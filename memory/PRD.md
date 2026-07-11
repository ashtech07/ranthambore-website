# Ranthambore's Curator — PRD

## Original Problem Statement
Build a high-end safari booking website "Ranthambore's Curator" with tagline "Trusted Booking Partner" for Ranthambore National Park. Wildlife-magazine aesthetic (amber #C8860A + forest green #1A2B1F, Playfair Display + DM Sans). Public pages: Home, Safari Booking (multi-step + Tatkal), Hotels (filterable + modal), Packages (5 + custom builder), Contact (form + map + FAQ). Private admin (PIN-gated): Overview stats, Bookings table, Inquiries table, Live Feed. Disclaimer ticker on every public page, floating WhatsApp button, mobile bottom-nav, blinking red Tatkal CTA. All bookings/inquiries saved to MongoDB and surfaced in admin. No payments on site.

## Architecture
- **Backend**: FastAPI + Motor (Mongo). Single file `/app/backend/server.py`. Endpoints under `/api/*`. Admin endpoints gated by `X-Admin-Pin` header verified against `ADMIN_PIN` env var.
- **Frontend**: React + Tailwind + shadcn/ui. Router with public pages + nested admin routes (PIN guarded). Session token in `sessionStorage`. Auto-refreshing admin views (30s, live-feed 7s).
- **Build fix**: Patched `craco.config.js` to strip deprecated webpack-dev-server v4 keys (`onBeforeSetupMiddleware`, `onAfterSetupMiddleware`, `https`) for v5 compatibility.

## User Personas
1. **Indian / foreign safari visitor** — browses, picks date/zone/vehicle, submits booking, gets WhatsApp confirmation.
2. **Last-minute traveller** — uses Tatkal flow to grab same-day seat.
3. **Site owner/admin** — logs in with PIN, reviews bookings & inquiries, confirms/cancels, watches live feed.

## What's been implemented (Dec 2025)
- 5 public pages with disclaimer ticker, sticky/scroll-reactive navbar, mobile drawer + bottom nav, floating WhatsApp, free-callback widget.
- Home: hero with amber overlay, alerts ticker, pricing table, 4 service cards, 10-zone gallery, How-It-Works, blinking Tatkal CTA, 6 attractions, 12-Q FAQ accordion (with FAQPage schema), 6 testimonials.
- Safari Booking: 3-step flow (color-coded calendar, shift toggle → vehicle/zone/nationality/guests/add-ons → visitor details), sticky price panel, post-submit success screen with reference `RTC-2026-XXXXX`, dedicated Tatkal section with blinking red submit + WhatsApp deep-link, collapsible seasonal timings.
- Hotels: 10 cards, category tabs, pool/breakfast filters, combo banner, enquiry modal with dialog.
- Packages: 5 packages + "Build Your Own" form.
- Contact: 5 info cards + Google Maps iframe (public embed, no key) + contact form + FAQ.
- Admin: PIN login with client-side 3-strike 10-min lockout, sidebar layout with auto-logout after 2h idle, overview with 7 stat cards + recent tables, bookings management with status actions, inquiries list with filters/search, live feed.
- SEO: per-page title/description (set via useEffect), keyword meta, OG tags, TouristAttraction + LocalBusiness + FAQPage schema, robots.txt (blocks /admin), sitemap.xml.

## Prioritised Backlog
**P1**
- Real WhatsApp number, phone, email, office address (owner-provided values).
- Real Unsplash images replaced by owner photos in `/app/frontend/src/lib/content.js`.
- Optional Google reCAPTCHA v3 on public forms.
- Bookings export to CSV / Excel from admin.

**P2**
- Booking email/SMS notifications via Resend/Twilio.
- Stripe/Razorpay deposit option (currently no payments).
- True real-time live feed via WebSockets (currently polled every 7s).
- Owner-uploadable image manager (S3) to replace static URLs in content.js.
- Server-side rate limiting on public forms (currently relies on infra/Cloudflare).

## Admin Credentials
See `/app/memory/test_credentials.md`. PIN: `73921846`. Endpoint: `/admin`.
