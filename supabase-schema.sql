create table if not exists public.members (
  id bigint generated always as identity primary key,
  initials text not null,
  name text not null,
  description text not null,
  page_url text not null unique,
  is_public boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.resources (
  id bigint generated always as identity primary key,
  category text not null,
  title text not null,
  description text not null,
  url text,
  display_order integer not null default 0,
  created_at timestamp with time zone default now(),
  unique (category, title)
);

create table if not exists public.team_members (
  id bigint generated always as identity primary key,
  badge text not null,
  role text not null unique,
  bio text not null,
  display_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.site_links (
  id bigint generated always as identity primary key,
  label text not null unique,
  title text not null,
  description text not null,
  url text,
  display_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamp with time zone default now()
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
  );
$$;

alter table public.events enable row level security;
alter table public.members enable row level security;
alter table public.resources enable row level security;
alter table public.team_members enable row level security;
alter table public.site_links enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read events" on public.events;
create policy "Public can read events"
on public.events
for select
to anon
using (true);

drop policy if exists "Public can read public members" on public.members;
create policy "Public can read public members"
on public.members
for select
to anon
using (is_public = true);

drop policy if exists "Public can read resources" on public.resources;
create policy "Public can read resources"
on public.resources
for select
to anon
using (true);

drop policy if exists "Public can read team members" on public.team_members;
create policy "Public can read team members"
on public.team_members
for select
to anon
using (true);

drop policy if exists "Public can read site links" on public.site_links;
create policy "Public can read site links"
on public.site_links
for select
to anon
using (true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon
using (true);

drop policy if exists "Admins can view admin users" on public.admin_users;
create policy "Admins can view admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage admin users" on public.admin_users;
create policy "Admins can manage admin users"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
on public.events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage members" on public.members;
create policy "Admins can manage members"
on public.members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage resources" on public.resources;
create policy "Admins can manage resources"
on public.resources
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage team members" on public.team_members;
create policy "Admins can manage team members"
on public.team_members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage site links" on public.site_links;
create policy "Admins can manage site links"
on public.site_links
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.members (initials, name, description, page_url, display_order)
values
  ('BR', 'Barsat Rithi', 'A starter personal website page that opens from the members hub and can grow into a fuller profile over time.', 'members/barsat-rithi.html', 1)
on conflict (page_url) do nothing;

insert into public.resources (category, title, description, url, display_order)
values
  ('On-Campus Support', 'Tutoring location placeholder', 'Add the tutoring room or department office once confirmed.', null, 1),
  ('On-Campus Support', 'Peer help / office hours placeholder', 'Use this for office hours, peer support sessions, or study groups.', null, 2),
  ('On-Campus Support', 'Faculty and department support placeholder', 'List helpful faculty contacts or department resources here.', null, 3),
  ('Online Learning Resources', 'Programming practice links placeholder', 'Swap in LeetCode, HackerRank, Exercism, or other practice platforms.', null, 1),
  ('Online Learning Resources', 'Course support references placeholder', 'Use this for notes, tutorials, and study references tied to coursework.', null, 2),
  ('Online Learning Resources', 'Internship and career prep links placeholder', 'Add resume, interview, or internship resources here.', null, 3)
on conflict (category, title) do nothing;

insert into public.team_members (badge, role, bio, display_order)
values
  ('01', 'President', 'Photo and leadership bio coming soon.', 1),
  ('02', 'Vice President', 'Photo and leadership bio coming soon.', 2),
  ('03', 'Treasurer', 'Photo and leadership bio coming soon.', 3),
  ('04', 'Secretary', 'Photo and leadership bio coming soon.', 4)
on conflict (role) do nothing;

insert into public.site_links (label, title, description, url, display_order)
values
  ('Discord', 'Server link coming soon', 'Use this area for a join link, server invite button, and a short note about what members can expect there.', null, 1),
  ('Instagram', '@fordhamcsclub', 'Perfect for event reminders, workshop recaps, and announcements.', null, 2),
  ('Email', 'club email placeholder', 'Add your official contact email here so students and campus partners know where to reach the club.', null, 3)
on conflict (label) do nothing;

insert into public.site_settings (key, value)
values
  ('club_name', 'Fordham CS Club'),
  ('campus_name', 'Lincoln Center'),
  ('home_eyebrow', 'Fordham University at Lincoln Center'),
  ('home_title', 'Building a club where curiosity, code, and community meet.'),
  ('home_intro', 'A community for students who want to learn, create, and grow through workshops, shared projects, campus resources, and meaningful collaboration.'),
  ('mission_heading', 'Make computer science more welcoming, practical, and creative on campus.'),
  ('events_heading', 'Designed now for dynamic updates later.'),
  ('events_intro', 'The event cards below still read from a shared data source, but they now live on a dedicated page that will be much easier to connect to a future backend.'),
  ('members_heading', 'A member hub that can grow into a student-built gallery of personal pages.'),
  ('members_intro', 'This page gives the member area its own home, while still leaving room to expand into a fuller gallery of student pages later on. Click a card to preview a member and jump to their profile.'),
  ('resources_heading', 'A home for campus help, tutoring details, and favorite learning links.'),
  ('resources_intro', 'Keeping resources on their own page makes the site easier to navigate now and easier to expand later when you add real tutoring info and curated links.'),
  ('team_heading', 'Meet the people building the club.'),
  ('team_intro', 'Meet the E-board and committee leads for the Fordham CS Club! This is the team that works behind the scenes to plan events, create resources, and build a welcoming community for all members. Check back here for photos and bios coming soon.'),
  ('connect_heading', 'All of the channels students will need!'),
  ('connect_intro', 'Find our discord server, instagram handle, and contact email here. Use these channels to stay in the loop on upcoming events, workshops, and club news, and to reach out with any questions or ideas you have for the club!')
on conflict (key) do nothing;

-- Add one row per admin email after you create those users in Supabase Auth.
-- Example:
-- insert into public.admin_users (email) values ('your-email@example.com') on conflict (email) do nothing;
