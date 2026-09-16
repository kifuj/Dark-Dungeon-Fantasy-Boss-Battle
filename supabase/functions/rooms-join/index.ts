import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { isRoomCode, normalizeRoomCode } from '../_shared/game/engine/rooms.ts';

/** POST /rooms-join { code } → { roomId } (US-17, docs/05-API.md §3). */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const body = (await req.json().catch(() => null)) ?? {};
  if (typeof body.code !== 'string') return fail(400, 'INVALID_BODY');

  const code = normalizeRoomCode(body.code); // casse, espaces et tirets ignorés (CA4)
  if (!isRoomCode(code)) return fail(404, 'ROOM_NOT_FOUND');

  const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) return fail(403, 'NOT_A_PLAYER', 'Aucun profil : choisis un pseudo avant de rejoindre un salon.');

  const { data: room } = await supabaseAdmin
    .from('rooms')
    .select('id, host_id, guest_id, status')
    .eq('code', code)
    .maybeSingle();
  if (!room) return fail(404, 'ROOM_NOT_FOUND');

  // Idempotent : l'hôte et l'invité déjà présents retrouvent simplement leur salon.
  if (room.host_id === user.id || room.guest_id === user.id) return json(200, { roomId: room.id });
  if (room.status !== 'waiting') return fail(409, 'ROOM_FULL');

  // `guest_id is null` dans le WHERE : si deux joueurs entrent le code en même temps,
  // un seul UPDATE modifie une ligne, l'autre reçoit ROOM_FULL.
  const { data: joined, error } = await supabaseAdmin
    .from('rooms')
    .update({ guest_id: user.id })
    .eq('id', room.id)
    .eq('status', 'waiting')
    .is('guest_id', null)
    .select('id');
  if (error) return fail(500, 'INTERNAL', error.message);
  if (!joined?.length) return fail(409, 'ROOM_FULL');

  return json(200, { roomId: room.id });
});
