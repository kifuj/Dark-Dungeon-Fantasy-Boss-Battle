import { describe, expect, it } from 'vitest';
import { REWARDS, type RewardId } from '../data/rewards.js';
import { SKILLS } from '../data/skills.js';
import {
  applyReward,
  drawRewards,
  forgettableSkills,
  MAX_TEAM_SIZE,
  needsTarget,
  RECRUIT_EVERY,
  recruitFor,
  rewardPool,
  scrollNeedsForget,
  scrollSkillFor,
} from '../engine/rewards.js';
import { COMMON_EVOLUTION_LEVEL, speciesAtLevel } from '../data/monsters.js';
import { BOSS_POOL, createRun, enemiesForWave, lootLevelForWave } from '../engine/run.js';
import { createMonster } from '../engine/stats.js';

const SEED = 777;
const ctx = (targetUid?: string) => ({ seed: SEED, wave: 3, targetUid });

describe('US-12 — tirage des récompenses', () => {
  it('propose 3 récompenses différentes (CA1)', () => {
    for (let wave = 1; wave <= 30; wave++) {
      const rewards = drawRewards(SEED, wave);
      expect(rewards).toHaveLength(3);
      expect(new Set(rewards).size).toBe(3);
      rewards.forEach((id) => expect(REWARDS[id]).toBeDefined());
    }
  });

  it('respecte les poids : la potion sort plus souvent que le parchemin (CA1)', () => {
    const counts: Partial<Record<RewardId, number>> = {};
    for (let seed = 0; seed < 2000; seed++) {
      for (const id of drawRewards(seed, 1)) counts[id] = (counts[id] ?? 0) + 1;
    }
    expect(counts.potion!).toBeGreaterThan(counts.scroll!);
    expect(counts.training!).toBeGreaterThan(counts.elixir!);
  });

  it('propose le recrutement au moins une vague sur deux', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let wave = 2; wave <= 20; wave += RECRUIT_EVERY) expect(drawRewards(seed, wave)).toContain('recruit');
    }
  });

  it('donne les mêmes propositions pour une même seed et une même vague (CA4)', () => {
    expect(drawRewards(SEED, 4)).toEqual(drawRewards(SEED, 4));
    const variety = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((w) => drawRewards(SEED, w).join()));
    expect(variety.size).toBeGreaterThan(1);
  });
});

