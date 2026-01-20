# SUIT AI v4.b - Order State Machine
## 22-State Manufacturing Pipeline

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. State Overview

The order lifecycle consists of 19 primary states (S01-S19), tracking an order from payment through final delivery.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORDER STATE MACHINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │   S01    │──▶│   S02    │──▶│   S03    │──▶│   S04    │──▶│   S05    │ │
│  │   PAID   │   │   SCAN   │   │  MEASURE │   │  PENDING │   │ PATTERN  │ │
│  │          │   │ RECEIVED │   │ CONFIRMED│   │  PATTERN │   │GENERATED │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └────┬─────┘ │
│       │                                                            │       │
│       │ (Skip scan if measurements already exist)                  │       │
│       └─────────────────────────────────────────────────▶──────────┘       │
│                                                                    │       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │       │
│  │   S09    │◀──│   S07    │◀──│   S06    │◀──────────────────────┘       │
│  │DELIVERED │   │  PRINT   │   │  SENT TO │                               │
│  │ TO RAJA  │   │COLLECTED │   │ PRINTER  │                               │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                               │
│       │              │              │                                      │
│       │              │         ┌────▼─────┐                               │
│       │              │         │   S08    │  (Ruler Test Fail)            │
│       │              │         │  PRINT   │────────────────┐              │
│       │              │         │ REJECTED │                │              │
│       │              │         └──────────┘                │              │
│       │              │                                     │              │
│       │              └─────────────────────────────────────┘              │
│       │                                                                    │
│  ┌────▼─────┐   ┌──────────┐   ┌──────────┐                               │
│  │   S10    │──▶│   S11    │──▶│   S12    │                               │
│  │ CUTTING  │   │  SEWING  │   │READY FOR │                               │
│  │          │   │          │   │    QC    │                               │
│  └──────────┘   └────┬─────┘   └────┬─────┘                               │
│                      │              │                                      │
│                      │         ┌────▼─────┐   ┌──────────┐                │
│                      │         │   S13    │──▶│   S15    │                │
│                      │         │ QC PASS  │   │COLLECTED │                │
│                      │         └──────────┘   │FROM RAJA │                │
│                      │                        └────┬─────┘                │
│                      │         ┌──────────┐        │                      │
│                      │         │   S14    │        │                      │
│                      └─────────│ QC FAIL  │◀───────┘ (Rework)             │
│                                └──────────┘                               │
│                                                                            │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│  │   S15    │──▶│   S16    │──▶│   S17    │──▶│   S18    │──▶ COMPLETE   │
│  │COLLECTED │   │ PACKAGED │   │ SHIPPED  │   │DELIVERED │    (S19)      │
│  │FROM RAJA │   │          │   │          │   │          │               │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘               │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. State Definitions

### Phase 1: Order Initiation

| State | Code | Description | Trigger | Responsible |
|-------|------|-------------|---------|-------------|
| **PAID** | S01 | Payment confirmed | Stripe webhook | System |
| **SCAN_RECEIVED** | S02 | Body scan completed | Vision pipeline | System |
| **MEASUREMENTS_CONFIRMED** | S03 | User approved measurements | User confirmation | Customer |

### Phase 2: Pattern Generation (Manual Bridge)

| State | Code | Description | Trigger | Responsible |
|-------|------|-------------|---------|-------------|
| **PENDING_PATTERN** | S04 | Awaiting operator action | Queue entry | System |
| **PATTERN_GENERATED** | S05 | DXF/PDF created in Optitex | File upload | Operator |
| **SENT_TO_PRINTER** | S06 | Patterns emailed to print shop | Email confirmation | Operator |

### Phase 3: Print QA

| State | Code | Description | Trigger | Responsible |
|-------|------|-------------|---------|-------------|
| **PRINT_COLLECTED** | S07 | Ruler test passed | Runner validation | Runner |
| **PRINT_REJECTED** | S08 | Ruler test failed | Runner validation | Runner |

### Phase 4: Manufacturing

| State | Code | Description | Trigger | Responsible |
|-------|------|-------------|---------|-------------|
| **DELIVERED_TO_RAJA** | S09 | Pattern + fabric at tailor | Runner confirmation | Runner |
| **CUTTING** | S10 | Fabric being cut | Raja update | Raja |
| **SEWING** | S11 | Assembly in progress | Raja update | Raja |
| **READY_FOR_QC** | S12 | Assembly complete | Raja update | Raja |

