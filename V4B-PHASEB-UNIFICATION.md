# V4B → Phase B Unification Plan

## Principle: V4B is the Foundation

Phase B **extends** v4b - it doesn't replace it. All existing v4b code, patterns, and tools carry forward.

---

## V4B Assets to Carry Forward

### 1. Database Layer (Prisma)
```
prisma/schema.prisma
├── Session        → KEEP (measurement sessions)
├── Fabric         → KEEP (fabric catalog)
├── SuitConfig     → KEEP (suit configuration)
├── Order          → EXTEND with logistics fields
├── OrderItem      → EXTEND with suit tracking
├── Scan           → KEEP (body scans)
├── LapelStyle     → KEEP (style options)
├── VentStyle      → KEEP (style options)
└── ButtonOption   → KEEP (style options)
```

### 2. State Machine (lib/orders/state-machine.ts)
```typescript
// CURRENT: S01-S19 (manufacturing flow)
S01_PAID → S02_MEASUREMENT_PENDING → ... → S19_COMPLETE

// EXTENDED: Add S20-S26 (logistics flow)
S19_COMPLETE → S20_FLIGHT_MANIFEST → S21_IN_FLIGHT → S22_LANDED
            → S23_VAN_DISPATCHED → S24_OUT_FOR_DELIVERY → S25_DELIVERED
            → S26_CONFIRMED
```

### 3. API Routes (src/app/api/)
```
/api/orders/*              → KEEP + extend
/api/scans/*               → KEEP
/api/measurements/*        → KEEP
/api/fabrics/*             → KEEP
/api/configs/*             → KEEP
/api/logistics/*           → NEW (Phase B)
```

### 4. Admin Dashboard (src/app/admin/)
```
/admin/orders/*            → EXTEND with logistics view
/admin/dashboard/*         → EXTEND with risk tracking
/admin/logistics/*         → NEW (Phase B)
```

### 5. Components
```
src/components/
├── OrderStateFilter       → EXTEND with S20-S26
├── OrderStateActions      → EXTEND with logistics actions
├── admin/*                → EXTEND
└── logistics/*            → NEW (Phase B)
```

### 6. Services
```
src/lib/
├── prisma.ts              → KEEP
├── supabase.ts            → KEEP  
├── vapi.ts                → EXTEND for tailor calls
├── vapi-client.ts         → EXTEND
├── pricing.ts             → KEEP
├── pricing-wedding.ts     → KEEP (Raja Exclusive uses this)
└── logistics/             → NEW (Phase B)
```

### 7. Vision Service
```
vision_service/            → KEEP (body scanning)
services/                  → KEEP
```

---

## Extended State Machine

### Manufacturing States (V4B - KEEP)
| Code | State | Description |
|------|-------|-------------|
| S01 | PAID | Payment confirmed |
| S02 | MEASUREMENT_PENDING | Awaiting body scan |
| S03 | MEASUREMENT_RECEIVED | Scan complete |
| S04 | PATTERN_PENDING | In Optitex queue |
| S05 | PATTERN_GENERATED | DXF ready |
| S06 | SENT_TO_PRINTER | At print shop |
| S07 | PRINT_COLLECTED | Ruler test passed |
| S08 | PRINT_REJECTED | Ruler test failed |
| S09 | DELIVERED_TO_TAILOR | At Raja (primary) |
| S10 | CUTTING_IN_PROGRESS | Fabric being cut |
| S11 | CUTTING_COMPLETE | Cut pieces ready |
| S12 | STITCHING_IN_PROGRESS | Assembly |
| S13 | STITCHING_COMPLETE | Assembled |
| S14 | QC_IN_PROGRESS | Quality check |
| S15 | QC_PASSED | Approved |
| S16 | QC_FAILED | Rework needed |
| S17 | PACKAGED | Ready to ship |
| S18 | HANDED_TO_LOGISTICS | At hub |
| S19 | LOCAL_SHIPPED | UK domestic (Track A) |

