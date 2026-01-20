# Order State Management API

## Endpoint: PATCH /api/orders/:id/state

Transition an order to a new state. This endpoint is restricted to administrators only and validates that state transitions follow the defined state machine rules.

### Authentication

- **Required**: Yes
- **Role**: Admin only
- **Headers**: Must include valid authentication credentials

### Request

**URL Parameters:**
- `id` (string, required): The UUID of the order to update

**Body Parameters:**
```typescript
{
  new_state: 'draft' | 'pending_payment' | 'payment_confirmed' | 'in_production' |
             'quality_check' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  notes?: string  // Optional notes to attach to the state transition
}
```

### Response

**Success (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "current_state": "in_production",
  "total_amount": 99.99,
  "currency": "USD",
  "metadata": {},
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-01-20T11:00:00Z"
}
```

**Error Responses:**

- `401 Unauthorized`: User is not authenticated
  ```json
  { "error": "Unauthorized" }
  ```

- `403 Forbidden`: User is not an admin
  ```json
  { "error": "Admin access required" }
  ```

- `400 Bad Request`: Invalid state transition
  ```json
  { "error": "Invalid state transition from delivered to draft" }
  ```

- `404 Not Found`: Order does not exist
  ```json
  { "error": "Order not found" }
  ```

- `400 Bad Request`: Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": { ... }
  }
  ```

## State Machine

The order state machine defines valid transitions between states. Invalid transitions are automatically rejected by the database trigger.

### State Transition Rules

```
draft → pending_payment, cancelled
pending_payment → payment_confirmed, cancelled
payment_confirmed → in_production, refunded
in_production → quality_check, cancelled
quality_check → shipped, in_production (can go back for rework)
shipped → delivered, refunded
delivered → refunded
cancelled → (terminal state)
refunded → (terminal state)
```

### State Descriptions

- **draft**: Order is being created/edited
- **pending_payment**: Awaiting payment confirmation
- **payment_confirmed**: Payment received and verified
- **in_production**: Order is being manufactured
- **quality_check**: Product is undergoing quality inspection
- **shipped**: Order has been shipped to customer
- **delivered**: Order received by customer
- **cancelled**: Order was cancelled before completion
- **refunded**: Payment was refunded to customer

## State History

All state transitions are automatically recorded in the `order_state_history` table with:
- Previous state (from_state)
- New state (to_state)
- Timestamp of transition
- User who made the change
- Optional notes

The history is automatically created by a database trigger whenever the order state changes.

## Examples

### Successful State Transition

```bash
curl -X PATCH https://api.example.com/api/orders/123e4567-e89b-12d3-a456-426614174000/state \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_state": "in_production",
    "notes": "Started production run #42"
  }'
```

### Invalid Transition Attempt

```bash
curl -X PATCH https://api.example.com/api/orders/123e4567-e89b-12d3-a456-426614174000/state \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_state": "draft"
  }'
```

Response (400):
```json
{
  "error": "Invalid state transition from delivered to draft"
}
```

## Database Schema

### Orders Table

```sql
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    current_state order_state DEFAULT 'draft' NOT NULL,
    total_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Order State History Table

```sql
CREATE TABLE public.order_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    from_state order_state,
    to_state order_state NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## Implementation Notes

1. **State Validation**: Enforced at the database level via triggers, ensuring consistency even if multiple services access the database
2. **Audit Trail**: Complete history of all state changes is maintained automatically
3. **Role-Based Access**: Only administrators can transition states
4. **Atomic Operations**: State updates and history recording happen in a single transaction
5. **Error Handling**: Clear error messages for invalid transitions help with debugging

## Related Tasks

- **API-E03-S01-T01**: Create order state machine (prerequisite)
- **API-E03-S01-T02**: GET orders endpoint
- **API-E03-S01-T03**: POST create order endpoint
- **API-E03-S01-T05**: Order state history endpoint
