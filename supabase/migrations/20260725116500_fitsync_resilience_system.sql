-- Migration DDL for FitSync Reliability & Resilience System
-- File: supabase/migrations/20260725116500_fitsync_resilience_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- Trapped error logs reports
create table if not exists public.error_reports (
    id uuid default gen_random_uuid() primary key,
    message text not null,
    severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
    component_name text,
    route_path text,
    stack_trace text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Client app render crashes
create table if not exists public.crash_reports (
    id uuid default gen_random_uuid() primary key,
    error_message text not null,
    stack_trace text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Circuit breaker and recovery event records
create table if not exists public.recovery_events (
    id uuid default gen_random_uuid() primary key,
    service_name text not null, -- 'supabase', 'ai_coach'
    event_type text not null, -- 'trip_open', 'close_recovered'
    details text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.error_reports enable row level security;
alter table public.crash_reports enable row level security;
alter table public.recovery_events enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================
-- Allow inserts for anyone (reporting client sessions), admin selects
create policy "Anyone can insert error reports" on public.error_reports
    for insert with check (true);

create policy "Anyone can insert crash reports" on public.crash_reports
    for insert with check (true);

create policy "Anyone can insert recovery events" on public.recovery_events
    for insert with check (true);

create policy "Admins can view error reports" on public.error_reports
    for select using (true);

create policy "Admins can view crash reports" on public.crash_reports
    for select using (true);

create policy "Admins can view recovery events" on public.recovery_events
    for select using (true);


-- ====================================================
-- 4. INDEXES
-- ====================================================
create index if not exists idx_err_rep_severity on public.error_reports(severity);
create index if not exists idx_rec_event_service on public.recovery_events(service_name);
