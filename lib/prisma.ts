import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis as unknown as {
  prismaClientV3: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

// Configure pg Pool with strict connection limits and timeouts for Prisma v7
const pool = globalForPrisma.pgPool ?? new Pool({ 
  connectionString,
  max: 1, // connection_limit=1
  connectionTimeoutMillis: 15000, // connect_timeout=15
  idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prismaClientV3 ?? new PrismaClient({ adapter, log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClientV3 = prisma;
}

// RLS Helper for Server Actions & API Routes
export function getPrismaWithRLS(userId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Wrap in a transaction to enforce RLS per query
          return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
            return query(args);
          });
        },
      },
    },
  });
}
