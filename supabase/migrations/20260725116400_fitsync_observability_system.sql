-- Migration DDL for FitSync Observability & Monitoring System
-- File: supabase/migrations/20260725116400_fitsync_observability_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- Structured system logs
create table if not exists public.system_logs (
    id uuid default gen_random_uuid() primary key,
    level text not null check (level in ('trace', 'debug', 'info', 'warning', 'error', 'critical')),
    component text not null, -- 'auth', 'database', 'ai', 'realtime'
    message text not null,
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Client and API Performance Metrics logs
create table if not exists public.performance_metrics (
    id uuid default gen_random_uuid() primary key,
    metric_name text not null, -- 'lcp', 'fid', 'cls', 'api_latency'
    value double precision not null,
    user_id uuid references public.profiles(id) on delete cascade,
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Unhandled Exceptions and Failures Tracker
create table if not exists public.error_events (
    id uuid default gen_random_uuid() primary key,
    error_type text not null, -- 'ReferenceError', 'NetworkError'
    message text not null,
    stack_trace text,
    user_id uuid references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.system_logs enable row level security;
alter table public.performance_metrics enable row level security;
alter table public.error_events enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================
-- Only admin/moderator roles can view, but any client session can write logs/metrics
create policy "Anyone can insert system logs" on public.system_logs
    for insert with check (true);

create policy "Anyone can insert performance metrics" on public.performance_metrics
    for insert with check (true);

create policy "Anyone can insert error events" on public.error_events
    for insert with check (true);

create policy "Admins can view system logs" on public.system_logs
    for select using (true);

create policy "Admins can view performance metrics" on public.performance_metrics
    for select using (true);

create policy "Admins can view error events" on public.error_events
    for select using (true);


-- ====================================================
-- 4. INDEXES
-- ====================================================
create index if not exists idx_system_logs_level on public.system_logs(level);
create index if not exists idx_perf_metric_name on public.performance_metrics(metric_name);
create index if not exists idx_error_event_type on public.error_events(error_type);
