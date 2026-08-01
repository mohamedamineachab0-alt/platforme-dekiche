import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis as unknown as {
  prismaClientV2: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

// Cache the pg Pool in development to avoid exhausting connections on hot reloads
const pool = globalForPrisma.pgPool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prismaClientV2 ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClientV2 = prisma;
}
