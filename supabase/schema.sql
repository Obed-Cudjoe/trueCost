-- TrueCost database schema — run once in Supabase Dashboard → SQL Editor.
-- Free tier. Tables match src/lib/db.ts + API routes.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  area_slug text not null,
  budget_range text not null,
  source_page text,
  status text default 'new'
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  contact text not null,
  topic text not null,
  message text not null,
  status text default 'new'
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text unique not null,
  source_page text,
  unsubscribed boolean default false
);

-- Lockdown: the service-role key (server only) bypasses RLS; anonymous clients get nothing.
alter table leads enable row level security;
alter table contact_messages enable row level security;
alter table newsletter_subscribers enable row level security;
-- No public policies = all browser-direct access denied. API routes use the service key server-side.

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  role text default 'agent',
  area_slug text not null,
  property_type text not null,
  price text,
  description text,
  source_page text,
  status text default 'new'
);
alter table partners enable row level security;

-- Renter-reported price observations. Never published directly: rows stay
-- "pending" until the owner reviews them behind the tracker key.
create table if not exists price_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  area_slug text not null,
  room_type text not null,
  observed_rent numeric not null,
  observed_on date not null,
  basis text not null default 'unknown',      -- asking | paid | unknown
  source_context text,                        -- how the figure was seen (optional)
  contact text,                               -- optional, private, never returned publicly
  source_page text,
  status text default 'pending',              -- pending | approved | rejected | needs_clarification
  review_note text,
  reviewed_at timestamptz
);
alter table price_reports enable row level security;
