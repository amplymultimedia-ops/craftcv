import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "./db";
import { env } from "./env";
import { sendOtpEmail } from "./mailer";

export const auth = betterAuth({
  baseURL: env.BACKEND_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: env.SUPABASE_DATABASE_URL ? "postgresql" : "sqlite",
  }),
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.vercel.app",
    "https://*.dev.vibecode.run",
    "https://*.vibecode.run",
    "https://*.vibecodeapp.com",
    "https://*.vibecode.dev",
    "https://vibecode.dev",
  ],
  advanced: {
    crossSubDomainCookies: { enabled: false },
    trustedProxyHeaders: true,
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendOtpEmail(user.email, url.split("/").pop() || "reset-link");
      } catch (error) {
        console.error("Failed to send reset password email", error);
      }
    },
  },
  plugins: [bearer()],
});

export type Auth = typeof auth;
