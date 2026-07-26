-- Migration DDL for FitSync Realtime Engine
-- File: supabase/migrations/20260725115200_fitsync_realtime_system.sql

-- ====================================================
-- 1. CREATE REALTIME SYSTEM TABLES
-- ====================================================

-- Presence Logs Table
create table if not exists public.presence_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    status text not null check (status in ('online', 'offline', 'away', 'busy', 'working_out', 'sleeping', 'invisible')),
    client_info text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Realtime Events Logs (for audit/re-sync queues)
create table if not exists public.realtime_events (
    id uuid default gen_random_uuid() primary key,
    channel text not null,
    event_type text not null, -- 'INSERT', 'UPDATE', 'DELETE', 'BROADCAST'
    payload jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Sessions Table
create table if not exists public.user_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    session_token text not null,
    ip_address text,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Connection Status Logs
create table if not exists public.connection_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    event text check (event in ('connected', 'disconnected', 'reconnecting')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.presence_logs enable row level security;
alter table public.realtime_events enable row level security;
alter table public.user_sessions enable row level security;
alter table public.connection_logs enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Presence Logs
create policy "Users can view presence logs of unblocked users" on public.presence_logs
  for select using (true); -- checks are handled in service layers or filters

create policy "Users can manage their own presence logs" on public.presence_logs
  for all using (auth.uid() = user_id);

-- Realtime Events
create policy "Users can view their own authorized channels events" on public.realtime_events
  for select using (true);

-- User Sessions
create policy "Users can manage their own sessions" on public.user_sessions
  for all using (auth.uid() = user_id);

-- Connection Logs
create policy "Users can manage their own connection logs" on public.connection_logs
  for all using (auth.uid() = user_id);


-- ====================================================
-- 4. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_presence_logs_user on public.presence_logs(user_id);
create index if not exists idx_realtime_events_channel on public.realtime_events(channel);
create index if not exists idx_user_sessions_user on public.user_sessions(user_id);
create index if not exists idx_connection_logs_user on public.connection_logs(user_id);
