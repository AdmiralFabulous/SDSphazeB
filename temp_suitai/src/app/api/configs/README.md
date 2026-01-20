# POST /api/configs - Suit Configuration API

## Overview
Creates a new suit configuration with fabric selection and style options. Validates fabric availability and calculates price based on fabric modifier.

## Endpoint
```
POST /api/configs
```

## Prerequisites
1. Database migrations must be applied:
   - `20260120000000_create_sessions_table.sql`
   - `20260120000001_create_suit_configs_table.sql`
   - `20260119070000_create_fabrics_table.sql` (already exists)

2. Environment variables configured in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Request Body

### Required Fields
- `session_id` (string, UUID): Valid session ID from the sessions table
- `fabric_id` (string, UUID): Valid fabric ID from the fabrics table

### Optional Fields
- `name` (string): Configuration name (defaults to "{fabric.name} Suit")
- `style_json` (object): Style customization options

### Style JSON Structure
```typescript
{
  jacket?: {
    lapel?: 'notch' | 'peak' | 'shawl';
    buttons?: 1 | 2 | 3;
    vents?: 'none' | 'single' | 'double';
    pocket_style?: 'flap' | 'jetted' | 'patch';
    lining_color?: string;  // Hex color code
  };
  trousers?: {
    fit?: 'slim' | 'regular' | 'relaxed';
    pleats?: 'flat' | 'single' | 'double';
    cuff?: boolean;
  };
  vest?: {
    included?: boolean;
    buttons?: number;
  };
}
```

## Default Style Options
If not provided, the following defaults are applied:
```json
{
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
}
```

## Example Requests

### Minimal Request
```bash
curl -X POST http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "fabric_id": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

### Full Request with Custom Styling
```bash
curl -X POST http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "fabric_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "My Wedding Suit",
    "style_json": {
      "jacket": {
        "lapel": "peak",
        "buttons": 2,
        "vents": "double",
        "pocket_style": "flap",
        "lining_color": "#2c3e50"
      },
      "trousers": {
        "fit": "slim",
        "pleats": "flat",
        "cuff": true
      },
      "vest": {
        "included": true,
        "buttons": 5
      }
    }
  }'
```

## Response

### Success Response (201 Created)
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "fabric_id": "660e8400-e29b-41d4-a716-446655440000",
  "style_json": {
    "jacket": {
      "lapel": "peak",
      "buttons": 2,
      "vents": "double",
      "pocket_style": "flap",
      "lining_color": "#2c3e50"
    },
    "trousers": {
      "fit": "slim",
      "pleats": "flat",
      "cuff": true
    },
    "vest": {
      "included": true,
      "buttons": 5
    }
  },
  "calculated_price_gbp": 659.00,
  "name": "My Wedding Suit",
  "is_finalized": false,
  "created_at": "2026-01-20T12:00:00.000Z",
  "updated_at": "2026-01-20T12:00:00.000Z",
  "fabric": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Navy Classic Wool",
    "code": "RAY-NVY-001",
    "price_modifier": 1.10,
    "in_stock": true,
    "texture_url": "https://...",
    "thumbnail_url": "https://...",
    "color_hex": "#1a1a3e"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "error": "session_id and fabric_id are required"
}
```

#### 400 Bad Request - Invalid Session
```json
{
  "error": "Invalid session_id"
}
```

#### 400 Bad Request - Invalid Fabric
```json
{
  "error": "Invalid fabric_id"
}
```

#### 400 Bad Request - Out of Stock
```json
{
  "error": "Selected fabric is out of stock"
}
```

#### 400 Bad Request - Invalid JSON
```json
{
  "error": "Invalid request body"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to create configuration"
}
```

## Price Calculation
The total price is calculated using the formula:
```
calculated_price_gbp = BASE_SUIT_PRICE_GBP × fabric.price_modifier
```

Where:
- `BASE_SUIT_PRICE_GBP = 599`
- `fabric.price_modifier` is retrieved from the fabrics table

## Validation Rules
1. **session_id**: Must exist in the sessions table
2. **fabric_id**: Must exist in the fabrics table
3. **Fabric Stock**: Must have `in_stock = true`
4. **Request Body**: Must be valid JSON

## Database Tables

### sessions
Required for session validation.

### fabrics
Required for fabric validation and price calculation.
Key fields used:
- `id`: Fabric identifier
- `name`: Used in default config name
- `price_modifier`: Used in price calculation
- `in_stock`: Stock availability check

### suit_configs
Created by this endpoint with:
- Generated UUID `id`
- Foreign keys to `sessions` and `fabrics`
- Merged `style_json` with defaults
- Calculated price
- Timestamps (auto-generated)

## Notes
- Style options are deep-merged with defaults, so partial updates work correctly
- The endpoint returns the created config with joined fabric details
- Row Level Security (RLS) policies control access based on session ownership
- The default config name includes the fabric name for easy identification
