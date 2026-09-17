import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { tryResolveBattleTurn, tryResolveDraft } from '../_shared/turns.ts';
import { DEFAULT_DRAFT_PICKS, defaultAction, isTurnExpired } from '../_shared/game/engine/online.ts';
import { replacementSeats } from '../_shared/game/engine/replace.ts';
import type { BattleState, Seat } from '../_shared/game/types.ts';

/**
 * POST /match-timeout { matchId } → { status: 'resolved' | 'nothing_to_do' } (US-20, docs/04-MULTIJOUEUR.md §7).
 * Aucun serveur ne tourne en continu : c'est le client qui attend qui réclame le timeout
 * une fois la deadline passée. L'action par défaut est jouée pour chaque joueur absent.
 */
Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const body = (await req.json().catch(() => null)) ?? {};
  if (typeof body.matchId !== 'string') return fail(400, 'INVALID_BODY');

  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', body.matchId).maybeSingle();
  if (!match) return fail(404, 'MATCH_NOT_FOUND');

  const players = [match.player1_id, match.player2_id];
  if (!players.includes(user.id)) return fail(403, 'NOT_A_PLAYER');
  if (match.phase !== 'battle' && match.phase !== 'draft') return json(200, { status: 'nothing_to_do' });
  if (!isTurnExpired(match.turn_deadline, Date.now())) return fail(409, 'TOO_EARLY'); // CA3

  const phase = match.phase as 'battle' | 'draft';
  const turn = phase === 'draft' ? 0 : match.turn;
  const { data: played } = await supabaseAdmin
    .from('match_actions')
    .select('player_id')
    .eq('match_id', match.id)
    .eq('phase', phase)
    .eq('round', match.round)
    .eq('turn', turn);

  const state = match.state as BattleState;
  // Phase de remplacement : seuls les joueurs dont le monstre est KO doivent jouer.
  const replacing = phase === 'battle' ? replacementSeats(state) : [];
  const expected: Seat[] = replacing.length > 0 ? replacing : [0, 1];
  const autoActions = expected
    .filter((seat) => !played?.some((a) => a.player_id === players[seat]))
    .map((seat) => ({
      match_id: match.id,
      player_id: players[seat],
      phase,
      round: match.round,
      turn,
      payload: phase === 'draft' ? { picks: DEFAULT_DRAFT_PICKS } : defaultAction(state, seat),
      is_auto: true,
    }));
  if (autoActions.length > 0) {
    // Conflits ignorés : si le joueur envoie son action au même moment, c'est la sienne qui compte.
    const { error } = await supabaseAdmin
      .from('match_actions')
      .upsert(autoActions, { onConflict: 'match_id,player_id,phase,round,turn', ignoreDuplicates: true });
    if (error) return fail(500, 'INTERNAL', error.message);
  }

  const resolved = phase === 'draft' ? await tryResolveDraft(match.id) : await tryResolveBattleTurn(match.id);
  return json(200, { status: resolved ? 'resolved' : 'nothing_to_do' });
});
