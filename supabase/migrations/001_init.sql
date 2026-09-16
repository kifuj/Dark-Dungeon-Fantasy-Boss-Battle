-- =========================================================
-- 001_init.sql — Dark Dungeon Fantasy Boss battle (US-02)
-- Schéma, RLS et Realtime. Voir docs/03-BASE-DE-DONNEES.md.
-- À exécuter une fois dans Supabase → SQL Editor (ou via `npx supabase db push`).
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
  is_auto     boolean not null default false,   -- true si jouée par timeout (US-20)
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
