# Fordham CS Club Website

Starter website for the Computer Science Club at Fordham University Lincoln Center.

## Files

- `index.html`: main one-page club website
- `styles.css`: full visual design and responsive layout
- `script.js`: mobile navigation, reveal animations, and event loading
- `data/events.json`: starter event data source
- `members/example-member.html`: example personal member page
- `members/how-to-build-your-page.html`: placeholder tutorial page
- `members/member-template.html`: starter file members can copy later

## Quick edits

- Replace contact placeholders in `index.html`
- Add real e-board names, photos, and descriptions in `index.html`
- Update event cards in `data/events.json`
- Expand the member tutorial in `members/how-to-build-your-page.html`
- Turn `members/example-member.html` into the first real sample profile

## Future event backend path

The front-end events section already reads from `data/events.json`. A later backend can replace that JSON file with:

- a small admin dashboard
- a shared CMS
- a database-backed API
- authenticated e-board event publishing

That means the website UI does not need to be rebuilt when you add dynamic events later.
