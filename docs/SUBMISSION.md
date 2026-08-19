# Submission email draft

Fill the four URLs after you deploy and record, then send.

---

**Subject:** Ganesh Customer Support CRM

Hi team,

Please find my Customer Support CRM MVP below.

- **Live application:** `https://YOUR-APP.vercel.app`  
- **GitHub:** `https://github.com/YOUR-USER/support-crm`  
- **Demo video:** `https://…`  
- **LinkedIn:** `https://www.linkedin.com/in/YOUR-PROFILE`

### Technical approach

React + Vite + Tailwind for the desk, Express REST for tickets/notes, and SQL with a small adapter: SQLite for local/demo and PostgreSQL when `DATABASE_URL` points at Supabase. Search and status filters run on the server. Notes live in their own table so a ticket can have a real history.

### Key feature

Internal notes as a first-class `notes` table (ticket_id, text, timestamp), not a JSON blob — so every update stays ordered and durable.

### Challenge and solution

A hosted Postgres project is extra friction for a 2–3 day assessment. The same service layer uses parameterized queries against SQLite by default and against Supabase when `DATABASE_URL` is set, so the app can be demoed immediately and still matches the PRD schema.

### Future improvements

Agent login and roles, assignment + SLAs, email on status change, attachments, audit log, pagination.

Thank you,  
YOUR NAME
