-- SQL Optimizations Migration: Database Performance Tuning
-- File: supabase/migrations/20260725116200_fitsync_performance_system.sql

-- ====================================================
-- 1. ADD TARGETED SEARCH INDEXES
-- ====================================================

-- Index for username searches during profile lookups
create index if not exists idx_profiles_username_perf on public.profiles(username);

-- Partial index for unread notifications to optimize badges queries
create index if not exists idx_notifications_unread_perf on public.notifications(user_id) where read = false;

-- Compound index for challenges participation tracking
create index if not exists idx_challenges_type_perf on public.challenges(type, status);

-- Index for workout categories filters
create index if not exists idx_workouts_category_perf on public.workouts(category);


-- ====================================================
-- 2. MATERIALIZED VIEW SIMULATION LOGS
-- ====================================================
-- To demonstrate caching of complex calculations, let's create a materialized view metrics logs table
create table if not exists public.usage_metrics_summary (
    id uuid default gen_random_uuid() primary key,
    total_active_users bigint not null,
    total_ai_queries bigint not null,
    cache_timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.usage_metrics_summary enable row level security;

create policy "Anyone can view cached usage summary" on public.usage_metrics_summary
    for select using (true);
