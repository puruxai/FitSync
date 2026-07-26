-- Migration DDL for FitSync PWA System
-- File: supabase/migrations/20260725116300_fitsync_pwa_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- PWA installations registry
create table if not exists public.pwa_installations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    device_os text not null, -- 'Android', 'iOS', 'Windows', etc.
    browser_name text not null,
    installed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Offline pending modifications queue
create table if not exists public.offline_queue (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    action_type text not null, -- 'update_steps', 'send_friend_request'
    payload jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Synchronization history log
create table if not exists public.sync_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    synced_items_count integer not null,
    status text not null check (status in ('success', 'failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.pwa_installations enable row level security;
alter table public.offline_queue enable row level security;
alter table public.sync_history enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================
create policy "Users can manage their own PWA installation records" on public.pwa_installations
    for all using (auth.uid() = user_id);

create policy "Users can manage their own offline queue" on public.offline_queue
    for all using (auth.uid() = user_id);

create policy "Users can view their own sync history" on public.sync_history
    for select using (auth.uid() = user_id);


-- ====================================================
-- 4. INDEXES
-- ====================================================
create index if not exists idx_pwa_install_user on public.pwa_installations(user_id);
create index if not exists idx_offline_queue_user on public.offline_queue(user_id);
