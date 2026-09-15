import { createMonster } from '../engine/stats.js';
import type { BattleState, Rng } from '../types.js';

/** Combat de test : chaque joueur a une équipe d'espèces données, toutes au même niveau. */
export function makeBattle(team0: string[], team1: string[], level = 10): BattleState {
  return {
    round: 1,
    turn: 1,
    players: [
      { userId: 'p1', activeIndex: 0, team: team0.map((id, i) => createMonster(id, level, `p1-${i}`)) },
      { userId: 'p2', activeIndex: 0, team: team1.map((id, i) => createMonster(id, level, `p2-${i}`)) },
    ],
  };
}

/** RNG qui renvoie toujours la même valeur (0.99 : jamais de critique, aléa maximal). */
export const fixedRng = (value: number): Rng => () => value;
