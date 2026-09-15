# 05 — API (Vercel Functions)

## 1. Conventions

- Tous les endpoints sont en **`POST`**, avec un corps et une réponse en **JSON**.
- Authentification : en-tête `Authorization: Bearer <access_token Supabase>`.
- Chaque fichier `api/xxx/yyy.ts` correspond à l'URL `/api/xxx/yyy`. Les fichiers et dossiers qui commencent par `_` ne sont pas exposés.
- Format d'erreur : `{ "error": "CODE_ERREUR", "message"?: "détail lisible" }`.
- Les **lectures** ne passent pas par l'API : le client lit directement Supabase (voir [02](02-ARCHITECTURE.md#-la-règle-dor)).

## 2. Codes d'erreur

| HTTP | Code | Signification |
|---|---|---|
| 400 | `INVALID_BODY` | Champ manquant ou mal typé |
| 400 | `INVALID_ACTION` | Action impossible (compétence inconnue, plus de PP, changement vers un monstre KO…) |
| 401 | `UNAUTHENTICATED` | JWT absent ou invalide |
| 403 | `NOT_A_PLAYER` | L'utilisateur ne participe pas à ce salon ou à ce match |
| 403 | `NOT_HOST` | Seul l'hôte peut lancer le match |
| 404 | `ROOM_NOT_FOUND` / `MATCH_NOT_FOUND` | Salon ou match introuvable |
| 405 | `METHOD_NOT_ALLOWED` | Autre méthode que POST |
| 409 | `ROOM_FULL` | Le salon a déjà 2 joueurs |
| 409 | `WRONG_PHASE` | Action qui ne correspond pas à la phase du match |
| 409 | `STALE_TURN` | `round`/`turn` différents du tour courant |
| 409 | `ALREADY_PLAYED` | Action déjà envoyée pour ce tour |
| 409 | `TOO_EARLY` | Timeout réclamé avant la deadline |
| 500 | `INTERNAL` | Erreur inattendue (voir les logs Vercel) |

## 3. Endpoints

### `POST /api/rooms/create`
Crée un salon dont l'appelant est l'hôte.

| Requête | Réponse `200` |
|---|---|
| `{}` | `{ "roomId": "uuid", "code": "K7P2QX" }` |

Règles : l'appelant doit avoir un profil. On génère un code de 6 caractères sans caractères ambigus (sans `0`, `O`, `1`, `I`, `L`) et on réessaie en cas de collision (`23505`).

---

### `POST /api/rooms/join`

| Requête | Réponse `200` |
|---|---|
| `{ "code": "K7P2QX" }` | `{ "roomId": "uuid" }` |

Règles : le salon existe et est en statut `waiting`, l'appelant n'est pas l'hôte, et `guest_id` est vide (`update … where guest_id is null`, pour éviter que deux joueurs rejoignent en même temps). Si l'appelant est déjà l'invité, la réponse est `200` (idempotent). Erreurs : `ROOM_NOT_FOUND`, `ROOM_FULL`.

---

### `POST /api/match/start`

| Requête | Réponse `200` |
|---|---|
| `{ "roomId": "uuid" }` | `{ "matchId": "uuid" }` |

Règles : l'appelant est l'hôte et un invité est présent. Le serveur génère une `seed` (entier 31 bits), crée l'état initial (MVP : équipes de 3 tirées au hasard → phase `battle`, `turn = 1` ; avec draft : 6 offres par joueur → phase `draft`, `turn = 0`), fixe `turn_deadline`, puis met à jour `rooms.status = 'playing'` et `rooms.current_match_id`.

---

### `POST /api/match/draft` *(Should)*

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid", "picks": [0, 3, 5] }` | `{ "status": "waiting" \| "resolved" }` |

Règles : phase `draft`, 3 indices distincts compris dans les offres du joueur. Quand les 2 drafts sont reçus, les équipes sont construites et le match passe en phase `battle`, `turn = 1`.

---

### `POST /api/match/action`

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

### `POST /api/match/timeout` *(Should)*

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid" }` | `{ "status": "resolved" \| "nothing_to_do" }` |

Règles : l'appelant est un joueur du match et `now > turn_deadline + 2 s`. Insère l'action par défaut pour chaque joueur absent (`is_auto = true`, conflits ignorés), puis résout le tour. Erreur : `TOO_EARLY`.