describe('US-12 — effets des récompenses (CA2)', () => {
  const team = () => {
    const a = createMonster('salamander', 6, 'a');
    const b = createMonster('goblin', 5, 'b');
    return [
      { ...a, hp: 3, skills: a.skills.map((s) => ({ ...s, ppLeft: s.ppLeft === null ? null : 0 })) },
      { ...b, hp: 0 },
    ];
  };

  it('Potion : soigne 50 % des PV max de chaque monstre, y compris un KO', () => {
    const before = team();
    const { team: after, message } = applyReward(before, 'potion', ctx());
    expect(after[0].hp).toBe(Math.min(before[0].maxHp, 3 + Math.floor(before[0].maxHp / 2)));
    expect(after[1].hp).toBe(Math.floor(before[1].maxHp / 2));
    expect(message).toMatch(/PV/);
    expect(before[1].hp).toBe(0); // l'équipe d'origine n'est pas modifiée
  });

  it('Élixir : recharge tous les PP', () => {
    const { team: after } = applyReward(team(), 'elixir', ctx());
    after[0].skills.forEach((s) => expect(s.ppLeft).toBe(SKILLS[s.id].pp));
  });

  it('Entraînement : +1 niveau, stats et PV recalculés pour le monstre choisi', () => {
    const before = team();
    const { team: after, message } = applyReward(before, 'training', ctx('a'));
    const reference = createMonster('salamander', 7, 'a');
    expect(after[0]).toMatchObject({ level: 7, maxHp: reference.maxHp, stats: reference.stats });
    expect(after[0].hp).toBe(3 + reference.maxHp - before[0].maxHp);
    expect(after[1]).toEqual(before[1]);
    expect(message).toBe('Salamandre passe au niveau 7 !');
  });

  it('Entraînement : un monstre KO gagne son niveau mais reste KO', () => {
    const { team: after } = applyReward(team(), 'training', ctx('b'));
    expect(after[1]).toMatchObject({ level: 6, hp: 0 });
  });

  it('Entraînement : le monstre évolue en atteignant son niveau d’évolution', () => {
    const young = createMonster('goblin', COMMON_EVOLUTION_LEVEL - 1, 'g');
    const { team: after, message } = applyReward([young], 'training', ctx('g'));
    expect(after[0]).toMatchObject({ speciesId: 'goblin_chief', name: 'Chef gobelin', level: COMMON_EVOLUTION_LEVEL, uid: 'g' });
    expect(after[0].skills).toEqual(young.skills); // il garde ses compétences
    expect(message).toBe(`Gobelin évolue en Chef gobelin ! Chef gobelin passe au niveau ${COMMON_EVOLUTION_LEVEL} !`);
  });

  it('Recrutement : le monstre vaincu rejoint l’équipe au niveau de celle-ci', () => {
    const before = team(); // niveaux 6 et 5 : niveau d'équipe 6
    const [enemy] = enemiesForWave(SEED, 3);
    const { team: after, message } = applyReward(before, 'recruit', ctx());
    expect(after).toHaveLength(3);
    expect(after[2]).toMatchObject({ speciesId: enemy.speciesId, level: 6, hp: createMonster(enemy.speciesId, 6, 'x').maxHp });
    expect(message).toContain('rejoint');
  });

  it('Recrutement : la recrue garde le niveau de l’ennemi s’il dépasse celui de l’équipe, et évolue si elle peut', () => {
    expect(recruitFor(SEED, 30, [createMonster('goblin', 1, 'g')]).level).toBe(enemiesForWave(SEED, 30, 1)[0].level);
    const veterans = [createMonster('salamander', COMMON_EVOLUTION_LEVEL + 5, 'v')];
    for (let seed = 0; seed < 50; seed++) {
      const recruit = recruitFor(seed, 2, veterans);
      expect(recruit.level).toBe(COMMON_EVOLUTION_LEVEL + 5);
      expect(recruit.speciesId).toBe(speciesAtLevel(recruit.speciesId, recruit.level));
      expect(recruit.kills ?? 0).toBe(0);
    }
  });

  it('Parchemin : la compétence choisie par le joueur est oubliée, jamais la Frappe', () => {
    const before = team();
    const learned = scrollSkillFor(SEED, 3, before[0]);
    expect(before[0].skills.map((s) => s.id)).not.toContain(learned);
    expect(forgettableSkills(before[0])).toEqual(['fireball', 'inferno', 'kindle']);
    expect(scrollNeedsForget(before[0])).toBe(true);
    const { team: after, message } = applyReward(before, 'scroll', { ...ctx('a'), forgetSkillId: 'inferno' });
    expect(after[0].skills.map((s) => s.id)).toEqual(['fireball', learned, 'kindle', 'strike']);
    expect(message).toBe(`Salamandre oublie Souffle ardent et apprend ${SKILLS[learned].name} !`);
    expect(() => applyReward(before, 'scroll', { ...ctx('a'), forgetSkillId: 'strike' })).toThrow();
  });

  it('Parchemin : un monstre qui a moins de 4 compétences apprend sans rien oublier', () => {
    const small = { ...createMonster('goblin', 5, 's'), skills: [{ id: 'strike', ppLeft: null }] };
    expect(scrollNeedsForget(small)).toBe(false);
    const { team: after } = applyReward([small], 'scroll', ctx('s'));
    expect(after[0].skills).toHaveLength(2);
  });

  it('Parchemin : une compétence à PP limités est remplacée, la frappe illimitée est gardée', () => {
    const before = team();
    const { team: after, message } = applyReward(before, 'scroll', ctx('a'));
    const oldIds = before[0].skills.map((s) => s.id);
    const newIds = after[0].skills.map((s) => s.id);
    expect(newIds).toHaveLength(oldIds.length);
    expect(newIds).toContain('strike');
    const learned = newIds.filter((id) => !oldIds.includes(id));
    expect(learned).toHaveLength(1);
    expect(after[0].skills.find((s) => s.id === learned[0])!.ppLeft).toBe(SKILLS[learned[0]].pp);
    expect(message).toContain(SKILLS[learned[0]].name);
    expect(applyReward(before, 'scroll', ctx('a'))).toEqual({ team: after, message }); // même seed, même résultat
  });

  it('refuse une récompense ciblée sans monstre désigné', () => {
    expect(() => applyReward(team(), 'training', ctx())).toThrow();
    expect(() => applyReward(team(), 'scroll', ctx('inconnu'))).toThrow();
  });
});

