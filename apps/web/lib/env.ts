import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  API_URL: z.string().url(),
});

// Process.env is automatically loaded by Next.js
export const env = envSchema.parse(process.env);
