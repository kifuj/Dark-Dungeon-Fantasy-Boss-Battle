import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { tryResolveBattleTurn } from '../_shared/turns.ts';
import { validateAction } from '../_shared/game/engine/validate.ts';
import type { BattleState, Seat } from '../_shared/game/types.ts';

/** POST /match-action { matchId, round, turn, action } → { status } (US-19, docs/05-API.md §3). */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const { matchId, round, turn, action } = (await req.json().catch(() => null)) ?? {};
  if (typeof matchId !== 'string' || !Number.isInteger(round) || !Number.isInteger(turn) || !action) {
    return fail(400, 'INVALID_BODY');
  }

  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return fail(404, 'MATCH_NOT_FOUND');

  const seat: Seat | null = match.player1_id === user.id ? 0 : match.player2_id === user.id ? 1 : null;
  if (seat === null) return fail(403, 'NOT_A_PLAYER');
  if (match.phase !== 'battle') return fail(409, 'WRONG_PHASE');
  if (match.round !== round || match.turn !== turn) return fail(409, 'STALE_TURN');

  // Même validation que le menu du client : une action trafiquée est refusée ici.
  const check = validateAction(match.state as BattleState, seat, action);
  if (!check.ok) return fail(400, 'INVALID_ACTION', check.reason);

  const { error } = await supabaseAdmin.from('match_actions').insert({
    match_id: matchId,
    player_id: user.id,
    phase: 'battle',
    round,
    turn,
    payload: action,
  });
  if (error?.code === '23505') return fail(409, 'ALREADY_PLAYED'); // double-clic (CA5)
  if (error) return fail(500, 'INTERNAL', error.message);

  const resolved = await tryResolveBattleTurn(matchId);
  return json(200, { status: resolved ? 'resolved' : 'waiting' });
});
