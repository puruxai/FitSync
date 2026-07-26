-- Migration DDL for FitSync Settings, Privacy, Security, Session and Account Management System
-- File: supabase/migrations/20260725115700_fitsync_settings_system.sql

-- ====================================================
-- 1. CREATE/EXTEND TABLES
-- ====================================================

-- Privacy Settings
create table if not exists public.privacy_settings (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    profile_visibility text default 'public' not null check (profile_visibility in ('public', 'friends', 'private')),
    share_fitness boolean default true not null,
    hide_weight boolean default false not null,
    hide_height boolean default false not null,
    hide_age boolean default false not null,
    hide_bmi boolean default false not null,
    hide_workout_history boolean default false not null,
    hide_friend_list boolean default false not null,
    hide_challenges boolean default false not null,
    hide_leaderboard_ranking boolean default false not null,
    hide_online_status boolean default false not null,
    hide_last_seen boolean default false not null,
    hide_activity_feed boolean default false not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Security Settings
create table if not exists public.security_settings (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    two_factor_enabled boolean default false not null,
    login_alerts_enabled boolean default true not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active User Sessions
create table if not exists public.user_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    browser text not null,
    os text not null,
    ip_address text,
    location text, -- e.g. "San Francisco, CA"
    login_time timestamp with time zone default timezone('utc'::text, now()) not null,
    is_current boolean default false not null,
    token_id text -- for session revocation
);

-- Trusted Devices
create table if not exists public.trusted_devices (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    device_name text not null, -- browser/OS summary
    trusted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Data Export requests history
create table if not exists public.data_exports (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    export_format text not null check (export_format in ('json', 'csv')),
    status text not null check (status in ('pending', 'completed', 'failed')),
    download_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Account Logs (audit logs)
create table if not exists public.account_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    action text not null, -- 'password_change', 'account_deactivation', 'data_export'
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.privacy_settings enable row level security;
alter table public.security_settings enable row level security;
alter table public.user_sessions enable row level security;
alter table public.trusted_devices enable row level security;
alter table public.data_exports enable row level security;
alter table public.account_logs enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Privacy
create policy "Users can manage their own privacy settings" on public.privacy_settings
    for all using (auth.uid() = profile_id);

-- Security
create policy "Users can manage their own security settings" on public.security_settings
    for all using (auth.uid() = profile_id);

-- Sessions
create policy "Users can manage their own active sessions" on public.user_sessions
    for all using (auth.uid() = user_id);

-- Trusted Devices
create policy "Users can manage their own trusted devices" on public.trusted_devices
    for all using (auth.uid() = user_id);

-- Data Exports
create policy "Users can view their own data exports" on public.data_exports
    for select using (auth.uid() = user_id);

-- Account Logs
create policy "Users can view their own account logs" on public.account_logs
    for select using (auth.uid() = user_id);


-- ====================================================
-- 4. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_sessions_user on public.user_sessions(user_id);
create index if not exists idx_trusted_dev_user on public.trusted_devices(user_id);
create index if not exists idx_exports_user on public.data_exports(user_id);
create index if not exists idx_account_logs_user on public.account_logs(user_id);
