# API-E03-S01-T01: POST /api/orders Implementation Summary

## Task Overview
Created a new order endpoint that creates orders after successful payment, typically called by the Stripe webhook handler. Sets initial state to S01_PAID.

## Acceptance Criteria Verification

### ✅ Creates order with S01_PAID state
- Implemented in `src/lib/orders/create-order.ts:28`
- Order is created with `current_state: 'S01_PAID'`

### ✅ Links to user and payment intent
- User ID linked via `user_id` field (line 25)
- Payment intent linked via `stripe_payment_intent` field (line 27)
- Foreign key constraint ensures user exists

### ✅ Creates order items from cart
- Implemented in `src/lib/orders/create-order.ts:47-57`
- Maps input items to order_items with proper calculations
- Sets status based on measurement availability:
  - `ready_for_production` if measurement_id exists
  - `pending_measurement` otherwise

### ✅ Calculates totals correctly
- VAT calculation: `subtotal * 0.20` (20% UK VAT)
- Subtotal: Sum of `unit_price_gbp * fabric_modifier` for all items
- Total: `subtotal + vat_amount`
- Item totals: `unit_price_gbp * fabric_modifier`

### ✅ Records in state history
- Automatic recording via database trigger
- Implemented in migration: `supabase/migrations/20260120000000_create_orders_tables.sql:145-158`
- Trigger `record_order_state_change_trigger` fires on INSERT/UPDATE

## Files Created

### Database Migration
- `supabase/migrations/20260120000000_create_orders_tables.sql`
  - Creates `orders`, `order_items`, and `order_state_history` tables
  - Implements automatic state history trigger
  - Sets up proper indexes and RLS
  - Includes updated_at triggers

### Business Logic
- `src/lib/orders/types.ts` - TypeScript interfaces
- `src/lib/orders/validation.ts` - Zod validation schemas
- `src/lib/orders/create-order.ts` - Core order creation logic

### API Endpoint
- `src/app/api/orders/route.ts` - POST /api/orders handler
  - Request validation using Zod
  - Error handling (400, 404, 409, 500)
  - Returns structured JSON response

### Infrastructure
- `src/lib/supabase.ts` - Supabase client singleton
- `.env.example` - Environment variable template

## API Specification

### Endpoint
POST /api/orders

### Request Body
```json
{
  "user_id": "string (UUID)",
  "stripe_payment_intent": "string",
  "track_type": "A | B",
  "wedding_event_id": "string (UUID, optional, required for Track B)",
  "items": [{
    "suit_config_id": "string (UUID)",
    "measurement_id": "string (UUID, optional)",
    "wedding_attendee_id": "string (UUID, optional)",
    "unit_price_gbp": "number (>= 0)",
    "fabric_modifier": "number (> 0)"
  }],
  "shipping": {
    "name": "string",
    "address_line1": "string",
    "address_line2": "string (optional)",
    "city": "string",
    "postal_code": "string",
    "country": "string (ISO 3166-1 alpha-2, default: GB)",
    "phone": "string (optional)"
  }
}
```

### Success Response (201)
```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "track_type": "A | B",
  "current_state": "S01_PAID",
  "stripe_payment_intent": "string",
  "subtotal_amount": "number",
  "vat_amount": "number",
  "total_amount": "number",
  "shipping": {
    "name": "string",
    "address_line1": "string",
    "address_line2": "string | null",
    "city": "string",
    "postal_code": "string",
    "country": "string",
    "phone": "string | null"
  },
  "paid_at": "string (ISO 8601)",
  "created_at": "string (ISO 8601)"
}
```

### Error Responses
- **400 Bad Request** - Validation failed
- **404 Not Found** - Invalid user_id or related resource
- **409 Conflict** - Duplicate payment intent
- **500 Internal Server Error**

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update with actual Supabase credentials

3. Run Supabase migration:
   ```bash
   supabase migration up
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Definition of Done
✅ Order created at S01_PAID with all items
