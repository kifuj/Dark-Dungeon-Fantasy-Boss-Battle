import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être définies (voir .env.example).');
}

/** Client navigateur : clé publishable uniquement, la sécurité repose sur la RLS. */
export const supabase = createClient(url, key);
