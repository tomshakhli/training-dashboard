# Training Dashboard

A live training dashboard that pulls data from [Intervals.icu](https://intervals.icu). Dark mode, data-dense, designed for runners.

## What it shows

- **Fitness / Fatigue / Form** (PMC chart) — 30, 60, or 90 day view
- **Weekly running mileage** — current week vs target, plus 12-week trend
- **Weekly training load** — stacked by session type (easy, quality, race, ride)
- **Wellness trends** — resting HR, sleep hours, sleep score with sparklines
- **Recent sessions** — colour-coded by type with pace, HR, and load
- **Upcoming workouts** — planned events from the Intervals.icu calendar

## Architecture

```
Browser (GitHub Pages)  →  Cloudflare Worker (CORS proxy)  →  Intervals.icu API
```

The Intervals.icu API doesn't set CORS headers, so browser requests are blocked. A lightweight Cloudflare Worker (free tier) forwards requests and adds the necessary headers.

**No API keys stored in code.** The user enters their credentials at runtime. Keys are stored in sessionStorage (cleared on tab close) or optionally localStorage.

## Setup

### 1. Deploy the CORS proxy

1. Go to [Cloudflare Workers](https://dash.cloudflare.com) → Workers & Pages → Create Worker
2. Paste the contents of `cloudflare-worker.js`
3. Update `ALLOWED_ORIGINS` with your GitHub Pages URL (e.g. `https://yourusername.github.io`)
4. Deploy. Note your worker URL (e.g. `https://intervals-proxy.your-subdomain.workers.dev`)

### 2. Configure the dashboard

1. Open `index.html`
2. Find `const PROXY_BASE = ...` near the top of the `<script>` section
3. Replace with your Cloudflare Worker URL
4. Update `RACES` array with your race dates if desired

### 3. Deploy to GitHub Pages

```bash
git clone https://github.com/YOUR_USERNAME/fitness-dashboard.git
cd fitness-dashboard
# Copy index.html and cloudflare-worker.js into the repo
git add .
git commit -m "Initial dashboard"
git push
```

Then in GitHub repo Settings → Pages → Source: deploy from `main` branch, root directory.

Your dashboard will be at `https://YOUR_USERNAME.github.io/fitness-dashboard/`

### 4. Get your Intervals.icu credentials

1. Go to [intervals.icu/settings](https://intervals.icu/settings)
2. Scroll to "Developer Settings"
3. Generate an API key
4. Your Athlete ID is shown at the top of settings (e.g. `i344297`)

## Tech stack

- Single HTML file, no build step
- Chart.js for all charts
- Cloudflare Worker for CORS proxy (free tier, ~80 lines)
- GitHub Pages for hosting (free)

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire dashboard — login, data fetching, rendering |
| `cloudflare-worker.js` | CORS proxy for Cloudflare Workers |
| `README.md` | This file |

## Multi-user

The architecture supports multiple users without code changes. Anyone can visit the URL and log in with their own Intervals.icu credentials. A coach could use it with multiple athletes by switching credentials.

## API endpoints used

- `GET /api/v1/athlete/{id}` — profile
- `GET /api/v1/athlete/{id}/wellness?oldest=...&newest=...` — wellness data
- `GET /api/v1/athlete/{id}/activities?oldest=...&newest=...` — activities
- `GET /api/v1/athlete/{id}/events?oldest=...&newest=...` — planned events
