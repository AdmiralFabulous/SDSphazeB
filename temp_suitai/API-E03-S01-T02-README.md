# API-E03-S01-T02: GET /api/orders

## Implementation Summary

This task implements the GET /api/orders endpoint for retrieving authenticated user orders with pagination and filtering capabilities.

## Files Created/Modified

### 1. Database Migration
**File:** `supabase/migrations/002_create_orders_tables.sql`
- Creates `orders` table with user_id, current_state, total_amount, timestamps
- Creates `order_items` table with order_id, product_id, quantity, price
- Adds appropriate indexes for performance
- Implements Row Level Security (RLS) policies
- Ensures users can only access their own orders

### 2. Supabase Client
**File:** `src/lib/supabase.ts`
- Creates server-side Supabase client using `@supabase/ssr`
- Handles cookie management for authentication
- Exports `createRouteHandlerClient()` function

### 3. API Route
**File:** `src/app/api/orders/route.ts`
- Implements GET endpoint at `/api/orders`
- Authenticates users via Supabase auth
- Returns 401 for unauthorized requests
- Supports query parameters:
  - `status`: Filter by order state (optional)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- Returns paginated response with:
  - Order list with item counts
  - Pagination metadata (page, limit, total, pages)
- Orders sorted by `created_at` descending

### 4. TypeScript Types
**File:** `src/types/orders.ts`
- Defines `Order` interface
- Defines `OrderItem` interface
- Defines `PaginatedOrdersResponse` interface
- Defines `OrdersQueryParams` interface

### 5. Environment Configuration
**File:** `.env.example`
- Documents required Supabase environment variables

## Installation Requirements

To use this endpoint, you need to install the Supabase dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

Run the migration to create the orders and order_items tables:

```bash
# Using Supabase CLI
supabase db push

# Or apply the migration file directly to your Supabase project
```

## API Usage

### Request

```http
GET /api/orders?status=pending&page=1&limit=10
Authorization: Bearer <user-token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by order state (e.g., "pending", "processing", "completed") |
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 10 | Number of items per page |

### Response

```json
{
  "orders": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "current_state": "pending",
      "total_amount": 99.99,
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-20T10:00:00Z",
      "items": [{ "count": 3 }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch orders"
}
```

## Acceptance Criteria

- [x] Returns paginated order list
- [x] Filters by status if specified
- [x] Includes item count per order
- [x] Sorted by created_at descending
- [x] Requires authentication

## Testing

Example test requests:

```bash
# Get all orders for authenticated user
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get pending orders only
curl -X GET "http://localhost:3000/api/orders?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get second page with 20 items per page
curl -X GET "http://localhost:3000/api/orders?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combine filters
curl -X GET "http://localhost:3000/api/orders?status=completed&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Features

1. **Authentication Required**: All requests must be authenticated via Supabase auth
2. **Row Level Security**: Database policies ensure users can only access their own orders
3. **User Isolation**: Queries automatically filter by authenticated user's ID
4. **Input Validation**: Query parameters are parsed and validated

## Performance Considerations

1. **Indexes**: Created on frequently queried columns (user_id, current_state, created_at)
2. **Pagination**: Limits data transfer and improves response times
3. **Count Optimization**: Uses Supabase's `count: 'exact'` for accurate totals
4. **Aggregation**: Item count computed via relation without separate queries
