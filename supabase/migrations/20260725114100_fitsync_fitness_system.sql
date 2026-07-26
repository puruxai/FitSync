-- Migration DDL for FitSync Fitness Tracking System
-- File: supabase/migrations/20260725114100_fitsync_fitness_system.sql

-- ====================================================
-- 1. CREATE TRACKING TABLES
-- ====================================================

-- Step Logs
create table if not exists public.step_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    steps integer not null check (steps >= 0),
    calories_burned numeric(6,2) default 0.00 not null check (calories_burned >= 0),
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Calorie Logs
create table if not exists public.calorie_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    calories integer not null check (calories >= 0),
    type text check (type in ('intake', 'burned')) not null,
    description text,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Water Logs
create table if not exists public.water_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    amount_ml integer not null check (amount_ml >= 0),
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout Logs
create table if not exists public.workout_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    category text not null,
    duration_minutes integer not null check (duration_minutes >= 0),
    calories_burned integer not null check (calories_burned >= 0),
    intensity text check (intensity in ('low', 'medium', 'high')) default 'medium' not null,
    notes text,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Weight Logs
create table if not exists public.weight_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    weight_kg numeric(5,2) not null check (weight_kg >= 0),
    bmi numeric(4,2) not null check (bmi >= 0),
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fitness Goals
create table if not exists public.fitness_goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    steps_goal integer default 10000 not null check (steps_goal >= 0),
    calories_goal integer default 2500 not null check (calories_goal >= 0),
    workout_minutes_goal integer default 30 not null check (workout_minutes_goal >= 0),
    water_ml_goal integer default 2500 not null check (water_ml_goal >= 0),
    weight_goal numeric(5,2) check (weight_goal >= 0),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fitness Statistics
create table if not exists public.fitness_statistics (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    avg_steps integer default 0 not null check (avg_steps >= 0),
    avg_calories integer default 0 not null check (avg_calories >= 0),
    avg_water integer default 0 not null check (avg_water >= 0),
    workout_streak integer default 0 not null check (workout_streak >= 0),
    longest_streak integer default 0 not null check (longest_streak >= 0),
    weight_change numeric(5,2) default 0.00 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ====================================================
alter table public.step_logs enable row level security;
alter table public.calorie_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.workout_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.fitness_goals enable row level security;
alter table public.fitness_statistics enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Step Logs
create policy "Users can manage their own step_logs" on public.step_logs
  for all using (auth.uid() = user_id);

-- Calorie Logs
create policy "Users can manage their own calorie_logs" on public.calorie_logs
  for all using (auth.uid() = user_id);

-- Water Logs
create policy "Users can manage their own water_logs" on public.water_logs
  for all using (auth.uid() = user_id);

-- Workout Logs
create policy "Users can manage their own workout_logs" on public.workout_logs
  for all using (auth.uid() = user_id);

-- Weight Logs
create policy "Users can manage their own weight_logs" on public.weight_logs
  for all using (auth.uid() = user_id);

-- Fitness Goals
create policy "Users can manage their own fitness_goals" on public.fitness_goals
  for all using (auth.uid() = user_id);

-- Fitness Statistics
create policy "Users can manage their own fitness_statistics" on public.fitness_statistics
  for all using (auth.uid() = user_id);


-- ====================================================
-- 4. TRIGGER SETUP FOR NEW USERS
-- ====================================================
create or replace function public.handle_new_fitness_user()
returns trigger as $$
begin
  -- Insert default goals
  insert into public.fitness_goals (id, user_id, steps_goal, calories_goal, workout_minutes_goal, water_ml_goal, weight_goal)
  values (gen_random_uuid(), new.id, 10000, 2500, 30, 2500, 70.0);

  -- Insert empty statistics
  insert into public.fitness_statistics (id, user_id, avg_steps, avg_calories, avg_water, workout_streak, longest_streak, weight_change)
  values (gen_random_uuid(), new.id, 0, 0, 0, 0, 0, 0.00);

  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_on_profile_create_fitness
  after insert on public.profiles
  for each row execute function public.handle_new_fitness_user();


-- ====================================================
-- 5. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_step_logs_user_date on public.step_logs(user_id, date);
create index if not exists idx_calorie_logs_user_date on public.calorie_logs(user_id, date);
create index if not exists idx_water_logs_user_date on public.water_logs(user_id, date);
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, date);
create index if not exists idx_weight_logs_user_date on public.weight_logs(user_id, date);
create index if not exists idx_fitness_goals_user on public.fitness_goals(user_id);
create index if not exists idx_fitness_statistics_user on public.fitness_statistics(user_id);