describe('US-12 — équipe pleine (CA3)', () => {
  const fullTeam = () => Array.from({ length: MAX_TEAM_SIZE }, (_, i) => createMonster('goblin', 5, `m${i}`));

  it('demande quel monstre remplacer seulement quand l’équipe compte 4 monstres', () => {
    expect(needsTarget('recruit', createRun('undine', SEED).team)).toBe(false);
    expect(needsTarget('recruit', fullTeam())).toBe(true);
    expect(needsTarget('potion', fullTeam())).toBe(false);
    expect(needsTarget('training', createRun('undine', SEED).team)).toBe(true);
  });

  it('remplace le monstre désigné par la recrue, sans dépasser 4', () => {
    const { team: after, message } = applyReward(fullTeam(), 'recruit', ctx('m2'));
    expect(after).toHaveLength(MAX_TEAM_SIZE);
    expect(after[2]).toEqual(recruitFor(SEED, 3, fullTeam()));
    expect(after.map((m) => m.uid)).toEqual(['m0', 'm1', `${SEED}-r3`, 'm3']);
    expect(message).toContain('remplace Gobelin');
  });

  it('refuse le recrutement dans une équipe pleine sans monstre à remplacer', () => {
    expect(() => applyReward(fullTeam(), 'recruit', ctx())).toThrow();
  });
});

describe('US-13 — butin selon la rareté et butin de boss', () => {
  it('ne propose que des récompenses débloquées par le niveau de butin', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const wave of [1, 2, 3, 6, 8, 9]) {
        const loot = lootLevelForWave(seed, wave);
        for (const id of drawRewards(seed, wave)) expect(REWARDS[id].minLoot).toBeLessThanOrEqual(loot);
      }
    }
    expect(rewardPool(SEED, 1).every((r) => REWARDS[r.id].minLoot === 0)).toBe(true);
  });

  it('propose plus souvent un butin rare après un monstre plus rare', () => {
    const rareShare = (wave: number) => {
      let rare = 0;
      let total = 0;
      for (let seed = 0; seed < 1500; seed++) {
        if (lootLevelForWave(seed, wave) === 0) continue;
        total += 3;
        rare += drawRewards(seed, wave).filter((id) => REWARDS[id].minLoot > 0).length;
      }
      return rare / total;
    };
    expect(rareShare(3)).toBeGreaterThan(0);
    expect(rareShare(9)).toBeGreaterThan(rareShare(3));
  });

  it('garantit la Relique après un boss, sans butin ordinaire hors recrutement', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (const wave of [5, 10]) {
        const drawn = drawRewards(seed, wave);
        expect(drawn[0]).toBe('relic');
        expect(new Set(drawn).size).toBe(3);
        for (const id of drawn) expect(REWARDS[id].minLoot > 0 || id === 'recruit').toBe(true);
      }
    }
  });

  it('Recrutement après un boss : le boss rejoint l’équipe', () => {
    expect(BOSS_POOL).toContain(recruitFor(SEED, 5, team()).speciesId);
  });

  const team = () => [createMonster('salamander', 6, 'a'), { ...createMonster('goblin', 5, 'b'), hp: 0 }];

  it('Potion royale : soigne tout et recharge les PP, KO compris', () => {
    const hurt = team().map((m) => ({ ...m, hp: Math.min(m.hp, 3), skills: m.skills.map((s) => ({ ...s, ppLeft: 0 })) }));
    const { team: after } = applyReward(hurt, 'royal_potion', ctx());
    for (const m of after) {
      expect(m.hp).toBe(m.maxHp);
      for (const s of m.skills) expect(s.ppLeft).toBe(SKILLS[s.id].pp);
    }
  });

  it('Entraînement intensif : +1 niveau pour toute l’équipe, sans choisir de monstre', () => {
    const { team: after, message } = applyReward(team(), 'intensive_training', ctx());
    expect(after.map((m) => m.level)).toEqual([7, 6]);
    expect(after[1].hp).toBe(0); // un KO reste KO
    expect(needsTarget('intensive_training', team())).toBe(false);
    expect(message).toBe('Toute l’équipe gagne 1 niveau !');
  });

  it('Camp d’entraînement : +2 niveaux pour toute l’équipe, un KO reste KO', () => {
    const { team: after, message } = applyReward(team(), 'war_camp', ctx());
    expect(after.map((m) => m.level)).toEqual([8, 7]);
    expect(after[1].hp).toBe(0);
    expect(message).toBe('Toute l’équipe gagne 2 niveaux !');
  });

  it('Relique : +2 niveaux et soin complet pour toute l’équipe', () => {
    const { team: after } = applyReward(team(), 'relic', ctx());
    expect(after.map((m) => m.level)).toEqual([8, 7]);
    for (const m of after) expect(m.hp).toBe(m.maxHp);
  });
});
