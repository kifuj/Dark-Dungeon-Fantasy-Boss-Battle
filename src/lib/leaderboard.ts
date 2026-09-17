import { loadProfile } from './session.ts';
import { supabase } from './supabase.ts';
import type { MonsterInstance } from '../../shared/types.js';

/** Ligne de la vue `leaderboard` (docs/03-BASE-DE-DONNEES.md) : meilleur score et meilleure vague par pseudo. */
export interface LeaderboardRow {
  username: string;
  best_score: number;
  best_wave: number;
}

/** Top 20 trié par score (US-14 CA2). La RLS réserve la lecture aux joueurs connectés. */
export async function loadLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.from('leaderboard').select('username, best_score, best_wave');
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

/** Résultat de l'enregistrement : `guest` quand le joueur n'a pas de pseudo (le solo se joue sans compte). */
export type SaveRunResult = 'saved' | 'guest' | 'error';

/** Enregistre la run dans `solo_runs` (US-14 CA1). La RLS n'autorise que ses propres lignes. */
export async function saveSoloRun(wave: number, score: number, team: MonsterInstance[]): Promise<SaveRunResult> {
  try {
    const profile = await loadProfile();
    if (!profile) return 'guest';
    const { error } = await supabase.from('solo_runs').insert({
      user_id: profile.id,
      wave_reached: wave,
      score,
      team: team.map((m) => ({ speciesId: m.speciesId, level: m.level })),
    });
    return error ? 'error' : 'saved';
  } catch {
    return 'error';
  }
}
