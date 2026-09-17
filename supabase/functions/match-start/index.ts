import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { createDraftState, TURN_DURATION_MS } from '../_shared/game/engine/online.ts';

/**
 * POST /match-start { roomId } → { matchId } (US-18, US-19, docs/05-API.md §3).
 * Après un duel terminé, l'un ou l'autre joueur relance une revanche dans le même salon.
 */
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
  const rematch = Boolean(room.current_match_id);
  const isPlayer = room.host_id === user.id || room.guest_id === user.id;
  if (rematch ? !isPlayer : room.host_id !== user.id) return fail(403, rematch ? 'NOT_A_PLAYER' : 'NOT_HOST');
  if (!room.guest_id) return fail(409, 'WRONG_PHASE', 'Le salon attend encore un deuxième joueur.');
  if (room.current_match_id) {
    // Idempotent : un double-clic (ou la revanche demandée par les deux joueurs) renvoie le match en cours.
    const { data: current } = await supabaseAdmin.from('matches').select('id, phase').eq('id', room.current_match_id).maybeSingle();
    if (current && current.phase !== 'finished') return json(200, { matchId: current.id });
  }

  const seed = Math.floor(Math.random() * 2 ** 31);
  const state = createDraftState(seed, room.host_id, room.guest_id);

  const { data: match, error } = await supabaseAdmin
    .from('matches')
    .insert({
      room_id: room.id,
      player1_id: room.host_id,
      player2_id: room.guest_id,
      phase: 'draft', // chaque joueur choisit son équipe avant le combat (US-18)
      round: 1,
      turn: 0,
      seed,
      state,
      turn_deadline: new Date(Date.now() + TURN_DURATION_MS).toISOString(),
    })
    .select('id')
    .single();
  if (error || !match) return fail(500, 'INTERNAL', error?.message);

  // Le Realtime sur `rooms` envoie `current_match_id` aux deux clients, qui partent sur /match/:id.
  // Verrou sur l'ancien match : si les deux joueurs demandent la revanche en même temps, un seul match est gardé.
  const update = supabaseAdmin.from('rooms').update({ status: 'playing', current_match_id: match.id }).eq('id', room.id);
  const { data: updated } = await (room.current_match_id
    ? update.eq('current_match_id', room.current_match_id)
    : update.is('current_match_id', null)
  ).select('id');
  if (!updated?.length) {
    await supabaseAdmin.from('matches').delete().eq('id', match.id);
    const { data: latest } = await supabaseAdmin.from('rooms').select('current_match_id').eq('id', room.id).single();
    return json(200, { matchId: latest?.current_match_id ?? match.id });
  }

  return json(200, { matchId: match.id });
});
