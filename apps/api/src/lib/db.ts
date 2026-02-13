import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Connection pool optimized for serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Limit connections for serverless (Vercel has concurrent limits)
  idleTimeoutMillis: 0, // Close idle connections immediately
  connectionTimeoutMillis: 10000, // 10s timeout
});

const adapter = new PrismaPg(pool);

// PrismaClient singleton for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { pool };