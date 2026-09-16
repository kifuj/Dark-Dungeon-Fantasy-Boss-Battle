// Réponses JSON et CORS communes à toutes les fonctions (docs/05-API.md §4).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // pas de cookie : la sécurité repose sur le JWT
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function fail(status: number, error: string, message?: string) {
  return json(status, { error, message });
}

/** Réponse à renvoyer tout de suite (preflight CORS ou mauvaise méthode), sinon null. */
export function preflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return fail(405, 'METHOD_NOT_ALLOWED');
  return null;
}
