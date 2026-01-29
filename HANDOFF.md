# EngagePod - Handoff Document

## What This Is

A LinkedIn engagement pod notifier. When someone in the pod publishes a LinkedIn post, they submit the URL here and everyone else gets an email notification so they can engage quickly (the first 30-60 minutes matter most for LinkedIn's algorithm).

## Current State

**Working:**
- Backend API (Express + SQLite)
- Member registration
- Post submission
- Email notifications via Resend
- LinkedIn URL validation (basic format check, Apify integration exists but needs token)
- Admin endpoints (list/delete/update members and posts)
- GitHub repo: https://github.com/WhittlingProf/engagepod

**In Progress:**
- Frontend design - coffee house aesthetic implemented but **header/navbar visibility is broken**. The Tailwind classes aren't applying correctly. Last attempt used inline styles but still needs verification.

**Not Done:**
- Railway deployment (was having issues connecting to GitHub)
- Resend domain verification (currently using `onboarding@resend.dev` test address)

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: React + Vite + Tailwind CSS
- **Email**: Resend
- **URL Validation**: Apify (optional)

## Project Structure

```
engagepod/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server
│   │   ├── routes/
│   │   │   ├── members.js        # CRUD for members
│   │   │   └── posts.js          # Post submission + notifications
│   │   ├── services/
│   │   │   ├── email.js          # Resend integration
│   │   │   └── linkedin.js       # URL validation
│   │   └── db/
│   │       ├── database.js       # SQLite connection
│   │       └── schema.sql        # Tables schema
│   ├── data/                     # SQLite database lives here
│   ├── .env                      # API keys (gitignored)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css             # Custom CSS + Tailwind
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Submit.jsx
│   │   └── components/
│   │       └── Layout.jsx        # Header/nav/footer
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Running Locally

```bash
cd engagepod
npm run dev
```

This starts both backend (port 3001) and frontend (port 5173).

Frontend: http://localhost:5173
Backend API: http://localhost:3001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/members | List all members |
| POST | /api/members | Register member (name, email) |
| DELETE | /api/members/:id | Delete member (cascades to posts) |
| PUT | /api/members/:id | Update member |
| GET | /api/posts | List recent posts |
| POST | /api/posts | Submit post (email, linkedin_url, note) |
| DELETE | /api/posts/:id | Delete post |

## Environment Variables

Located in `backend/.env` (see `.env.example` for template):

```
PORT=3001
RESEND_API_KEY=<your-resend-api-key>
APIFY_TOKEN=<your-apify-token>
DATABASE_PATH=./data/engagepod.db
FRONTEND_URL=http://localhost:5173
```

**Note:** Real API keys are in the local `.env` file (gitignored). Ask Josh for the keys.

## Current Members in DB

Check with: `curl http://localhost:3001/api/members`

User registered:
- Josh (joshua.c.bowen@gmail.com)
- Josh2 (josh@handcraftedcopy.com)

## Known Issues

### 1. Header Not Visible (PRIORITY)
The navbar/header is dark and hard to see. Tailwind classes like `bg-cream` aren't applying. Last attempt used inline styles in `Layout.jsx` but needs to be verified/fixed.

The header SHOULD be:
- Light cream background (#FFF8E7)
- Dark text (#2C1810)
- Visible bordered buttons

### 2. Resend Domain
Currently using `onboarding@resend.dev` (Resend's test address). For production, need to:
1. Verify a domain at https://resend.com/domains
2. Update `backend/src/services/email.js` line 31 with verified domain

### 3. Apify Token
The Apify token is set but getting "Forbidden" errors. May need to check the actor being used or subscription status.

## Design Direction

"Coffee house" aesthetic - warm browns, cream colors, serif typography (Playfair Display + Crimson Text). Think 17th century merchant guild but with modern, direct copy (not overly old-timey language).

Color palette:
- Espresso: #2C1810 (dark brown, main background)
- Parchment: #F5E6D3 (paper color)
- Cream: #FFF8E7 (lightest, for header)
- Amber: #C4A77D (accents, borders)
- Sepia: #704214 (text accents)

## Next Steps

1. **Fix the header** - make it visually distinct and usable
2. **Test email flow** - verify emails send correctly with Resend test domain
3. **Deploy to Railway** when GitHub connection works
4. **Verify Resend domain** for production emails
5. **Commit the latest changes** to GitHub

## Useful Commands

```bash
# List members
curl http://localhost:3001/api/members

# Delete a member
curl -X DELETE http://localhost:3001/api/members/{id}

# Test post submission
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"email": "joshua.c.bowen@gmail.com", "linkedin_url": "https://linkedin.com/posts/example", "note": "Test"}'
```