### Phase 5: Quality Control

| State | Code | Description | Trigger | Responsible |
|-------|------|-------------|---------|-------------|
| **QC_PASS** | S13 | Final QC approved | Runner validation | Runner |
| **QC_FAIL** | S14 | Final QC failed | Runner validation | Runner |
| **COLLECTED_FROM_RAJA** | S15 | Suit collected | Runner confirmation | Runner |

### Phase 6: Delivery

| State | Code | Description | Trigger | Responsible |
|-------|------|-------------|---------|-------------|
| **PACKAGED** | S16 | Ready for shipping | Logistics update | Ops |
| **SHIPPED** | S17 | With courier | Courier handoff | Ops |
| **DELIVERED** | S18 | Customer received | Delivery confirmation | System |
| **COMPLETE** | S19 | Order lifecycle ended | Auto-close | System |

---

## 3. Valid State Transitions

```javascript
const VALID_TRANSITIONS = {
  'S01_PAID':                 ['S02_SCAN_RECEIVED', 'S03_MEASUREMENTS_CONFIRMED'],
  'S02_SCAN_RECEIVED':        ['S03_MEASUREMENTS_CONFIRMED'],
  'S03_MEASUREMENTS_CONFIRMED': ['S04_PENDING_PATTERN'],
  'S04_PENDING_PATTERN':      ['S05_PATTERN_GENERATED'],
  'S05_PATTERN_GENERATED':    ['S06_SENT_TO_PRINTER'],
  'S06_SENT_TO_PRINTER':      ['S07_PRINT_COLLECTED', 'S08_PRINT_REJECTED'],
  'S07_PRINT_COLLECTED':      ['S09_DELIVERED_TO_RAJA'],
  'S08_PRINT_REJECTED':       ['S06_SENT_TO_PRINTER'],  // Reprint cycle
  'S09_DELIVERED_TO_RAJA':    ['S10_CUTTING'],
  'S10_CUTTING':              ['S11_SEWING'],
  'S11_SEWING':               ['S12_READY_FOR_QC'],
  'S12_READY_FOR_QC':         ['S13_QC_PASS', 'S14_QC_FAIL'],
  'S13_QC_PASS':              ['S15_COLLECTED_FROM_RAJA'],
  'S14_QC_FAIL':              ['S11_SEWING'],  // Rework cycle
  'S15_COLLECTED_FROM_RAJA':  ['S16_PACKAGED'],
  'S16_PACKAGED':             ['S17_SHIPPED'],
  'S17_SHIPPED':              ['S18_DELIVERED'],
  'S18_DELIVERED':            ['S19_COMPLETE'],
  'S19_COMPLETE':             []  // Terminal state
};
```

---

## 4. State Actions & Side Effects

### S01 → S02: Scan Received
```typescript
async function onScanReceived(orderId: string, measurementId: string) {
  // 1. Link measurement to order
  await db.orderItems.update({ orderId }, { measurementId });
  
  // 2. Notify customer
  await email.send('scan_complete', customer.email);
  
  // 3. Update state
  await transitionState(orderId, 'S02_SCAN_RECEIVED');
}
```

### S03 → S04: Measurements Confirmed
```typescript
async function onMeasurementsConfirmed(orderId: string) {
  // 1. Lock measurements
  await db.measurements.update({ orderId }, { locked: true });
  
  // 2. Add to operator queue
  await queue.push('pattern_generation', { orderId, priority: 'normal' });
  
  // 3. Notify operator
  await slack.notify('#ops', `New order in queue: ${orderId}`);
  
  // 4. Update state
  await transitionState(orderId, 'S04_PENDING_PATTERN');
}
```

### S06 → S07/S08: Ruler Test
```typescript
async function onRulerTest(orderId: string, measuredValue: number) {
  const TOLERANCE_MIN = 9.9;
  const TOLERANCE_MAX = 10.1;
  
  const passed = measuredValue >= TOLERANCE_MIN && measuredValue <= TOLERANCE_MAX;
  
  if (passed) {
    await transitionState(orderId, 'S07_PRINT_COLLECTED');
  } else {
    // 1. Mark as rejected
    await transitionState(orderId, 'S08_PRINT_REJECTED');
    
    // 2. Alert operator
    await slack.notify('#ops', `PRINT REJECTED: ${orderId} - Measured ${measuredValue}cm`);
    
    // 3. Block printer payment
    await payments.holdPrinterPayment(orderId);
  }
}
```

