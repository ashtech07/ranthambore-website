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
- **Backend**: FastAPI + Motor (async MongoDB driver) — `backend/server.py`
- **Database**: MongoDB (run locally in this dev environment; see below)

## Running locally
Two workflows:
- **Backend API** (console, port 8001): starts a local `mongod` (data dir
  `.data/mongo`) if not already running, then `uvicorn server:app --reload`
  from `backend/`.
- **Start application** (webview, port 5000): `yarn start` (craco) from
  `frontend/`. The frontend dev server proxies `/api/*` to `http://localhost:8001`
  via the `proxy` field in `frontend/package.json`; `REACT_APP_BACKEND_URL` is
  left empty so `axios` calls go through that proxy.

Config (Mongo URL/DB name, CORS origins, admin PIN, frontend backend-URL/host
settings) lives in **Replit env vars** (shared environment) rather than
`.env` files, since this environment forbids writing `.env` files directly.

Admin panel PIN defaults to `73921846` (see `ADMIN_PIN` env var) — no real
auth system, just a shared PIN header.

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
