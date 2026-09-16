import { supabase } from './supabase.ts';
import type { ProfileRow } from '../../shared/types.js';

/** Erreurs de connexion affichées par la page Login (US-15 CA2). */
export type SessionError = 'USERNAME_TAKEN' | 'INVALID_USERNAME' | 'INTERNAL';

export class SessionFailure extends Error {
  readonly code: SessionError;

  constructor(code: SessionError) {
    super(code);
    this.name = 'SessionFailure';
    this.code = code;
  }
}

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

/** Même règle que la contrainte SQL `char_length(username) between 3 and 20` (docs/03 §2). */
export function normalizeUsername(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export const isValidUsername = (input: string) => {
  const name = normalizeUsername(input);
  return name.length >= USERNAME_MIN && name.length <= USERNAME_MAX;
};

/** Profil du joueur connecté, ou null si personne n'est connecté (US-15 CA3). */
export async function loadProfile(): Promise<ProfileRow | null> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;

  const { data: profile } = await supabase.from('profiles').select('id, username').eq('id', userId).maybeSingle();
  return (profile as ProfileRow | null) ?? null;
}

/**
 * Connexion par pseudo (US-15 CA1) : session anonyme Supabase puis `upsert` du profil.
 * Le joueur déjà connecté garde son utilisateur et ne fait que renommer son profil.
 */
export async function signInWithUsername(input: string): Promise<ProfileRow> {
  const username = normalizeUsername(input);
  if (!isValidUsername(username)) throw new SessionFailure('INVALID_USERNAME');

  const { data: existing } = await supabase.auth.getSession();
  let userId = existing.session?.user.id;

  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) throw new SessionFailure('INTERNAL');
    userId = data.user.id;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, username })
    .select('id, username')
    .single();

  // 23505 = violation de l'unicité de `username` : le pseudo appartient à quelqu'un d'autre.
  if (error?.code === '23505') throw new SessionFailure('USERNAME_TAKEN');
  if (error || !profile) throw new SessionFailure('INTERNAL');
  return profile as ProfileRow;
}

export async function signOut() {
  await supabase.auth.signOut();
}
