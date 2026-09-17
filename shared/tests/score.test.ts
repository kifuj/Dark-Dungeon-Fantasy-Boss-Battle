import { describe, expect, it } from 'vitest';
import { createMonster } from '../engine/stats.js';
import { runScore, SCORE_PER_WAVE } from '../engine/score.js';

describe('US-14 — score de fin de run', () => {
  it('compte 100 points par vague quand toute l’équipe est KO', () => {
    const team = [{ ...createMonster('salamander', 5, 'a'), hp: 0 }];
    expect(runScore(7, team)).toBe(7 * SCORE_PER_WAVE);
  });

  it('ajoute les PV restants de toute l’équipe (abandon)', () => {
    const a = { ...createMonster('salamander', 5, 'a'), hp: 12 };
    const b = { ...createMonster('undine', 5, 'b'), hp: 0 };
    const c = { ...createMonster('mushroom', 5, 'c'), hp: 30 };
    expect(runScore(3, [a, b, c])).toBe(342);
  });
});
