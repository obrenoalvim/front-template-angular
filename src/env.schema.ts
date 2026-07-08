// src/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  SITE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(4000),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