### S12 → S13/S14: Final QC
```typescript
async function onFinalQC(orderId: string, qcResults: QCResult) {
  // QC checks 70+ landmark measurements
  const passed = qcResults.every(r => Math.abs(r.delta) <= 5); // 5mm tolerance
  
  if (passed) {
    await transitionState(orderId, 'S13_QC_PASS');
    await db.orders.update({ orderId }, { qcReport: qcResults });
  } else {
    await transitionState(orderId, 'S14_QC_FAIL');
    
    // Document failure reasons
    const failures = qcResults.filter(r => Math.abs(r.delta) > 5);
    await db.orders.update({ orderId }, { 
      qcReport: qcResults,
      reworkNotes: failures 
    });
    
    // Notify Raja
    await email.send('rework_required', raja.email, { failures });
  }
}
```

---

## 5. Timeline Expectations

| Stage | Target Duration | Alert Threshold |
|-------|-----------------|-----------------|
| S01 → S03 | 1 hour | 4 hours |
| S03 → S05 | 2 hours | 8 hours |
| S05 → S07 | 24 hours | 48 hours |
| S07 → S09 | 4 hours | 12 hours |
| S09 → S13 | 5-7 days | 10 days |
| S13 → S17 | 24 hours | 48 hours |
| S17 → S18 | 5-10 days | 14 days |

**Total Target:** 2-3 weeks from payment to delivery

---

## 6. Webhook Events

Each state transition emits a webhook event:

```json
{
  "event": "order.state_changed",
  "timestamp": "2026-01-19T10:30:00Z",
  "data": {
    "order_id": "ord_xxx",
    "from_state": "S06_SENT_TO_PRINTER",
    "to_state": "S07_PRINT_COLLECTED",
    "changed_by": "user_runner_123",
    "metadata": {
      "ruler_test_value": 10.0
    }
  }
}
```

---

## 7. State Query API

### Get Order State
```http
GET /api/orders/:id/state

Response:
{
  "order_id": "ord_xxx",
  "current_state": "S10_CUTTING",
  "state_since": "2026-01-19T08:00:00Z",
  "next_valid_states": ["S11_SEWING"],
  "history": [
    {
      "from_state": "S09_DELIVERED_TO_RAJA",
      "to_state": "S10_CUTTING",
      "changed_at": "2026-01-19T08:00:00Z",
      "changed_by": "system"
    }
  ]
}
```

### Transition State
```http
PATCH /api/orders/:id/state

Request:
{
  "new_state": "S11_SEWING",
  "notes": "All pieces cut, starting assembly"
}

Response:
{
  "success": true,
  "order_id": "ord_xxx",
  "previous_state": "S10_CUTTING",
  "current_state": "S11_SEWING"
}
```

---

## 8. Dashboard Filters

Operator dashboard groups orders by actionable states:

| Filter | States | Description |
|--------|--------|-------------|
| **Needs Pattern** | S04 | Ready for Optitex work |
| **Needs Print** | S05 | Pattern ready, needs printing |
| **Awaiting Pickup** | S06 | At print shop |
| **Print Issues** | S08 | Failed ruler test |
| **At Raja** | S09-S12 | In manufacturing |
| **QC Issues** | S14 | Rework required |
| **Ready to Ship** | S15-S16 | Ready for courier |
| **In Transit** | S17 | With courier |

---

## 9. Error States & Recovery

### Stuck Order Detection
```sql
-- Orders stuck in a state too long
SELECT o.id, o.current_state, 
       EXTRACT(HOURS FROM NOW() - sh.created_at) as hours_in_state
FROM orders o
JOIN order_state_history sh ON o.id = sh.order_id
WHERE sh.to_state = o.current_state
  AND EXTRACT(HOURS FROM NOW() - sh.created_at) > 
      CASE o.current_state
        WHEN 'S04_PENDING_PATTERN' THEN 8
        WHEN 'S06_SENT_TO_PRINTER' THEN 48
        WHEN 'S09_DELIVERED_TO_RAJA' THEN 240
        ELSE 24
      END;
```

### Manual Override (Admin Only)
```http
POST /api/admin/orders/:id/force-state

Request:
{
  "new_state": "S05_PATTERN_GENERATED",
  "reason": "Manual upload completed outside system",
  "override_validation": true
}
```

---

*End of State Machine Document*
