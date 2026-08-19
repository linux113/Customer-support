# Submission cover letter — Ganesh Customer Support CRM

**Subject:** Submission — Ganesh Customer Support CRM (full-stack MVP)

---

Hello,

Please find my Customer Support CRM MVP. It is a production-shaped desk for support agents and managers: create tickets, search and filter the queue, open a case, change status, add internal notes, and see workload statistics.

This build is a **React + Vite + Express + SQL** web app (not Google Apps Script). The PRD asked for that stack. Configs are included for **Vercel**, **Render**, **Railway**, and **Supabase**.

---

### Technical approach and architectural decisions

I kept the surface small: **three screens** (queue, create, details) and **four REST endpoints** plus stats and health.

- **Frontend:** React 18, Vite, Tailwind, React Router, Axios. Search is debounced on the client and executed on the server so results match the database.
- **Backend:** Express with validation, Helmet, CORS, and separate read/write rate limits. Controllers stay thin; a ticket service owns persistence.
- **Data:** Two tables — `tickets` and `notes` (one-to-many). Notes are rows, not a JSON blob, so history stays ordered.
- **IDs:** Sequential `TKT-001` style ids generated on the server, default status **Open**, `created_at` / `updated_at` on every write.
- **Database adapter:** Parameterized queries (`?` → `$1` on Postgres). Local default is SQLite/JSON so the app runs without cloud keys. Set `DATABASE_URL` for Supabase PostgreSQL. Status has a CHECK constraint; RLS is enabled in `supabase/schema.sql`.
- **Security:** Input length caps, email and status allow-lists, ticket-id format `TKT-\d{1,8}`, optional `WRITE_KEY` for POST/PUT, no stack traces on 500s, secrets only in env.
- **Deploy:** Same-origin on Vercel (`/api` serverless + static SPA), or one Node process on Render/Railway serving `frontend/dist`.

I avoided extra auth, websockets, and microservices. The PRD listed auth as optional; I favoured a working, explainable MVP.

---

### What I am most proud of

1. **Notes as a first-class table** — every comment has a timestamp and survives refresh.
2. **Search and filters on the server** — ID, name, email, subject, description, plus Open / In Progress / Closed.
3. **Dashboard statistics** — total, open, in progress, closed for managers (bonus in the PRD).
4. **Honest errors** — invalid email, missing fields, and unknown tickets return 400/404 with a clear UI message.
5. **One mental model** — the same API contract locally, on Vercel, and against Supabase.

---

### Challenges and how I solved them

- **No hosted Postgres in a 2–3 day sandbox.** I built a small store adapter (SQLite locally, JSON on Vercel `/tmp`, Postgres when `DATABASE_URL` is set) so the demo never blocked on cloud signup.
- **Native SQLite on serverless.** `better-sqlite3` does not belong on Vercel; the API falls back to a JSON store and reseeds sample tickets.
- **Temporary Vercel deploys expire.** Permanent hosting needs a claimed Vercel project (or Render/Railway) plus GitHub. Config files are already in the repo (`vercel.json`, `render.yaml`, `railway.toml`).
- **Security without drowning the MVP.** I added validation, rate limits, optional write keys, and RLS rather than a full login system the PRD did not require.

---

### Improvements with more time

- Agent login and roles (agent vs manager)
- Assignment, SLAs, and email on status change
- Attachments and a field-level audit log
- Pagination and saved views
- Playwright end-to-end tests
- A durable Supabase project on the production URL so data never resets

---

### Links

| Item | URL |
| --- | --- |
| **Live application** | https://temporary-nimble-coral-pc3jycp.vercel.app |
| **GitHub (complete source)** | `https://github.com/YOUR-USER/support-crm` |
| **Demo video (optional)** | `PASTE_IF_RECORDED` |
| **LinkedIn** | `https://www.linkedin.com/in/YOUR-PROFILE` |

This assignment is a **web CRM**, not a Google Apps Script app. There is no Apps Script URL. The public app is the Vercel / Render / Railway deployment above.

---

Thank you for your time. I can walk through ticket-id generation, the search SQL, the notes model, and the SQLite/Supabase adapter in an interview.

Best regards,  
**YOUR NAME**
