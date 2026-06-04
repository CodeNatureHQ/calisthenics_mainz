-- Event registrations (team + individual)
create table public.event_registrations (
  id         uuid        default gen_random_uuid() primary key,
  event_id   text        not null references public.events(id) on delete cascade,
  type       text        not null check (type in ('team', 'individual')),
  name       text,        -- individual: required; team: null
  email      text,        -- optional for both
  team_name  text,        -- team: required; individual: null
  created_at timestamptz not null default now()
);

create index event_registrations_event_id_idx on public.event_registrations (event_id);

-- Team members (only for team registrations)
create table public.event_registration_members (
  id              uuid default gen_random_uuid() primary key,
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  name            text not null,
  email           text,
  sort_order      int  not null default 0
);

create index event_registration_members_reg_id_idx on public.event_registration_members (registration_id);

-- RLS
alter table public.event_registrations         enable row level security;
alter table public.event_registration_members  enable row level security;

-- Public: anyone may register (insert only)
create policy "anyone registers"
  on public.event_registrations for insert
  to anon, authenticated with check (true);

create policy "anyone adds members"
  on public.event_registration_members for insert
  to anon, authenticated with check (true);

-- Admin: full access
create policy "admins manage registrations"
  on public.event_registrations for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

create policy "admins manage members"
  on public.event_registration_members for all
  using (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));
