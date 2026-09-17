import { describe, expect, it } from 'vitest';
import { COMMON_EVOLUTION_LEVEL, EVOLVED_IDS, evolvesFrom, SPECIES, speciesAtLevel } from '../data/monsters.js';
import { RARITIES } from '../data/rarities.js';
import {
  BOSS_POOL,
  battleForWave,
  createRun,
  enemiesForWave,
  enemyForWave,
  enemyLevelForWave,
  FIRST_WAVE_POOL,
  healTeam,
  isBossWave,
  isRunOver,
  lootLevelForWave,
  nextWave,
  raritiesForWave,
  LATE_WAVE,
  STARTER_IDS,
  STARTER_LEVEL,
  TEAM_LEVEL_GAP,
  teamLevel,
  WAVE_POOL,
} from '../engine/run.js';
import { elementMultiplier } from '../data/elements.js';
import { createMonster } from '../engine/stats.js';

describe('US-10 — départ de la run', () => {
  it('démarre avec le starter choisi au niveau 5', () => {
    const run = createRun('undine', 42);
    expect(run.wave).toBe(1);
    expect(run.team).toHaveLength(1);
    expect(run.team[0]).toMatchObject({ speciesId: 'undine', level: STARTER_LEVEL });
    expect(run.team[0].hp).toBe(run.team[0].maxHp);
  });

  it('refuse une espèce qui n’est pas un starter', () => {
    expect(() => createRun('demon', 42)).toThrow();
  });
});

