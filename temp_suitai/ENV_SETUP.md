# Environment Configuration Setup

This document describes the environment variable configuration system for the SUIT AI v4 application.

## Overview

The application uses a type-safe environment configuration system with Zod validation. Environment variables are validated at build time, ensuring configuration errors are caught early.

## Files

### Core Configuration Files

- **`src/lib/env.ts`** - Environment schema definition and validation using Zod
- **`src/config/index.ts`** - Centralized configuration object derived from environment variables
- **`.env.local`** - Local development environment variables (loaded automatically)
- **`.env.example`** - Template documenting all available environment variables
- **`.env.development`** - Development-specific environment configuration
- **`.env.production`** - Production-specific environment configuration
- **`.env.test`** - Test environment configuration

## Environment Variables

### Application Environment

- **`NODE_ENV`** (required)
  - Options: `development`, `production`, `test`
  - Default: `development`
  - Controls application behavior and logging

### Application URLs

- **`NEXT_PUBLIC_API_URL`** (required, public)
  - Default: `http://localhost:3000`
  - Base URL for API requests
  - Public variables (prefixed with `NEXT_PUBLIC_`) are exposed to the browser

- **`NEXT_PUBLIC_APP_URL`** (required, public)
  - Default: `http://localhost:3000`
  - Application URL for redirects and links

### Database

- **`DATABASE_URL`** (required)
  - Default: `file:./dev.db` (SQLite for development)
  - For production: use proper database connection string (PostgreSQL, MySQL, etc.)
  - Format: `postgresql://user:password@host:port/database`

### Feature Flags

- **`NEXT_PUBLIC_ENABLE_ANALYTICS`** (optional, public)
  - Values: `true` or `false`
  - Default: `false`
  - Enable/disable analytics tracking

- **`NEXT_PUBLIC_ENABLE_EXPERIMENTAL`** (optional, public)
  - Values: `true` or `false`
  - Default: `false`
  - Enable/disable experimental features

### API Keys

- **`NEXT_PUBLIC_API_KEY`** (optional, public)
  - API key for external services
  - Leave commented out if not needed

## Usage

### In TypeScript/React Code

```typescript
import { env } from '@/lib/env';
import { config } from '@/config';

// Direct environment access
console.log(env.NODE_ENV);
console.log(env.NEXT_PUBLIC_API_URL);

// Or use the config object
console.log(config.app.environment);
console.log(config.api.baseUrl);
console.log(config.features.analytics);
```

### Type Safety

The `env` object is fully type-safe. TypeScript will provide autocomplete and type checking:

```typescript
import { env, Environment } from '@/lib/env';

// Type-safe access
const apiUrl: string = env.NEXT_PUBLIC_API_URL;
const isDev: boolean = env.NODE_ENV === 'development';
```

## Setup Instructions

### 1. For Development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your development settings (already configured for local development).

### 2. For Production

Create a `.env.production.local` file with production settings:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://app.example.com
DATABASE_URL=postgresql://user:password@host:5432/db
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPERIMENTAL=false
```

### 3. For Testing

The `.env.test` file is used automatically when running tests. No additional setup needed.

## Validation

Environment variables are validated at build time using Zod schema. Invalid configurations will cause the build to fail with clear error messages:

```
Invalid environment variables:
  NODE_ENV: Invalid enum value
  NEXT_PUBLIC_API_URL: Invalid url
```

## Environment Loading Order (Next.js)

Next.js loads environment files in this order (later files override earlier ones):
1. `.env` (committed to repo)
2. `.env.local` (not committed, local development)
3. `.env.development` or `.env.production` or `.env.test` (based on NODE_ENV)
4. `.env.development.local` or `.env.production.local` or `.env.test.local`

## Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use `.env.example`** - Document all available variables here
3. **Public variables only** - Use `NEXT_PUBLIC_` prefix for browser-accessible variables
4. **Secrets separately** - Use environment-specific files for secrets (`.env.production.local`)
5. **Type safety** - Always use the `env` export for type-checked access
6. **Validation** - The build fails if validation fails, catching errors early

## Example Usage

### API Client Initialization

```typescript
import { env } from '@/lib/env';

const api = {
  baseUrl: env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Feature Flags

```typescript
import { config } from '@/config';

if (config.features.analytics) {
  initializeAnalytics();
}

if (config.features.experimental && config.app.isDevelopment) {
  enableExperimentalFeatures();
}
```

### Database Configuration

```typescript
import { env } from '@/lib/env';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});
```

## Troubleshooting

### Build fails with "Invalid environment variables"

1. Check the error message for which variable is invalid
2. Verify the value matches the expected format
3. Ensure required variables are set in `.env.local`
4. Refer to `.env.example` for correct variable format

### Environment variable not being picked up

1. Ensure the variable is in `.env.local` (or appropriate `.env` file)
2. For public variables in browser, prefix with `NEXT_PUBLIC_`
3. Restart the dev server after changing `.env` files
4. Check Next.js is loading the correct environment: `NEXT_PUBLIC_*` variables log to browser console during initialization

### TypeScript errors about env properties

1. Check the property name matches schema in `src/lib/env.ts`
2. Add new variables to the `envSchema` object
3. Rebuild the project after updating schema

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Zod Schema Validation](https://zod.dev/)
