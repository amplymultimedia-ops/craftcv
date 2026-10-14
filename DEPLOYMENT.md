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

The repository includes a Render Blueprint (`render.yaml`) pinned to `release-candidate-local-ai` and a Docker build for the Bun backend. The container generates both Prisma clients in Linux and does not run a schema push at startup.

1. In Render, create a Blueprint Instance from this repository and select `render.yaml`.
2. Set the prompted secrets: `SUPABASE_DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` using a sender verified by Resend.
3. Render generates a new `BETTER_AUTH_SECRET`. Do not copy the short legacy secret from local environment files.
4. After the service is created, copy its public HTTPS URL into the `BACKEND_URL` environment variable and redeploy.
5. Verify `/health` returns `{"status":"ok"}` before deploying the frontend.

Do not run `backend/scripts/start` in production: it runs `prisma db push --accept-data-loss`. The Render image generates clients only and does not mutate the production schema.

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
   - Set it on the public `craftcv` Vercel project, not the separate protected `webapp` project.
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
