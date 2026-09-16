import { createClient } from '@supabase/supabase-js';

/**
 * Client serveur : la clé `service_role` ignore la RLS. Elle est injectée par Supabase
 * dans les fonctions déployées et ne doit jamais sortir du dossier supabase/functions/.
 */
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
