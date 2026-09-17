import { supabaseAdmin } from './supabaseAdmin.ts';
import { resolveTurn } from './game/engine/battle.ts';
import { replacementSeats, resolveReplacement } from './game/engine/replace.ts';
import { createTurnRng } from './game/engine/rng.ts';
import { startBattleFromDrafts, TURN_DURATION_MS } from './game/engine/online.ts';
import type { Action, BattleState, TurnResult } from './game/types.ts';

/**
 * Résout le tour courant si les actions attendues sont présentes (docs/04-MULTIJOUEUR.md §5) :
 * les 2 actions pour un tour de combat, ou seulement celles des joueurs dont le monstre est KO
 * pendant une phase de remplacement.
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
  const current = match.state as BattleState;
  const replacing = replacementSeats(current);
  let result: TurnResult;
  if (replacing.length > 0) {
    const bySeat = [a1, a2];
    if (replacing.some((seat) => !bySeat[seat])) return false; // on attend le choix du remplaçant
    const choices = Object.fromEntries(
      replacing.map((seat) => {
        const action = bySeat[seat]!;
        return [seat, action.type === 'switch' ? action.toIndex : undefined];
      }),
    );
    result = resolveReplacement(current, choices);
  } else {
    if (!a1 || !a2) return false; // on attend l'autre joueur
    result = resolveTurn(current, [a1, a2], createTurnRng(match.seed, match.round, match.turn));
  }
  const { state, events, winnerSeat } = result;
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

/**
 * Lance le combat si les 2 drafts sont reçus (US-18 CA3). Même verrou optimiste que
 * pour un tour : deux appels simultanés ne construisent les équipes qu'une fois.
 */
export async function tryResolveDraft(matchId: string): Promise<boolean> {
  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).single();
  if (!match || match.phase !== 'draft') return false;

  const { data: drafts } = await supabaseAdmin
    .from('match_actions')
    .select('player_id, payload')
    .eq('match_id', matchId)
    .eq('phase', 'draft')
    .eq('round', match.round);

  const p1 = drafts?.find((d) => d.player_id === match.player1_id)?.payload?.picks as number[] | undefined;
  const p2 = drafts?.find((d) => d.player_id === match.player2_id)?.payload?.picks as number[] | undefined;
  if (!p1 || !p2) return false; // on attend l'autre joueur

  const state = startBattleFromDrafts(match.state as BattleState, [p1, p2]);
  const { data: updated } = await supabaseAdmin
    .from('matches')
    .update({
      state,
      phase: 'battle',
      turn: 1,
      last_events: [],
      version: match.version + 1,
      turn_deadline: new Date(Date.now() + TURN_DURATION_MS).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .eq('version', match.version)
    .select('id');
  return Boolean(updated?.length);
}
