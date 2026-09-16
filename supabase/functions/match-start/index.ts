import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { TURN_DURATION_MS } from '../_shared/turns.ts';
import { createOnlineBattle } from '../_shared/game/engine/online.ts';

/** POST /match-start { roomId } → { matchId } (US-19, docs/05-API.md §3). */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const body = (await req.json().catch(() => null)) ?? {};
  if (typeof body.roomId !== 'string') return fail(400, 'INVALID_BODY');

  const { data: room } = await supabaseAdmin
    .from('rooms')
    .select('id, host_id, guest_id, status, current_match_id')
    .eq('id', body.roomId)
    .maybeSingle();
  if (!room) return fail(404, 'ROOM_NOT_FOUND');
  if (room.host_id !== user.id) return fail(403, 'NOT_HOST');
  if (!room.guest_id) return fail(409, 'WRONG_PHASE', 'Le salon attend encore un deuxième joueur.');
  // Idempotent : un double-clic sur « Lancer le duel » renvoie le match déjà créé.
  if (room.current_match_id) return json(200, { matchId: room.current_match_id });

  const seed = Math.floor(Math.random() * 2 ** 31);
  const state = createOnlineBattle(seed, room.host_id, room.guest_id);

  const { data: match, error } = await supabaseAdmin
    .from('matches')
    .insert({
      room_id: room.id,
      player1_id: room.host_id,
      player2_id: room.guest_id,
      phase: 'battle', // MVP : pas de draft (docs/04 §2)
      round: 1,
      turn: 1,
      seed,
      state,
      turn_deadline: new Date(Date.now() + TURN_DURATION_MS).toISOString(),
    })
    .select('id')
    .single();
  if (error || !match) return fail(500, 'INTERNAL', error?.message);

  // Le Realtime sur `rooms` envoie `current_match_id` aux deux clients, qui partent sur /match/:id.
  await supabaseAdmin.from('rooms').update({ status: 'playing', current_match_id: match.id }).eq('id', room.id);

  return json(200, { matchId: match.id });
});
