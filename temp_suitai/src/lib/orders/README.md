# Order State Machine - API-E03-S01-T05

State validation layer for the order management system. Ensures all state transitions follow the defined workflow and provides clear error messages for invalid transitions.

## Overview

The order state machine manages the lifecycle of custom suit orders from payment through delivery. It enforces a strict progression through manufacturing stages with validation at each step.

## State Flow

```
S01_PAID
  ↓
S02_MEASUREMENT_PENDING
  ↓
S03_MEASUREMENT_RECEIVED
  ↓
S04_PATTERN_PENDING
  ↓
S05_PATTERN_GENERATED
  ↓
S06_SENT_TO_PRINTER
  ↓ ↺ (retry on rejection)
S07_PRINT_COLLECTED / S08_PRINT_REJECTED
  ↓
S09_DELIVERED_TO_RAJA
  ↓
S10_CUTTING_IN_PROGRESS
  ↓
S11_CUTTING_COMPLETE
  ↓
S12_STITCHING_IN_PROGRESS ↺ (retry on QC failure)
  ↓
S13_STITCHING_COMPLETE
  ↓
S14_QC_IN_PROGRESS
  ↓
S15_QC_PASSED / S16_QC_FAILED
  ↓
S17_SHIPPED
  ↓
S18_DELIVERED
  ↓
S19_COMPLETE
```

## Features

### ✅ Validates all state transitions
Only allows transitions defined in the state machine. Prevents skipping states or moving backwards (except for defined retry flows).

### ✅ Returns valid next states
API endpoint provides list of valid transitions for any order state, useful for UI dropdowns and workflow visualization.

### ✅ Clear error messages
When transitions fail, provides:
- Human-readable error explanation
- Current state with label
- Requested state with label
- List of valid next states

### ✅ Works with API and Admin UI
RESTful API design supports both programmatic access and user interfaces.

### ✅ Handles edge cases
- Terminal state detection (S19_COMPLETE has no valid transitions)
- Retry flows (print rejection, QC failure)
- Unknown state validation

## API Endpoints

### Get Valid Transitions

```http
GET /api/orders/{orderId}/valid-transitions
```

**Response:**
```json
{
  "current_state": "S06_SENT_TO_PRINTER",
  "current_label": "Sent to Printer",
  "valid_transitions": [
    { "state": "S07_PRINT_COLLECTED", "label": "Print Collected" },
    { "state": "S08_PRINT_REJECTED", "label": "Print Rejected" }
  ]
}
```

### Update Order State

```http
PATCH /api/orders/{orderId}/state
Content-Type: application/json

{
  "state": "S07_PRINT_COLLECTED"
}
```

**Success Response:**
```json
{
  "orderId": "clxxx...",
  "previous_state": "S06_SENT_TO_PRINTER",
  "previous_label": "Sent to Printer",
  "current_state": "S07_PRINT_COLLECTED",
  "current_label": "Print Collected",
  "transitioned_at": "2026-01-20T12:00:00.000Z"
}
```

**Error Response (Invalid Transition):**
```json
{
  "error": "Cannot transition from Paid to Pattern Generated",
  "current_state": "S01_PAID",
  "current_label": "Paid",
  "requested_state": "S05_PATTERN_GENERATED",
  "requested_label": "Pattern Generated",
  "valid_options": [
    { "state": "S02_MEASUREMENT_PENDING", "label": "Awaiting Measurements" }
  ]
}
```

**Error Response (Terminal State):**
```json
{
  "error": "Order is in terminal state: Complete",
  "current_state": "S19_COMPLETE",
  "current_label": "Complete",
  "requested_state": "S01_PAID",
  "requested_label": "Paid",
  "valid_options": []
}
```

## Usage

### Validate a Transition

```typescript
import { validateStateTransition } from '@/lib/orders/state-machine';

const validation = validateStateTransition('S01_PAID', 'S02_MEASUREMENT_PENDING');

if (validation.valid) {
  // Proceed with state update
} else {
  console.error(validation.error);
  console.log('Valid options:', validation.validOptions);
}
```

### Check if Transition is Valid

```typescript
import { isValidTransition } from '@/lib/orders/state-machine';

if (isValidTransition('S14_QC_IN_PROGRESS', 'S15_QC_PASSED')) {
  // Valid transition
}
```

### Get Valid Next States

```typescript
import { getValidNextStates, getStateLabel } from '@/lib/orders/state-machine';

const currentState = 'S14_QC_IN_PROGRESS';
const validNext = getValidNextStates(currentState);

validNext.forEach(state => {
  console.log(`${state}: ${getStateLabel(state)}`);
});
// Output:
// S15_QC_PASSED: QC Passed
// S16_QC_FAILED: QC Failed
```

