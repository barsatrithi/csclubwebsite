# Supabase Events Setup

This project is being reset around one clear goal first:

1. Public visitors can view published events
2. Approved admins can sign in and create/edit/delete events
3. Admins can upload event flyer images

## Chronological setup

### 1. Work on the right git branch

You are currently on `supabase-events`. Stay there while rebuilding the events workflow.

If you ever want to switch to `main`:

```bash
git checkout main
git pull
```

### 2. Create a fresh Supabase project

In the Supabase dashboard:

1. Create a new project under the club account
2. Wait for the database to finish provisioning
3. Copy:
   - Project URL
   - Anon public key

Put those into [supabase-config.js](/Users/barsatrithi/Desktop/Computer%20Science%20Club%20Website/supabase-config.js).

### 3. Configure Auth first

In Supabase:

1. Go to `Authentication` -> `Providers`
2. Make sure `Email` is enabled
3. Go to `Authentication` -> `URL Configuration`
4. Set `Site URL` to your local URL
   - Example: `http://localhost:5500/admin.html`
   - Use the exact origin/path pattern you are actually testing with
5. Add allowed redirect URLs for local development
   - Example:
     - `http://localhost:5500/admin.html`
     - `http://127.0.0.1:5500/admin.html`

### 4. Create admin auth users

In Supabase:

1. Go to `Authentication` -> `Users`
2. Create or invite the admin accounts who should manage events
3. If using invites, finish the email/password setup flow for each admin

### 5. Create the flyer bucket

In Supabase:

1. Go to `Storage`
2. Create a new bucket named `event-flyers`
3. Make it `Public`
4. Restrict it to image uploads if desired
   - Good options:
     - allowed MIME types: `image/png`, `image/jpeg`, `image/webp`
     - reasonable size limit, for example `5 MB`

This uses Supabase Storage bucket guidance and public bucket behavior from the official docs:
- [Creating buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets)
- [Storage fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals)

### 6. Run the events-first SQL schema

Open `SQL Editor` in Supabase and run the contents of:

- [supabase-events-schema.sql](/Users/barsatrithi/Desktop/Computer%20Science%20Club%20Website/supabase-events-schema.sql)

This creates:
- `admin_users`
- `events`
- admin-check helper function
- RLS policies for events
- storage policies for the `event-flyers` bucket

This uses Supabase RLS and Storage policy patterns from the official docs:
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

### 7. Approve your admin emails

After your Auth users exist, add the approved admin emails:

```sql
insert into public.admin_users (email, name, role)
values
  ('your-club-email@example.com', 'Your Name', 'president')
on conflict (email) do nothing;
```

Important:
- Supabase Auth proves identity
- `admin_users` decides authorization
- both are required for admin access

### 8. Test browser login

Open:

- [admin.html](/Users/barsatrithi/Desktop/Computer%20Science%20Club%20Website/admin.html)

Use an approved admin email/password.

Expected result:
- sign-in succeeds
- the page checks `admin_users`
- if approved, the event editor appears

### 9. Create your first event

In the admin dashboard:

1. Enter title, tag, description, date/time, location
2. Optionally add a registration link
3. Upload a flyer image
4. Mark the event as published
5. Save

### 10. Verify the public events page

Open:

- [events.html](/Users/barsatrithi/Desktop/Computer%20Science%20Club%20Website/events.html)

Expected result:
- only published events appear
- flyer image displays if uploaded
- registration link appears if provided

## Why this setup is enough for now

For the current milestone, Supabase only needs to manage:
- admin login
- admin authorization
- event records
- flyer image uploads

You do **not** need to connect Supabase to GitHub for this.

GitHub stores your code.
Supabase stores your auth, database, and uploaded files.
