import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Application URLs
  NEXT_PUBLIC_API_URL: z.string().url().or(z.literal('http://localhost:3000')).default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().or(z.literal('http://localhost:3000')).default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),

  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),

  // API Keys (optional for public clients)
  NEXT_PUBLIC_API_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

// Validate environment variables at build time
function validateEnv(): Environment {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    result.error.issues.forEach(issue => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export const env = validateEnv();
