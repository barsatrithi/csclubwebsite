create table if not exists public.admin_users (
  email text primary key,
  user_id uuid unique references auth.users(id) on delete cascade,
  name text,
  role text not null default 'admin',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  title text not null,
  tag text not null,
  description text not null,
  location text not null,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone,
  flyer_path text,
  flyer_url text,
  registration_url text,
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       or user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.events enable row level security;

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Approved admins can read admin users" on public.admin_users;
create policy "Approved admins can read admin users"
on public.admin_users
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "Approved admins can manage events" on public.events;
create policy "Approved admins can manage events"
on public.events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Approved admins can manage admin users" on public.admin_users;
create policy "Approved admins can manage admin users"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Storage setup note:
-- Create a public bucket in the Supabase dashboard named `event-flyers`
-- and then run the policies below.

drop policy if exists "Public can view event flyers" on storage.objects;
create policy "Public can view event flyers"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'event-flyers');

drop policy if exists "Approved admins can upload event flyers" on storage.objects;
create policy "Approved admins can upload event flyers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-flyers'
  and public.is_admin()
);

drop policy if exists "Approved admins can update event flyers" on storage.objects;
create policy "Approved admins can update event flyers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-flyers'
  and public.is_admin()
)
with check (
  bucket_id = 'event-flyers'
  and public.is_admin()
);

drop policy if exists "Approved admins can delete event flyers" on storage.objects;
create policy "Approved admins can delete event flyers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-flyers'
  and public.is_admin()
);

-- Add approved admins after creating users in Supabase Auth.
-- Example:
-- insert into public.admin_users (email, name, role)
-- values ('club@example.edu', 'Club Admin', 'president')
-- on conflict (email) do nothing;
