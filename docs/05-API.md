# 05 — API (Supabase Edge Functions)

## 1. Conventions

- Chaque endpoint est une **Edge Function** Supabase (Deno) : `supabase/functions/<nom>/index.ts`, appelable à `https://<ref>.supabase.co/functions/v1/<nom>`.
- Nommage `<ressource>-<action>` : `rooms-create`, `match-action`… Les dossiers qui commencent par `_` (`_shared/`) ne sont pas déployés.
- Tous les endpoints sont en **`POST`**, avec un corps et une réponse en **JSON**. Les requêtes `OPTIONS` (preflight CORS) reçoivent une réponse vide : le front est servi par Render, sur un autre domaine que Supabase.
- Authentification : en-tête `Authorization: Bearer <access_token Supabase>`, ajouté automatiquement par `supabase.functions.invoke`. La passerelle Supabase vérifie le JWT avant d'appeler la fonction.
- Format d'erreur : `{ "error": "CODE_ERREUR", "message"?: "détail lisible" }`.
- Les **lectures** ne passent pas par l'API : le client lit directement Supabase (voir [02](02-ARCHITECTURE.md#-la-règle-dor)).

## 2. Codes d'erreur

| HTTP | Code | Signification |
|---|---|---|
| 400 | `INVALID_BODY` | Champ manquant ou mal typé |
| 400 | `INVALID_ACTION` | Action impossible (compétence inconnue, plus de PP, changement vers un monstre KO…) |
| 401 | `UNAUTHENTICATED` | JWT absent ou invalide (peut aussi venir de la passerelle Supabase, avec un autre corps) |
| 403 | `NOT_A_PLAYER` | L'utilisateur ne participe pas à ce salon ou à ce match |
| 403 | `NOT_HOST` | Seul l'hôte peut lancer le match |
| 404 | `ROOM_NOT_FOUND` / `MATCH_NOT_FOUND` | Salon ou match introuvable |
| 405 | `METHOD_NOT_ALLOWED` | Autre méthode que POST |
| 409 | `ROOM_FULL` | Le salon a déjà 2 joueurs |
| 409 | `WRONG_PHASE` | Action qui ne correspond pas à la phase du match |
| 409 | `STALE_TURN` | `round`/`turn` différents du tour courant |
| 409 | `ALREADY_PLAYED` | Action déjà envoyée pour ce tour |
| 409 | `TOO_EARLY` | Timeout réclamé avant la deadline |
| 500 | `INTERNAL` | Erreur inattendue (voir les logs de la fonction dans Supabase) |

## 3. Endpoints

> ✅ **Déployées au sprint 3** : `rooms-create`, `rooms-join`, `match-start`, `match-action`, `match-forfeit`
> (`npm run functions:deploy`). **Ajoutée ensuite** : `match-draft` (US-18). `match-timeout` et `match-reward` restent à faire.
> Toutes les fonctions livrées sont **idempotentes** : rejoindre deux fois, lancer deux fois ou abandonner
> deux fois renvoie `200` avec le même résultat, pour qu'un double-clic ne produise jamais d'erreur visible.

### `rooms-create`
Crée un salon dont l'appelant est l'hôte.

| Requête | Réponse `200` |
|---|---|
| `{}` | `{ "roomId": "uuid", "code": "K7P2QX" }` |

Règles : l'appelant doit avoir un profil. On génère un code de 6 caractères sans caractères ambigus (sans `0`, `O`, `1`, `I`, `L`) et on réessaie en cas de collision (`23505`).

---

### `rooms-join`

| Requête | Réponse `200` |
|---|---|
| `{ "code": "K7P2QX" }` | `{ "roomId": "uuid" }` |

Règles : le salon existe et est en statut `waiting`, l'appelant n'est pas l'hôte, et `guest_id` est vide (`update … where guest_id is null`, pour éviter que deux joueurs rejoignent en même temps). Si l'appelant est déjà l'invité, la réponse est `200` (idempotent). Erreurs : `ROOM_NOT_FOUND`, `ROOM_FULL`.

---

### `match-start`

| Requête | Réponse `200` |
|---|---|
| `{ "roomId": "uuid" }` | `{ "matchId": "uuid" }` |

Règles : l'appelant est l'hôte et un invité est présent. Le serveur génère une `seed` (entier 31 bits), crée l'état initial (6 offres par joueur → phase `draft`, `turn = 0`, voir `match-draft`), fixe `turn_deadline`, puis met à jour `rooms.status = 'playing'` et `rooms.current_match_id`.

---

### `match-draft` (US-18)

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid", "picks": [0, 3, 5] }` | `{ "status": "waiting" \| "resolved" }` |

Règles : phase `draft`, 3 indices distincts compris dans les offres du joueur (0 à 5) ; l'ordre des indices est l'ordre d'entrée en combat. Le choix est inséré dans `match_actions` (`phase = 'draft'`, `turn = 0`). Quand les 2 drafts sont reçus, les équipes sont construites et le match passe en phase `battle`, `turn = 1`, `draftOffers = null`. Erreurs : `WRONG_PHASE`, `INVALID_ACTION`, `ALREADY_PLAYED`, `NOT_A_PLAYER`.

---

### `match-action`

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid", "round": 1, "turn": 4, "action": Action }` | `{ "status": "waiting" \| "resolved" }` |

`Action` :

```ts
type Action =
  | { type: 'skill'; skillId: string }
  | { type: 'switch'; toIndex: number };
```

Règles : voir l'implémentation ci-dessous. Erreurs : `WRONG_PHASE`, `STALE_TURN`, `INVALID_ACTION`, `ALREADY_PLAYED`, `NOT_A_PLAYER`.

