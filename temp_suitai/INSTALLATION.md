# Installation Instructions for API-E03-S01-T02

## Required Dependencies

The following packages need to be installed to use the GET /api/orders endpoint:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with your actual Supabase project credentials from https://app.supabase.com

### 3. Run Database Migration

Apply the database migration to create the orders and order_items tables:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration in the Supabase SQL Editor:
# Copy the contents of supabase/migrations/002_create_orders_tables.sql
# and run it in your Supabase project
```

### 4. Start Development Server

```bash
npm run dev
```

The API endpoint will be available at `http://localhost:3000/api/orders`

## Verification

Test that the endpoint is working:

```bash
# This should return 401 Unauthorized (expected without auth)
curl http://localhost:3000/api/orders
```

For authenticated requests, you'll need a valid Supabase auth token.

## Package.json Updates

After running `npm install`, your package.json will include:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "@supabase/ssr": "^0.x.x",
    // ... other dependencies
  }
}
```

## Next Steps

1. Set up Supabase authentication for your application
2. Test the endpoint with authenticated users
3. Implement the POST /api/orders endpoint (next task in the epic)
