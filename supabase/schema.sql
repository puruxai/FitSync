-- FitSync Suppabase Database Schema
-- Production-Ready DDL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ====================================================
-- 1. PROFILES
-- ====================================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    fitsync_id text unique not null,
    full_name text not null,
    avatar_url text,
    age integer,
    gender text,
    height numeric(5,2), -- in cm
    weight numeric(5,2), -- in kg
    fitness_goal text,
    bio text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- ====================================================
-- 2. PRIVACY SETTINGS
-- ====================================================
create table public.privacy_settings (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    profile_visibility text default 'public' check (profile_visibility in ('public', 'friends', 'private')) not null,
    share_fitness boolean default true not null,
    hide_weight boolean default false not null,
    hide_bmi boolean default false not null,
    hide_online_status boolean default false not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.privacy_settings enable row level security;

-- ====================================================
-- 3. ONLINE STATUS
-- ====================================================
create table public.online_status (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    is_online boolean default false not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.online_status enable row level security;

-- ====================================================
-- 4. WORKOUTS LIBRARY (Static/Read-only)
-- ====================================================
create table public.workouts (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    category text check (category in ('home', 'gym', 'yoga', 'hiit', 'cardio', 'strength')) not null,
    default_duration integer not null, -- in minutes
    default_calories integer not null,
    difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workouts enable row level security;

-- ====================================================
-- 5. FITNESS LOGS
-- ====================================================
create table public.fitness_logs (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    workout_id uuid references public.workouts(id) on delete set null,
    workout_name text not null, -- Stores custom name or workout title
    category text check (category in ('home', 'gym', 'yoga', 'hiit', 'cardio', 'strength')) not null,
    duration_minutes integer not null,
    calories_burned integer not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.fitness_logs enable row level security;

-- ====================================================
-- 6. STEP LOGS
-- ====================================================
create table public.step_logs (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    steps integer default 0 not null,
    calories_burned integer default 0 not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(profile_id, date)
);

alter table public.step_logs enable row level security;

-- ====================================================
-- 7. WATER LOGS
-- ====================================================
create table public.water_logs (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    amount_ml integer default 0 not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(profile_id, date)
);

alter table public.water_logs enable row level security;

-- ====================================================
-- 8. WEIGHT LOGS
-- ====================================================
create table public.weight_logs (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    weight_kg numeric(5,2) not null,
    bmi numeric(4,2) not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(profile_id, date)
);

alter table public.weight_logs enable row level security;

-- ====================================================
-- 9. FRIEND REQUESTS
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
-- 10. FRIENDS
-- ====================================================
create table public.friends (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    friend_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, friend_id)
);

alter table public.friends enable row level security;

-- ====================================================
-- 11. CHALLENGES
-- ====================================================
create table public.challenges (
    id uuid default uuid_generate_v4() primary key,
    creator_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    type text check (type in ('steps', 'calories', 'water', 'workouts')) not null,
    target integer not null, -- e.g. 50000 steps, 3000 calories
    start_date date not null,
    end_date date not null,
    is_private boolean default false not null,
    invite_code text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.challenges enable row level security;

-- ====================================================
-- 12. CHALLENGE MEMBERS
-- ====================================================
create table public.challenge_members (
    id uuid default uuid_generate_v4() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    progress integer default 0 not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_winner boolean default false not null,
    unique(challenge_id, profile_id)
);

alter table public.challenge_members enable row level security;

-- ====================================================
-- 13. NOTIFICATIONS
-- ====================================================
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    type text not null, -- 'friend_request', 'challenge_invite', 'workout_reminder', 'achievement'
    title text not null,
    content text not null,
    is_read boolean default false not null,
    data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- ====================================================
-- 14. LEADERBOARDS (Calculated View/Cache Table)
-- ====================================================
create table public.leaderboards (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    steps_total integer default 0 not null,
    calories_total integer default 0 not null,
    period text check (period in ('daily', 'weekly', 'monthly')) not null,
    last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(profile_id, period)
);

alter table public.leaderboards enable row level security;

-- ====================================================
-- 15. ACTIVITY FEED
-- ====================================================
create table public.activity_feed (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    type text not null, -- 'workout_completed', 'challenge_joined', 'achievement_earned', 'friend_connected'
    content text not null,
    data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_feed enable row level security;


-- ====================================================
-- TRIGGERS & FUNCTIONS
-- ====================================================

-- Trigger function: Create profile and default settings after public signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_username text;
  new_fitsync_id text;
begin
  new_username := coalesce(new.raw_user_meta_data->>'username', 'fitsync_' || substr(md5(random()::text), 1, 8));
  new_fitsync_id := 'FS-' || upper(substr(md5(random()::text), 1, 8));

  insert into public.profiles (id, username, fitsync_id, full_name, avatar_url)
  values (
    new.id,
    new_username,
    new_fitsync_id,
    coalesce(new.raw_user_meta_data->>'full_name', 'FitSync Athlete'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );

  insert into public.privacy_settings (profile_id)
  values (new.id);

  insert into public.online_status (profile_id, is_online)
  values (new.id, true);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Privacy Settings Policies
create policy "Users can view all privacy settings" on public.privacy_settings
  for select using (true);

create policy "Users can update their own privacy settings" on public.privacy_settings
  for update using (auth.uid() = profile_id);

-- Online Status Policies
create policy "Online statuses are viewable by everyone" on public.online_status
  for select using (true);

create policy "Users can update their own online status" on public.online_status
  for update using (auth.uid() = profile_id);

-- Workouts Policies
create policy "Workouts are viewable by everyone" on public.workouts
  for select using (true);

-- Fitness Logs Policies
create policy "Users can view logs based on profile visibility" on public.fitness_logs
  for select using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.privacy_settings ps
      where ps.profile_id = fitness_logs.profile_id
      and (
        ps.profile_visibility = 'public' or
        (ps.profile_visibility = 'friends' and exists (
          select 1 from public.friends f
          where (f.user_id = auth.uid() and f.friend_id = fitness_logs.profile_id)
          or (f.friend_id = auth.uid() and f.user_id = fitness_logs.profile_id)
        ))
      )
    )
  );

create policy "Users can insert their own fitness logs" on public.fitness_logs
  for insert with check (profile_id = auth.uid());

create policy "Users can update their own fitness logs" on public.fitness_logs
  for update using (profile_id = auth.uid());

create policy "Users can delete their own fitness logs" on public.fitness_logs
  for delete using (profile_id = auth.uid());

-- Step Logs Policies
create policy "Users can view step logs based on visibility" on public.step_logs
  for select using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.privacy_settings ps
      where ps.profile_id = step_logs.profile_id
      and ps.share_fitness = true
      and (
        ps.profile_visibility = 'public' or
        (ps.profile_visibility = 'friends' and exists (
          select 1 from public.friends f
          where (f.user_id = auth.uid() and f.friend_id = step_logs.profile_id)
          or (f.friend_id = auth.uid() and f.user_id = step_logs.profile_id)
        ))
      )
    )
  );

create policy "Users can modify their own step logs" on public.step_logs
  for all using (profile_id = auth.uid());

-- Water Logs Policies
create policy "Users can view their own water logs" on public.water_logs
  for select using (profile_id = auth.uid());

create policy "Users can modify their own water logs" on public.water_logs
  for all using (profile_id = auth.uid());

-- Weight Logs Policies
create policy "Users can view weight logs based on visibility" on public.weight_logs
  for select using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.privacy_settings ps
      where ps.profile_id = weight_logs.profile_id
      and ps.hide_weight = false
      and (
        ps.profile_visibility = 'public' or
        (ps.profile_visibility = 'friends' and exists (
          select 1 from public.friends f
          where (f.user_id = auth.uid() and f.friend_id = weight_logs.profile_id)
          or (f.friend_id = auth.uid() and f.user_id = weight_logs.profile_id)
        ))
      )
    )
  );

