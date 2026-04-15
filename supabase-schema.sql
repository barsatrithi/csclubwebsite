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

alter table public.events enable row level security;
alter table public.members enable row level security;
alter table public.resources enable row level security;

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

insert into public.members (initials, name, description, page_url, display_order)
values
  ('BR', 'Example Member Page', 'A starter personal page placeholder that can become your example profile once you send your details.', 'members/example-member.html', 1),
  ('?', 'How to Build Your Page', 'A future article-style tutorial placeholder for students to follow step by step.', 'members/how-to-build-your-page.html', 2),
  ('TP', 'Member Template', 'A starter file members can eventually copy when the profile-page project officially launches.', 'members/member-template.html', 3)
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
