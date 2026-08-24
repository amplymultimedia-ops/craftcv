<stack>
  Bun runtime, Hono web framework, Zod validation.
</stack>

<structure>
  src/index.ts     — App entry, middleware, route mounting
  src/routes/      — Route modules (create as needed)
</structure>

<routes>
  Create routes in src/routes/ and mount them in src/index.ts.

  Example route file (src/routes/todos.ts):
  ```typescript
  import { Hono } from "hono";
  import { zValidator } from "@hono/zod-validator";
  import { z } from "zod";

  const todosRouter = new Hono();

  todosRouter.get("/", (c) => {
    return c.json({ todos: [] });
  });

  todosRouter.post(
    "/",
    zValidator("json", z.object({ title: z.string() })),
    (c) => {
      const { title } = c.req.valid("json");
      return c.json({ todo: { id: "1", title } });
    }
  );

  export { todosRouter };
  ```

  Mount in src/index.ts:
  ```typescript
  import { todosRouter } from "./routes/todos";
  app.route("/api/todos", todosRouter);
  ```

  IMPORTANT: Make sure all endpoints and routes are prefixed with `/api/`
</routes>

<shared_types>
  Define all API contracts in src/types.ts as Zod schemas.
  This file is the single source of truth — both backend and frontend import from here.
</shared_types>

<curl_testing>
  ALWAYS test APIs with cURL after implementing.
  Use $BACKEND_URL environment variable, never localhost.
  Verify response matches the Zod schema before telling frontend it's ready.
</curl_testing>

<database>
  The app supports local SQLite by default and Supabase Postgres when DATABASE_URL is set to a Postgres connection string.
  If the user needs to persist data or have user accounts, use the database-auth skill and then update this file to reflect the changes.
</database>

<deployment_workflow>
  Use a local-first, low-friction release flow:
  1. Validate backend changes locally (typecheck, health, and route checks).
  2. Deploy backend changes to the active platform (Railway, Supabase-connected host, or current production host).
  3. Verify live behavior from the frontend domain that uses this backend.

  <when_to_release>
    For bigger backend/auth/data changes, deploy when it is safe and reasonable to update production.
  </when_to_release>

  <required_live_checks>
    - /health responds correctly.
    - Auth flows work from production frontend origin.
    - Core API routes return expected contracts.
  </required_live_checks>

  <done_gate>
    Do not mark done until post-deploy live checks pass.
  </done_gate>
</deployment_workflow>