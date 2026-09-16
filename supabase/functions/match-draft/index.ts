import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { tryResolveDraft } from '../_shared/turns.ts';
import { validateDraftPicks } from '../_shared/game/engine/online.ts';
import type { Seat } from '../_shared/game/types.ts';

/** POST /match-draft { matchId, picks } → { status } (US-18, docs/05-API.md §3). */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const { matchId, picks } = (await req.json().catch(() => null)) ?? {};
  if (typeof matchId !== 'string' || !Array.isArray(picks)) return fail(400, 'INVALID_BODY');

  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return fail(404, 'MATCH_NOT_FOUND');

  const seat: Seat | null = match.player1_id === user.id ? 0 : match.player2_id === user.id ? 1 : null;
  if (seat === null) return fail(403, 'NOT_A_PLAYER');
  if (match.phase !== 'draft') return fail(409, 'WRONG_PHASE');
  if (!validateDraftPicks(picks)) return fail(400, 'INVALID_ACTION', 'Choisissez exactement 3 monstres différents parmi les 6.');

  // Le choix est rangé dans `match_actions` : la RLS le cache à l'adversaire (CA2).
  const { error } = await supabaseAdmin.from('match_actions').insert({
    match_id: matchId,
    player_id: user.id,
    phase: 'draft',
    round: match.round,
    turn: 0,
    payload: { picks },
  });
  if (error?.code === '23505') return fail(409, 'ALREADY_PLAYED'); // double-clic
  if (error) return fail(500, 'INTERNAL', error.message);

  const resolved = await tryResolveDraft(matchId);
  return json(200, { status: resolved ? 'resolved' : 'waiting' });
});
