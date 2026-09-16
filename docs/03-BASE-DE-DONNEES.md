# 03 — Base de données (Supabase)

## 1. Modèle

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "1-1"
  PROFILES ||--o{ ROOMS : "héberge / rejoint"
  ROOMS ||--o{ MATCHES : contient
  MATCHES ||--o{ MATCH_ACTIONS : "actions des joueurs"
  MATCHES ||--o{ MATCH_TURNS : "historique"
  PROFILES ||--o{ SOLO_RUNS : joue

  PROFILES { uuid id PK; text username UK }
  ROOMS { uuid id PK; text code UK; uuid host_id FK; uuid guest_id FK; text status; uuid current_match_id FK }
  MATCHES { uuid id PK; uuid room_id FK; uuid player1_id; uuid player2_id; text phase; int round; int turn; int seed; jsonb state; jsonb last_events; int version; timestamptz turn_deadline; uuid winner_id }
  MATCH_ACTIONS { bigint id PK; uuid match_id FK; uuid player_id FK; text phase; int round; int turn; jsonb payload }
  MATCH_TURNS { uuid match_id PK; int round PK; int turn PK; jsonb events }
  SOLO_RUNS { uuid id PK; uuid user_id FK; int wave_reached; int score; jsonb team }
```

| Table | Rôle | Qui écrit |
|---|---|---|
| `profiles` | Pseudo du joueur (lié à l'utilisateur anonyme) | Le client (sa propre ligne) |
| `rooms` | Salon d'attente avec un code | API |
| `matches` | **État faisant autorité** d'un duel (`state` jsonb) + événements du dernier tour | API |
| `match_actions` | Actions soumises, cachées à l'adversaire tant que le tour n'est pas résolu | API |
| `match_turns` | Historique des tours (debug, replay) | API |
| `solo_runs` | Scores du mode solo | Le client (ses propres lignes) |

## 2. Migration SQL

À enregistrer dans `supabase/migrations/001_init.sql`, puis à exécuter dans **Supabase → SQL Editor**.

```sql
-- =========================================================
-- 001_init.sql — Dark Dungeon Fantasy Boss battle
-- =========================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique
              check (char_length(username) between 3 and 20),
  created_at  timestamptz not null default now()
);

-- ---------- ROOMS ----------
create table public.rooms (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  host_id           uuid not null references public.profiles(id) on delete cascade,
  guest_id          uuid references public.profiles(id) on delete set null,
  status            text not null default 'waiting'
                    check (status in ('waiting', 'playing', 'finished', 'cancelled')),
  current_match_id  uuid,
  created_at        timestamptz not null default now()
);

-- ---------- MATCHES ----------
create table public.matches (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms(id) on delete cascade,
  player1_id     uuid not null references public.profiles(id),
  player2_id     uuid not null references public.profiles(id),
  phase          text not null default 'draft'
                 check (phase in ('draft', 'battle', 'reward', 'finished')),
  round          int  not null default 1,
  turn           int  not null default 0,
  seed           int  not null,
  state          jsonb not null,
  last_events    jsonb not null default '[]'::jsonb,
  version        int  not null default 1,
  turn_deadline  timestamptz,
  winner_id      uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (player1_id <> player2_id)
);

alter table public.rooms
  add constraint rooms_current_match_fk
  foreign key (current_match_id) references public.matches(id) on delete set null;

-- ---------- MATCH_ACTIONS ----------
create table public.match_actions (
  id          bigint generated always as identity primary key,
  match_id    uuid not null references public.matches(id) on delete cascade,
  player_id   uuid not null references public.profiles(id),
  phase       text not null,
  round       int  not null,
  turn        int  not null,
  payload     jsonb not null,
  is_auto     boolean not null default false,   -- true si jouée par timeout
  created_at  timestamptz not null default now(),
  unique (match_id, player_id, phase, round, turn) -- 1 action par joueur par tour
);
create index match_actions_lookup on public.match_actions (match_id, phase, round, turn);

-- ---------- MATCH_TURNS (historique) ----------
create table public.match_turns (
  match_id    uuid not null references public.matches(id) on delete cascade,
  round       int  not null,
  turn        int  not null,
  events      jsonb not null,
  created_at  timestamptz not null default now(),
  primary key (match_id, round, turn)
);

-- ---------- SOLO_RUNS ----------
create table public.solo_runs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  wave_reached  int  not null check (wave_reached >= 0),
  score         int  not null check (score >= 0),
  team          jsonb,
  created_at    timestamptz not null default now()
);
create index solo_runs_score on public.solo_runs (score desc);

-- ---------- CLASSEMENT ----------
create view public.leaderboard
with (security_invoker = true) as
select p.username, max(r.score) as best_score, max(r.wave_reached) as best_wave
from public.solo_runs r
join public.profiles p on p.id = r.user_id
group by p.username
order by best_score desc
limit 20;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles      enable row level security;
alter table public.rooms         enable row level security;
alter table public.matches       enable row level security;
alter table public.match_actions enable row level security;
alter table public.match_turns   enable row level security;
alter table public.solo_runs     enable row level security;

-- PROFILES : tout le monde lit, chacun gère sa ligne
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ROOMS : visibles par leurs participants uniquement (écriture = API)
create policy "rooms_select_participants" on public.rooms
  for select to authenticated
  using ((select auth.uid()) in (host_id, guest_id));

-- MATCHES : visibles par les 2 joueurs (écriture = API)
create policy "matches_select_players" on public.matches
  for select to authenticated
  using ((select auth.uid()) in (player1_id, player2_id));

-- MATCH_ACTIONS : chacun ne voit QUE ses propres actions (choix secret)
create policy "match_actions_select_own" on public.match_actions
  for select to authenticated
  using (player_id = (select auth.uid()));

-- MATCH_TURNS : visibles par les 2 joueurs
create policy "match_turns_select_players" on public.match_turns
  for select to authenticated
  using (exists (
    select 1 from public.matches m
    where m.id = match_id
      and (select auth.uid()) in (m.player1_id, m.player2_id)
  ));

-- SOLO_RUNS : lecture pour tous (classement), insertion de ses propres runs
create policy "solo_runs_select" on public.solo_runs
  for select to authenticated using (true);
create policy "solo_runs_insert_own" on public.solo_runs
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Droits explicites (sans effet si déjà accordés par défaut)
grant select on public.profiles, public.rooms, public.matches,
                public.match_actions, public.match_turns, public.solo_runs,
                public.leaderboard to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert on public.solo_runs to authenticated;

-- =========================================================
-- REALTIME : diffuser les changements de ces tables
-- =========================================================
alter publication supabase_realtime add table public.rooms, public.matches;
```

> ⚠️ **Pourquoi `match_actions` n'est pas dans Realtime ?** Si elle l'était, un joueur recevrait peut-être l'action de l'adversaire avant la résolution du tour. La RLS filtre aussi Realtime, mais on évite le risque : les clients ne sont notifiés **que** via `matches`, après résolution.

## 3. Configuration du dashboard Supabase

> ✅ **Fait au sprint 3 (16/09/2026)** sur le projet `wdjhbwdtlkpizzfhcsoj` : migration exécutée (7 tables + la vue `leaderboard`), connexions anonymes activées, `rooms` et `matches` présentes dans la publication `supabase_realtime`. Vérifié par `npm run test:multi`.
> `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont en place dans Render : le duel a été rejoué sur <https://dark-dungeon-fantasy-boss-battle.onrender.com>. ⚠️ Une clé tronquée donne `401 Invalid API key` sur *tous* les appels — la vérifier avec le `curl` de [07 §1](07-INSTALLATION-DEPLOIEMENT.md#client-supabase).

1. **Authentication → Sign In / Providers → Allow anonymous sign-ins** : activer.
2. **SQL Editor** : coller et exécuter `001_init.sql`.
3. **Database → Publications → supabase_realtime** : vérifier que `rooms` et `matches` sont cochées.
4. **Project Settings → API Keys** : récupérer l'URL, la clé **publishable** et la clé **secret** (voir [07](07-INSTALLATION-DEPLOIEMENT.md)).
5. *(Optionnel)* **Authentication → Rate limits** : les limites par défaut des connexions anonymes suffisent pour une démo.

## 4. Forme du JSON `matches.state`

```jsonc
{
  "phase": "battle",
  "round": 1,
  "turn": 4,
  "players": [
    {
      "userId": "uuid-joueur-1",
      "activeIndex": 0,
      "team": [
        {
          "uid": "p1-m0",
          "speciesId": "salamander",
          "name": "Salamandre",
          "element": "feu",
          "level": 10,
          "hp": 42, "maxHp": 86,
          "stats": { "atk": 111, "def": 68, "spd": 94 },
          "skills": [ { "id": "fireball", "ppLeft": 8 }, { "id": "inferno", "ppLeft": 3 }, { "id": "strike", "ppLeft": null } ],
          "modifiers": { "defMult": 1 }
        }
      ]
    },
    { "userId": "uuid-joueur-2", "activeIndex": 1, "team": [ /* … */ ] }
  ],
  "draftOffers": null,
  "roundWins": [0, 0]
}
```

Le type TypeScript correspondant est dans [06-MOTEUR-DE-COMBAT](06-MOTEUR-DE-COMBAT.md#1-types).

## 5. Requêtes côté client (exemples)

```ts
// Créer / mettre à jour son pseudo
await supabase.from('profiles').upsert({ id: user.id, username });

// Lire un match (chargement initial ou reconnexion)
const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();

// Retrouver un match en cours (reconnexion)
const { data: ongoing } = await supabase
  .from('matches')
  .select('id')
  .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
  .neq('phase', 'finished')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// Enregistrer un score solo
await supabase.from('solo_runs').insert({ user_id: user.id, wave_reached: wave, score, team });

// Classement
const { data: top } = await supabase.from('leaderboard').select('*');
```

## 6. Réinitialiser la base (en développement)

```sql
truncate public.match_turns, public.match_actions, public.solo_runs restart identity cascade;
update public.rooms set current_match_id = null;
truncate public.matches, public.rooms cascade;
```
