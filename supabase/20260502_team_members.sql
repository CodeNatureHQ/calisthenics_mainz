-- ---------------------------------------------------------------------------
-- Team members (Trainer & Vorstand)
-- ---------------------------------------------------------------------------
create table public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null check (role in ('trainer', 'vorstand')),
  image_url   text,
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger team_members_touch before update on public.team_members
  for each row execute function public.set_updated_at();

alter table public.team_members enable row level security;

create policy "public read team_members"
  on public.team_members for select
  using (visible = true);

create policy "admins manage team_members"
  on public.team_members for all
  using  (coalesce((auth.jwt() ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() ->> 'is_admin')::boolean, false));

-- Storage bucket for team photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-images', 'team-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public read team images"
  on storage.objects for select
  using (bucket_id = 'team-images');

create policy "admins upload team images"
  on storage.objects for insert
  with check (
    bucket_id = 'team-images'
    and coalesce((auth.jwt() ->> 'is_admin')::boolean, false)
  );

create policy "admins delete team images"
  on storage.objects for delete
  using (
    bucket_id = 'team-images'
    and coalesce((auth.jwt() ->> 'is_admin')::boolean, false)
  );
