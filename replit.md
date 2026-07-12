# Ranthambore Safari Curator

## Overview
A safari booking concierge site for Ranthambore National Park: a public-facing
React site (booking flow, hotels, packages, contact) backed by a FastAPI +
MongoDB service, plus an admin panel (bookings, hotels, reviews, site images).
Imported from an "emergent"-style template (see `test_result.md`'s testing
protocol comment block — a legacy convention, not currently wired to any agent
here).

## Stack
- **Frontend**: React (Create React App via craco), Tailwind, shadcn/radix UI
  components, react-router — `frontend/`
- **Backend**: Node.js + Express + the native MongoDB driver — `backend/server.js`
  (rewritten from the original FastAPI + Motor service on 2026-07-12; same
  routes, same request/response shapes, no frontend changes needed)
- **Database**: MongoDB (run locally in this dev environment; see below)

## Running locally
Two workflows:
- **Backend API** (console, port 8001): starts a local `mongod` (data dir
  `.data/mongo`) if not already running, then `node server.js` from `backend/`
  (started with `PORT=8001` on the workflow's command line — see note below).
- **Start application** (webview, port 5000): `yarn start` (craco) from
  `frontend/`. The frontend dev server proxies `/api/*` to `http://localhost:8001`
  via the `proxy` field in `frontend/package.json`; `REACT_APP_BACKEND_URL` is
  left empty so `axios` calls go through that proxy.

Required backend env vars: `MONGO_URL`, `DB_NAME`, `ADMIN_PIN` (server refuses
to start if any are missing — no hardcoded fallback PIN). Optional:
`CORS_ORIGINS` (comma-separated allowlist, defaults to `*` in dev / restrictive
in production), `PORT` (default 8001), `NODE_ENV`. See `backend/.env.example`
and `backend/README.md` for the full list — on Replit these are already
provided as shared env vars rather than a `.env` file.

**Note:** the shared `PORT` env var in this Replit environment is `5000`
(claimed by the frontend), so the Backend API workflow explicitly runs with
`PORT=8001` prefixed on its command to avoid a collision — don't remove that
prefix or the backend will try to bind to the frontend's port.

Admin panel PIN is `73921846` in this dev environment (see `ADMIN_PIN` env
var) — no real auth system, just a shared PIN header (`X-Admin-Pin`).

## Contact channels
- WhatsApp: +91 70144 04093 (used for the floating chat button, "Book via
  WhatsApp" CTAs, and the post-booking "Continue on WhatsApp" link, which
  pre-fills the message with the booking reference).
- Email: theranthamborecurator@gmail.com (footer + Contact page).
These are defined once in `frontend/src/lib/api.js`.

## Known quirks
- The mobile nav drawer (`Navbar.jsx`) is rendered via a React portal to
  `document.body`. This is required: the header has `backdrop-blur`, and a
  `backdrop-filter`/`filter`/`transform` on an ancestor creates a new
  containing block for `fixed`-position descendants, which was clipping the
  drawer to the header's own height instead of the full viewport.
- The booking-confirmation screen in `SafariBooking.jsx` must pass
  `transparentOnTop={false}` to `PublicLayout` — otherwise the navbar starts
  transparent (matching the light confirmation background) and looks broken.

## User preferences
None recorded yet.
