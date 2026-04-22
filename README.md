# Fordham CS Club Website

Starter website for the Computer Science Club at Fordham University Lincoln Center.

## Pages

- `index.html`: homepage and main landing page
- `team.html`: e-board and leadership page
- `connect.html`: social links and contact page
- `resources.html`: tutoring and learning resources page
- `events.html`: dedicated events page fed by shared data
- `members.html`: member hub page

## Shared files

- `styles.css`: full visual design and responsive layout
- `script.js`: sticky mobile navigation, active page highlighting, reveal animations, and event loading
- `supabase-config.js`: Supabase project URL and public anon key for browser reads
- `supabase-schema.sql`: starter SQL for `events`, `members`, `resources`, `team_members`, `site_links`, and `site_settings`
- `supabase-events-schema.sql`: clean events-first Supabase schema with admin access and flyer upload policies
- `SUPABASE_EVENTS_SETUP.md`: chronological setup guide for the events backend
- `data/events.json`: starter event data source
- `members/example-member.html`: example personal member page
- `members/how-to-build-your-page.html`: placeholder tutorial page
- `members/member-template.html`: starter file members can copy later

## Quick edits

- Replace contact placeholders in `connect.html`
- Add real e-board names, photos, and descriptions in `team.html`
- Update event cards in `data/events.json`
- Expand the member tutorial in `members/how-to-build-your-page.html`
- Turn `members/example-member.html` into the first real sample profile

## Future event backend path

The dedicated events page already reads from `data/events.json`. A later backend can replace that JSON file with:

- a small admin dashboard
- a shared CMS
- a database-backed API
- authenticated e-board event publishing

That means the current events UI does not need to be redesigned when you add dynamic event data later.

## Supabase setup

The events, members, resources, team, and connect pages now try to load from Supabase first and fall back to local placeholder content if the database read is unavailable. Shared brand/page copy can also be driven from `site_settings`.

To add the current tables and public read policies, run the contents of `supabase-schema.sql` in the Supabase SQL Editor.

If you are restarting with an events-first setup, use:

- [supabase-events-schema.sql](/Users/barsatrithi/Desktop/Computer%20Science%20Club%20Website/supabase-events-schema.sql)
- [SUPABASE_EVENTS_SETUP.md](/Users/barsatrithi/Desktop/Computer%20Science%20Club%20Website/SUPABASE_EVENTS_SETUP.md)

## Admin dashboard

- `admin.html`: login-backed dashboard for managing content tables
- `admin.js`: Supabase Auth login flow and CRUD editor UI

To use the admin dashboard:

1. Run the latest `supabase-schema.sql` in Supabase SQL Editor.
2. In Supabase Auth, create email/password users for each admin.
3. Insert those admin emails into `public.admin_users`.
4. Open `admin.html` and sign in with one of those accounts.

If you only need the `events` read policy separately, use:

```sql
alter table public.events enable row level security;

create policy "Public can read events"
on public.events
for select
to anon
using (true);
```
