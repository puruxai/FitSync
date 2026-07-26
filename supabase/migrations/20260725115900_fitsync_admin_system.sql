-- Migration DDL for FitSync Enterprise Admin Dashboard and Moderation System
-- File: supabase/migrations/20260725115900_fitsync_admin_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- System Roles
create table if not exists public.roles (
    id uuid default gen_random_uuid() primary key,
    name text unique not null -- 'super_admin', 'admin', 'moderator', 'support_agent', 'verified_trainer', 'verified_nutritionist', 'user'
);

-- System Permissions
create table if not exists public.permissions (
    id uuid default gen_random_uuid() primary key,
    name text unique not null -- 'manage_users', 'moderate_content', 'view_audit_logs', 'publish_announcements'
);

-- User Roles linking
create table if not exists public.user_roles (
    user_id uuid references public.profiles(id) on delete cascade not null,
    role_id uuid references public.roles(id) on delete cascade not null,
    primary key (user_id, role_id)
);

-- Moderation Reports
create table if not exists public.reports (
    id uuid default gen_random_uuid() primary key,
    reporter_id uuid references public.profiles(id) on delete cascade not null,
    reported_user_id uuid references public.profiles(id) on delete cascade not null,
    category text not null check (category in ('spam', 'abuse', 'fake_profile', 'harassment', 'inappropriate_content')),
    reason text not null,
    status text default 'pending' not null check (status in ('pending', 'resolved_approved', 'resolved_rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Global Announcements
create table if not exists public.announcements (
    id uuid default gen_random_uuid() primary key,
    author_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    content text not null,
    type text default 'global' not null check (type in ('global', 'maintenance', 'release_notes', 'emergency')),
    is_active boolean default true not null,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit logs
create table if not exists public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    action text not null, -- 'user_ban', 'role_assignment', 'announcement_publish'
    details text,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- System Settings
create table if not exists public.system_settings (
    key text primary key,
    value text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. SEED SEEDS
-- ====================================================

-- Seed Default Roles
insert into public.roles (name) values
  ('super_admin'),
  ('admin'),
  ('moderator'),
  ('support_agent'),
  ('verified_trainer'),
  ('verified_nutritionist'),
  ('user')
on conflict (name) do nothing;

-- Seed Default Permissions
insert into public.permissions (name) values
  ('manage_users'),
  ('moderate_content'),
  ('view_audit_logs'),
  ('publish_announcements')
on conflict (name) do nothing;


-- ====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.reports enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;


-- ====================================================
-- 4. DEFINE RLS POLICIES
-- ====================================================

-- Roles: read public
create policy "Anyone can read system roles" on public.roles
    for select using (true);

-- Permissions: read public
create policy "Anyone can read system permissions" on public.permissions
    for select using (true);

-- User roles: read public, write admin
create policy "Anyone can view user roles mapping" on public.user_roles
    for select using (true);

create policy "Admins can manage user roles" on public.user_roles
    for all using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin')
        )
    );

-- Reports
create policy "Users can view reports they submitted" on public.reports
    for select using (auth.uid() = reporter_id);

create policy "Moderators and admins can manage all reports" on public.reports
    for all using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin', 'moderator')
        )
    );

-- Announcements
create policy "Anyone can view active announcements" on public.announcements
    for select using (is_active = true);

create policy "Admins can manage announcements" on public.announcements
    for all using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin')
        )
    );

-- Audit logs
create policy "Admins can view audit logs" on public.audit_logs
    for select using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin')
        )
    );

-- System Settings
create policy "Anyone can view system settings" on public.system_settings
    for select using (true);

create policy "Admins can manage system settings" on public.system_settings
    for all using (
        exists (
            select 1 from public.user_roles ur
            join public.roles r on ur.role_id = r.id
            where ur.user_id = auth.uid() and r.name in ('super_admin', 'admin')
        )
    );


-- ====================================================
-- 5. INDEXES
-- ====================================================
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_reports_reported on public.reports(reported_user_id);
create index if not exists idx_announcements_active on public.announcements(is_active);
create index if not exists idx_audit_user on public.audit_logs(user_id);
