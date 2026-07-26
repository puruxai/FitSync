-- Migration DDL for FitSync Friend System
-- File: supabase/migrations/20260725114600_fitsync_friend_system.sql

-- ====================================================
-- 1. CREATE SOCIAL SYSTEM TABLES
-- ====================================================

-- Friends Table (Extending if already present)
create table if not exists public.friends (
    id uuid default gen_random_uuid() primary key,
    user1 uuid references public.profiles(id) on delete cascade not null,
    user2 uuid references public.profiles(id) on delete cascade not null,
    favorite boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_friendship unique (user1, user2),
    constraint check_friend_order check (user1 < user2) -- enforce alphabetical/uuid order to prevent duplicate rows
);

-- Friend Requests Table
create table if not exists public.friend_requests (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    status text check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'blocked', 'expired')) default 'pending' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_request unique (sender_id, receiver_id),
    constraint check_self_request check (sender_id <> receiver_id)
);

-- Blocked Users Table
create table if not exists public.blocked_users (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    blocked_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_block unique (user_id, blocked_id),
    constraint check_self_block check (user_id <> blocked_id)
);

-- Friend Activity Feed Table
create table if not exists public.friend_activity (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    type text not null, -- 'workout_completed', 'step_goal', 'finished_challenge', 'lost_weight', 'new_achievement', 'joined_challenge', 'personal_record'
    content text not null,
    data jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friend Settings Table
create table if not exists public.friend_settings (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    enable_activity_sharing boolean default true not null,
    show_online_status boolean default true not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friend Notifications Table
create table if not exists public.friend_notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text not null, -- 'friend_request_received', 'friend_request_accepted', 'friend_removed', 'blocked_user', 'new_friend_joined'
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Online Status Table
create table if not exists public.online_status (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    status text check (status in ('online', 'offline', 'away', 'working_out')) default 'offline' not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recent Searches Table
create table if not exists public.recent_searches (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    query text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friend Suggestions Table
create table if not exists public.friend_suggestions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    suggested_id uuid references public.profiles(id) on delete cascade not null,
    reason text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_suggestion unique (user_id, suggested_id)
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.friends enable row level security;
alter table public.friend_requests enable row level security;
alter table public.blocked_users enable row level security;
alter table public.friend_activity enable row level security;
alter table public.friend_settings enable row level security;
alter table public.friend_notifications enable row level security;
alter table public.online_status enable row level security;
alter table public.recent_searches enable row level security;
alter table public.friend_suggestions enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES WITH BLOCK SYSTEM ENFORCED
-- ====================================================

-- Helper Check functions
-- Blocked filter check: returns true if there is no active block between userA and userB
create or replace function public.are_not_blocked(user_a uuid, user_b uuid)
returns boolean as $$
begin
  return not exists (
    select 1 from public.blocked_users
    where (user_id = user_a and blocked_id = user_b)
       or (user_id = user_b and blocked_id = user_a)
  );
end;
$$ language plpgsql security definer;

-- Friends Check
create policy "Users can view friendships they belong to" on public.friends
  for select using (auth.uid() = user1 or auth.uid() = user2);

create policy "Users can manage friendships they belong to" on public.friends
  for all using (auth.uid() = user1 or auth.uid() = user2);

-- Friend Requests
create policy "Users can view requests they sent or received" on public.friend_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert/update requests they sent or received" on public.friend_requests
  for all using ((auth.uid() = sender_id or auth.uid() = receiver_id) and public.are_not_blocked(sender_id, receiver_id));

-- Blocked Users
create policy "Users can manage their own block lists" on public.blocked_users
  for all using (auth.uid() = user_id);

-- Friend Activity Feed
create policy "Users can view activity of their friends" on public.friend_activity
  for select using (
    auth.uid() = user_id or 
    exists (
      select 1 from public.friends
      where (user1 = auth.uid() and user2 = user_id)
         or (user2 = auth.uid() and user1 = user_id)
    )
  );

create policy "Users can log their own activities" on public.friend_activity
  for all using (auth.uid() = user_id);

-- Settings
create policy "Users can manage their own settings" on public.friend_settings
  for all using (auth.uid() = user_id);

-- Notifications
create policy "Users can manage their own notifications" on public.friend_notifications
  for all using (auth.uid() = user_id);

-- Online Status
create policy "Users can view online status of unblocked users" on public.online_status
  for select using (public.are_not_blocked(auth.uid(), profile_id));

create policy "Users can update their own status" on public.online_status
  for all using (auth.uid() = profile_id);

-- Recent Searches
create policy "Users can manage their own searches" on public.recent_searches
  for all using (auth.uid() = user_id);

-- Suggestions
create policy "Users can view their own suggestions" on public.friend_suggestions
  for select using (auth.uid() = user_id);


-- ====================================================
-- 4. TRIGGER SETUP ON NEW USER CREATION
-- ====================================================
create or replace function public.handle_new_friend_user()
returns trigger as $$
begin
  -- Insert settings
  insert into public.friend_settings (user_id, enable_activity_sharing, show_online_status)
  values (new.id, true, true);

  -- Insert default offline presence status
  insert into public.online_status (profile_id, status, last_seen)
  values (new.id, 'offline', timezone('utc'::text, now()));

  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_on_profile_create_friends
  after insert on public.profiles
  for each row execute function public.handle_new_friend_user();


-- ====================================================
-- 5. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_friends_user1 on public.friends(user1);
create index if5_friends_user2 on public.friends(user2);
create index if not exists idx_friend_requests_sender on public.friend_requests(sender_id);
create index if not exists idx_friend_requests_receiver on public.friend_requests(receiver_id);
create index if not exists idx_blocked_users_user on public.blocked_users(user_id);
create index if not exists idx_friend_activity_user on public.friend_activity(user_id);
create index if not exists idx_recent_searches_user on public.recent_searches(user_id);
