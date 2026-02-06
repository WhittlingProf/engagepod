# EngagePod - Handoff Document

## What This Is

LinkedIn Engagement Pod Notifier - alerts your pod members via email when you publish a post so they can engage during the critical first 30-60 minutes. Also includes an admin dashboard for managing members and sending broadcast emails.

---

## Current Status: LIVE WITH ~30 MEMBERS

App is deployed, fully configured with persistent storage, admin auth, and Brevo email.

### Working Features
- Member registration (name + email)
- Post submission with LinkedIn URL validation
- Email notifications via Brevo API (verified domain, 300/day free tier)
- Live progress counter showing "Sending 1/3..." as emails go out
- Registration redirects to submit page with welcome banner + pre-filled email
- Admin email notification when new members register
- Frontend served by backend in production
- **Admin dashboard** (password-protected):
  - View all members and posts
  - Delete members (with confirmation)
  - Send broadcast email to all active members
  - Send test email (to admin only) before broadcasting
  - Progress ticker on send button ("Sending 3/30...")

### Deployment Info
- **Live URL:** https://engage.morebetterclients.com
- **GitHub:** https://github.com/WhittlingProf/engagepod
- **Branch:** master
- **Volume:** Configured at `/app/backend/data` (database persists across deploys)

---

## Tech Stack

- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Email:** Brevo API (native fetch, no SDK)
- **Hosting:** Railway

---

## Environment Variables (set in Railway)

```
BREVO_API_KEY=xkeysib-xxxxx
ADMIN_EMAIL=josh@handcraftedcopy.com (receives notifications + test emails)
ADMIN_PASSWORD=xxxxx (required for admin dashboard access)
APIFY_TOKEN=apify_api_xxxxx (optional, for LinkedIn URL validation)
```

Note: `PORT`, `NODE_ENV`, and `DATABASE_PATH` are handled automatically.

---

## Email Configuration

- **Provider:** Brevo (formerly Sendinblue) — 300 emails/day free tier
- **From:** `EngagePod <hello@send.morebetterclients.com>`
- **Subject (post notifications):** `Support {Name}'s new LinkedIn post`
- **Domain:** `send.morebetterclients.com` (verified in Brevo)
- **Rate limit:** 600ms delay between emails to stay under API limits
- **Replies forward to:** josh@handcraftedcopy.com (via Cloudflare Email Routing)

---

## Admin Authentication

The admin dashboard at `/admin` is protected by a password gate:

- **How it works:** Frontend prompts for password, stores in `sessionStorage`, sends via `x-admin-password` header on all admin API calls
- **Backend middleware:** `requireAdmin` in `adminAuth.js` validates the header against `ADMIN_PASSWORD` env var
- **Security features:**
  - Timing-safe password comparison (`crypto.timingSafeEqual`)
  - Rate limiting: 5 failed attempts per IP per minute, then 429 response
  - Auto-cleanup of rate limit records every 5 minutes
  - If `ADMIN_PASSWORD` is not set, all admin routes return 500
- **Protected routes:** `DELETE /api/members/:id`, `PUT /api/members/:id`, all `/api/survey/*` routes

---

## File Structure

```
engagepod/
├── package.json              # Root scripts (dev, build, start, postinstall)
├── HANDOFF.md                # This file
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server, serves frontend in production
│   │   ├── db/
│   │   │   ├── database.js   # SQLite setup, creates dir if missing
│   │   │   └── schema.sql    # Members and posts tables
│   │   ├── middleware/
│   │   │   └── adminAuth.js  # Password gate + rate limiting
│   │   ├── routes/
│   │   │   ├── members.js    # GET/POST/PUT/DELETE /api/members
│   │   │   ├── posts.js      # GET/POST/DELETE /api/posts
│   │   │   └── survey.js     # Broadcast email + test email + verify
│   │   └── services/
│   │       ├── email.js      # Brevo integration (post notifications, broadcast, admin alerts)
│   │       └── linkedin.js   # URL validation
│   └── .env                  # Local env (not committed)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx      # Landing page
    │   │   ├── Register.jsx  # Redirects to /submit on success
    │   │   ├── Submit.jsx    # Shows progress counter while sending
    │   │   └── Admin.jsx     # Password-gated admin dashboard
    │   └── components/
    │       └── Layout.jsx    # Header/footer wrapper
    └── dist/                 # Built frontend (served by backend in prod)
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| GET | /api/members | No | List all active members |
| POST | /api/members | No | Register new member |
| GET | /api/members/:email | No | Look up member by email |
| PUT | /api/members/:id | Admin | Update member |
| DELETE | /api/members/:id | Admin | Remove member + their posts |
| GET | /api/posts | No | List recent posts |
| POST | /api/posts | No | Submit post & notify members |
| DELETE | /api/posts/:id | No | Remove post |
| POST | /api/survey/verify | Admin | Check admin password (login) |
| POST | /api/survey/send | Admin | Send broadcast email to all members |
| POST | /api/survey/test | Admin | Send test email to admin only |

---

## Local Development

```bash
cd engagepod
cp backend/.env.example backend/.env  # Add your API keys
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## User Flow

