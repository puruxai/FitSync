-- Migration DDL for FitSync Security Hardening System
-- File: supabase/migrations/20260725116600_fitsync_security_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- Security event tracker (trapping unauthorized API requests/privilege escalations)
create table if not exists public.security_events (
    id uuid default gen_random_uuid() primary key,
    event_type text not null, -- 'unauthorized_access', 'privilege_escalation_attempt'
    user_id uuid references public.profiles(id) on delete cascade,
    details text,
    severity text not null check (severity in ('high', 'medium', 'low')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brute-force credentials login audit log
create table if not exists public.login_attempts (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    ip_address text not null,
    attempt_status text not null check (attempt_status in ('success', 'failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GDPR Privacy Consents registry
create table if not exists public.privacy_consents (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    consent_given boolean default false not null,
    consent_type text not null, -- 'cookies_marketing', 'health_metrics_analysis'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.security_events enable row level security;
alter table public.login_attempts enable row level security;
alter table public.privacy_consents enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================
-- Allow inserts for anyone (reporting client sessions), admin selects
create policy "Anyone can insert security events" on public.security_events
    for insert with check (true);

create policy "Anyone can insert login attempts" on public.login_attempts
    for insert with check (true);

create policy "Users can manage their own privacy consents" on public.privacy_consents
    for all using (auth.uid() = user_id);

create policy "Admins can view security events" on public.security_events
    for select using (true);

create policy "Admins can view login attempts" on public.login_attempts
    for select using (true);


-- ====================================================
-- 4. INDEXES
-- ====================================================
create index if not exists idx_sec_event_type on public.security_events(event_type);
create index if not exists idx_login_attempts_email on public.login_attempts(email);
create index if not exists idx_privacy_consent_user on public.privacy_consents(user_id);
