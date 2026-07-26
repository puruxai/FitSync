-- Migration DDL for FitSync Supabase Backend
-- File: supabase/migrations/20260725112700_fitsync_backend.sql

create extension if not exists "uuid-ossp";

-- ====================================================
-- 1. PROFILES
-- ====================================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    user_id uuid default uuid_generate_v4() unique not null,
    username text unique not null,
    fitsync_id text unique not null,
    full_name text not null,
    avatar_url text,
    bio text,
    gender text,
    age integer,
    height numeric(5,2), -- in cm
    weight numeric(5,2), -- in kg
    fitness_goal text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- ====================================================
-- 2. FITNESS LOGS
-- ====================================================
create table public.fitness_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    date date default current_date not null,
    steps integer default 0 not null,
    calories integer default 0 not null,
    water integer default 0 not null,
    workout_minutes integer default 0 not null,
    weight numeric(5,2),
    bmi numeric(4,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, date)
);

alter table public.fitness_logs enable row level security;

-- ====================================================
-- 3. FRIEND REQUESTS
-- ====================================================
create table public.friend_requests (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    status text default 'pending' check (status in ('pending', 'accepted', 'rejected')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(sender_id, receiver_id)
);

alter table public.friend_requests enable row level security;

-- ====================================================
-- 4. FRIENDS
-- ====================================================
create table public.friends (
    id uuid default uuid_generate_v4() primary key,
    user1 uuid references public.profiles(id) on delete cascade not null,
    user2 uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user1, user2)
);

alter table public.friends enable row level security;

-- ====================================================
-- 5. NOTIFICATIONS
-- ====================================================
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text not null, -- 'friend_request', 'challenge_invite', 'achievement'
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- ====================================================
-- 6. LEADERBOARDS
-- ====================================================
create table public.leaderboards (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    score integer default 0 not null, -- accumulated steps or points
    period text check (period in ('daily', 'weekly', 'monthly')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, period)
);

alter table public.leaderboards enable row level security;

-- ====================================================
-- 7. WORKOUTS (Curated templates)
-- ====================================================
create table public.workouts (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    duration integer not null, -- default minutes
    difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')) not null,
    calories integer not null,
    category text check (category in ('home', 'gym', 'yoga', 'hiit', 'cardio', 'strength')) not null,
    image_url text
);

alter table public.workouts enable row level security;

-- ====================================================
-- 8. CHALLENGES
-- ====================================================
create table public.challenges (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    start_date date not null,
    end_date date not null,
    goal integer not null, -- steps target or minutes target
    created_by uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.challenges enable row level security;

-- ====================================================
-- 9. CHALLENGE MEMBERS
-- ====================================================
create table public.challenge_members (
    id uuid default uuid_generate_v4() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    progress integer default 0 not null,
    unique(challenge_id, user_id)
);

alter table public.challenge_members enable row level security;


-- ====================================================
-- TRIGGERS & FUNCTIONS
-- ====================================================

-- Automatic profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_username text;
  new_fitsync_id text;
begin
  new_username := coalesce(new.raw_user_meta_data->>'username', 'fitsync_' || substr(md5(random()::text), 1, 8));
  new_fitsync_id := 'FS-' || upper(substr(md5(random()::text), 1, 8));

  insert into public.profiles (id, user_id, username, fitsync_id, full_name, avatar_url, bio, gender, age, height, weight, fitness_goal, location)
  values (
    new.id,
    new.id,
    new_username,
    new_fitsync_id,
    coalesce(new.raw_user_meta_data->>'full_name', 'FitSync Athlete'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'Just joined FitSync!',
    'Not Specified',
    25,
    175,
    70,
    'Stay Healthy',
    'Earth'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Profiles Policies
create policy "Authenticated users can select profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Fitness Logs Policies
create policy "Users can select own or friends fitness logs" on public.fitness_logs
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from public.friends f
      where (f.user1 = auth.uid() and f.user2 = fitness_logs.user_id)
         or (f.user2 = auth.uid() and f.user1 = fitness_logs.user_id)
    )
  );

create policy "Users can insert own logs" on public.fitness_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own logs" on public.fitness_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete own logs" on public.fitness_logs
  for delete using (auth.uid() = user_id);

-- Friend Requests Policies
create policy "Users can see requests they are involved in" on public.friend_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can create friend requests" on public.friend_requests
  for insert with check (auth.uid() = sender_id);

create policy "Users can update or delete requests they are involved in" on public.friend_requests
  for all using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Friends Policies
create policy "Users can select their friendship records" on public.friends
  for select using (auth.uid() = user1 or auth.uid() = user2);

create policy "Users can create or delete friendship records" on public.friends
  for all using (auth.uid() = user1 or auth.uid() = user2);

-- Notifications Policies
create policy "Users can manage their own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- Leaderboards Policies
create policy "Leaderboard viewable by all authenticated users" on public.leaderboards
  for select using (auth.role() = 'authenticated');

create policy "Users can edit own leaderboard score" on public.leaderboards
  for all using (auth.uid() = user_id);

-- Workouts Policies
create policy "Workouts list read-only to everyone" on public.workouts
  for select using (true);

-- Challenges Policies
create policy "Challenges read-only to all authenticated users" on public.challenges
  for select using (auth.role() = 'authenticated');

create policy "Challenges can be managed by creator" on public.challenges
  for all using (auth.uid() = created_by);

-- Challenge Members Policies
create policy "Challenge members readable to all authenticated users" on public.challenge_members
  for select using (auth.role() = 'authenticated');

create policy "Users can manage challenge memberships" on public.challenge_members
  for all using (auth.uid() = user_id);


-- ====================================================
-- PERFORMANCE INDEXES
-- ====================================================
create index idx_profiles_username_fitsync on public.profiles(username, fitsync_id);
create index idx_fitness_logs_user_date on public.fitness_logs(user_id, date);
create index idx_friend_requests_sender_receiver_status on public.friend_requests(sender_id, receiver_id, status);
create index idx_friends_user1_user2 on public.friends(user1, user2);
create index idx_notifications_user_unread on public.notifications(user_id, is_read);
create index idx_leaderboards_user_period on public.leaderboards(user_id, period);
create index idx_challenge_members_challenge_user on public.challenge_members(challenge_id, user_id);
