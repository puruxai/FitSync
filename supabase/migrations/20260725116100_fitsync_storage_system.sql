-- Migration DDL for FitSync Enterprise File Storage and Media Management System
-- File: supabase/migrations/20260725116100_fitsync_storage_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- Media Folders structure
create table if not exists public.media_folders (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    parent_id uuid references public.media_folders(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Media Files metadata
create table if not exists public.media_files (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    folder_id uuid references public.media_folders(id) on delete set null,
    filename text not null,
    file_path text not null, -- path in bucket
    file_size bigint not null, -- in bytes
    mime_type text not null,
    category text not null check (category in ('profile_photo', 'cover_photo', 'workout_image', 'exercise_image', 'workout_video', 'challenge_image', 'ai_image', 'progress_photo', 'document', 'export_file', 'general')),
    permission_level text default 'private' not null check (permission_level in ('public', 'friends', 'private', 'admin')),
    thumbnail_path text,
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Media Tags
create table if not exists public.media_tags (
    file_id uuid references public.media_files(id) on delete cascade not null,
    tag text not null,
    primary key (file_id, tag)
);

-- Upload transactions history log
create table if not exists public.upload_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    filename text not null,
    file_size bigint not null,
    status text not null check (status in ('success', 'failed', 'cancelled')),
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Storage quota and usage metrics per user
create table if not exists public.storage_usage (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    bytes_used bigint default 0 not null,
    quota_bytes bigint default 1073741824 not null, -- 1 GB default
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.media_folders enable row level security;
alter table public.media_files enable row level security;
alter table public.media_tags enable row level security;
alter table public.upload_history enable row level security;
alter table public.storage_usage enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- Folders
create policy "Users can manage their own media folders" on public.media_folders
    for all using (auth.uid() = user_id);

-- Files: read if public, if owner, or if friends (join check), or if admin
create policy "Owner can perform all operations on files" on public.media_files
    for all using (auth.uid() = user_id);

create policy "Users can view public files" on public.media_files
    for select using (permission_level = 'public');

create policy "Admins can view all files" on public.media_files
    for select using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin')
        )
    );

-- Tags
create policy "Users can manage tags on their files" on public.media_tags
    for all using (
        exists (
            select 1 from public.media_files f
            where f.id = file_id and f.user_id = auth.uid()
        )
    );

-- Upload History
create policy "Users can view their own upload history" on public.upload_history
    for select using (auth.uid() = user_id);

-- Storage Usage
create policy "Users can view their own storage usage" on public.storage_usage
    for select using (auth.uid() = profile_id);


-- ====================================================
-- 4. SEED SEEDS DEFAULT
-- ====================================================
insert into public.storage_usage (profile_id, bytes_used, quota_bytes)
select id, 0, 1073741824 from public.profiles
on conflict (profile_id) do nothing;


-- ====================================================
-- 5. INDEXES
-- ====================================================
create index if not exists idx_media_files_user on public.media_files(user_id);
create index if not exists idx_media_files_folder on public.media_files(folder_id);
create index if not exists idx_media_folders_parent on public.media_folders(parent_id);
create index if not exists idx_upload_hist_user on public.upload_history(user_id);
