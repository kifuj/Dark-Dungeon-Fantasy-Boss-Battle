// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import { SPECIES } from '../data/monsters.ts';
import { mulberry32 } from './rng.ts';
import { createMonster } from './stats.ts';
import type { BattleState, MonsterInstance, Seat } from '../types.ts';

/** Duel en ligne (US-19) : 3 monstres de niveau 10 par joueur, tirés avec la seed du match. */
export const ONLINE_TEAM_SIZE = 3;
export const ONLINE_LEVEL = 10;
/** Tout le bestiaire sauf les boss, qui sont réservés au solo (US-13). */
export const ONLINE_POOL = Object.values(SPECIES)
  .filter((species) => species.rarity !== 'boss')
  .map((species) => species.id)
  .sort();

/** Équipe d'un siège : tirage sans remise, donc pas deux fois la même espèce. */
export function onlineTeam(seed: number, seat: Seat): MonsterInstance[] {
  const rng = mulberry32((seed ^ Math.imul(seat + 1, 0x9e3779b1)) >>> 0);
  const pool = [...ONLINE_POOL];
  return Array.from({ length: ONLINE_TEAM_SIZE }, (_, index) => {
    const [speciesId] = pool.splice(Math.floor(rng() * pool.length), 1);
    return createMonster(speciesId, ONLINE_LEVEL, `p${seat}-m${index}`);
  });
}

/** État initial d'un duel : même seed → mêmes équipes pour les deux joueurs (US-19 CA1). */
export function createOnlineBattle(seed: number, player1Id: string, player2Id: string): BattleState {
  return {
    round: 1,
    turn: 1,
    players: [
      { userId: player1Id, team: onlineTeam(seed, 0), activeIndex: 0 },
      { userId: player2Id, team: onlineTeam(seed, 1), activeIndex: 0 },
    ],
  };
}
