-- ============================================================
-- House of Power — Full Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── Profiles (extends auth.users) ────────────────────────────
create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  username   text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Odin Tasks ────────────────────────────────────────────────
create table if not exists public.odin_tasks (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  title          text not null,
  description    text,
  category       text not null check (category in ('leads','appointments','campaigns','follow-up','payments','pipeline')),
  status         text not null check (status in ('planned','in-progress','done')) default 'planned',
  priority       text not null check (priority in ('high','medium','low')) default 'medium',
  source         text default 'manual', -- 'manual' | 'ghl_webhook' | 'telegram' | 'gymmaster'
  ghl_contact_id text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table public.odin_tasks enable row level security;
create policy "own tasks" on public.odin_tasks for all using (auth.uid() = user_id);


-- ── Daily Check-Ins ───────────────────────────────────────────
create table if not exists public.check_ins (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null,
  mood       text check (mood in ('strong','solid','off')),
  wins       text,
  struggles  text,
  tomorrow   text,
  created_at timestamptz default now(),
  unique (user_id, date)
);
alter table public.check_ins enable row level security;
create policy "own check_ins" on public.check_ins for all using (auth.uid() = user_id);


-- ── Goals ─────────────────────────────────────────────────────
create table if not exists public.goals (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  category   text,
  status     text check (status in ('active','paused','completed')) default 'active',
  progress   integer default 0 check (progress between 0 and 100),
  target     text,
  due        text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.goals enable row level security;
create policy "own goals" on public.goals for all using (auth.uid() = user_id);


-- ── Athletes ──────────────────────────────────────────────────
create table if not exists public.athletes (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references auth.users(id) on delete cascade not null,
  name                  text not null,
  sport                 text,
  current_block         text,
  last_check_in         date,
  check_in_status       text check (check_in_status in ('checked-in','missed','pending')) default 'pending',
  goal                  text,
  program               text,
  notes                 text,
  bodyweight            text,
  ghl_contact_id        text,
  gymmaster_member_id   text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
alter table public.athletes enable row level security;
create policy "own athletes" on public.athletes for all using (auth.uid() = user_id);


-- ── Macro Blocks (linked to athletes) ────────────────────────
create table if not exists public.macro_blocks (
  id          uuid default gen_random_uuid() primary key,
  athlete_id  uuid references public.athletes(id) on delete cascade not null,
  type        text check (type in ('Hypertrophy','Strength','Peaking','Deload','Transition')),
  start_month integer check (start_month between 0 and 11),
  duration    integer check (duration between 1 and 6),
  year        integer,
  label       text,
  created_at  timestamptz default now()
);
alter table public.macro_blocks enable row level security;
create policy "own blocks" on public.macro_blocks for all
  using (exists (
    select 1 from public.athletes a
    where a.id = macro_blocks.athlete_id and a.user_id = auth.uid()
  ));


-- ── Bloodwork ─────────────────────────────────────────────────
create table if not exists public.bloodwork (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  date       date,
  lab        text,
  next_date  date,
  notes      text,
  file_path  text, -- Supabase Storage path (replaces base64 localStorage)
  file_name  text,
  file_type  text,
  created_at timestamptz default now()
);
alter table public.bloodwork enable row level security;
create policy "own bloodwork" on public.bloodwork for all using (auth.uid() = user_id);


-- ── GHL Events (inbound webhooks, server-only) ────────────────
create table if not exists public.ghl_events (
  id          uuid default gen_random_uuid() primary key,
  event_type  text not null,
  contact_id  text,
  payload     jsonb not null,
  processed   boolean default false,
  created_at  timestamptz default now()
);
-- No RLS: written only by server-side webhook handler with service role key


-- ── GymMaster Members (sync cache) ───────────────────────────
create table if not exists public.gymmaster_members (
  id                    uuid default gen_random_uuid() primary key,
  gymmaster_member_id   text unique not null,
  first_name            text,
  last_name             text,
  email                 text,
  phone                 text,
  membership_type       text,
  membership_status     text, -- 'active' | 'expired' | 'suspended'
  expiry_date           date,
  last_visit            date,
  ghl_contact_id        text,
  synced_at             timestamptz default now()
);
-- No RLS: synced by server-side cron with service role key


-- ── Google OAuth Tokens ───────────────────────────────────────
create table if not exists public.google_tokens (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  access_token  text not null,
  refresh_token text,
  expiry_date   bigint,
  updated_at    timestamptz default now()
);
alter table public.google_tokens enable row level security;
create policy "own google_tokens" on public.google_tokens for all using (auth.uid() = user_id);


-- ── Notifications ─────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text, -- 'new_lead' | 'membership_expiring' | 'task_auto_created' | 'brief_sent'
  title      text,
  body       text,
  read       boolean default false,
  source     text, -- 'ghl_webhook' | 'gymmaster_sync' | 'telegram' | 'cron'
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for all using (auth.uid() = user_id);


-- ── Telegram Messages (audit log) ────────────────────────────
create table if not exists public.telegram_messages (
  id          uuid default gen_random_uuid() primary key,
  chat_id     bigint not null,
  direction   text check (direction in ('inbound','outbound')),
  text        text,
  odin_reply  text,
  created_at  timestamptz default now()
);
-- No RLS: written by server-side webhook handler with service role key


-- ── Eden Memory (persistent cross-session AI memory) ─────────
create table if not exists public.eden_memory (
  id         uuid default gen_random_uuid() primary key,
  key        text not null unique,
  value      text not null,
  category   text default 'general' check (category in ('personal','business','goals','context','general')),
  updated_at timestamptz default now()
);
-- No RLS: written only by server-side Eden agent with service role key


-- ── Supabase Storage Bucket for Bloodwork Files ───────────────
-- Run separately in Supabase Storage UI or via:
-- insert into storage.buckets (id, name, public) values ('bloodwork', 'bloodwork', false);
-- create policy "own bloodwork files" on storage.objects for all
--   using (bucket_id = 'bloodwork' and auth.uid()::text = (storage.foldername(name))[1]);