describe('US-11 — vagues', () => {
  it('fait monter les ennemis de 0,7 niveau par vague jusqu’à la vague 20, puis de 1,5', () => {
    expect([1, 2, 4, 12, 19].map((wave) => enemyForWave(1234, wave).level)).toEqual([1, 2, 3, 9, 14]);
    expect([21, 22, 29].map((wave) => enemyForWave(1234, wave).level)).toEqual([16, 17, 28]);
    expect(LATE_WAVE).toBe(20);
    expect(enemyLevelForWave(LATE_WAVE)).toBe(14); // calcul entier : pas d'erreur d'arrondi
  });

  it('ne laisse jamais les ennemis plus de 3 niveaux sous l’équipe (pas d’emballement)', () => {
    expect(enemyLevelForWave(4, 40)).toBe(40 - TEAM_LEVEL_GAP);
    expect(enemyLevelForWave(12, 5)).toBe(9); // équipe en retard : la vague décide
    expect(enemyForWave(1234, 7, 30).level).toBe(27);
    expect(teamLevel([createMonster('goblin', 10, 'a'), createMonster('slime', 5, 'b')])).toBe(8);
    // Le combat prend le niveau de l'équipe du joueur.
    const run = createRun('salamander', 7);
    const veterans = { ...run, wave: 3, team: [createMonster('salamander', 20, 'v')] };
    expect(battleForWave(veterans).players[1].team[0].level).toBe(17);
  });

  it('ne tire en vague 1 aucun ennemi avec un avantage ou une résistance face à un starter', () => {
    expect(FIRST_WAVE_POOL.length).toBeGreaterThan(1);
    for (let seed = 0; seed < 500; seed++) {
      const [enemy] = enemiesForWave(seed, 1);
      for (const starter of STARTER_IDS) {
        expect(elementMultiplier(enemy.element, SPECIES[starter].element)).toBeLessThanOrEqual(1);
        expect(elementMultiplier(SPECIES[starter].element, enemy.element)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('tire toujours le même ennemi pour une seed et une vague données', () => {
    expect(enemyForWave(1234, 3)).toEqual(enemyForWave(1234, 3));
    const species = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((w) => enemyForWave(1234, w).speciesId));
    expect(species.size).toBeGreaterThan(1); // les vagues ne se ressemblent pas toutes
  });

  it('ne fait apparaître ni starter ni boss dans les vagues, et les évolutions seulement par le niveau', () => {
    expect(WAVE_POOL.length).toBeGreaterThan(0);
    for (const id of WAVE_POOL) {
      expect(SPECIES[id].rarity).not.toBe('boss');
      expect(STARTER_IDS).not.toContain(id);
      expect(EVOLVED_IDS.has(id)).toBe(false);
    }
    for (let seed = 0; seed < 20; seed++) {
      for (let wave = 1; wave <= 30; wave++) {
        if (isBossWave(wave)) continue;
        for (const m of enemiesForWave(seed, wave)) {
          const base = evolvesFrom(m.speciesId) ?? m.speciesId;
          expect(WAVE_POOL).toContain(base);
          expect(m.speciesId).toBe(speciesAtLevel(base, m.level));
        }
      }
    }
  });

  it('fait arriver les monstres communs déjà évolués en fin de run', () => {
    const evolvedWaves = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      for (let wave = 1; wave <= 14; wave++) {
        if (enemiesForWave(seed, wave).some((m) => EVOLVED_IDS.has(m.speciesId))) evolvedWaves.add(wave);
      }
    }
    // Les ennemis atteignent le niveau 10 à la vague 13 (0,7 niveau par vague).
    expect(Math.min(...evolvedWaves)).toBe(13);
    expect(enemyLevelForWave(12)).toBe(COMMON_EVOLUTION_LEVEL - 1);
    expect(enemyLevelForWave(13)).toBe(COMMON_EVOLUTION_LEVEL);
  });

  it('remet les boosts à zéro d’une vague à l’autre', () => {
    const run = createRun('salamander', 7);
    const boosted = run.team.map((m) => ({ ...m, modifiers: { defMult: 1.3, atkMult: 1.5 } }));
    expect(nextWave(run, boosted).team[0].modifiers).toEqual({ defMult: 1, atkMult: 1 });
  });

  it('oppose 1 monstre jusqu’à la vague 5, puis 2 (game design §6.1)', () => {
    for (const wave of [1, 3, 4]) expect(enemiesForWave(99, wave)).toHaveLength(1);
    for (const wave of [6, 9]) expect(enemiesForWave(99, wave)).toHaveLength(2);
    expect(enemiesForWave(99, 7).every((m) => m.level === enemyLevelForWave(7))).toBe(true);
  });

  it('garde le monstre actif et l’ordre de l’équipe d’une vague à l’autre', () => {
    const run = createRun('salamander', 7);
    const team = [run.team[0], { ...run.team[0], uid: 'b', speciesId: 'goblin', name: 'Gobelin' }];
    const next = nextWave({ ...run, team }, team, 1);
    const battle = battleForWave(next);
    expect(battle.players[0].activeIndex).toBe(1);
    expect(battle.players[0].team.map((m) => m.uid)).toEqual([run.team[0].uid, 'b']);
    // Si ce monstre est KO, le premier monstre en vie ouvre la vague.
    const koTeam = [team[0], { ...team[1], hp: 0 }];
    expect(battleForWave({ ...next, team: koTeam }).players[0].activeIndex).toBe(0);
  });

  it('place le joueur au siège 0 et l’IA au siège 1', () => {
    const battle = battleForWave(createRun('salamander', 7));
    expect(battle.players[0].userId).toBe('solo');
    expect(battle.players[1].userId).toBeNull();
    // Le starter est niveau 5 : l'ennemi de la vague 1 est au plus 3 niveaux en dessous.
    expect(battle.players[1].team[0].level).toBe(STARTER_LEVEL - TEAM_LEVEL_GAP);
  });

  it('rend 20 % des PV max après une vague gagnée, sans dépasser le maximum', () => {
    const run = createRun('mushroom', 7);
    const hurt = run.team.map((m) => ({ ...m, hp: 10 }));
    const after = nextWave(run, hurt);
    expect(after.wave).toBe(2);
    expect(after.team[0].hp).toBe(10 + Math.floor(after.team[0].maxHp * 0.2));
    expect(healTeam(run.team)[0].hp).toBe(run.team[0].maxHp);
  });

  it('laisse les monstres KO à 0 PV et détecte la fin de run', () => {
    const run = createRun('mushroom', 7);
    const dead = run.team.map((m) => ({ ...m, hp: 0 }));
    expect(healTeam(dead)[0].hp).toBe(0);
    expect(isRunOver(dead)).toBe(true);
    expect(isRunOver(run.team)).toBe(false);
  });

  it('garde les PP consommés d’une vague à l’autre', () => {
    const run = createRun('salamander', 7);
    const used = run.team.map((m) => ({ ...m, skills: m.skills.map((s) => ({ ...s, ppLeft: s.ppLeft === null ? null : s.ppLeft - 2 })) }));
    expect(nextWave(run, used).team[0].skills.find((s) => s.id === 'fireball')?.ppLeft).toBe(11);
  });
});

describe('US-13 — boss et raretés', () => {
  it('oppose un boss seul toutes les 5 vagues : un niveau au-dessus, sauf le premier, un niveau en dessous', () => {
    for (const wave of [5, 10, 15, 20]) {
      const enemies = enemiesForWave(42, wave);
      expect(enemies).toHaveLength(1);
      expect(BOSS_POOL).toContain(enemies[0].speciesId);
      expect(enemies[0].level).toBe(enemyLevelForWave(wave) + (wave === 5 ? -1 : 1));
    }
    expect(enemiesForWave(42, 5)[0].level).toBe(3);
    for (const wave of [4, 6, 11]) expect(isBossWave(wave)).toBe(false);
  });

  it('débloque les raretés au fil des vagues', () => {
    expect(raritiesForWave(1)).toEqual(['common']);
    expect(raritiesForWave(3)).toEqual(['common', 'uncommon']);
    expect(raritiesForWave(8)).toEqual(['common', 'uncommon', 'rare', 'epic']);
    for (let seed = 0; seed < 200; seed++) {
      for (const wave of [1, 2, 3, 4, 6, 7]) {
        for (const m of enemiesForWave(seed, wave)) expect(RARITIES[SPECIES[m.speciesId].rarity].firstWave).toBeLessThanOrEqual(wave);
      }
    }
  });

  it('fait apparaître des monstres épiques dans les vagues tardives', () => {
    const late = new Set<string>();
    for (let seed = 0; seed < 200; seed++) for (const m of enemiesForWave(seed, 9)) late.add(SPECIES[m.speciesId].rarity);
    expect(late.has('epic')).toBe(true);
    expect(late.has('common')).toBe(true);
  });

  it('calcule le niveau de butin sur l’ennemi le plus rare', () => {
    expect(lootLevelForWave(42, 5)).toBe(4);
    expect(lootLevelForWave(42, 1)).toBe(0);
    for (let seed = 0; seed < 50; seed++) {
      const expected = Math.max(...enemiesForWave(seed, 7).map((m) => RARITIES[SPECIES[m.speciesId].rarity].loot));
      expect(lootLevelForWave(seed, 7)).toBe(expected);
    }
  });
});
