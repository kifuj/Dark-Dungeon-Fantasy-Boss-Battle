import type { Rng } from '../types.js';

/** Générateur pseudo-aléatoire reproductible. `Math.random()` est interdit dans `shared/`. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** RNG propre à un tour : même seed de match + même tour = mêmes tirages. */
export function createTurnRng(seed: number, round: number, turn: number): Rng {
  return mulberry32((seed ^ Math.imul(round, 0x9e3779b1) ^ Math.imul(turn, 0x85ebca6b)) >>> 0);
}

export const randInt = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
export const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];
