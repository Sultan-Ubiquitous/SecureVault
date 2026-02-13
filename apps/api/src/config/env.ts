import { z } from 'zod';
import { config } from 'dotenv';
config();

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Server config
  PORT: z.string().default('3001'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Storage backend
  STORAGE_TYPE: z.enum(['memory', 'prisma']).default('memory'),

  // Cryptography
  MASTER_KEY_HEX: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'Master key must be 64 hexadecimal characters (32 bytes)'),

  // Database (optional, required only for Prisma)
  DATABASE_URL: z.string().optional(),
});

/**
 * Parse and validate environment variables
 * Throws on startup if configuration is invalid
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  // Additional validation: DATABASE_URL required if using Prisma
  if (parsed.data.STORAGE_TYPE === 'prisma' && !parsed.data.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required when STORAGE_TYPE=prisma');
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;