1. **Register** at /register → enters name + email
2. **Redirects** to /submit with welcome banner + email pre-filled
3. **Submit post** → pastes LinkedIn URL, optional note
4. **Progress shown** → "Sending 1/30..." counter ticks up
5. **Done** → shows "Notified X of Y members"
6. **Recipients** get email with link to engage

### Admin Flow

1. Navigate to /admin → password prompt
2. **View members** — table with name, email, join date, status
3. **Remove member** — click Remove, confirm dialog, deletes member + posts
4. **Send broadcast** — enter subject + message
5. **Send test first** — sends to admin email only for preview
6. **Send to all** — sends to all active members with progress ticker

---

## Design

"Coffee house" aesthetic - warm browns, cream colors, serif typography.

- Espresso: #2C1810 (dark brown)
- Parchment: #F5E6D3 (paper)
- Cream: #FFF8E7 (lightest)
- Amber: #C4A77D (accents)
- Sepia: #704214 (links)

---

## Session History

### Feb 5, 2026

1. **Broadcast email feature** — Added ability to send emails to all members from admin dashboard (subject + message fields)
2. **Delete members** — Added Remove button to member table rows with confirmation dialog
3. **Brevo migration** — Migrated email provider from Resend (100/day) to Brevo (300/day). Rewrote `email.js` to use Brevo HTTP API via native fetch (no SDK). Removed `resend` npm dependency.
4. **Send Test button** — Added `/api/survey/test` endpoint and UI button that sends only to admin email before broadcasting
5. **Admin auth** — Password-gated admin dashboard with `x-admin-password` header, `sessionStorage` on frontend, `requireAdmin` middleware on backend
6. **Security hardening** — Added rate limiting (5 attempts/IP/minute) and `crypto.timingSafeEqual` for password comparison
7. **Timezone fix** — SQLite `CURRENT_TIMESTAMP` stores UTC without Z suffix; fixed by appending 'Z' before JS Date parsing. Added timezone label to displayed dates.
8. **Progress ticker** — Send button shows "Sending 3/30..." with setInterval ticker matching Submit.jsx pattern

### Jan 29, 2026

1. Added admin email notification on new member registration
2. Set up custom domain: `engage.morebetterclients.com`
3. Verified Railway volume is configured and working
4. Linked local project to Railway CLI

### Previous Sessions

1. Configured Resend email with verified domain `send.morebetterclients.com`
2. Updated subject line to "Support {name}'s new LinkedIn post"
3. Fixed rate limiting - emails send sequentially with 600ms delay
4. Added registration flow redirect to submit page with welcome banner
5. Added live progress counter showing emails being sent
6. Fixed Railway deployment (postinstall, static serving, data directory)

---

## Known Issues

- **Apify validation** shows "Forbidden" in logs - posts still work (graceful fallback)
- **GET /api/members and /api/posts are public** — anyone with the URL can list members/posts. Fine for now since no sensitive data is exposed, but could be locked down later.

---

## Useful Commands

```bash
# Local dev
npm run dev

# List members (local)
curl http://localhost:3001/api/members

# Test admin password (local)
curl -X POST http://localhost:3001/api/survey/verify -H "Content-Type: application/json" -H "x-admin-password: YOUR_PASSWORD"

# Send test email (local, admin only)
curl -X POST http://localhost:3001/api/survey/test -H "Content-Type: application/json" -H "x-admin-password: YOUR_PASSWORD" -d "{\"subject\": \"Test\", \"message\": \"Hello\"}"
```

---

## External Services

- **Brevo:** <https://brevo.com> (email, 300/day free tier)
- **Railway:** <https://railway.app> (hosting)
- **Cloudflare:** DNS for morebetterclients.com + email routing
- **Apify:** <https://apify.com> (optional URL validation)
