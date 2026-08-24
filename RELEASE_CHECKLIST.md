# Release Checklist

Use this checklist for bigger changes when it is safe to update production.

## 1. Local Validation

- Run backend checks (typecheck + startup health).
- Run frontend checks (build + critical UI flow).
- Verify API contracts and auth behavior locally.
- Confirm no obvious console or network errors.

## 2. Deploy Order (Low Friction)

- Deploy backend first if APIs, auth, database, or shared contracts changed.
- Deploy frontend second (Vercel) after backend health is confirmed.
- Use existing linked projects and existing deployment targets.

## 3. Live Smoke Tests (Required)

- Health check works on backend live URL.
- Auth works from production frontend domain:
  - Register
  - Login
  - Session persists after refresh
- One critical end-to-end flow works (create/edit/save/export).
- No blocking browser console or failed network requests.

## 4. Data and Platform Checks

- Confirm database writes/reads succeed for changed features.
- Confirm env vars required by the change are set in live environments.
- Confirm CORS and trusted origins for production domain(s).

## 5. Done Gate

A release is done only when live smoke tests pass.

If any test fails:

- Fix the issue.
- Redeploy the affected service(s).
- Re-run this checklist until stable.

## 6. Preferred Tooling Targets

- Source control: GitHub
- Frontend: Vercel
- Backend: current production host (for example Railway/Render/Fly)
- Database/Auth persistence: Supabase/Postgres when configured

Keep this process simple: validate locally, deploy in order, verify live, then close.
