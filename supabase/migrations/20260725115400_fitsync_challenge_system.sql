-- Migration DDL for FitSync Challenge System
-- File: supabase/migrations/20260725115400_fitsync_challenge_system.sql

-- ====================================================
-- 1. CREATE CHALLENGE SYSTEM TABLES
-- ====================================================

-- Challenges Configuration Table
create table if not exists public.challenges (
    id uuid default gen_random_uuid() primary key,
    creator_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    banner_url text,
    category text not null check (category in ('steps', 'calories', 'workout_minutes', 'water', 'weight_loss', 'running_distance', 'cycling', 'yoga', 'strength_training', 'hiit', 'custom')),
    goal_value double precision not null,
    target_unit text not null, -- e.g. steps, kcal, minutes, ml, kg, km
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    visibility text not null check (visibility in ('public', 'friends', 'private')),
    max_participants integer default 100 not null,
    min_participants integer default 1 not null,
    difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
    reward_points integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Challenge Members Mapping Table
create table if not exists public.challenge_members (
    id uuid default gen_random_uuid() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    status text not null check (status in ('joined', 'waiting_list')),
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(challenge_id, user_id)
);

-- Challenge Live Progress Tracking
create table if not exists public.challenge_progress (
    id uuid default gen_random_uuid() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    value double precision default 0.0 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(challenge_id, user_id)
);

-- Challenge Friend Invites
create table if not exists public.challenge_invites (
    id uuid default gen_random_uuid() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    status text not null check (status in ('pending', 'accepted', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(challenge_id, sender_id, receiver_id)
);

-- Challenge Claimable Rewards
create table if not exists public.challenge_rewards (
    id uuid default gen_random_uuid() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    reward_points integer default 0 not null,
    is_claimed boolean default false not null,
    claimed_at timestamp with time zone
);

-- Challenge Milestones Winner Badges
create table if not exists public.challenge_badges (
    id uuid default gen_random_uuid() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    awarded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Challenge Completed History Logs
create table if not exists public.challenge_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    completion_status text not null check (completion_status in ('completed', 'failed')),
    final_score double precision not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.challenge_invites enable row level security;
alter table public.challenge_rewards enable row level security;
alter table public.challenge_badges enable row level security;
alter table public.challenge_history enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Challenges: viewable if public, creator, or member
create policy "Anyone can read public challenges" on public.challenges
  for select using (visibility = 'public' or creator_id = auth.uid());

create policy "Users can manage challenges they created" on public.challenges
  for all using (creator_id = auth.uid());

-- Members mapping
create policy "Anyone can read challenge members" on public.challenge_members
  for select using (true);

create policy "Users can manage their own memberships" on public.challenge_members
  for all using (auth.uid() = user_id);

-- Live Progress
create policy "Anyone can read challenge progress rows" on public.challenge_progress
  for select using (true);

create policy "Users can update their own progress rows" on public.challenge_progress
  for all using (auth.uid() = user_id);

-- Friend Invites
create policy "Invites readable by sender and receiver" on public.challenge_invites
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can manage challenge invites" on public.challenge_invites
  for all using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Rewards (Private to user)
create policy "Users can manage their own challenge rewards" on public.challenge_rewards
  for all using (auth.uid() = user_id);

-- Badges
create policy "Anyone can read challenge badges" on public.challenge_badges
  for select using (true);

-- Completed History
create policy "Anyone can read challenge completion history" on public.challenge_history
  for select using (true);


-- ====================================================
-- 4. DATABASE INDEXES FOR ENHANCED PERFORMANCES
-- ====================================================
create index if not exists idx_challenges_visibility on public.challenges(visibility, start_date);
create index if not exists idx_challenge_members_lookup on public.challenge_members(challenge_id, user_id);
create index if not exists idx_challenge_progress_lookup on public.challenge_progress(challenge_id, user_id);
create index if not exists idx_challenge_invites_receiver on public.challenge_invites(receiver_id, status);
create index if not exists idx_challenge_rewards_user on public.challenge_rewards(user_id);
create index if not exists idx_challenge_badges_user on public.challenge_badges(user_id);
create index if not exists idx_challenge_history_user on public.challenge_history(user_id);
