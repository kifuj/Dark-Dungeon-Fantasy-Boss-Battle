import { supabase } from './supabase.ts';
import type { RoomRow } from '../../shared/types.js';

/** Lecture directe de la table (la RLS ne montre le salon qu'à ses participants). */
export async function fetchRoom(roomId: string): Promise<RoomRow | null> {
  const { data } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
  return (data as RoomRow | null) ?? null;
}

/** Pseudos des joueurs d'un salon ou d'un match, par identifiant. */
export async function fetchUsernames(ids: (string | null)[]): Promise<Record<string, string>> {
  const wanted = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (wanted.length === 0) return {};

  const { data } = await supabase.from('profiles').select('id, username').in('id', wanted);
  return Object.fromEntries((data ?? []).map((row) => [row.id, row.username]));
}
