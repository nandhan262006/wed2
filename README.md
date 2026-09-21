# Sahana & Krishna Teja — Wedding Invitation (Next.js)

Modern wedding invitation site built with **Next.js 15 App Router + TypeScript**.

- Hero / details / countdown / RSVP / guest list / closing
- RSVP storage in **Turso (libSQL)** via `app/api/rsvp`
- Fonts via `next/font`, images via `next/image`, SEO metadata + JSON-LD

## Run locally

```bash
npm install
cp .env.example .env   # fill in Turso values
npm run dev
```

Open http://localhost:3000

## Env vars

| Var | Required | Purpose |
|-----|----------|---------|
| `TURSO_DATABASE_URL` | yes | Turso DB URL for RSVP storage |
| `TURSO_AUTH_TOKEN` | yes | Turso auth token |
| `RSVP_ADMIN_TOKEN` | no | If set, `GET /api/rsvp?token=...` requires it (guest-list passcode). If empty, list is public. |

## API

- `POST /api/rsvp` — `{ name, contact, attendance: "accepts"|"declines", guests, side, dietary, message, timestamp }`
- `GET /api/rsvp[?token=...]` — `{ ok, counts: { total, accepts, declines, guestTotal }, rsvps }`

Table `rsvps` is auto-created on first request.

## Deploy (Vercel)

1. Push to GitHub, import in Vercel (framework auto-detected as Next.js).
2. Add the env vars above in Vercel → Settings → Environment Variables.
3. Deploy. Image is served from `public/wedding-frame.jpg`.

## Project structure

```
app/
  layout.tsx        # fonts, SEO, JSON-LD
  page.tsx          # all invitation sections
  globals.css       # full styling (fixed readability + responsive)
  api/rsvp/route.ts # Turso-backed RSVP API
components/
  Countdown.tsx RsvpForm.tsx GuestList.tsx types.ts
lib/wedding.ts      # names, date, venue constants
public/wedding-frame.jpg
```
