-- Migration DDL for FitSync Notification System
-- File: supabase/migrations/20260725115500_fitsync_notification_system.sql

-- ====================================================
-- 1. CREATE/EXTEND NOTIFICATION TABLES
-- ====================================================

-- Drop old notifications if table schema differs (safe since it's development)
drop table if exists public.notifications cascade;

-- Notifications Configuration Table
create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text not null, -- 'friend_request', 'friend_request_accepted', etc.
    priority text default 'medium' not null check (priority in ('low', 'medium', 'high')),
    sender_id uuid references public.profiles(id) on delete set null,
    target_resource text, -- e.g. challenge_id, friend_id
    is_read boolean default false not null,
    is_archived boolean default false not null,
    is_pinned boolean default false not null,
    category text default 'system' not null check (category in ('friend', 'challenge', 'workout', 'reminder', 'leaderboard', 'achievement', 'system')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notification Settings/Preferences
create table if not exists public.notification_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    mute_friend boolean default false not null,
    mute_challenge boolean default false not null,
    mute_workout boolean default false not null,
    mute_reminder boolean default false not null,
    mute_leaderboard boolean default false not null,
    mute_achievement boolean default false not null,
    mute_system boolean default false not null,
    email_enabled boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notification Archival History logs
create table if not exists public.notification_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    notification_id uuid not null,
    archived_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- System Notifications Templates
create table if not exists public.notification_templates (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    title_template text not null,
    body_template text not null
);

-- Notification Sent logs (for audit)
create table if not exists public.notification_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    status text not null check (status in ('sent', 'failed', 'pending')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_history enable row level security;
alter table public.notification_logs enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Notifications: private to target user
create policy "Users can manage their own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- Preferences
create policy "Users can manage their own notification preferences" on public.notification_preferences
  for all using (auth.uid() = user_id);

-- History
create policy "Users can view their own notification history" on public.notification_history
  for select using (auth.uid() = user_id);

-- Logs
create policy "Users can view their own notification logs" on public.notification_logs
  for select using (auth.uid() = user_id);


-- ====================================================
-- 4. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_notifications_user_lookup on public.notifications(user_id, is_read, is_archived);
create index if not exists idx_notif_pref_user on public.notification_preferences(user_id);
create index if not exists idx_notif_hist_user on public.notification_history(user_id);
create index if not exists idx_notif_logs_user on public.notification_logs(user_id);
