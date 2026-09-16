import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase du navigateur (US-02 CA4). La clé publishable est publique par
 * construction : elle est embarquée dans le build et la sécurité repose sur la RLS
 * (docs/03-BASE-DE-DONNEES.md §2) et sur les Edge Functions.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const SUPABASE_URL = (env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
export const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** Faux tant que les variables d'environnement ne sont pas renseignées : le multijoueur affiche alors un message clair. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = createClient(SUPABASE_URL || 'http://localhost:54321', SUPABASE_KEY || 'cle-absente', {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ddfbb-auth' },
});
