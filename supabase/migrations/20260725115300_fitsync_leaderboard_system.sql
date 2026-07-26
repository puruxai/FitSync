-- Migration DDL for FitSync Leaderboard System
-- File: supabase/migrations/20260725115300_fitsync_leaderboard_system.sql

-- ====================================================
-- 1. CREATE LEADERBOARD SYSTEM TABLES
-- ====================================================

-- Leaderboard Scores
create table if not exists public.leaderboard_scores (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    category text not null check (category in ('steps', 'calories', 'workout_minutes', 'water', 'weight_loss', 'bmi_improvement', 'challenge_wins', 'workout_streak', 'activity_score')),
    period text not null check (period in ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
    score double precision default 0.0 not null,
    trend text default 'no_change' not null check (trend in ('moved_up', 'moved_down', 'no_change')),
    level integer default 1 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, category, period)
);

-- Leaderboard Archival History
create table if not exists public.leaderboard_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    category text not null,
    period text not null,
    score double precision not null,
    rank integer not null,
    achieved_date date default current_date not null
);

-- User Rank History (Timelines)
create table if not exists public.user_rank_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    rank integer not null,
    period text not null,
    recorded_at date default current_date not null
);

-- Leaderboard Badges
create table if not exists public.leaderboard_badges (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    badge_type text not null check (badge_type in ('top_1', 'top_3', 'top_10', 'weekly_winner', 'monthly_champion', 'fitness_legend', 'consistency_master', 'challenge_winner')),
    title text not null,
    image_url text,
    awarded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leaderboard Rewards
create table if not exists public.leaderboard_rewards (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    reward_points integer default 0 not null,
    is_claimed boolean default false not null,
    claimed_at timestamp with time zone
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.leaderboard_scores enable row level security;
alter table public.leaderboard_history enable row level security;
alter table public.user_rank_history enable row level security;
alter table public.leaderboard_badges enable row level security;
alter table public.leaderboard_rewards enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Leaderboard Scores (readable by all eligible users)
create policy "Anyone can read leaderboard scores" on public.leaderboard_scores
  for select using (true);

create policy "Users can upsert their own leaderboard scores" on public.leaderboard_scores
  for all using (auth.uid() = user_id);

-- Leaderboard History (readable by all)
create policy "Anyone can read leaderboard history" on public.leaderboard_history
  for select using (true);

-- User Rank History (readable by all)
create policy "Anyone can read rank histories" on public.user_rank_history
  for select using (true);

-- Badges
create policy "Anyone can read awarded badges" on public.leaderboard_badges
  for select using (true);

create policy "System can award badges to profiles" on public.leaderboard_badges
  for insert with check (true);

-- Rewards (private to user)
create policy "Users can manage their own leaderboard rewards" on public.leaderboard_rewards
  for all using (auth.uid() = user_id);


-- ====================================================
-- 4. INDEXES FOR HIGH-VELOCITY READS
-- ====================================================
create index if not exists idx_lead_scores_search on public.leaderboard_scores(category, period, score desc);
create index if not exists idx_lead_history_user on public.leaderboard_history(user_id);
create index if not exists idx_rank_history_lookup on public.user_rank_history(user_id, period, recorded_at desc);
create index if not exists idx_lead_badges_user on public.leaderboard_badges(user_id);
create index if not exists idx_lead_rewards_user on public.leaderboard_rewards(user_id);
