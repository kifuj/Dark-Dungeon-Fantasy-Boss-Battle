import { supabase } from './supabase.ts';
import type { MatchRow, RoomRow } from '../../shared/types.js';

/** Plan B si le Realtime est bloqué par le réseau (docs/04-MULTIJOUEUR.md §10). */
export const POLL_INTERVAL_MS = 2000;

type Table = 'rooms' | 'matches';

/**
 * Suit une ligne de `rooms` ou `matches` : Realtime d'abord, relecture périodique
 * si le canal n'arrive pas à s'établir. `onRow` peut être appelée plusieurs fois
 * avec la même version : l'appelant compare `version` avant d'animer.
 */
function subscribeToRow<T>(table: Table, id: string, onRow: (row: T) => void): () => void {
  let stopped = false;
  let poll: ReturnType<typeof setInterval> | null = null;

  const read = async () => {
    const { data } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
    if (data && !stopped) onRow(data as T);
  };

  const startPolling = () => {
    if (poll || stopped) return;
    poll = setInterval(() => void read(), POLL_INTERVAL_MS);
  };

  const channel = supabase
    .channel(`${table}:${id}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter: `id=eq.${id}` }, (payload) => {
      if (!stopped) onRow(payload.new as T);
    })
    .subscribe((status) => {
      // Une fois abonné, on relit la ligne pour ne rater aucune mise à jour arrivée avant l'abonnement.
      if (status === 'SUBSCRIBED') void read();
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') startPolling();
    });

  void read(); // premier affichage sans attendre le Realtime

  return () => {
    stopped = true;
    if (poll) clearInterval(poll);
    void supabase.removeChannel(channel);
  };
}

export const subscribeToRoom = (roomId: string, onRow: (row: RoomRow) => void) => subscribeToRow<RoomRow>('rooms', roomId, onRow);
export const subscribeToMatch = (matchId: string, onRow: (row: MatchRow) => void) => subscribeToRow<MatchRow>('matches', matchId, onRow);