create policy "Users can modify their own weight logs" on public.weight_logs
  for all using (profile_id = auth.uid());

-- Friend Requests Policies
create policy "Users can view requests they sent or received" on public.friend_requests
  for select using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Users can create friend requests" on public.friend_requests
  for insert with check (sender_id = auth.uid());

create policy "Users can update/delete their received or sent requests" on public.friend_requests
  for all using (sender_id = auth.uid() or receiver_id = auth.uid());

-- Friends Policies
create policy "Users can view friends list" on public.friends
  for select using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can manage friends" on public.friends
  for all using (user_id = auth.uid() or friend_id = auth.uid());

-- Challenges Policies
create policy "Challenges are viewable by everyone" on public.challenges
  for select using (true);

create policy "Users can create challenges" on public.challenges
  for insert with check (creator_id = auth.uid());

-- Challenge Members Policies
create policy "Challenge members are viewable by everyone" on public.challenge_members
  for select using (true);

create policy "Users can join challenges" on public.challenge_members
  for insert with check (profile_id = auth.uid());

create policy "Users can update their progress" on public.challenge_members
  for update using (profile_id = auth.uid());

-- Notifications Policies
create policy "Users can view their own notifications" on public.notifications
  for select using (profile_id = auth.uid());

create policy "Users can update their own notifications" on public.notifications
  for update using (profile_id = auth.uid());

-- Leaderboards Policies
create policy "Leaderboard viewable by everyone" on public.leaderboards
  for select using (true);

-- Activity Feed Policies
create policy "Activity feed viewable by everyone" on public.activity_feed
  for select using (true);

create policy "Users can insert their own activities" on public.activity_feed
  for insert with check (profile_id = auth.uid());

-- ====================================================
-- PERFORMANCE INDEXES
-- ====================================================
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_fitsync_id on public.profiles(fitsync_id);
create index idx_step_logs_profile_date on public.step_logs(profile_id, date);
create index idx_water_logs_profile_date on public.water_logs(profile_id, date);
create index idx_weight_logs_profile_date on public.weight_logs(profile_id, date);
create index idx_friend_requests_sender_receiver on public.friend_requests(sender_id, receiver_id);
create index idx_friends_user_friend on public.friends(user_id, friend_id);
create index idx_challenge_members_challenge_profile on public.challenge_members(challenge_id, profile_id);
create index idx_notifications_profile_read on public.notifications(profile_id, is_read);
create index idx_leaderboards_period on public.leaderboards(period);
create index idx_activity_feed_profile on public.activity_feed(profile_id);
