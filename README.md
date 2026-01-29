# EngagePod

LinkedIn Engagement Pod Notifier - Alert your pod when you post, get support during the critical early-engagement window.

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy the example env file and add your API keys:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:

```
PORT=3001
RESEND_API_KEY=re_your_api_key_here
APIFY_TOKEN=apify_api_your_token_here
DATABASE_PATH=./data/engagepod.db
FRONTEND_URL=http://localhost:5173
```

**Get your API keys:**
- Resend: https://resend.com (100 free emails/day)
- Apify: https://apify.com (optional, for LinkedIn URL validation)

### 3. Run the app

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173).

Open http://localhost:5173 in your browser.

## How It Works

1. **Register** - Pod members sign up with their name and email
2. **Post** - When you publish a LinkedIn post, copy the URL
3. **Submit** - Paste the URL on EngagePod
4. **Notify** - All other pod members receive an email notification
5. **Engage** - Members click through to support your post

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Email**: Resend
- **URL Validation**: Apify (optional)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/members | List all members |
| POST | /api/members | Register a new member |
| GET | /api/posts | List recent posts |
| POST | /api/posts | Submit a post and notify members |

## Deployment

The app is designed to be deployed on Railway:

1. Create a new Railway project
2. Add the repository
3. Set environment variables in Railway dashboard
4. Deploy

For Resend, you'll need to verify a domain or use their testing domain.

## License

MIT