### Logistics States (Phase B - NEW)
| Code | State | Description |
|------|-------|-------------|
| S20 | FLIGHT_MANIFEST | On charter manifest |
| S21 | IN_FLIGHT | Airborne ATQ→UAE |
| S22 | LANDED | At UAE airport |
| S23 | CUSTOMS_CLEARED | Through customs |
| S24 | VAN_ASSIGNED | Route optimized |
| S25 | OUT_FOR_DELIVERY | With driver |
| S26 | DELIVERED_UAE | Customer received |

### Dual Track Support
```
Track A (UK Retail): S01 → S19 → S19_COMPLETE (domestic shipping)
Track B (Dubai):     S01 → S18 → S20 → S26 (charter logistics)
```

---

## Schema Extensions

### Extend Order Model
```prisma
model Order {
  // EXISTING V4B FIELDS - KEEP ALL
  id                String      @id @default(cuid())
  userId            String?
  status            String      @default("S01_PAID")
  totalAmount       Float?
  currency          String      @default("GBP")
  stripePaymentId   String?
  shippingAddress   String?
  notes             String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  items             OrderItem[]

  // NEW PHASE B FIELDS
  track             String      @default("A")  // "A" = UK, "B" = Dubai
  deadline          DateTime?   // For Track B 24-hour delivery
  riskScore         Float?      // 0-1 composite risk
  riskFactors       Json?       // Detailed risk breakdown
  flightId          String?     // FK to Flight (Track B only)
  
  @@index([userId])
  @@index([status])
  @@index([track])
}
```

### Extend OrderItem for Suit Tracking
```prisma
model OrderItem {
  // EXISTING V4B FIELDS - KEEP ALL
  id           String     @id @default(cuid())
  orderId      String
  order        Order      @relation(...)
  suitConfigId String
  suitConfig   SuitConfig @relation(...)
  quantity     Int        @default(1)
  price        Float?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // NEW PHASE B FIELDS - Per-suit logistics
  isBackupSuit      Boolean   @default(false)
  primaryItemId     String?   // Self-ref for backup linking
  currentLocation   String?   // Location type
  currentCoords     String?   // "lat,lng" 
  primaryTailorId   String?   // FK to Tailor
  backupTailorId    String?   // FK to Tailor (dual production)
  vanId             String?   // FK to Van (Track B)
  deliveryWindowStart DateTime?
  deliveryWindowEnd   DateTime?

  // Relations
  primaryTailor     Tailor?   @relation("PrimaryTailor", ...)
  backupTailor      Tailor?   @relation("BackupTailor", ...)
  timeline          SuitTimeline[]
  
  @@index([orderId])
  @@index([primaryTailorId])
}
```

### New Phase B Tables
```prisma
model Tailor {
  id                    String   @id @default(cuid())
  name                  String
  phone                 String   // WhatsApp
  workshopCoords        String   // "lat,lng"
  zoneId                String?
  maxConcurrentJobs     Int      @default(2)
  currentJobCount       Int      @default(0)
  skillLevel            String   // junior, senior, master
  qcPassRate            Float    @default(0.95)
  avgProductionMinutes  Int      @default(300)
  upiVpa                String   // For INR 8,500 payout
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  
  primaryAssignments    OrderItem[] @relation("PrimaryTailor")
  backupAssignments     OrderItem[] @relation("BackupTailor")
}

model QcStation {
  id              String   @id @default(cuid())
  name            String
  coords          String   // "lat,lng"
  zoneId          String
  inspectorCount  Int      @default(2)
  capacityPerHour Int      @default(10)
  operatingHours  Json     // {start: "08:00", end: "20:00"}
  isActive        Boolean  @default(true)
}

model Flight {
  id                String   @id @default(cuid())
  aircraftType      String   @default("Saab340F")
  departureAirport  String   // ATQ
  arrivalAirports   String[] // [MCT, AUH, SHJ] for multi-stop
  scheduledDeparture DateTime
  actualDeparture   DateTime?
  status            String   @default("SCHEDULED")
  costGbp           Float
  suitsOnBoard      Int      @default(0)
  manifestUrl       String?
  createdAt         DateTime @default(now())
  
  orders            Order[]
}

model Van {
  id              String   @id @default(cuid())
  licensePlate    String
  driverName      String
  driverPhone     String
  currentCoords   String?
  capacity        Int      @default(20)
  currentLoad     Int      @default(0)
  status          String   @default("AVAILABLE")
  createdAt       DateTime @default(now())
}

model SuitTimeline {
  id            String   @id @default(cuid())
  orderItemId   String
  orderItem     OrderItem @relation(...)
  fromState     String
  toState       String
  changedAt     DateTime @default(now())
  changedBy     String   // user_id or "system"
  location      String?
  coords        String?
  notes         String?
  
  @@index([orderItemId])
  @@index([changedAt])
}
```