---

### `POST /api/match/forfeit`

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid" }` | `{ "status": "finished" }` |

---

### `POST /api/match/reward` *(Could, BO3)*

| Requête | Réponse `200` |
|---|---|
| `{ "matchId": "uuid", "round": 1, "rewardIndex": 2, "targetUid"?: "p1-m0" }` | `{ "status": "waiting" \| "resolved" }` |

## 4. Code commun

### `api/_lib/supabaseAdmin.ts`

```ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,           // ⚠️ serveur uniquement
  { auth: { persistSession: false, autoRefreshToken: false } },
);
```

### `api/_lib/http.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export function fail(res: VercelResponse, status: number, error: string, message?: string) {
  res.status(status).json({ error, message });
  return null;
}

export function ensurePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'POST') return true;
  fail(res, 405, 'METHOD_NOT_ALLOWED');
  return false;
}
```

### `api/_lib/auth.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabaseAdmin.js';
import { fail } from './http.js';

export async function requireUser(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return fail(res, 401, 'UNAUTHENTICATED');

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return fail(res, 401, 'UNAUTHENTICATED');
  return data.user;
}
```

### `api/match/action.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireUser } from '../_lib/auth.js';
import { ensurePost, fail } from '../_lib/http.js';
import { tryResolveBattleTurn } from '../_lib/turns.js';
import { validateAction } from '../../shared/engine/validate.js';
import type { BattleState } from '../../shared/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensurePost(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const { matchId, round, turn, action } = req.body ?? {};
  if (typeof matchId !== 'string' || !Number.isInteger(round) || !Number.isInteger(turn) || !action) {
    return fail(res, 400, 'INVALID_BODY');
  }

  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).single();
  if (!match) return fail(res, 404, 'MATCH_NOT_FOUND');

  const seat = match.player1_id === user.id ? 0 : match.player2_id === user.id ? 1 : null;
  if (seat === null) return fail(res, 403, 'NOT_A_PLAYER');
  if (match.phase !== 'battle') return fail(res, 409, 'WRONG_PHASE');
  if (match.round !== round || match.turn !== turn) return fail(res, 409, 'STALE_TURN');

  const check = validateAction(match.state as BattleState, seat, action);
  if (!check.ok) return fail(res, 400, 'INVALID_ACTION', check.reason);

  const { error } = await supabaseAdmin.from('match_actions').insert({
    match_id: matchId, player_id: user.id, phase: 'battle', round, turn, payload: action,
  });
  if (error?.code === '23505') return fail(res, 409, 'ALREADY_PLAYED');
  if (error) return fail(res, 500, 'INTERNAL', error.message);

  const resolved = await tryResolveBattleTurn(matchId);
  return res.status(200).json({ status: resolved ? 'resolved' : 'waiting' });
}
```

### `api/rooms/create.ts` (générer le code)

```ts
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

// dans le handler :
for (let attempt = 0; attempt < 5; attempt++) {
  const code = makeCode();
  const { data, error } = await supabaseAdmin
    .from('rooms').insert({ code, host_id: user.id }).select('id, code').single();
  if (!error) return res.status(200).json({ roomId: data.id, code: data.code });
  if (error.code !== '23505') return fail(res, 500, 'INTERNAL', error.message);
}
return fail(res, 500, 'INTERNAL', 'Impossible de générer un code');
```

## 5. Appeler l'API depuis le client

```ts
// src/lib/api.ts
import { supabase } from './supabase';

export class ApiError extends Error {
  constructor(public code: string, public status: number) { super(code); }
}

export async function callApi<T>(path: string, body: unknown = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? 'INTERNAL', res.status);
  return json as T;
}

// Exemples
export const createRoom = () => callApi<{ roomId: string; code: string }>('rooms/create');
export const joinRoom = (code: string) => callApi<{ roomId: string }>('rooms/join', { code });
export const startMatch = (roomId: string) => callApi<{ matchId: string }>('match/start', { roomId });
export const sendAction = (matchId: string, round: number, turn: number, action: unknown) =>
  callApi<{ status: 'waiting' | 'resolved' }>('match/action', { matchId, round, turn, action });
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
