import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import type { BattleEvent, Seat } from '../_shared/game/types.ts';

/** POST /match-forfeit { matchId } → { status } (US-23, docs/04-MULTIJOUEUR.md §9). */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const body = (await req.json().catch(() => null)) ?? {};
  if (typeof body.matchId !== 'string') return fail(400, 'INVALID_BODY');

  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', body.matchId).maybeSingle();
  if (!match) return fail(404, 'MATCH_NOT_FOUND');

  const seat: Seat | null = match.player1_id === user.id ? 0 : match.player2_id === user.id ? 1 : null;
  if (seat === null) return fail(403, 'NOT_A_PLAYER');
  if (match.phase === 'finished') return json(200, { status: 'finished' }); // déjà terminé : idempotent

  const winnerSeat: Seat = seat === 0 ? 1 : 0;
  const events: BattleEvent[] = [
    { type: 'forfeit', seat },
    { type: 'battle_end', winnerSeat },
  ];

  // Verrou optimiste comme pour un tour : un abandon qui croise une résolution ne l'écrase pas.
  const { data: updated } = await supabaseAdmin
    .from('matches')
    .update({
      phase: 'finished',
      winner_id: [match.player1_id, match.player2_id][winnerSeat],
      last_events: events,
      version: match.version + 1,
      turn_deadline: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', match.id)
    .eq('version', match.version)
    .select('id');
  if (!updated?.length) return fail(409, 'STALE_TURN');

  await supabaseAdmin.from('rooms').update({ status: 'finished' }).eq('id', match.room_id);
  return json(200, { status: 'finished' });
});
