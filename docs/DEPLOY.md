# Deploy: Vercel + Supabase + Render / Railway

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → run `supabase/schema.sql`.
3. Project Settings → Database → copy the **URI** (pooler, port 6543).
4. Use that as `DATABASE_URL` on the host.

RLS is on. The Express API connects with the database URI, not the anon key.

## 2. Vercel (frontend + API, one origin)

1. Import the GitHub repo.
2. `vercel.json` already sets install / build / output / rewrites.
3. Environment:
   - `DATABASE_URL` = Supabase URI
   - `SEED_SAMPLE_DATA` = `true`
   - `WRITE_KEY` = optional secret
   - `FRONTEND_URL` = `https://your-app.vercel.app` (optional on same origin)
4. Deploy.

Without `DATABASE_URL`, Vercel uses a JSON store in `/tmp` (resets on cold start).

## 3. Render

1. New Web Service from the repo.
2. Or use `render.yaml`.
3. Build: `npm run install:all && npm run build`
4. Start: `npm start`
5. Env: `NODE_ENV=production`, `DATABASE_URL`, `FRONTEND_URL=https://your-service.onrender.com`, optional `WRITE_KEY`.

## 4. Railway

1. New project from GitHub.
2. `railway.toml` supplies build/start/healthcheck.
3. Variables: `DATABASE_URL`, `FRONTEND_URL`, optional `WRITE_KEY`.

## Split deploy (Vercel UI + Render API)

1. Render/Railway: backend only, `FRONTEND_URL=https://your-app.vercel.app`.
2. Vercel: `frontend/` root, `VITE_API_URL=https://your-api.onrender.com/api`.
