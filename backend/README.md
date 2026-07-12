# Ranthambore Safari Curator — Backend

Express + native MongoDB driver API for the Ranthambore Safari Curator booking
site. Rewritten from the original Python (FastAPI + Motor) service with the
exact same routes and request/response shapes, so the React frontend in
`frontend/` works against it unchanged.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URL` | Yes | — | MongoDB connection string. Server refuses to start if unset. |
| `DB_NAME` | Yes | — | MongoDB database name. Server refuses to start if unset. |
| `ADMIN_PIN` | Yes | — | PIN required in the `X-Admin-Pin` header (or request body for `/api/admin/login`) to access any `/api/admin/*` route. Server refuses to start if unset — there is no default/fallback PIN. |
| `CORS_ORIGINS` | No | `*` in development, restrictive (no origins) in production | Comma-separated list of allowed origins, e.g. `https://example.com,https://www.example.com`. |
| `PORT` | No | `8001` | Port the Express server listens on. |
| `NODE_ENV` | No | `development` | Set to `production` on your production host to enable the stricter CORS default. |

Copy `.env.example` to `.env` and fill in real values for local development
outside of Replit. `.env` is git-ignored.

## Running locally

```bash
npm install
npm start
```

This starts the Express server on `PORT` (default `8001`). It expects a
MongoDB instance reachable at `MONGO_URL`.

## Deploying (e.g. Hostinger Node.js App hosting)

- Entry file: `server.js` (also set as the `main` field and `start` script in
  `package.json`).
- Set `MONGO_URL`, `DB_NAME`, `ADMIN_PIN`, and `CORS_ORIGINS` (a real
  allowlist, not `*`) as environment variables in the hosting platform's
  dashboard — do not commit a `.env` file with real credentials.
- Set `NODE_ENV=production`.

## API surface

All routes are prefixed with `/api`.

- `POST /api/bookings` — create a booking
- `GET /api/admin/bookings` — list bookings (admin)
- `PATCH /api/admin/bookings/:ref/status` — update booking status (admin)
- `POST /api/inquiries` — create an inquiry
- `GET /api/admin/inquiries` — list inquiries (admin)
- `POST /api/admin/login` — admin login (pin in body)
- `GET /api/admin/stats` — dashboard stats (admin)
- `GET /api/admin/live-feed` — recent activity feed (admin)
- `GET /api/reviews` — public reviews list
- `GET /api/admin/reviews`, `POST /api/admin/reviews`, `PATCH /api/admin/reviews/:id`, `DELETE /api/admin/reviews/:id` (admin)
- `GET /api/hotels`, `GET/POST/PATCH/DELETE /api/admin/hotels[/:id]` (admin for mutations)
- `GET /api/images`, `PUT /api/admin/images/:key`, `DELETE /api/admin/images/:key` (admin for mutations) — images are base64 data URLs stored directly in MongoDB

Admin routes are protected by the `requireAdmin` middleware, which checks the
`X-Admin-Pin` header against `ADMIN_PIN`. Request bodies for `POST`/`PATCH`
routes are validated with [zod](https://zod.dev), mirroring the field
requirements the previous Pydantic models enforced.
