-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Enumerated types for consistent domain modelling
do $$
begin
  if not exists (select 1 from pg_type where typname = 'session_category') then
    create type session_category as enum ('love', 'life', 'relationship');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_role') then
    create type message_role as enum ('user', 'assistant', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_plan') then
    create type subscription_plan as enum ('free', 'light', 'premium');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('active', 'canceled', 'past_due');
  end if;
end$$;

-- Users ----------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nickname text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Sessions (chat conversations)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category session_category not null,
  title text,
  total_tokens integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists sessions_user_id_idx on sessions(user_id);

-- Messages within a session
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  role message_role not null,
  content text not null,
  tokens_used integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists messages_session_id_idx on messages(session_id);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade unique,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'active',
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Pay-as-you-go points balance
create table if not exists user_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade unique,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Diagnosis results
create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  answers jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists diagnoses_user_id_idx on diagnoses(user_id);

-- Knowledge base chunks for RAG
create table if not exists knowledge (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists knowledge_embedding_idx on knowledge using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Helper indexes for frequently queried fields
create index if not exists subscriptions_status_idx on subscriptions(status);
create index if not exists sessions_category_idx on sessions(category);

comment on table users is 'Application users mirrored from Supabase Auth';
comment on table sessions is 'Chat sessions categorized by consultation type';
comment on table messages is 'Individual chat messages stored for history & analytics';
comment on table subscriptions is 'Stripe-backed subscription state for each user';
comment on table user_points is 'Prepaid point balances for usage-based billing';
comment on table diagnoses is 'Stored results of TapeAI diagnostic flows';
comment on table knowledge is 'RAG knowledge base chunks with embeddings';
