import { createAuthClient } from "better-auth/react";

const useRelativeApi =
  typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");

export const authClient = createAuthClient({
  baseURL: useRelativeApi ? undefined : import.meta.env.VITE_BACKEND_URL || undefined,
});

export const { signIn, signUp, signOut, useSession } = authClient;
