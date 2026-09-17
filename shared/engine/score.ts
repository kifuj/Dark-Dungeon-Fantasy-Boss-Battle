import type { MonsterInstance } from '../types.js';

/** Points par vague atteinte (docs/01-GAME-DESIGN.md §6.3). */
export const SCORE_PER_WAVE = 100;

/** Score d'une run solo (US-14 CA1) : `vague atteinte × 100 + PV restants en fin de run`. */
export function runScore(wave: number, team: MonsterInstance[]): number {
  const hpLeft = team.reduce((sum, m) => sum + Math.max(0, m.hp), 0);
  return Math.max(0, wave) * SCORE_PER_WAVE + hpLeft;
}
