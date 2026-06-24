import { PrismaClient as LocalPrismaClient } from "@prisma/client";
import { env } from "./env";

const databaseUrl = env.SUPABASE_DATABASE_URL || env.DATABASE_URL;
const useSupabaseDatabase = /^postgres(ql)?:\/\//i.test(databaseUrl);

const PrismaClientClass = (useSupabaseDatabase
  ? (await import("./generated/supabase-prisma")).PrismaClient
  : LocalPrismaClient) as typeof LocalPrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof LocalPrismaClient> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientClass({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
