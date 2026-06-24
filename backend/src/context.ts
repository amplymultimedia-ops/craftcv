import type { auth } from "./auth";

// Hono context variable types
export type HonoVariables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};