---

### `match-timeout` *(Should)*

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid" }` | `{ "status": "resolved" \| "nothing_to_do" }` |

Règles : l'appelant est un joueur du match et `now > turn_deadline + 2 s`. Insère l'action par défaut pour chaque joueur absent (`is_auto = true`, conflits ignorés), puis résout le tour. Erreur : `TOO_EARLY`.

---

### `match-forfeit`

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid" }` | `{ "status": "finished" }` |

---

### `match-reward` *(Could, BO3)*

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid", "round": 1, "rewardIndex": 2, "targetUid"?: "p1-m0" }` | `{ "status": "waiting" \| "resolved" }` |

## 4. Code commun

> Dans `supabase/functions/`, les imports relatifs prennent l'extension **`.ts`** (Deno) et les paquets npm sont importés avec le préfixe `npm:`. Voir [07 §1](07-INSTALLATION-DEPLOIEMENT.md#supabasefunctionsdenojson) pour l'import de `shared/`.

### `supabase/functions/_shared/supabaseAdmin.ts`

```ts
import { createClient } from 'npm:@supabase/supabase-js@2';

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // ⚠️ injectée par Supabase, serveur uniquement
  { auth: { persistSession: false, autoRefreshToken: false } },
);
```

### `supabase/functions/_shared/http.ts`

```ts
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
```

### `supabase/functions/_shared/auth.ts`

```ts
import { supabaseAdmin } from './supabaseAdmin.ts';

export async function getUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : data.user;
}
```

### `supabase/functions/match-action/index.ts`

```ts
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { getUser } from '../_shared/auth.ts';
import { fail, json, preflight } from '../_shared/http.ts';
import { tryResolveBattleTurn } from '../_shared/turns.ts';
import { validateAction } from '../../../shared/engine/validate.ts';
import type { BattleState } from '../../../shared/types.ts';

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const user = await getUser(req);
  if (!user) return fail(401, 'UNAUTHENTICATED');

  const { matchId, round, turn, action } = (await req.json().catch(() => null)) ?? {};
  if (typeof matchId !== 'string' || !Number.isInteger(round) || !Number.isInteger(turn) || !action) {
    return fail(400, 'INVALID_BODY');
  }

  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).single();
  if (!match) return fail(404, 'MATCH_NOT_FOUND');

  const seat = match.player1_id === user.id ? 0 : match.player2_id === user.id ? 1 : null;
  if (seat === null) return fail(403, 'NOT_A_PLAYER');
  if (match.phase !== 'battle') return fail(409, 'WRONG_PHASE');
  if (match.round !== round || match.turn !== turn) return fail(409, 'STALE_TURN');

  const check = validateAction(match.state as BattleState, seat, action);
  if (!check.ok) return fail(400, 'INVALID_ACTION', check.reason);

  const { error } = await supabaseAdmin.from('match_actions').insert({
    match_id: matchId, player_id: user.id, phase: 'battle', round, turn, payload: action,
  });
  if (error?.code === '23505') return fail(409, 'ALREADY_PLAYED');
  if (error) return fail(500, 'INTERNAL', error.message);

  const resolved = await tryResolveBattleTurn(matchId);
  return json(200, { status: resolved ? 'resolved' : 'waiting' });
});
```

### `supabase/functions/rooms-create/index.ts` (générer le code)

```ts
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

// dans Deno.serve, après preflight et getUser :
for (let attempt = 0; attempt < 5; attempt++) {
  const code = makeCode();
  const { data, error } = await supabaseAdmin
    .from('rooms').insert({ code, host_id: user.id }).select('id, code').single();
  if (!error) return json(200, { roomId: data.id, code: data.code });
  if (error.code !== '23505') return fail(500, 'INTERNAL', error.message);
}
return fail(500, 'INTERNAL', 'Impossible de générer un code');
```

## 5. Appeler l'API depuis le client

```ts
// src/lib/api.ts
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export class ApiError extends Error {
  constructor(public code: string, public status: number) { super(code); }
}

export async function callApi<T>(name: string, body: unknown = {}): Promise<T> {
  // invoke ajoute l'en-tête Authorization avec la session courante
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error instanceof FunctionsHttpError) {
    const status = error.context.status;
    const json = await error.context.json().catch(() => ({}));
    throw new ApiError(json.error ?? (status === 401 ? 'UNAUTHENTICATED' : 'INTERNAL'), status);
  }
  if (error) throw new ApiError('INTERNAL', 0); // réseau, CORS, fonction introuvable
  return data as T;
}

// Exemples
export const createRoom = () => callApi<{ roomId: string; code: string }>('rooms-create');
export const joinRoom = (code: string) => callApi<{ roomId: string }>('rooms-join', { code });
export const startMatch = (roomId: string) => callApi<{ matchId: string }>('match-start', { roomId });
export const sendAction = (matchId: string, round: number, turn: number, action: unknown) =>
  callApi<{ status: 'waiting' | 'resolved' }>('match-action', { matchId, round, turn, action });
```

### Messages d'erreur affichés au joueur

| Code | Message |
|---|---|
| `ROOM_NOT_FOUND` | « Aucun salon avec ce code. » |
| `ROOM_FULL` | « Ce salon est déjà complet. » |
| `ALREADY_PLAYED` | *(silencieux : on reste en attente)* |
| `STALE_TURN` | *(silencieux : on relit l'état du match)* |
| `UNAUTHENTICATED` | « Session expirée, reconnecte-toi. » |
| autres | « Une erreur est survenue, réessaie. » |
