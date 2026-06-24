# Deploying CraftCV (GitHub + Vercel)

## 1) Push this project to GitHub

1. Create a new empty GitHub repository.
2. In this project root, run:

```bash
git init
git add .
git commit -m "Initial commit: CraftCV"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Notes:
- Secret files are ignored by [/.gitignore](.gitignore), including [backend/.env](backend/.env).
- Example env files are provided: [backend/.env.example](backend/.env.example), [webapp/.env.example](webapp/.env.example).

## 2) Deploy backend (required before frontend)

This app frontend calls backend APIs. Deploy backend first so frontend has a live API URL.

Recommended platforms: Railway, Render, Fly.io, or another Bun/Node host.

Backend required env vars:
- `SUPABASE_DATABASE_URL`
- `BACKEND_URL` (your deployed backend URL)
- `BETTER_AUTH_SECRET`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`

After deploy, verify:
- `https://<backend-domain>/health` returns `{"status":"ok"}`

## 3) Deploy frontend to Vercel

1. In Vercel, import your GitHub repository.
2. Set **Root Directory** to `webapp`.
3. Framework preset: `Vite`.
4. Build command: `npm run build` (or `bun run build` if preferred)
5. Output directory: `dist`
6. Add env var in Vercel project:
   - `VITE_BACKEND_URL=https://<your-backend-domain>`
7. Deploy.

## 4) Make auth work on Vercel domain

Already handled in code:
- Better Auth trusted origins include `https://*.vercel.app`
- Backend CORS allows `https://*.vercel.app`

Files:
- [backend/src/auth.ts](backend/src/auth.ts)
- [backend/src/index.ts](backend/src/index.ts)

## 5) Final checks

- Open your Vercel URL.
- Register a user.
- Create a resume.
- Refresh and re-login to confirm progress persists.

## Security

You shared a DB password in chat. Rotate it in Supabase now, then update [backend/.env](backend/.env) with the new value.
