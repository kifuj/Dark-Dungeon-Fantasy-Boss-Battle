import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { makeRoomCode } from '../_shared/game/engine/rooms.ts';

/** POST /rooms-create → { roomId, code } (US-16, docs/05-API.md §3). */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) return fail(403, 'NOT_A_PLAYER', 'Aucun profil : choisis un pseudo avant de créer un salon.');

  // Un joueur n'a qu'un salon en attente à la fois : les précédents sont annulés.
  await supabaseAdmin.from('rooms').update({ status: 'cancelled' }).eq('host_id', user.id).eq('status', 'waiting');

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeRoomCode(Math.random);
    const { data, error } = await supabaseAdmin.from('rooms').insert({ code, host_id: user.id }).select('id, code').single();
    if (!error && data) return json(200, { roomId: data.id, code: data.code });
    if (error && error.code !== '23505') return fail(500, 'INTERNAL', error.message); // 23505 = code déjà pris
  }
  return fail(500, 'INTERNAL', 'Impossible de générer un code de salon.');
});
