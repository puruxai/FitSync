-- Migration DDL for FitSync User Profile System
-- File: supabase/migrations/20260725113500_fitsync_profile_system.sql

-- ====================================================
-- 1. EXTEND PROFILES TABLE
-- ====================================================
alter table public.profiles 
  add column if not exists cover_url text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists activity_level text default 'Moderate',
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists twitter text;

-- ====================================================
-- 2. CREATE PROFILE PRIVACY
-- ====================================================
create table if not exists public.profile_privacy (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    profile_visibility text check (profile_visibility in ('public', 'friends', 'private')) default 'public' not null,
    hide_weight boolean default false not null,
    hide_height boolean default false not null,
    hide_age boolean default false not null,
    hide_online_status boolean default false not null,
    hide_progress boolean default false not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profile_privacy enable row level security;

-- ====================================================
-- 3. CREATE PROFILE STATISTICS
-- ====================================================
create table if not exists public.profile_statistics (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    current_weight numeric(5,2),
    current_bmi numeric(4,2),
    avg_daily_steps integer default 0 not null,
    avg_calories integer default 0 not null,
    workout_streak integer default 0 not null,
    total_workouts integer default 0 not null,
    friends_count integer default 0 not null,
    challenges_completed integer default 0 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profile_statistics enable row level security;

-- ====================================================
-- 4. CREATE PROFILE SETTINGS
-- ====================================================
create table if not exists public.profile_settings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    theme text default 'dark' check (theme in ('light', 'dark')) not null,
    email_notifications boolean default true not null,
    push_notifications boolean default true not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profile_settings enable row level security;


-- ====================================================
-- 5. STORAGE BUCKETS CONFIGURATION
-- ====================================================

-- Create buckets inside storage schema if table exists
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('covers', 'covers', true)
on conflict (id) do nothing;


-- ====================================================
-- 6. RLS POLICIES FOR PROFILE SYSTEM TABLES
-- ====================================================

-- Profile Privacy Policies
create policy "Select privacy: public, self, or friends" on public.profile_privacy
  for select using (
    auth.uid() = user_id or
    profile_visibility = 'public' or
    (
      profile_visibility = 'friends' and
      exists (
        select 1 from public.friends f
        where (f.user1 = auth.uid() and f.user2 = profile_privacy.user_id)
           or (f.user2 = auth.uid() and f.user1 = profile_privacy.user_id)
      )
    )
  );

create policy "Users can update own privacy settings" on public.profile_privacy
  for update using (auth.uid() = user_id);

create policy "Users can insert own privacy record" on public.profile_privacy
  for insert with check (auth.uid() = user_id);

-- Profile Statistics Policies
create policy "Select stats if not hidden or self" on public.profile_statistics
  for select using (
    auth.uid() = user_id or
    not exists (
      select 1 from public.profile_privacy p
      where p.user_id = profile_statistics.user_id and p.hide_progress = true
    )
  );

create policy "Users/systems can update statistics" on public.profile_statistics
  for all using (auth.uid() = user_id);

create policy "Users/systems can insert statistics" on public.profile_statistics
  for insert with check (auth.uid() = user_id);

-- Profile Settings Policies
create policy "Users can manage own settings" on public.profile_settings
  for all using (auth.uid() = user_id);


-- ====================================================
-- 7. STORAGE POLICIES FOR BUCKETS
-- ====================================================

-- Avatars bucket policies
create policy "Avatars bucket public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Avatars bucket upload own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    (left(name, 36) = auth.uid()::text)
  );

create policy "Avatars bucket update own" on storage.objects
  for update using (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    (left(name, 36) = auth.uid()::text)
  );

create policy "Avatars bucket delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    (left(name, 36) = auth.uid()::text)
  );

-- Covers bucket policies
create policy "Covers bucket public read" on storage.objects
  for select using (bucket_id = 'covers');

create policy "Covers bucket upload own" on storage.objects
  for insert with check (
    bucket_id = 'covers' and
    auth.role() = 'authenticated' and
    (left(name, 36) = auth.uid()::text)
  );

create policy "Covers bucket update own" on storage.objects
  for update using (
    bucket_id = 'covers' and
    auth.role() = 'authenticated' and
    (left(name, 36) = auth.uid()::text)
  );

create policy "Covers bucket delete own" on storage.objects
  for delete using (
    bucket_id = 'covers' and
    auth.role() = 'authenticated' and
    (left(name, 36) = auth.uid()::text)
  );


-- ====================================================
-- 8. REWRITE SIGNUP TRIGGER FUNCTION
-- ====================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_username text;
  new_fitsync_id text;
begin
  new_username := coalesce(new.raw_user_meta_data->>'username', 'fitsync_' || substr(md5(random()::text), 1, 8));
  new_fitsync_id := 'FTS-' || upper(substr(md5(random()::text), 1, 8));

  -- Insert profile
  insert into public.profiles (
    id, user_id, username, fitsync_id, full_name, avatar_url, cover_url, bio, gender, age, height, weight, fitness_goal, location, email, phone, activity_level, website, instagram, twitter
  )
  values (
    new.id,
    new.id,
    new_username,
    new_fitsync_id,
    coalesce(new.raw_user_meta_data->>'full_name', 'FitSync Athlete'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    '',
    'Just joined FitSync! Ready to track and improve.',
    'Not Specified',
    25,
    175.0,
    70.0,
    'Stay Healthy',
    'Earth',
    new.email,
    '',
    'Moderate',
    '',
    '',
    ''
  );

  -- Insert profile privacy
  insert into public.profile_privacy (id, user_id, profile_visibility, hide_weight, hide_height, hide_age, hide_online_status, hide_progress)
  values (gen_random_uuid(), new.id, 'public', false, false, false, false, false);

  -- Insert profile settings
  insert into public.profile_settings (id, user_id, theme, email_notifications, push_notifications)
  values (gen_random_uuid(), new.id, 'dark', true, true);

  -- Insert profile statistics
  insert into public.profile_statistics (id, user_id, current_weight, current_bmi, avg_daily_steps, avg_calories, workout_streak, total_workouts, friends_count, challenges_completed)
  values (gen_random_uuid(), new.id, 70.0, 22.86, 0, 0, 0, 0, 0, 0);

  return new;
end;
$$ language plpgsql security definer;


-- ====================================================
-- 9. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_profile_privacy_user on public.profile_privacy(user_id);
create index if not exists idx_profile_statistics_user on public.profile_statistics(user_id);
create index if not exists idx_profile_settings_user on public.profile_settings(user_id);
