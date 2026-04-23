-- =============================================================================
-- Calisthenics Mainz — Supabase Schema
-- Paste this into Supabase SQL Editor → New Query → Run
-- =============================================================================

create extension if not exists "pgcrypto";

-- Automatic updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id          text primary key,
  glyph       text,
  category    jsonb not null,
  date_label  jsonb not null,
  read_time   jsonb not null,
  title       jsonb not null,
  excerpt     jsonb not null,
  body_html   jsonb not null,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger posts_touch before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create type event_category as enum ('comp', 'jam', 'workshop', 'social');

create table public.events (
  id           text primary key,
  category     event_category not null,
  starts_at    timestamptz not null,
  place        jsonb not null,
  title        jsonb not null,
  description  jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index events_starts_at_idx on public.events (starts_at desc);
create trigger events_touch before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Weekly training schedule
-- ---------------------------------------------------------------------------
create type session_level as enum ('beginner', 'advanced', 'open', 'comp', 'training');

create table public.training_sessions (
  id          uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  time_label  text not null,
  place       jsonb not null,
  level       session_level not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index training_dow_idx on public.training_sessions (day_of_week);
create trigger training_touch before update on public.training_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Calendar overrides
-- ---------------------------------------------------------------------------
create type override_type as enum ('training', 'cancel');

create table public.calendar_overrides (
  id         uuid primary key default gen_random_uuid(),
  type       override_type not null,
  on_date    date not null,
  time_label text,
  place      jsonb,
  level      session_level,
  note       jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_needs_details check (
    type <> 'training' or (time_label is not null and place is not null and level is not null)
  )
);
create index overrides_date_idx on public.calendar_overrides (on_date);
create trigger overrides_touch before update on public.calendar_overrides
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Spots (with lat/lng for Leaflet map)
-- ---------------------------------------------------------------------------
create table public.spots (
  id            text primary key,
  glyph         text not null,
  map_x         integer not null default 400,
  map_y         integer not null default 280,
  lat           real,
  lng           real,
  label_anchor  text not null default 'right',
  name          jsonb not null,
  subtitle      jsonb not null,
  address       text not null,
  access        jsonb not null,
  gear          text[] not null default '{}',
  maps_url      text,
  images        text[] not null default '{}',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger spots_touch before update on public.spots
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Site settings (single-row)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id              smallint primary key default 1 check (id = 1),
  hero_members    text not null default '120+',
  hero_sessions   text not null default '2 + Open',
  hero_spot       text not null default 'JGU Campus',
  hero_fee        text not null default '€ 0 / Monat',
  about_members   text not null default '120',
  about_founded   text not null default '2018',
  about_spots     text not null default '3',
  about_sessions  text not null default '2',
  updated_at      timestamptz not null default now()
);
create trigger settings_touch before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Contact form
-- ---------------------------------------------------------------------------
create type experience_level as enum ('beginner', 'intermediate', 'advanced', 'unsure');

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  level       experience_level not null,
  message     text not null,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index contact_created_idx on public.contact_messages (created_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.posts               enable row level security;
alter table public.events              enable row level security;
alter table public.training_sessions   enable row level security;
alter table public.calendar_overrides  enable row level security;
alter table public.spots               enable row level security;
alter table public.site_settings       enable row level security;
alter table public.contact_messages    enable row level security;

-- Public read
create policy "public read posts"     on public.posts for select using (published = true);
create policy "public read events"    on public.events for select using (true);
create policy "public read training"  on public.training_sessions for select using (true);
create policy "public read overrides" on public.calendar_overrides for select using (true);
create policy "public read spots"     on public.spots for select using (true);
create policy "public read settings"  on public.site_settings for select using (true);

-- Admin full access (is_admin claim on JWT)
create policy "admins manage posts"     on public.posts for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins manage events"    on public.events for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins manage training"  on public.training_sessions for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins manage overrides" on public.calendar_overrides for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins manage spots"     on public.spots for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins manage settings"  on public.site_settings for update
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "anyone submits contact"  on public.contact_messages for insert
  to anon, authenticated with check (true);

create policy "admins read contact"     on public.contact_messages for select
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins update contact"   on public.contact_messages for update
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

-- =============================================================================
-- After running this schema, set the admin claim for your admin user:
--
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
-- where email = 'your-admin@email.com';
-- =============================================================================
