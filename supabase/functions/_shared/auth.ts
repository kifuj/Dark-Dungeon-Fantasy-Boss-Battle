import { supabaseAdmin } from './supabaseAdmin.ts';

/** Utilisateur derrière le JWT de la requête, ou null. La passerelle Supabase a déjà filtré. */
export async function getUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : data.user;
}
