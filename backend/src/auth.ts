import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { prisma } from "./db";
import { env } from "./env";
import { sendVerificationCodeEmail } from "./mailer";

export const auth = betterAuth({
  baseURL: env.BACKEND_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: env.SUPABASE_DATABASE_URL ? "postgresql" : "sqlite",
  }),
  trustedOrigins: [
    env.BACKEND_URL,
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.vercel.app",
    "https://webapp-roan-phi-58.vercel.app",
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
  plugins: [
    bearer(),
    emailOTP({
      expiresIn: 10 * 60,
      allowedAttempts: 3,
      storeOTP: "hashed",
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendVerificationCodeEmail(email, otp, type);
      },
    }),
  ],
});

export type Auth = typeof auth;
