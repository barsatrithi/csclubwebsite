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
- `supabase-schema.sql`: starter SQL for `members` and `resources` tables plus public read policies
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

The events, members, and resources pages now try to load from Supabase first and fall back to local placeholder content if the database read is unavailable.

To add the new tables and public read policies, run the contents of `supabase-schema.sql` in the Supabase SQL Editor.

If you only need the `events` read policy separately, use:

```sql
alter table public.events enable row level security;

create policy "Public can read events"
on public.events
for select
to anon
using (true);
```
