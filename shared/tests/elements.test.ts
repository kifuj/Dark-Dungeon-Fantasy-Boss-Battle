import { describe, expect, it } from 'vitest';
import { elementMultiplier } from '../data/elements.js';
import type { Element } from '../types.js';

// Table de docs/01-GAME-DESIGN.md §3.4 : ligne = attaque, colonne = défense
const ORDER: Element[] = ['feu', 'eau', 'nature', 'lumiere', 'ombre', 'neutre'];
const TABLE: number[][] = [
  [1, 0.5, 2, 1, 1, 1],
  [2, 1, 0.5, 1, 1, 1],
  [0.5, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1],
  [1, 1, 1, 2, 1, 1],
  [1, 1, 1, 1, 1, 1],
];

describe('elementMultiplier', () => {
  for (const [i, attack] of ORDER.entries()) {
    for (const [j, defense] of ORDER.entries()) {
      it(`${attack} contre ${defense} = ×${TABLE[i][j]}`, () => {
        expect(elementMultiplier(attack, defense)).toBe(TABLE[i][j]);
      });
    }
  }
});
