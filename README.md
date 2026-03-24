# ApplyTrack

A job-application tracker: log roles, pipeline status, notes, and metadata in one place. The repo is a **small monorepo** — **React web app**, **Express + PostgreSQL API**, and an optional **Chrome extension** that can capture applications from common job boards.

---

## What’s in this repo

| Part | Path | Role |
|------|------|------|
| **Web app** | repo root (`src/`) | Dashboard, Kanban, Analytics, add/edit flows, detail drawer |
| **API** | `backend/` | REST API, CSV export, persistence in Postgres |
| **Extension** | `extension/` | MV3 extension: scrape supported sites → `POST /api/applications` |
| **Docs** | `docs/` | Design system, specs (Gmail, Chrome), PM/engineering notes |

---

## Features (current)

### Web (`src/`)

- **Dashboard** — Application list, stats bar, search/filter/sort, **Export CSV** (via API).
- **Kanban** — Drag-and-drop columns (`@dnd-kit`), status updates persisted through the API.
- **Analytics** — Charts (`recharts`) from the same application data.
- **Application detail drawer** — Reads **events** and **tags** for an application from the API; can append timeline events.
- **Forms** — Add/edit with validation (e.g. required company/role), extra fields (salary, location, job URL, company size, follow-up, resume version).
- **Routing** — `react-router-dom`: `/`, `/kanban`, `/analytics`.
- **Auth** — `src/components/auth/*` is a **stub** (Clerk commented out); the app does not enforce sign-in in `App.jsx` today.

### Backend (`backend/`)

- **Express 5** + **CORS** + **pg** (connection pool via `DATABASE_URL`).
- **Applications** — CRUD, `GET /api/applications/export/csv`.
- **Per-application** — `GET/POST /api/applications/:applicationId/events`.
- **Tags** — `GET/POST /api/tags`, link apps via `applications` ↔ tags routes (see `routes/applications.js`).
- **Health** — `GET /api/health/db` for DB connectivity.

SQL migrations live in `backend/migrations/` (run in order: `001` → `004`).

### Extension (`extension/`)

- TypeScript + esbuild; loads **unpacked** from the `extension/` folder after `pnpm run build`.
- Prompts on supported hosts (LinkedIn, Indeed, Greenhouse, Lever, Workday, Wellfound, etc.) to save scraped fields to your API.
- See **[extension/README.md](./extension/README.md)** for load steps and URLs.

---

## Tech stack

| Area | Choice |
|------|--------|
| **UI** | React 19, Vite 7, Tailwind CSS 3.4, shadcn-style Radix UI |
| **Routing** | react-router-dom 7 |
| **Kanban** | @dnd-kit |
| **Charts** | recharts |
| **API** | Express 5, `pg`, dotenv, cors |
| **DB** | PostgreSQL |
| **Extension** | TypeScript, esbuild, Chrome MV3 |

Package manager: **pnpm** (root and `extension/`; backend uses npm lockfile as checked in).

---

## Prerequisites

- **Node.js** (LTS recommended)
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** and a database URL for the API

---

## Run locally

### 1. Database

Create a database, then apply migrations (from `backend/`), e.g.:

```bash
cd backend
psql "$DATABASE_URL" -f migrations/001_create_applications.sql
psql "$DATABASE_URL" -f migrations/002_add_application_fields.sql
psql "$DATABASE_URL" -f migrations/003_create_events.sql
psql "$DATABASE_URL" -f migrations/004_create_tags.sql
```

### 2. API

```bash
cd backend
npm install
npm start
# http://localhost:3001 — try GET /api/health/db
```

### 3. Web app

```bash
# repo root
pnpm install
pnpm dev
# http://localhost:5173 (typical Vite port)
```

### 4. Extension (optional)

```bash
cd extension
pnpm install
pnpm run build
```

Load unpacked in Chrome from the `extension/` directory; set API URL and dashboard URL in the popup (see extension README).

---

## Deploying the web app (Vercel)

The SPA uses client routes (`/`, `/kanban`, `/analytics`). **`vercel.json`** at the repo root rewrites unknown paths to `index.html` so refreshes and deep links don’t return Vercel’s `404 NOT_FOUND`.

**Vercel project settings**

- **Root directory:** repository root (where `vite.config.js` and `package.json` live).
- **Environment variables (Production):** `VITE_API_BASE=https://your-render-api.onrender.com` — required at **build** time so the bundle calls the live API.

After changing env vars, trigger a **redeploy** so Vite picks them up.

---

## Scripts

**Root (Vite app)**

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | ESLint |

**Backend**

| Command | Description |
|---------|-------------|
| `npm start` | Run `server.js` |

**Extension**

| Command | Description |
|---------|-------------|
| `pnpm run build` | Typecheck + bundle to `dist/` |
| `pnpm run dev` | Watch build |

---

## Project structure (high level)

```
applytrack/
├── src/
│   ├── App.jsx                 # API client, routes, global drawer
│   ├── main.jsx
│   ├── pages/                  # Dashboard, KanbanBoard, Analytics
│   ├── components/             # Header, forms, cards, FilterBar, StatusBar, Kanban*, drawer, ui/
│   ├── components/auth/        # Stub auth (not wired in App)
│   ├── types/application.js    # Status enum + helpers
│   └── lib/                    # utils, compose-refs
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── routes/                 # applications, events, tags
│   ├── store/                  # DB access layer
│   └── migrations/
├── extension/
│   ├── src/                    # TypeScript sources
│   ├── dist/                   # Built bundles (after build)
│   ├── manifest.json
│   └── build.mjs
├── docs/                       # Design, specs, PM/engineering docs
├── package.json                # Web app
├── vite.config.js
└── eslint.config.js
```

**Data flow:** The SPA loads and mutates applications through `fetch` to `VITE_API_BASE`. The extension POSTs new rows to the same API. Auth is not required by the server in the current code.

---

## Documentation

- **[docs/README.md](./docs/README.md)** — Index of design guide, code style, Gmail/Chrome specs, and engineer/PM notes.
- **[docs/design-guide.md](./docs/design-guide.md)** — Colors, typography, spacing, Paper artboard names.
- **[docs/code-style.md](./docs/code-style.md)** — Conventions (e.g. file size targets).

---

## Code style

Aim for small, focused files; details in **[docs/code-style.md](./docs/code-style.md)**.

---

## Roadmap / specs (docs only)

Product and integration specs (not necessarily implemented in code yet):

- **[docs/gmail-integration.md](./docs/gmail-integration.md)**
- **[docs/chrome-extension.md](./docs/chrome-extension.md)** (broader product spec; `extension/` is the current implementation)

---

## Positioning (portfolio / interviews)

- **What** — Full-stack style tracker: SPA + REST API + Postgres + optional browser capture.
- **How** — Clear separation of UI, API, and migrations; Kanban and analytics on shared data; extension as a second client.
- **Why** — Good for discussing API design, migrations, CORS, env-based config, and how you’d add real auth (Clerk or other) on top of the existing stub.

---

*If the README and behavior drift, prefer the code in `src/`, `backend/`, and `extension/` as source of truth.*
