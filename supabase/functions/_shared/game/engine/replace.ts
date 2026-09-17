// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import type { BattleEvent, BattleState, Seat, TurnResult } from '../types.ts';

/**
 * Remplacement d'un monstre KO (docs/06-MOTEUR-DE-COMBAT.md §6) : le moteur ne choisit plus
 * le remplaçant à la place du joueur. Après un tour où un monstre actif tombe KO, le combat
 * passe par une phase de remplacement où seuls les joueurs concernés jouent, un `switch`.
 */

/** Vrai si le monstre actif du siège est KO alors qu'il lui reste un monstre en vie. */
export function needsReplacement(state: BattleState, seat: Seat): boolean {
  const player = state.players[seat];
  const active = player.team[player.activeIndex];
  return Boolean(active) && active.hp <= 0 && player.team.some((m) => m.hp > 0);
}

/** Sièges qui doivent choisir un remplaçant avant le prochain tour de combat. */
export const replacementSeats = (state: BattleState): Seat[] => ([0, 1] as const).filter((seat) => needsReplacement(state, seat));

/** Remplaçant par défaut (joueur absent) : le premier monstre en vie, dans l'ordre de l'équipe. */
export const firstAliveIndex = (state: BattleState, seat: Seat) => state.players[seat].team.findIndex((m) => m.hp > 0);

/**
 * Applique les remplacements choisis. Un choix absent ou invalide retombe sur le premier monstre
 * en vie, pour qu'un duel ne reste jamais bloqué. Le numéro de tour avance : en ligne, c'est lui
 * qui identifie les actions attendues (docs/04-MULTIJOUEUR.md §5).
 */
export function resolveReplacement(input: BattleState, choices: Partial<Record<Seat, number>>): TurnResult {
  const state: BattleState = structuredClone(input);
  const events: BattleEvent[] = [];
  for (const seat of replacementSeats(input)) {
    const player = state.players[seat];
    const wanted = choices[seat];
    const valid = typeof wanted === 'number' && player.team[wanted] !== undefined && player.team[wanted].hp > 0;
    const toIndex = valid ? wanted : firstAliveIndex(state, seat);
    const fromIndex = player.activeIndex;
    player.activeIndex = toIndex;
    events.push({ type: 'switch', seat, fromIndex, toIndex, forced: true, name: player.team[toIndex].name });
  }
  state.turn += 1;
  return { state, events, winnerSeat: null };
}
