import { describe, expect, it } from 'vitest';
import { REWARDS, type RewardId } from '../data/rewards.js';
import { SKILLS } from '../data/skills.js';
import { applyReward, drawRewards, MAX_TEAM_SIZE, needsTarget, recruitFor } from '../engine/rewards.js';
import { createRun, enemiesForWave } from '../engine/run.js';
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

  it('Entraînement : +2 niveaux, stats et PV recalculés pour le monstre choisi', () => {
    const before = team();
    const { team: after, message } = applyReward(before, 'training', ctx('a'));
    const reference = createMonster('salamander', 8, 'a');
    expect(after[0]).toMatchObject({ level: 8, maxHp: reference.maxHp, stats: reference.stats });
    expect(after[0].hp).toBe(3 + reference.maxHp - before[0].maxHp);
    expect(after[1]).toEqual(before[1]);
    expect(message).toBe('Salamandre passe au niveau 8 !');
  });

  it('Entraînement : un monstre KO gagne ses niveaux mais reste KO', () => {
    const { team: after } = applyReward(team(), 'training', ctx('b'));
    expect(after[1]).toMatchObject({ level: 7, hp: 0 });
  });

  it('Recrutement : le monstre vaincu rejoint l’équipe à son niveau', () => {
    const before = team();
    const [enemy] = enemiesForWave(SEED, 3);
    const { team: after, message } = applyReward(before, 'recruit', ctx());
    expect(after).toHaveLength(3);
    expect(after[2]).toMatchObject({ speciesId: enemy.speciesId, level: enemy.level, hp: enemy.maxHp });
    expect(message).toContain('rejoint');
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
    expect(after[2]).toEqual(recruitFor(SEED, 3));
    expect(after.map((m) => m.uid)).toEqual(['m0', 'm1', `${SEED}-r3`, 'm3']);
    expect(message).toContain('remplace Gobelin');
  });

  it('refuse le recrutement dans une équipe pleine sans monstre à remplacer', () => {
    expect(() => applyReward(fullTeam(), 'recruit', ctx())).toThrow();
  });
});
