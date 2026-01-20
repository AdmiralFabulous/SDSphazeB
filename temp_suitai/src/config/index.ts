import { env } from '@/lib/env';

export const config = {
  app: {
    name: 'SUIT AI v4',
    version: '0.0.0',
    environment: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
  },
  app_url: env.NEXT_PUBLIC_APP_URL,
  database: {
    url: env.DATABASE_URL,
  },
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    experimental: env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL,
  },
} as const;

export default config;
