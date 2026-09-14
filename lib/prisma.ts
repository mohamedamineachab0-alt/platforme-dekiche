import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Runtime uses DATABASE_URL (Supavisor transaction pooler, :6543).
 * DIRECT_URL (session/direct, :5432) is for Prisma CLI / migrations only.
 */
function resolveRuntimeConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const directUrl = process.env.DIRECT_URL?.trim();

  if (databaseUrl) return databaseUrl;

  if (directUrl) {
    console.warn(
      "[prisma] DATABASE_URL is missing; falling back to DIRECT_URL (session mode). " +
        "Set DATABASE_URL to the transaction pooler (:6543?pgbouncer=true)."
    );
    return directUrl;
  }

  throw new Error("DATABASE_URL is not set");
}

const connectionString = resolveRuntimeConnectionString();

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
  pgPool: Pool | undefined;
  prismaSchemaEpoch?: string;
};

/** Bump this whenever Prisma schema models/fields change so HMR drops the stale client. */
const PRISMA_SCHEMA_EPOCH = "account-branch-v1";

if (globalForPrisma.prismaSchemaEpoch !== PRISMA_SCHEMA_EPOCH) {
  const previousPool = globalForPrisma.pgPool;
  globalForPrisma.prismaClient = undefined;
  globalForPrisma.pgPool = undefined;
  globalForPrisma.prismaSchemaEpoch = PRISMA_SCHEMA_EPOCH;
  if (previousPool) {
    void previousPool.end().catch(() => undefined);
  }
}

const isProd = process.env.NODE_ENV === "production";

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    // One sticky client locally; a couple in production warm isolates.
    max: isProd ? 2 : 1,
    connectionTimeoutMillis: 20_000,
    // Keep connections warm — aggressive idle exit caused flaky
    // "Can't reach database server at …pooler.supabase.com" under Turbopack.
    idleTimeoutMillis: 60_000,
    allowExitOnIdle: false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

pool.on("error", (err) => {
  // Prevent unhandled idle-client errors from crashing the Next process.
  console.error("[prisma] pool client error:", err.message);
});

globalForPrisma.pgPool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prismaClient ??
  new PrismaClient({ adapter, log: ["error", "warn"] });

globalForPrisma.prismaClient = prisma;

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
