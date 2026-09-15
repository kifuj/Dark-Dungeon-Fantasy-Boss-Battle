import { describe, expect, it } from 'vitest';
import { SKILLS } from '../data/skills.js';
import { computeDamage } from '../engine/damage.js';
import { mulberry32 } from '../engine/rng.js';
import { createMonster, statAtLevel } from '../engine/stats.js';
import { fixedRng } from './helpers.js';

describe('rng', () => {
  it('même seed → même suite', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('renvoie des nombres dans [0, 1[', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const x = rng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('stats', () => {
  it('suit la formule floor(base × (1 + (N − 1) × 0,08))', () => {
    expect(statAtLevel(50, 1)).toBe(50);
    expect(statAtLevel(50, 5)).toBe(66);
    expect(statAtLevel(65, 10)).toBe(111);
  });

  it('crée un monstre avec ses PV au max et ses PP pleins', () => {
    const m = createMonster('salamander', 5, 'm');
    expect(m.hp).toBe(m.maxHp);
    expect(m.skills).toEqual([
      { id: 'fireball', ppLeft: 10 },
      { id: 'inferno', ppLeft: 3 },
      { id: 'strike', ppLeft: null },
    ]);
  });
});

describe('computeDamage', () => {
  it('applique la formule (sans critique, aléa max)', () => {
    const salamander = createMonster('salamander', 10, 'a'); // ATQ 111
    const goblin = createMonster('goblin', 10, 'b'); // DEF 68
    // 50 × (111 / 68) × (20 / 60) × 1 × 1,25 (même élément) × ~1
    const { amount, effectiveness, crit } = computeDamage(salamander, goblin, SKILLS.fireball, fixedRng(0.99));
    expect(crit).toBe(false);
    expect(effectiveness).toBe(1);
    expect(amount).toBe(Math.floor(50 * (111 / 68) * (20 / 60) * 1.25 * (0.9 + 0.99 * 0.1)));
  });

  it('multiplie par 1,5 sur un coup critique', () => {
    const a = createMonster('goblin', 10, 'a');
    const b = createMonster('goblin', 10, 'b');
    const normal = computeDamage(a, b, SKILLS.strike, fixedRng(0.99));
    const critical = computeDamage(a, b, SKILLS.strike, fixedRng(0.01));
    expect(critical.crit).toBe(true);
    expect(critical.amount).toBeGreaterThan(normal.amount);
  });

  it('inflige au moins 1 dégât', () => {
    const a = createMonster('slime', 1, 'a');
    const b = createMonster('knight', 50, 'b');
    b.modifiers.defMult = 100;
    expect(computeDamage(a, b, SKILLS.strike, fixedRng(0.99)).amount).toBe(1);
  });
});