---

## API Extension Pattern

### Keep Existing + Add Logistics Namespace
```
src/app/api/
├── orders/                    # KEEP - extend handlers
│   ├── route.ts              # Add track filter
│   ├── [id]/
│   │   ├── route.ts          # KEEP
│   │   ├── state/route.ts    # Extend for S20-S26
│   │   └── valid-transitions/route.ts  # Extend
│   └── track-b/              # NEW - Track B specific
│       └── route.ts
├── logistics/                 # NEW - Phase B
│   ├── assign-tailors/route.ts
│   ├── qc-result/route.ts
│   ├── routes/route.ts       # VRPTW
│   ├── delivery-confirmed/route.ts
│   ├── tailors/route.ts
│   ├── flights/route.ts
│   └── vans/route.ts
├── events/                    # NEW - Real-time
│   ├── ws/route.ts           # WebSocket
│   └── sse/route.ts          # SSE stream
└── [existing routes...]       # KEEP ALL
```

---

## VAPI Extension

### Existing VAPI (v4b)
```typescript
// src/lib/vapi.ts - KEEP
// Used for customer measurement guidance
```

### Extended VAPI (Phase B)
```typescript
// src/lib/vapi-logistics.ts - NEW
// Parallel dialer for tailors
// Escalation calls for risk alerts
// Delivery confirmation calls
```

---

## Migration Path

### Step 1: Schema Migration
```bash
npx prisma migrate dev --name add_phase_b_logistics
```

### Step 2: State Machine Extension
```typescript
// src/lib/orders/state-machine.ts
// Add S20-S26 to STATE_TRANSITIONS
// Add track-aware transition logic
```

### Step 3: Seed Tailors & QC Stations
```typescript
// prisma/seed-phase-b.ts
// Load Amritsar tailor network
// Load QC station locations
```

### Step 4: API Routes
```bash
# Add new routes incrementally
# Test each endpoint before next
```

### Step 5: Dashboard Extension
```typescript
// Extend existing admin components
// Add logistics views as new pages
```

---

## File-by-File Carry Forward

| V4B File | Action | Phase B Change |
|----------|--------|----------------|
| `prisma/schema.prisma` | EXTEND | Add logistics models |
| `src/lib/orders/state-machine.ts` | EXTEND | Add S20-S26 |
| `src/lib/orderStates.ts` | EXTEND | Add logistics states |
| `src/types/order.ts` | EXTEND | Add logistics types |
| `src/app/api/orders/*` | EXTEND | Track filter, logistics |
| `src/components/OrderStateFilter.tsx` | EXTEND | Add logistics states |
| `src/components/admin/OrderStateActions.tsx` | EXTEND | Add logistics actions |
| `src/lib/vapi.ts` | KEEP | No change |
| `src/lib/vapi-client.ts` | EXTEND | Add tailor calls |
| `vision_service/*` | KEEP | No change |
| `services/*` | KEEP | No change |

---

## Summary

**V4B provides:**
- Prisma ORM + SQLite/Supabase
- 19-state manufacturing pipeline
- Body scanning + measurements
- Pattern generation workflow
- QC pass/fail flow
- VAPI voice integration
- Admin dashboard
- Stripe payments

**Phase B adds:**
- 7 additional logistics states (S20-S26)
- Dual production model (2 tailors)
- Charter flight management
- VRPTW route optimization
- Real-time risk scoring
- UAE ground fleet
- Extended VAPI for tailors

**Result:** Single unified codebase with Track A (UK) and Track B (Dubai) flows.
