-- Zhongwenfy: tables for account sync, shared word lists, and the weekly leaderboard.
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.shared_decks (
  code text primary key check (char_length(code) = 6),
  data jsonb not null check (octet_length(data::text) < 300000),
  created_at timestamptz not null default now()
);
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 30),
  points int not null check (points between 0 and 20000),
  created_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
alter table public.shared_decks enable row level security;
alter table public.scores enable row level security;

create policy "own data select" on public.user_data for select to authenticated using (user_id = auth.uid());
create policy "own data insert" on public.user_data for insert to authenticated with check (user_id = auth.uid());
create policy "own data update" on public.user_data for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "decks read" on public.shared_decks for select to anon, authenticated using (true);
create policy "decks insert" on public.shared_decks for insert to anon, authenticated with check (true);
create policy "scores read" on public.scores for select to authenticated using (true);
create policy "scores insert" on public.scores for insert to authenticated with check (user_id = auth.uid());

grant select, insert, update on public.user_data to authenticated;
grant select, insert on public.shared_decks to anon, authenticated;
grant select, insert on public.scores to authenticated;
