-- ========================================================
-- KERWAN CUP TOURNAMENT APP - SUPABASE SCHEMA & RLS SETUP
-- ========================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Create table to store the tournament state (brackets, matches, MMR)
create table if not exists public.tournament_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- 2. Enable Row Level Security (RLS)
alter table public.tournament_state enable row level security;

-- 3. Policy: Public Read (Spectators & Stream Viewers)
-- Anyone can read tournament brackets and standings without logging in
drop policy if exists "Public Read Access" on public.tournament_state;
create policy "Public Read Access"
  on public.tournament_state
  for select
  to anon, authenticated
  using (true);

-- 4. Policy: Authenticated Write (Host & Co-host Only)
-- Only logged-in users with verified accounts can create or update brackets and scores
drop policy if exists "Authenticated Hosts Can Insert" on public.tournament_state;
create policy "Authenticated Hosts Can Insert"
  on public.tournament_state
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated Hosts Can Update" on public.tournament_state;
create policy "Authenticated Hosts Can Update"
  on public.tournament_state
  for update
  to authenticated
  using (true);

-- 5. Enable Supabase Realtime for this table
alter publication supabase_realtime add table public.tournament_state;
