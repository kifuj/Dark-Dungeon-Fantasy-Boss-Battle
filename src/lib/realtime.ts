import { supabase } from './supabase.ts';
import type { MatchRow, RoomRow } from '../../shared/types.js';

/**
 * Filet de sécurité : la ligne est relue à cet intervalle même quand le Realtime
 * fonctionne. C'est le plan B de docs/04-MULTIJOUEUR.md §10, laissé actif en
 * permanence après le sprint 3 (un canal peut être fermé sans erreur visible).
 */
export const POLL_INTERVAL_MS = 2000;

type Table = 'rooms' | 'matches';

/**
 * Suit une ligne de `rooms` ou `matches` : Realtime pour l'instantané, relecture
 * périodique pour la robustesse. `onRow` peut être appelée plusieurs fois avec la
 * même version : l'appelant compare `version` avant d'animer quoi que ce soit.
 */
function subscribeToRow<T>(table: Table, id: string, onRow: (row: T) => void): () => void {
  let stopped = false;

  const read = async () => {
    const { data } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
    if (data && !stopped) onRow(data as T);
  };

  // Un nom de canal unique par abonnement : en StrictMode, React monte deux fois, et
  // deux canaux du même nom se marchent dessus (le second peut être fermé aussitôt).
  const channel = supabase
    .channel(`${table}:${id}:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter: `id=eq.${id}` }, (payload) => {
      if (!stopped) onRow(payload.new as T);
    })
    .subscribe((status) => {
      // Une fois abonné, on relit la ligne pour ne rater aucune mise à jour arrivée avant l'abonnement.
      if (status === 'SUBSCRIBED') void read();
    });

  void read(); // premier affichage sans attendre le Realtime
  const poll = setInterval(() => void read(), POLL_INTERVAL_MS);

  return () => {
    stopped = true;
    clearInterval(poll);
    void supabase.removeChannel(channel);
  };
}

export const subscribeToRoom = (roomId: string, onRow: (row: RoomRow) => void) => subscribeToRow<RoomRow>('rooms', roomId, onRow);
export const subscribeToMatch = (matchId: string, onRow: (row: MatchRow) => void) => subscribeToRow<MatchRow>('matches', matchId, onRow);
