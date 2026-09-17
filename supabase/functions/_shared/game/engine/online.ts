// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import { SPECIES } from '../data/monsters.ts';
import { mulberry32 } from './rng.ts';
import { createMonster } from './stats.ts';
import { validateAction } from './validate.ts';
import type { Action, BattleState, MonsterInstance, Seat } from '../types.ts';

/** Duel en ligne (US-19) : 3 monstres de niveau 10 par joueur, tirés avec la seed du match. */
export const ONLINE_TEAM_SIZE = 3;
export const ONLINE_LEVEL = 10;
/** Draft (US-18) : chaque joueur choisit ses 3 monstres parmi 6 propositions. */
export const DRAFT_OFFER_SIZE = 6;
/** Tout le bestiaire sauf les boss, qui sont réservés au solo (US-13). */
export const ONLINE_POOL = Object.values(SPECIES)
  .filter((species) => species.rarity !== 'boss')
  .map((species) => species.id)
  .sort();

const seatRng = (seed: number, seat: Seat) => mulberry32((seed ^ Math.imul(seat + 1, 0x9e3779b1)) >>> 0);

/** Tirage sans remise de `count` espèces : pas deux fois la même espèce pour un siège. */
function drawSpecies(seed: number, seat: Seat, count: number): string[] {
  const rng = seatRng(seed, seat);
  const pool = [...ONLINE_POOL];
  return Array.from({ length: count }, () => pool.splice(Math.floor(rng() * pool.length), 1)[0]);
}

const buildTeam = (speciesIds: string[], seat: Seat): MonsterInstance[] =>
  speciesIds.map((speciesId, index) => createMonster(speciesId, ONLINE_LEVEL, `p${seat}-m${index}`));

/** Équipe tirée au hasard (MVP sans draft). */
export function onlineTeam(seed: number, seat: Seat): MonsterInstance[] {
  return buildTeam(drawSpecies(seed, seat, ONLINE_TEAM_SIZE), seat);
}

/** État initial d'un duel sans draft : même seed → mêmes équipes pour les deux joueurs (US-19 CA1). */
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

/** Les 6 espèces proposées à un siège, tirées avec la seed du match (US-18 CA1). */
export const draftOffer = (seed: number, seat: Seat): string[] => drawSpecies(seed, seat, DRAFT_OFFER_SIZE);

/** État de la phase `draft` : équipes vides, offres visibles, tour 0 (docs/05-API.md §3). */
export function createDraftState(seed: number, player1Id: string, player2Id: string): BattleState {
  return {
    round: 1,
    turn: 0,
    players: [
      { userId: player1Id, team: [], activeIndex: 0 },
      { userId: player2Id, team: [], activeIndex: 0 },
    ],
    draftOffers: [draftOffer(seed, 0), draftOffer(seed, 1)],
  };
}

/** Choix valide : exactement 3 indices entiers, distincts, compris dans l'offre. */
export function validateDraftPicks(picks: unknown): picks is number[] {
  return (
    Array.isArray(picks) &&
    picks.length === ONLINE_TEAM_SIZE &&
    picks.every((pick) => Number.isInteger(pick) && pick >= 0 && pick < DRAFT_OFFER_SIZE) &&
    new Set(picks).size === picks.length
  );
}

/**
 * Les deux drafts sont reçus : les équipes sont construites dans l'ordre choisi
 * (le premier choix entre en combat) et le duel passe au tour 1 (US-18 CA3).
 */
export function startBattleFromDrafts(state: BattleState, picks: [number[], number[]]): BattleState {
  if (!state.draftOffers) throw new Error('Pas de draft en cours');
  const offers = state.draftOffers;
  const team = (seat: Seat) => {
    if (!validateDraftPicks(picks[seat])) throw new Error(`Draft invalide pour le siège ${seat}`);
    return buildTeam(picks[seat].map((index) => offers[seat][index]), seat);
  };
  return {
    round: state.round,
    turn: 1,
    players: [
      { ...state.players[0], team: team(0), activeIndex: 0 },
      { ...state.players[1], team: team(1), activeIndex: 0 },
    ],
    draftOffers: null,
  };
}

/** Durée d'un tour et marge laissée aux horloges des clients avant de réclamer le timeout (US-20). */
export const TURN_DURATION_MS = 60_000;
export const TIMEOUT_GRACE_MS = 2_000;

/**
 * Action jouée pour un joueur absent (US-20 CA2, docs/04-MULTIJOUEUR.md §7) : la première
 * compétence qui a encore des PP. `strike` a des PP illimités, il y en a donc toujours une.
 */
export function defaultAction(state: BattleState, seat: Seat): Action {
  const player = state.players[seat];
  const slot = player.team[player.activeIndex].skills.find((s) => validateAction(state, seat, { type: 'skill', skillId: s.id }).ok);
  return { type: 'skill', skillId: (slot ?? player.team[player.activeIndex].skills[0]).id };
}

/** Draft d'un joueur absent : les 3 premières propositions, dans l'ordre. */
export const DEFAULT_DRAFT_PICKS: readonly number[] = Array.from({ length: ONLINE_TEAM_SIZE }, (_, i) => i);

/** Vrai quand la deadline du tour, marge comprise, est dépassée (US-20 CA3). */
export function isTurnExpired(turnDeadline: string | null, now: number): boolean {
  return turnDeadline !== null && now > Date.parse(turnDeadline) + TIMEOUT_GRACE_MS;
}
