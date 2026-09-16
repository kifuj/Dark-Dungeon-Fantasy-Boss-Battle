import { supabaseAdmin } from './supabaseAdmin.ts';
import { resolveTurn } from './game/engine/battle.ts';
import { createTurnRng } from './game/engine/rng.ts';
import type { Action, BattleState } from './game/types.ts';

export const TURN_DURATION_MS = 60_000;

/**
 * Résout le tour courant si les 2 actions sont présentes (docs/04-MULTIJOUEUR.md §5).
 * Sans danger si elle est appelée plusieurs fois : le verrou optimiste sur `version`
 * fait qu'un seul appel écrit le tour.
 */
export async function tryResolveBattleTurn(matchId: string): Promise<boolean> {
  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).single();
  if (!match || match.phase !== 'battle') return false;

  const { data: actions } = await supabaseAdmin
    .from('match_actions')
    .select('player_id, payload')
    .eq('match_id', matchId)
    .eq('phase', 'battle')
    .eq('round', match.round)
    .eq('turn', match.turn);

  const a1 = actions?.find((a) => a.player_id === match.player1_id)?.payload as Action | undefined;
  const a2 = actions?.find((a) => a.player_id === match.player2_id)?.payload as Action | undefined;
  if (!a1 || !a2) return false; // on attend l'autre joueur

  const rng = createTurnRng(match.seed, match.round, match.turn);
  const { state, events, winnerSeat } = resolveTurn(match.state as BattleState, [a1, a2], rng);
  const finished = winnerSeat !== null;

  // Verrou optimiste : si un autre appel a déjà résolu ce tour, 0 ligne n'est modifiée.
  const { data: updated } = await supabaseAdmin
    .from('matches')
    .update({
      state,
      last_events: events,
      turn: match.turn + 1,
      version: match.version + 1,
      phase: finished ? 'finished' : 'battle',
      winner_id: finished ? [match.player1_id, match.player2_id][winnerSeat as number] : null,
      turn_deadline: finished ? null : new Date(Date.now() + TURN_DURATION_MS).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .eq('version', match.version)
    .select('id');

  if (!updated?.length) return false;

  await supabaseAdmin.from('match_turns').insert({
    match_id: matchId,
    round: match.round,
    turn: match.turn,
    events,
  });
  if (finished) {
    await supabaseAdmin.from('rooms').update({ status: 'finished' }).eq('id', match.room_id);
  }
  return true;
}
