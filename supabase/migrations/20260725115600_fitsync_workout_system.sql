-- Migration DDL for FitSync Workout Library and Planner System
-- File: supabase/migrations/20260725115600_fitsync_workout_system.sql

-- ====================================================
-- 1. CREATE/EXTEND WORKOUT TABLES
-- ====================================================

-- Extend workouts table with advanced properties if not exists
create table if not exists public.workouts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    category text not null check (category in ('home', 'gym', 'hiit', 'yoga', 'pilates', 'strength', 'cardio', 'running', 'cycling', 'stretching', 'crossfit', 'calisthenics', 'bodyweight', 'senior_fitness')),
    difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
    duration integer not null, -- minutes
    calories integer not null, -- estimate
    equipment_required text[] default '{}'::text[] not null,
    muscle_groups text[] default '{}'::text[] not null,
    target_gender text default 'all' not null, -- all, male, female
    target_goal text, -- fat_loss, muscle_gain, stamina, flexibility
    cover_image text,
    video_url text,
    instructions text[],
    safety_tips text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercises table
create table if not exists public.exercises (
    id uuid default gen_random_uuid() primary key,
    workout_id uuid references public.workouts(id) on delete cascade not null,
    name text not null,
    sets integer default 3 not null,
    reps integer, -- reps count (can be null if duration-based)
    duration integer, -- seconds (can be null if reps-based)
    rest_time integer default 30 not null, -- seconds
    target_muscle text,
    instructions text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercise Media links
create table if not exists public.exercise_media (
    id uuid default gen_random_uuid() primary key,
    exercise_id uuid references public.exercises(id) on delete cascade not null,
    media_type text not null check (media_type in ('image', 'animation', 'video')),
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout Plans (Calendars)
create table if not exists public.workout_plans (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Planned Workouts (Schedules assigned to days)
create table if not exists public.planned_workouts (
    id uuid default gen_random_uuid() primary key,
    plan_id uuid references public.workout_plans(id) on delete cascade not null,
    workout_id uuid references public.workouts(id) on delete cascade not null,
    day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    time_of_day text, -- e.g. "07:30"
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout History logs (extended from simple logs)
create table if not exists public.workout_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    workout_id uuid references public.workouts(id) on delete set null,
    workout_name text not null,
    duration_minutes integer not null,
    calories_burned integer not null,
    completion_percent integer default 100 not null,
    exercises_completed integer default 0 not null,
    logged_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Favorite Bookmarked Workouts
create table if not exists public.favorite_workouts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    workout_id uuid references public.workouts(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, workout_id)
);

-- Recently Viewed Workouts logs
create table if not exists public.recent_workouts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    workout_id uuid references public.workouts(id) on delete cascade not null,
    viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_media enable row level security;
alter table public.workout_plans enable row level security;
alter table public.planned_workouts enable row level security;
alter table public.workout_history enable row level security;
alter table public.favorite_workouts enable row level security;
alter table public.recent_workouts enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Workouts & Exercises: publicly viewable
create policy "Workouts are readable by everyone" on public.workouts
    for select using (true);

create policy "Exercises are readable by everyone" on public.exercises
    for select using (true);

create policy "Exercise media is readable by everyone" on public.exercise_media
    for select using (true);

-- Plans & Schedules: private to owner
create policy "Users can manage their own plans" on public.workout_plans
    for all using (auth.uid() = user_id);

create policy "Users can manage their own planned schedules" on public.planned_workouts
    for all using (
        exists (
            select 1 from public.workout_plans
            where id = planned_workouts.plan_id and user_id = auth.uid()
        )
    );

-- History
create policy "Users can manage their own workout history" on public.workout_history
    for all using (auth.uid() = user_id);

-- Bookmarks & Recents
create policy "Users can manage their own favorite bookmarks" on public.favorite_workouts
    for all using (auth.uid() = user_id);

create policy "Users can manage their own recents logs" on public.recent_workouts
    for all using (auth.uid() = user_id);


-- ====================================================
-- 4. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_workouts_search on public.workouts(category, difficulty, duration);
create index if not exists idx_exercises_workout on public.exercises(workout_id);
create index if not exists idx_workout_plans_user on public.workout_plans(user_id);
create index if not exists idx_planned_wk_plan on public.planned_workouts(plan_id);
create index if not exists idx_wk_history_user on public.workout_history(user_id, logged_date);
create index if not exists idx_fav_wk_user on public.favorite_workouts(user_id);
create index if not exists idx_rec_wk_user on public.recent_workouts(user_id, viewed_at desc);
