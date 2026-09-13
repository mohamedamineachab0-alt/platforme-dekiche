import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Session/direct URL avoids PgBouncer prepared-statement issues with Prisma.
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
  pgPool: Pool | undefined;
  prismaSchemaEpoch?: string;
};

/** Bump this whenever Prisma schema models/fields change so HMR drops the stale client. */
const PRISMA_SCHEMA_EPOCH = "live-session-weekly-zoom-v1";

if (globalForPrisma.prismaSchemaEpoch !== PRISMA_SCHEMA_EPOCH) {
  globalForPrisma.prismaClient = undefined;
  if (globalForPrisma.pgPool) {
    void globalForPrisma.pgPool.end().catch(() => undefined);
    globalForPrisma.pgPool = undefined;
  }
  globalForPrisma.prismaSchemaEpoch = PRISMA_SCHEMA_EPOCH;
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 20000,
    allowExitOnIdle: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prismaClient ??
  new PrismaClient({ adapter, log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}

export function getPrismaWithRLS(userId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
            return query(args);
          });
        },
      },
    },
  });
}
