import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase.ts';
import type { Action } from '../../shared/types.js';

/** Erreur renvoyée par une Edge Function, avec le code de docs/05-API.md §2. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function callApi<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  // `invoke` ajoute l'en-tête Authorization avec la session courante.
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error instanceof FunctionsHttpError) {
    const status = error.context.status;
    const payload = await error.context.json().catch(() => ({}));
    throw new ApiError(payload.error ?? (status === 401 ? 'UNAUTHENTICATED' : 'INTERNAL'), status);
  }
  if (error) throw new ApiError('INTERNAL', 0); // réseau, CORS, fonction introuvable
  return data as T;
}

export const createRoom = () => callApi<{ roomId: string; code: string }>('rooms-create');
export const joinRoom = (code: string) => callApi<{ roomId: string }>('rooms-join', { code });
export const startMatch = (roomId: string) => callApi<{ matchId: string }>('match-start', { roomId });
export const sendDraft = (matchId: string, picks: number[]) =>
  callApi<{ status: 'waiting' | 'resolved' }>('match-draft', { matchId, picks });
export const sendAction = (matchId: string, round: number, turn: number, action: Action) =>
  callApi<{ status: 'waiting' | 'resolved' }>('match-action', { matchId, round, turn, action });
export const claimTimeout = (matchId: string) =>
  callApi<{ status: 'resolved' | 'nothing_to_do' }>('match-timeout', { matchId });
export const forfeitMatch = (matchId: string) => callApi<{ status: 'finished' }>('match-forfeit', { matchId });

/** Messages affichés au joueur (docs/05-API.md §5). */
const MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: 'Aucun salon avec ce code.',
  ROOM_FULL: 'Ce salon est déjà complet.',
  NOT_A_PLAYER: "Vous ne participez pas à cette partie.",
  NOT_HOST: "Seul l'hôte peut lancer le duel.",
  MATCH_NOT_FOUND: 'Cette partie est introuvable.',
  INVALID_ACTION: "Cette action n'est pas possible.",
  UNAUTHENTICATED: 'Session expirée, reconnecte-toi.',
  INTERNAL: 'Une erreur est survenue, réessaie.',
};

export const errorMessage = (error: unknown): string =>
  (error instanceof ApiError && MESSAGES[error.code]) || MESSAGES.INTERNAL;
