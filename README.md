# Datastraw Customer Support CRM

A production-ready support-desk MVP for the Datastraw internship assessment. Agents can file tickets, search and filter the queue, open a full case record, change status, and leave internal notes. Managers get live workload statistics.

**Live application:** served from this repository once the backend is running (frontend is built into `frontend/dist` and hosted by Express).

---

## Overview

Support teams need a single, fast place to capture customer issues and keep a written trail. Datastraw Support Desk is a focused CRM: create a ticket, find it again, update it, and see how the queue is moving.

The app is intentionally small. One REST API, two SQL tables, three screens.

## Features

- Create a ticket with customer name, email, subject and description
- Auto-generated sequential IDs (`TKT-001`, `TKT-002`, …)
- Statuses: **Open**, **In Progress**, **Closed** (default Open)
- Queue table with ID, customer, subject, status, created date and view action
- Live search across ticket ID, name, email, subject and description
- Status filter (All / Open / In Progress / Closed)
- Ticket detail: customer, issue, timestamps, notes
- Status updates and internal notes with timestamps
- Dashboard statistics: total, open, in progress, closed
- Validation and friendly errors (invalid email, missing fields, missing ticket)
- Responsive layout for desktop and mobile
- Sample seed data so the desk is not empty on first launch

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, Helmet, CORS, rate limiting |
| Database | SQLite by default (`better-sqlite3`) · PostgreSQL / Supabase when `DATABASE_URL` is set |
| Deploy | One Node process can serve API + built SPA · or split Vercel + Render |

SQLite is the default so the project runs locally and in a sandbox without a hosted database. The query layer uses `?` placeholders and swaps them to `$1` for Postgres, so switching to Supabase is a connection string, not a rewrite.

## Architecture

```
USER
  ↓
React SPA  (Vite in development, Express static in production)
  ↓ REST  /api/tickets
Express API
  ↓ parameterized SQL
SQLite file   or   Supabase PostgreSQL
```

```
support-crm/
├── frontend/                 React + Vite + Tailwind
│   ├── src/components
│   ├── src/pages
│   └── src/services
├── backend/
│   └── src/
│       ├── controllers
│       ├── routes
│       ├── services
│       ├── middleware
│       └── db
├── README.md
├── .gitignore
├── .env.example
└── LICENSE
```

## Database schema

### `tickets`

| Column | Type | Notes |
| --- | --- | --- |
| id | PK | auto increment |
| ticket_id | unique text | e.g. `TKT-001` |
| customer_name | text | required |
| customer_email | text | required, validated |
| subject | text | required |
| description | text | required |
| status | text | `Open` \| `In Progress` \| `Closed` |
| created_at | timestamp | ISO-8601 |
| updated_at | timestamp | ISO-8601 |

### `notes`

| Column | Type | Notes |
| --- | --- | --- |
| id | PK | auto increment |
| ticket_id | FK / text | parent ticket |
| note_text | text | internal only |
| created_at | timestamp | ISO-8601 |

One ticket has many notes. SQL files live in `backend/src/db/schema.sql` (SQLite) and `backend/src/db/schema.pg.sql` (Supabase / Postgres).

## API documentation

Base path: `/api`

### `GET /api/health`

Service heartbeat.

### `POST /api/tickets`

Create a ticket. Status is always `Open`.

```json
{
  "customer_name": "Rahul Sharma",
  "customer_email": "rahul@gmail.com",
  "subject": "Payment Failed",
  "description": "Payment was deducted but order was not confirmed."
}
```

**201** returns the full ticket (including generated `ticket_id`).

**400** missing required fields or invalid email.

### `GET /api/tickets`

List tickets, newest first.

Query parameters:

- `status` — `Open` | `In Progress` | `Closed`
- `search` — matches ticket ID, customer name, email, subject, description (case-insensitive)

```
GET /api/tickets?status=Open&search=Rahul
```

### `GET /api/tickets/stats`

```json
{ "total": 8, "open": 3, "in_progress": 3, "closed": 2 }
```

### `GET /api/tickets/:ticket_id`

Full ticket plus `notes[]`. **404** if the id does not exist.

### `PUT /api/tickets/:ticket_id`

Update status and/or append a note.

