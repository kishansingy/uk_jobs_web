# UK Medical Jobs — Admin Web Panel

Vue 3 + Vite + Tailwind CSS admin dashboard for managing the UK Medical Jobs platform.

## Stack
- Vue 3 (Composition API)
- Vite 5
- Pinia (state)
- Vue Router 4
- Tailwind CSS 3 (NHS colour palette)
- Chart.js (reports)
- Axios (API)

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 — login with an admin account.

## Build for production

```bash
npm run build
# Output in dist/
```

## Features

| Page | Description |
|------|-------------|
| Dashboard | Live stats + profession/application charts |
| Users | Search, filter, view details, activate/deactivate |
| Jobs | Browse all jobs, reclassify, delete |
| Job Sources | Add/edit RSS/API/scraper sources, trigger imports |
| Videos | Add/edit/publish career guidance videos |
| Plans | View Free / Pro / Premium feature breakdown |
| Broadcasts | Send push notifications to user segments |
| Reports | Revenue, profession, application charts + CSV export |

## Auth
Admin-only. Uses Laravel Sanctum Bearer tokens. Non-admin users are blocked at login.
