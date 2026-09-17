import { describe, expect, it } from 'vitest';
import { SPECIES } from '../data/monsters.js';
import { battleForWave, createRun, enemiesForWave, enemyForWave, healTeam, isRunOver, nextWave, STARTER_LEVEL, WAVE_POOL } from '../engine/run.js';

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
  it('oppose un ennemi de niveau N (niveau 1 à la vague 1)', () => {
    for (const wave of [1, 2, 5, 12]) expect(enemyForWave(1234, wave).level).toBe(wave);
  });

  it('tire toujours le même ennemi pour une seed et une vague données', () => {
    expect(enemyForWave(1234, 3)).toEqual(enemyForWave(1234, 3));
    const species = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((w) => enemyForWave(1234, w).speciesId));
    expect(species.size).toBeGreaterThan(1); // les vagues ne se ressemblent pas toutes
  });

  it('ne fait apparaître ni starter ni boss dans les vagues', () => {
    expect(WAVE_POOL.length).toBeGreaterThan(0);
    for (const id of WAVE_POOL) expect(['common', 'rare']).toContain(SPECIES[id].rarity);
  });

  it('oppose 1 monstre jusqu’à la vague 5, puis 2 (game design §6.1)', () => {
    for (const wave of [1, 3, 5]) expect(enemiesForWave(99, wave)).toHaveLength(1);
    for (const wave of [6, 9]) expect(enemiesForWave(99, wave)).toHaveLength(2);
    expect(enemiesForWave(99, 7).every((m) => m.level === 7)).toBe(true);
  });

  it('place le joueur au siège 0 et l’IA au siège 1', () => {
    const battle = battleForWave(createRun('salamander', 7));
    expect(battle.players[0].userId).toBe('solo');
    expect(battle.players[1].userId).toBeNull();
    expect(battle.players[1].team[0].level).toBe(1);
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
    expect(nextWave(run, used).team[0].skills.find((s) => s.id === 'fireball')?.ppLeft).toBe(8);
  });
});
