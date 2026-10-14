import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, magicLink } from "better-auth/plugins";
import { prisma } from "./db";
import { env } from "./env";
import { sendMagicLinkEmail } from "./mailer";

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
    magicLink({
      expiresIn: 10 * 60,
      sendMagicLink: async ({ email, token, url }) => {
        const verificationURL = new URL(url);
        const callbackURL = verificationURL.searchParams.get("callbackURL");
        if (!callbackURL) {
          throw new Error("Magic link is missing its verification callback URL");
        }

        const signInURL = new URL(callbackURL);
        signInURL.searchParams.set("token", token);
        await sendMagicLinkEmail(email, signInURL.toString());
      },
    }),
  ],
});

export type Auth = typeof auth;