## State Definitions

| State Code | Label | Valid Next States |
|------------|-------|-------------------|
| S01_PAID | Paid | S02_MEASUREMENT_PENDING |
| S02_MEASUREMENT_PENDING | Awaiting Measurements | S03_MEASUREMENT_RECEIVED |
| S03_MEASUREMENT_RECEIVED | Measurements Received | S04_PATTERN_PENDING |
| S04_PATTERN_PENDING | Pattern Generation Pending | S05_PATTERN_GENERATED |
| S05_PATTERN_GENERATED | Pattern Generated | S06_SENT_TO_PRINTER |
| S06_SENT_TO_PRINTER | Sent to Printer | S07_PRINT_COLLECTED, S08_PRINT_REJECTED |
| S07_PRINT_COLLECTED | Print Collected | S09_DELIVERED_TO_RAJA |
| S08_PRINT_REJECTED | Print Rejected | S06_SENT_TO_PRINTER |
| S09_DELIVERED_TO_RAJA | Delivered to Tailor | S10_CUTTING_IN_PROGRESS |
| S10_CUTTING_IN_PROGRESS | Cutting | S11_CUTTING_COMPLETE |
| S11_CUTTING_COMPLETE | Cut Complete | S12_STITCHING_IN_PROGRESS |
| S12_STITCHING_IN_PROGRESS | Stitching | S13_STITCHING_COMPLETE |
| S13_STITCHING_COMPLETE | Stitching Complete | S14_QC_IN_PROGRESS |
| S14_QC_IN_PROGRESS | Quality Check | S15_QC_PASSED, S16_QC_FAILED |
| S15_QC_PASSED | QC Passed | S17_SHIPPED |
| S16_QC_FAILED | QC Failed | S12_STITCHING_IN_PROGRESS |
| S17_SHIPPED | Shipped | S18_DELIVERED |
| S18_DELIVERED | Delivered | S19_COMPLETE |
| S19_COMPLETE | Complete | *(terminal state)* |

## Special Flows

### Print Rejection Retry
When a print is rejected (S08_PRINT_REJECTED), the order can be sent back to the printer (S06_SENT_TO_PRINTER) for retry.

### QC Failure Retry
When QC fails (S16_QC_FAILED), the order returns to stitching (S12_STITCHING_IN_PROGRESS) for rework.

## Testing

Run the comprehensive test suite:

```bash
npx tsx __tests__/state-validation.test.ts
```

The test suite validates:
- Valid state transitions (linear progression)
- Invalid state transitions (skipping, backwards)
- Valid next states retrieval
- State label mapping
- Detailed error messages
- Edge cases (terminal states, retry flows)
- Complete state coverage

## Database Schema

```prisma
model Order {
  id            String   @id @default(cuid())
  current_state String   @default("S01_PAID")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Integration Examples

### Admin UI - Show Available Actions

```typescript
// Fetch valid transitions for current order
const response = await fetch(`/api/orders/${orderId}/valid-transitions`);
const { current_label, valid_transitions } = await response.json();

// Render dropdown with valid next states
<select>
  {valid_transitions.map(({ state, label }) => (
    <option value={state}>{label}</option>
  ))}
</select>
```

### Automated Workflow - State Progression

```typescript
async function advanceOrderState(orderId: string, newState: string) {
  const response = await fetch(`/api/orders/${orderId}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: newState })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}
```

## Acceptance Criteria

- [x] Validates all state transitions
- [x] Returns valid next states for current state
- [x] Provides clear error messages
- [x] Works with both API and admin UI
- [x] Handles edge cases (terminal states, retry flows)

## Files Created

- `src/lib/orders/state-machine.ts` - Core state machine logic
- `src/app/api/orders/[id]/valid-transitions/route.ts` - GET endpoint
- `src/app/api/orders/[id]/state/route.ts` - PATCH endpoint (example)
- `__tests__/state-validation.test.ts` - Comprehensive test suite
- `prisma/schema.prisma` - Order model added

## Next Steps

To complete the order management system:

1. **API-E03-S01-T01**: POST /api/orders - Create new orders
2. **API-E03-S01-T02**: GET /api/orders - List orders with filtering
3. **API-E03-S01-T03**: GET /api/orders/:id - Get order details
4. **API-E03-S01-T04**: PATCH /api/orders/:id/state - State transitions (example provided)
5. Run database migration: `npx prisma migrate dev --name add_orders`
6. Generate Prisma client: `npx prisma generate`
