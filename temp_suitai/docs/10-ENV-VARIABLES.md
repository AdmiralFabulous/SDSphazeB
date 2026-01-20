# SUIT AI v4.b - Environment Variables
## Configuration Reference

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. Environment Overview

| Environment | Branch | Purpose |
|-------------|--------|---------|
| **Development** | local | Developer machines |
| **Preview** | feature/* | PR deployments |
| **Staging** | develop | Integration testing |
| **Production** | main | Live customers |

---

## 2. Frontend Variables (`apps/web/.env`)

### Public Variables (Exposed to Browser)

```bash
# =============================================================================
# NEXT.JS PUBLIC VARIABLES
# These are exposed to the browser and should NOT contain secrets
# =============================================================================

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Supabase (Public Keys Only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Publishable Key Only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE=false
NEXT_PUBLIC_ENABLE_EXPLODED_VIEW=true
NEXT_PUBLIC_ENABLE_TRACK_B=true

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### Server-Only Variables

```bash
# =============================================================================
# SERVER-ONLY VARIABLES
# These are only available on the server and can contain secrets
# =============================================================================

# Supabase (Service Role - Full Access)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Secret Key)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=orders@suitai.com

# Vision Service
VISION_SERVICE_URL=http://localhost:8000
VISION_SERVICE_API_KEY=vs_...

# Voice (Vapi.ai)
VAPI_API_KEY=vapi_...
VAPI_ASSISTANT_ID=asst_...

# Session Configuration
SESSION_SECRET=your-32-character-secret-key-here
SESSION_EXPIRY_DAYS=30

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 3. Vision Service Variables (`services/vision/.env`)

```bash
# =============================================================================
# VISION SERVICE CONFIGURATION
# =============================================================================

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=1
DEBUG=false

# GPU Configuration
CUDA_VISIBLE_DEVICES=0
TORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

# Model Paths
MODEL_PATH=/models
SAM3_MODEL_PATH=/models/sam3/sam3_vit_h.pth
SAM_BODY4D_PATH=/models/sam_body4d/checkpoint.pth
HMR2_MODEL_PATH=/models/hmr2/checkpoint.pth
SHAPY_MODEL_PATH=/models/shapy/checkpoint.pth
SMPLX_MODEL_PATH=/models/smplx

# Processing Configuration
MAX_FRAME_RATE=30
KALMAN_PROCESS_NOISE=0.001
KALMAN_MEASUREMENT_NOISE=0.01
CALIBRATION_LOCK_FRAMES=30
WARMUP_FRAMES=60

# ArUco Configuration
ARUCO_DICTIONARY=DICT_4X4_50
ARUCO_MARKER_SIZE_MM=210  # A4 width

# API Security
API_KEY=vs_...
ALLOWED_ORIGINS=http://localhost:3000,https://suitai.com

# Database (for measurement storage)
DATABASE_URL=postgresql://user:pass@localhost:5432/suitai

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

---

## 4. Database Variables (`packages/database/.env`)

```bash
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# Supabase Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct PostgreSQL (for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Migration Configuration
MIGRATION_TABLE=_migrations
AUTO_MIGRATE=false
```

---

## 5. Runner App Variables (`apps/runner/.env`)

```bash
# =============================================================================
# RUNNER PWA CONFIGURATION
# =============================================================================

# API
NEXT_PUBLIC_API_URL=https://api.suitai.com
NEXT_PUBLIC_ENVIRONMENT=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Offline Storage
NEXT_PUBLIC_OFFLINE_STORAGE_SIZE_MB=50

# Server-only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. CI/CD Variables (GitHub Secrets)

```bash
# =============================================================================
# GITHUB ACTIONS SECRETS
# =============================================================================

# Vercel Deployment
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx

# Docker Registry
DOCKER_USERNAME=xxx
DOCKER_PASSWORD=xxx
GHCR_TOKEN=xxx

# Test Environment
TEST_SUPABASE_URL=https://test-project.supabase.co
TEST_SUPABASE_ANON_KEY=xxx
TEST_STRIPE_SECRET_KEY=sk_test_xxx

# Code Quality
CODECOV_TOKEN=xxx
SONAR_TOKEN=xxx

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

---

## 7. Environment-Specific Configurations

### Development (`.env.local`)

```bash
# Local development overrides
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development

# Use local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Local vision service
VISION_SERVICE_URL=http://localhost:8000

# Disable analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### Staging (`.env.staging`)

```bash
# Staging environment
NEXT_PUBLIC_API_URL=https://staging.suitai.com
NEXT_PUBLIC_WS_URL=wss://vision-staging.suitai.com
NEXT_PUBLIC_ENVIRONMENT=staging

# Staging Supabase
NEXT_PUBLIC_SUPABASE_URL=https://staging-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Stripe test mode (still)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Staging vision service
VISION_SERVICE_URL=https://vision-staging.suitai.com

# Enable all features for testing
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_EXPLODED_VIEW=true
NEXT_PUBLIC_ENABLE_TRACK_B=true
```

### Production (`.env.production`)

```bash
# Production environment
NEXT_PUBLIC_API_URL=https://suitai.com
NEXT_PUBLIC_WS_URL=wss://vision.suitai.com
NEXT_PUBLIC_ENVIRONMENT=production

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://prod-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Stripe live mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Production vision service
VISION_SERVICE_URL=https://vision.suitai.com

# Feature flags (controlled rollout)
NEXT_PUBLIC_ENABLE_VOICE=false  # Enable after testing
NEXT_PUBLIC_ENABLE_EXPLODED_VIEW=true
NEXT_PUBLIC_ENABLE_TRACK_B=true

# Full analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 8. Docker Compose Environment

### `docker-compose.yml` (Development)

```yaml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3000
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    volumes:
      - ./apps/web:/app
      - /app/node_modules

  vision:
    build: ./services/vision
    ports:
      - "8000:8000"
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - MODEL_PATH=/models
      - API_KEY=${VISION_API_KEY}
    volumes:
      - ./services/vision:/app
      - ./models:/models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  supabase-db:
    image: supabase/postgres:15
    ports:
      - "54322:5432"
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - supabase-db:/var/lib/postgresql/data

volumes:
  supabase-db:
```

---

## 9. Security Best Practices

### Do's

- Store secrets in environment variables, never in code
- Use different keys for each environment
- Rotate keys regularly (quarterly minimum)
- Use `NEXT_PUBLIC_` prefix only for truly public values
- Encrypt secrets in CI/CD systems

### Don'ts

- Never commit `.env` files to git
- Don't use production keys in development
- Don't expose server-only variables to the browser
- Don't log sensitive environment variables

### `.gitignore`

```
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Keep example file
!.env.example
```

---

## 10. Validation Script

```typescript
// scripts/validate-env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required for all environments
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  
  // Required for production
  ...(process.env.NODE_ENV === 'production' && {
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
    VISION_SERVICE_URL: z.string().url(),
  }),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}
```

---

*End of Environment Variables Document*
