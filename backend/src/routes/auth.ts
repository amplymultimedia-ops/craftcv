import { Hono } from "hono";
import { auth } from "../auth";

const authRouter = new Hono();

// Mount Better Auth handler - handles all auth routes
authRouter.all("/*", (c) => {
  return auth.handler(c.req.raw);
});

export { authRouter };
