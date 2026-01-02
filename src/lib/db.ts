import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

function getClient() {
  if (!global.__prisma) {
    const pool =
      global.__pgPool ??
      new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    if (!global.__pgPool) global.__pgPool = pool;

    const adapter = new PrismaPg(pool);
    global.__prisma = new PrismaClient({ adapter });
  }
  return global.__prisma;
}

// Important: lazy init so `next build` doesn't crash when DATABASE_URL isn't present at build time.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getClient() as any)[prop];
  },
});


