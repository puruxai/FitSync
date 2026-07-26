-- Migration DDL for FitSync Enterprise Analytics & Business Intelligence System
-- File: supabase/migrations/20260725116000_fitsync_analytics_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- User Click and Views Analytics events
create table if not exists public.analytics_events (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    event_type text not null, -- 'page_view', 'workout_complete', 'ai_query'
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aggregated User consistency metrics
create table if not exists public.user_statistics (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    consistency_score numeric default 0.0 not null,
    best_workout_day text, -- 'Monday', 'Wednesday', etc.
    most_active_time text, -- '08:00', '18:30'
    average_steps numeric default 0.0 not null,
    average_calories numeric default 0.0 not null,
    average_workout_duration numeric default 0.0 not null,
    goal_completion_rate numeric default 0.0 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily/Weekly Fitness Score history logs
create table if not exists public.fitness_statistics (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    fitness_score numeric not null, -- 0 - 100
    steps_score numeric not null,
    calories_score numeric not null,
    workout_score numeric not null,
    water_score numeric not null,
    bmi_score numeric not null,
    consistency_score numeric not null,
    logged_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analytics Reports exports records
create table if not exists public.analytics_reports (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    report_name text not null,
    report_format text not null check (report_format in ('pdf', 'csv', 'excel')),
    download_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pluggable usage analytics
create table if not exists public.usage_metrics (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    ai_conversations_count integer default 0 not null,
    workout_recos_used integer default 0 not null,
    diet_plans_created integer default 0 not null,
    predictions_viewed integer default 0 not null,
    insights_generated integer default 0 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Global System Metrics (Admins DAU/MAU/Storage counters)
create table if not exists public.system_metrics (
    id uuid default gen_random_uuid() primary key,
    dau integer default 0 not null,
    mau integer default 0 not null,
    retention_rate numeric default 0.0 not null,
    db_storage_bytes bigint default 0 not null,
    realtime_connections integer default 0 not null,
    logged_date date default current_date unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.analytics_events enable row level security;
alter table public.user_statistics enable row level security;
alter table public.fitness_statistics enable row level security;
alter table public.analytics_reports enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.system_metrics enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Events
create policy "Users can manage their own analytics events" on public.analytics_events
    for all using (auth.uid() = user_id);

-- User Statistics
create policy "Users can view their own statistics summaries" on public.user_statistics
    for select using (auth.uid() = profile_id);

create policy "Users can update their own statistics" on public.user_statistics
    for update using (auth.uid() = profile_id);

-- Fitness Statistics logs
create policy "Users can view their own fitness scores" on public.fitness_statistics
    for select using (auth.uid() = user_id);

-- Reports exports
create policy "Users can manage their own reports exports" on public.analytics_reports
    for all using (auth.uid() = user_id);

-- Usage
create policy "Users can view their own usage stats" on public.usage_metrics
    for select using (auth.uid() = user_id);

-- System Metrics (Admins only)
create policy "Admins can view global system metrics" on public.system_metrics
    for select using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin')
        )
    );


-- ====================================================
-- 4. SEED SEEDS DEFAULT
-- ====================================================
insert into public.system_metrics (dau, mau, retention_rate, db_storage_bytes, realtime_connections, logged_date)
values (45, 120, 88.5, 41943040, 14, current_date)
on conflict (logged_date) do nothing;


-- ====================================================
-- 5. INDEXES
-- ====================================================
create index if not exists idx_events_user on public.analytics_events(user_id);
create index if not exists idx_fit_stats_user on public.fitness_statistics(user_id);
create index if not exists idx_reports_user on public.analytics_reports(user_id);
create index if not exists idx_usage_user on public.usage_metrics(user_id);