```json
{
  "status": "In Progress",
  "notes": "Escalated to payment team."
}
```

Either field may be omitted. **400** if neither is provided or status is not allowed. **404** if the ticket is missing.

## Local setup

Requires Node.js 18+.

```bash
git clone <your-fork-url> support-crm
cd support-crm

cp .env.example backend/.env
# edit backend/.env if you want Postgres instead of SQLite

npm run install:all
npm run build
npm start
```

Open [http://localhost:5000](http://localhost:5000).

### Split development servers

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:5000`.

### Using Supabase PostgreSQL

1. Create a project at [supabase.com](https://supabase.com).
2. Run `backend/src/db/schema.pg.sql` in the SQL editor (or let the API apply it on boot).
3. Set `DATABASE_URL` in `backend/.env` to the Supabase connection string (use the pooler URL in hosted environments).
4. Restart the API. Leave `DATABASE_URL` empty to stay on SQLite.

## Environment variables

See `.env.example`. Never commit a real `.env`.

| Variable | Where | Purpose |
| --- | --- | --- |
| `PORT` | backend | API port, default `5000` |
| `DATABASE_URL` | backend | Postgres / Supabase URL. Empty = SQLite |
| `SQLITE_PATH` | backend | SQLite file path |
| `FRONTEND_URL` | backend | CORS allow-list. `*` for local, your Vercel origin in production |
| `SEED_SAMPLE_DATA` | backend | Seed demo tickets when the table is empty |
| `VITE_API_URL` | frontend | API base. Use `/api` when Express serves the SPA |

## Deployment

### Option A — single service (Render / Railway)

1. Build command: `npm run install:all && npm run build`
2. Start command: `npm start`
3. Set `PORT` from the host, `FRONTEND_URL` to the public origin, `SEED_SAMPLE_DATA=true`.
4. Optionally set `DATABASE_URL` to Supabase.

The Express server serves `frontend/dist` and the `/api` routes from the same origin.

### Option B — split (Vercel + Render + Supabase)

1. **Supabase:** apply `schema.pg.sql`, copy the connection string.
2. **Render:** deploy `backend/`, start `node src/server.js`, set `DATABASE_URL`, `FRONTEND_URL=https://your-app.vercel.app`.
3. **Vercel:** deploy `frontend/`, set `VITE_API_URL=https://your-api.onrender.com/api`.

Restrict CORS to the Vercel origin. Keep secrets in the host’s env UI, not in git.

## Screenshots

Run the app and capture:

1. Dashboard with statistics, search and filters
2. Create-ticket confirmation showing the generated ID
3. Ticket detail with status change and notes

Place images in a `docs/` folder if you add them to the repo.

## Demo video

Target 3–5 minutes:

| Time | Content |
| --- | --- |
| 0:00–0:30 | Introduction and problem |
| 0:30–1:30 | Dashboard, search, filter, statistics |
| 1:30–2:15 | Create a ticket, show generated ID |
| 2:15–3:00 | Details, status change, add a note, refresh |
| 3:00–3:45 | Architecture (React → Express → SQL) |
| 3:45–4:30 | GitHub walkthrough |
| 4:30–5:00 | Challenge, solution, bonus stats, next steps |

## Future improvements

- Agent authentication and role-based access (agent vs manager)
- Assignment, SLA timers and @mentions in notes
- Email / webhook notifications on status change
- File attachments
- Audit log of every field change
- Pagination and saved views
- Playwright end-to-end tests

## Technical approach

The API is a thin Express layer over a small service that owns SQL. The same service talks to SQLite or Postgres through a tiny adapter so evaluators can run the project without a cloud database, and the candidate can still point it at Supabase for a hosted demo.

The UI is three routes only: queue, create, detail. Search is debounced on the client and executed on the server so results stay consistent with the database.

## Key feature

**Internal notes on a first-class notes table**, not a JSON blob. That keeps a durable, ordered conversation next to the ticket and is what a real support desk actually needs.

## Challenge and solution

Hosting Postgres is friction for a 2–3 day assessment. The dual adapter (SQLite file by default, Postgres when `DATABASE_URL` is present) lets the app be demonstrated immediately and still match the recommended Supabase schema.

## License

MIT. See `LICENSE`.
