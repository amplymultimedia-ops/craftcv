import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { backendBaseURL } from "@/lib/backend-url";

export const authClient = createAuthClient({
  baseURL: backendBaseURL || undefined,
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
