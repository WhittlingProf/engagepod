# EngagePod - Handoff Document

## What This Is

LinkedIn Engagement Pod Notifier - alerts your pod members via email when you publish a post so they can engage during the critical first 30-60 minutes.

---

## Current Status: DEPLOYED TO RAILWAY

App is live. Needs a Railway Volume added for database persistence.

### Working Features
- Member registration (name + email)
- Post submission with LinkedIn URL validation
- Email notifications via Resend API (verified domain)
- Live progress counter showing "Sending 1/3..." as emails go out
- Registration redirects to submit page with welcome banner + pre-filled email
- Frontend served by backend in production

### Deployment Info
- **Railway:** Check Railway dashboard for live URL
- **GitHub:** https://github.com/WhittlingProf/engagepod
- **Branch:** master

---

## CRITICAL: Add Railway Volume

**Without a volume, the database resets on every deploy.**

To persist data:
1. Railway dashboard → your service → **Settings** → **Add Volume**
2. Mount path: `/app/backend/data`
3. Redeploy

---

## Tech Stack

- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Email:** Resend API
- **Hosting:** Railway

---

## Environment Variables (set in Railway)

```
RESEND_API_KEY=re_xxxxx
APIFY_TOKEN=apify_api_xxxxx (optional, for LinkedIn URL validation)
```

Note: `PORT`, `NODE_ENV`, and `DATABASE_PATH` are handled automatically.

---

## Email Configuration

- **From:** `EngagePod <hello@send.morebetterclients.com>`
- **Subject:** `Support {Name}'s new LinkedIn post`
- **Domain:** `send.morebetterclients.com` (verified in Resend)
- **Rate limit:** 600ms delay between emails to stay under Resend's 2 req/sec limit
- **Replies forward to:** josh@handcraftedcopy.com (via Cloudflare Email Routing)

---

## File Structure

```
engagepod/
├── package.json              # Root scripts (dev, build, start, postinstall)
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server, serves frontend in production
│   │   ├── db/
│   │   │   ├── database.js   # SQLite setup, creates dir if missing
│   │   │   └── schema.sql    # Members and posts tables
│   │   ├── routes/
│   │   │   ├── members.js    # GET/POST/DELETE /api/members
│   │   │   └── posts.js      # GET/POST/DELETE /api/posts
│   │   └── services/
│   │       ├── email.js      # Resend integration with rate limiting
│   │       └── linkedin.js   # URL validation
│   └── .env                  # Local env (not committed)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx      # Landing page
    │   │   ├── Register.jsx  # Redirects to /submit on success
    │   │   └── Submit.jsx    # Shows progress counter while sending
    │   └── components/
    │       └── Layout.jsx    # Header/footer wrapper
    └── dist/                 # Built frontend (served by backend in prod)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/members | List all members |
| POST | /api/members | Register new member |
| DELETE | /api/members/:id | Remove member |
| GET | /api/posts | List recent posts |
| POST | /api/posts | Submit post & notify members |
| DELETE | /api/posts/:id | Remove post |

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
4. **Progress shown** → "Sending 1/3..." counter ticks up
5. **Done** → shows "Notified X of Y members"
6. **Recipients** get email with link to engage

---

## Design

"Coffee house" aesthetic - warm browns, cream colors, serif typography.

- Espresso: #2C1810 (dark brown)
- Parchment: #F5E6D3 (paper)
- Cream: #FFF8E7 (lightest)
- Amber: #C4A77D (accents)
- Sepia: #704214 (links)

---

## What Was Done This Session

1. Configured Resend email with verified domain `send.morebetterclients.com`
2. Updated subject line to "Support {name}'s new LinkedIn post"
3. Fixed rate limiting - emails send sequentially with 600ms delay
4. Added registration flow redirect to submit page with welcome banner
5. Added live progress counter showing emails being sent
6. Fixed Railway deployment:
   - `postinstall` script installs all workspace dependencies
   - Backend serves frontend static files in production
   - Database code creates `./data/` directory if missing
7. Pushed all changes to GitHub, Railway auto-deploys

---

## Known Issues

- **Apify validation** shows "Forbidden" in logs - posts still work (graceful fallback)
- **No auth** - anyone with the URL can register/post (fine for trusted pods)
- **Volume needed** - add Railway volume before inviting real users

---

## Test Accounts in DB

- Josh (joshua.c.bowen@gmail.com)
- Josh (josh@handcraftedcopy.com)
- Additional test accounts may have been added during testing

---

## Useful Commands

```bash
# Local dev
npm run dev

# List members (local)
curl http://localhost:3001/api/members

# Submit test post (local)
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"email": "joshua.c.bowen@gmail.com", "linkedin_url": "https://linkedin.com/posts/test", "note": "Test"}'
```

---

## External Services

- **Resend:** https://resend.com (email)
- **Railway:** https://railway.app (hosting)
- **Cloudflare:** DNS for morebetterclients.com
- **Apify:** https://apify.com (optional URL validation)
