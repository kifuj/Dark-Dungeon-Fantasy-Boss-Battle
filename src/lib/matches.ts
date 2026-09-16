import { supabase } from './supabase.ts';
import type { MatchRow } from '../../shared/types.js';

export async function fetchMatch(matchId: string): Promise<MatchRow | null> {
  const { data } = await supabase.from('matches').select('*').eq('id', matchId).maybeSingle();
  return (data as MatchRow | null) ?? null;
}

/**
 * Vrai si le joueur a déjà envoyé son action pour ce tour (US-18, US-19 CA2, US-21 CA2).
 * La RLS ne laisse voir que ses propres actions : le choix de l'adversaire reste secret.
 */
export async function hasPlayedThisTurn(
  matchId: string,
  round: number,
  turn: number,
  phase: 'draft' | 'battle' = 'battle',
): Promise<boolean> {
  const { data } = await supabase
    .from('match_actions')
    .select('id')
    .eq('match_id', matchId)
    .eq('phase', phase)
    .eq('round', round)
    .eq('turn', turn)
    .maybeSingle();
  return Boolean(data);
}
