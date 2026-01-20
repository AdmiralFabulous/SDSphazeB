# Quick Start: POST /api/configs

Get the suit configuration API running in 5 minutes.

## Prerequisites
- Node.js installed
- Supabase account (free tier works)

## Setup Steps

### 1. Create Supabase Project
```bash
# Visit https://supabase.com/dashboard
# Click "New Project"
# Save your project URL and anon key
```

### 2. Configure Environment
```bash
# Update .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Apply Database Migrations
```bash
# In Supabase Dashboard → SQL Editor, run these files in order:
# 1. supabase/migrations/001_create_users_table.sql
# 2. supabase/migrations/20260119070000_create_fabrics_table.sql
# 3. supabase/migrations/20260120000000_create_sessions_table.sql
# 4. supabase/migrations/20260120000001_create_suit_configs_table.sql
```

### 4. Add Test Data
```sql
-- In Supabase SQL Editor, create test session
INSERT INTO sessions (id, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'active');

-- Create test fabric
INSERT INTO fabrics (id, code, name, price_modifier, in_stock)
VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  'TEST-001',
  'Test Navy Wool',
  1.00,
  true
);
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Start Server
```bash
npm run dev
```

### 7. Test the Endpoint
```bash
curl -X POST http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "fabric_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Test Suit"
  }'
```

## Expected Response
```json
{
  "id": "770e8400-...",
  "session_id": "550e8400-...",
  "fabric_id": "660e8400-...",
  "name": "Test Suit",
  "calculated_price_gbp": 599.00,
  "style_json": {
    "jacket": {
      "lapel": "notch",
      "buttons": 2,
      "vents": "double",
      "pocket_style": "flap",
      "lining_color": "#1a1a2e"
    },
    "trousers": {
      "fit": "slim",
      "pleats": "flat",
      "cuff": false
    },
    "vest": {
      "included": false
    }
  },
  "fabric": {
    "id": "660e8400-...",
    "name": "Test Navy Wool",
    "code": "TEST-001",
    "price_modifier": 1.00,
    "in_stock": true
  }
}
```

## Troubleshooting

### "Invalid session_id"
- Check that session exists in database
- Verify UUID format is correct

### "Invalid fabric_id"
- Check that fabric exists in database
- Ensure fabric has `in_stock = true`

### "Failed to create configuration"
- Check Supabase connection
- Verify environment variables are set
- Check browser console for errors

### Network Error
- Ensure dev server is running on port 3000
- Check firewall settings

## Next Steps
- Review full documentation: `src/app/api/configs/README.md`
- Run test suite: `__tests__/configs-endpoint.test.ts`
- Read implementation details: `API_E02_S01_T01_IMPLEMENTATION_SUMMARY.md`
