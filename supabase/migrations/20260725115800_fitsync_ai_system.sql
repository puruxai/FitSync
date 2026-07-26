-- Migration DDL for FitSync AI-Powered Fitness Platform
-- File: supabase/migrations/20260725115800_fitsync_ai_system.sql

-- ====================================================
-- 1. CREATE TABLES
-- ====================================================

-- AI settings configuration
create table if not exists public.ai_settings (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    provider text default 'gemini' not null check (provider in ('openai', 'gemini', 'claude', 'ollama', 'openrouter')),
    model text default 'gemini-1.5-flash' not null,
    memory_enabled boolean default true not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Conversations threads
create table if not exists public.ai_conversations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text default 'New Fitness Session' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Messages history logs
create table if not exists public.ai_messages (
    id uuid default gen_random_uuid() primary key,
    conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Insights logs (strengths, weaknesses, suggestions)
create table if not exists public.ai_insights (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    category text not null, -- 'weekly_summary', 'strength_analysis', 'diet_analysis'
    insight text not null,
    strength_analysis text,
    weakness_analysis text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Predictions (weight trends, BMI targets, completions)
create table if not exists public.ai_predictions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    metric_type text not null, -- 'weight_trend', 'bmi_trend', 'consistency'
    predicted_value text not null, -- e.g. "72.4 kg", "85% probability"
    probability numeric default 100.0 not null, -- percentage confidence
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Recommendations logs
create table if not exists public.ai_recommendations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    category text not null, -- 'workout', 'diet', 'recovery'
    recommendation text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================
alter table public.ai_settings enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_insights enable row level security;
alter table public.ai_predictions enable row level security;
alter table public.ai_recommendations enable row level security;


-- ====================================================
-- 3. DEFINE RLS POLICIES
-- ====================================================

-- settings
create policy "Users can manage their own AI settings" on public.ai_settings
    for all using (auth.uid() = profile_id);

-- conversations
create policy "Users can manage their own AI conversations" on public.ai_conversations
    for all using (auth.uid() = user_id);

-- messages
create policy "Users can view messages in their conversations" on public.ai_messages
    for all using (
        exists (
            select 1 from public.ai_conversations c 
            where c.id = conversation_id and c.user_id = auth.uid()
        )
    );

-- insights
create policy "Users can view their own AI insights" on public.ai_insights
    for all using (auth.uid() = user_id);

-- predictions
create policy "Users can view their own AI predictions" on public.ai_predictions
    for all using (auth.uid() = user_id);

-- recommendations
create policy "Users can view their own AI recommendations" on public.ai_recommendations
    for all using (auth.uid() = user_id);


-- ====================================================
-- 4. PERFORMANCE INDEXES
-- ====================================================
create index if not exists idx_ai_conv_user on public.ai_conversations(user_id);
create index if not exists idx_ai_msg_conv on public.ai_messages(conversation_id);
create index if not exists idx_ai_ins_user on public.ai_insights(user_id);
create index if not exists idx_ai_pred_user on public.ai_predictions(user_id);
create index if not exists idx_ai_reco_user on public.ai_recommendations(user_id);
