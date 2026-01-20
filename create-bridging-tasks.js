/**
 * Create V4B → Phase B Bridging Tasks
 * These tasks EXTEND the existing v4b codebase
 */

const PROJECT_ID = 'e9f51260-db58-4e17-b0a8-7ad898206bf5';
const API_BASE = 'http://127.0.0.1:63846/api';

const bridgingTasks = [
  // ==================== BRIDGE EPIC: SCHEMA EXTENSION ====================
  {
    title: "BRIDGE-001: Extend Order model with Phase B logistics fields",
    description: "Type: Database Migration\nPriority: P0\nDepends On: Existing prisma/schema.prisma\nEpic: Bridge - Schema Extension\n\nDescription:\nExtend the EXISTING Order model in prisma/schema.prisma with Phase B fields.\n\nExisting File: prisma/schema.prisma\nExisting Model: Order (lines 44-58)\n\nFields to ADD (do not remove existing):\n- track String @default(\"A\") // \"A\" = UK retail, \"B\" = Dubai\n- deadline DateTime? // 24-hour deadline for Track B\n- riskScore Float? // 0-1 composite risk\n- riskFactors Json? // Detailed breakdown\n- flightId String? // FK to Flight (Track B)\n\nAdd index:\n- @@index([track])\n\nAcceptance Criteria:\n- Existing Order fields unchanged\n- New fields added with defaults\n- Migration runs without data loss\n- Existing orders default to track=\"A\""
  },
  {
    title: "BRIDGE-002: Extend OrderItem model for per-suit tracking",
    description: "Type: Database Migration\nPriority: P0\nDepends On: BRIDGE-001\nEpic: Bridge - Schema Extension\n\nDescription:\nExtend EXISTING OrderItem model with per-suit logistics tracking.\n\nExisting File: prisma/schema.prisma\nExisting Model: OrderItem (lines 60-73)\n\nFields to ADD:\n- isBackupSuit Boolean @default(false)\n- primaryItemId String? // Self-reference for backup\n- currentLocation String?\n- currentCoords String? // \"lat,lng\"\n- primaryTailorId String?\n- backupTailorId String?\n- vanId String?\n- deliveryWindowStart DateTime?\n- deliveryWindowEnd DateTime?\n\nRelations to ADD:\n- primaryTailor Tailor? @relation(\"PrimaryTailor\")\n- backupTailor Tailor? @relation(\"BackupTailor\")\n- timeline SuitTimeline[]\n\nAcceptance Criteria:\n- Existing OrderItem fields unchanged\n- Dual tailor assignment works\n- Backup suit linking works"
  },
  {
    title: "BRIDGE-003: Create Tailor model (new table)",
    description: "Type: Database Migration\nPriority: P0\nDepends On: BRIDGE-002\nEpic: Bridge - Schema Extension\n\nDescription:\nCreate NEW Tailor model for Amritsar workshop network.\n\nExisting File: prisma/schema.prisma\nLocation: Add after ButtonOption model\n\nNew Model: Tailor\n- id String @id @default(cuid())\n- name String\n- phone String // WhatsApp number\n- workshopCoords String // \"lat,lng\"\n- zoneId String?\n- maxConcurrentJobs Int @default(2)\n- currentJobCount Int @default(0)\n- skillLevel String // junior, senior, master\n- qcPassRate Float @default(0.95)\n- avgProductionMinutes Int @default(300)\n- upiVpa String // For INR 8,500 payout\n- isActive Boolean @default(true)\n- createdAt DateTime @default(now())\n- primaryAssignments OrderItem[] @relation(\"PrimaryTailor\")\n- backupAssignments OrderItem[] @relation(\"BackupTailor\")\n\nAcceptance Criteria:\n- Tailor CRUD works\n- Relation to OrderItem works\n- UPI VPA stored for payouts"
  },
  {
    title: "BRIDGE-004: Create Flight, Van, QcStation, SuitTimeline models",
    description: "Type: Database Migration\nPriority: P0\nDepends On: BRIDGE-003\nEpic: Bridge - Schema Extension\n\nDescription:\nCreate remaining Phase B models in prisma/schema.prisma.\n\nNew Models:\n\n1. Flight:\n- id, aircraftType, departureAirport, arrivalAirports String[]\n- scheduledDeparture, actualDeparture, status, costGbp\n- suitsOnBoard, manifestUrl\n- orders Order[]\n\n2. Van:\n- id, licensePlate, driverName, driverPhone\n- currentCoords, capacity, currentLoad, status\n\n3. QcStation:\n- id, name, coords, zoneId\n- inspectorCount, capacityPerHour, operatingHours Json\n\n4. SuitTimeline:\n- id, orderItemId (FK), fromState, toState\n- changedAt, changedBy, location, coords, notes\n\nAcceptance Criteria:\n- All models created\n- Relations to Order/OrderItem work\n- Timeline audit trail works"
  },
  {
    title: "BRIDGE-005: Run Prisma migration for Phase B schema",
    description: "Type: Database Migration\nPriority: P0\nDepends On: BRIDGE-004\nEpic: Bridge - Schema Extension\n\nDescription:\nExecute the Prisma migration to apply all schema changes.\n\nCommands:\n```bash\ncd PRODUCTION\nnpx prisma migrate dev --name add_phase_b_logistics\nnpx prisma generate\n```\n\nVerification:\n```bash\nnpx prisma studio\n# Verify all new tables exist\n# Verify existing data preserved\n```\n\nAcceptance Criteria:\n- Migration succeeds\n- Existing Session, Order, etc. data intact\n- New tables visible in Prisma Studio\n- Prisma Client regenerated"
  },

  // ==================== BRIDGE EPIC: STATE MACHINE EXTENSION ====================
  {
    title: "BRIDGE-006: Extend state-machine.ts with S20-S26 logistics states",
    description: "Type: Code Modification\nPriority: P0\nDepends On: BRIDGE-005\nEpic: Bridge - State Machine\n\nDescription:\nExtend EXISTING state machine with Phase B logistics states.\n\nExisting File: src/lib/orders/state-machine.ts\n\nAdd to STATE_TRANSITIONS:\n```typescript\n// Existing S01-S19 transitions - KEEP ALL\n\n// NEW: Phase B logistics transitions\n'S18_HANDED_TO_LOGISTICS': ['S19_LOCAL_SHIPPED', 'S20_FLIGHT_MANIFEST'], // Branch point\n'S19_LOCAL_SHIPPED': ['S19_COMPLETE'], // Track A ends\n'S20_FLIGHT_MANIFEST': ['S21_IN_FLIGHT'],\n'S21_IN_FLIGHT': ['S22_LANDED'],\n'S22_LANDED': ['S23_CUSTOMS_CLEARED'],\n'S23_CUSTOMS_CLEARED': ['S24_VAN_ASSIGNED'],\n'S24_VAN_ASSIGNED': ['S25_OUT_FOR_DELIVERY'],\n'S25_OUT_FOR_DELIVERY': ['S26_DELIVERED_UAE'],\n'S26_DELIVERED_UAE': [], // Terminal\n```\n\nAdd to STATE_LABELS:\n```typescript\n'S20_FLIGHT_MANIFEST': 'On Flight Manifest',\n'S21_IN_FLIGHT': 'In Flight',\n'S22_LANDED': 'Landed in UAE',\n'S23_CUSTOMS_CLEARED': 'Customs Cleared',\n'S24_VAN_ASSIGNED': 'Van Assigned',\n'S25_OUT_FOR_DELIVERY': 'Out for Delivery',\n'S26_DELIVERED_UAE': 'Delivered (UAE)',\n```\n\nAcceptance Criteria:\n- Existing S01-S19 transitions unchanged\n- S20-S26 transitions valid\n- Track A: S18 -> S19 -> S19_COMPLETE\n- Track B: S18 -> S20 -> S26"
  },
  {
    title: "BRIDGE-007: Extend orderStates.ts with Phase B states",
    description: "Type: Code Modification\nPriority: P0\nDepends On: BRIDGE-006\nEpic: Bridge - State Machine\n\nDescription:\nExtend EXISTING orderStates.ts with Phase B state configs.\n\nExisting File: src/lib/orderStates.ts\n\nAdd to OrderState enum:\n```typescript\nS20 = 'S20',\nS21 = 'S21',\nS22 = 'S22',\nS23 = 'S23',\nS24 = 'S24',\nS25 = 'S25',\nS26 = 'S26',\n```\n\nAdd to ORDER_STATE_CONFIG:\n```typescript\n[OrderState.S20]: {\n  label: 'Flight Manifest',\n  color: '#4169E1', // Blue\n  description: 'Added to charter flight manifest',\n},\n[OrderState.S21]: {\n  label: 'In Flight',\n  color: '#87CEEB', // Sky blue\n  description: 'On charter flight ATQ to UAE',\n},\n// ... S22-S26\n```\n\nAcceptance Criteria:\n- All 26 states in enum\n- Colors follow risk scheme (blues for logistics)\n- Descriptions accurate"
  },
  {
    title: "BRIDGE-008: Add track-aware transition logic",
    description: "Type: Code Modification\nPriority: P1\nDepends On: BRIDGE-007\nEpic: Bridge - State Machine\n\nDescription:\nAdd track-aware logic to state transitions.\n\nExisting File: src/lib/orders/state-machine.ts\n\nNew Function:\n```typescript\nexport function getValidNextStatesForTrack(\n  currentState: string,\n  track: 'A' | 'B'\n): string[] {\n  const allValid = STATE_TRANSITIONS[currentState] || [];\n  \n  // At branch point S18\n  if (currentState === 'S18_HANDED_TO_LOGISTICS') {\n    if (track === 'A') return ['S19_LOCAL_SHIPPED'];\n    if (track === 'B') return ['S20_FLIGHT_MANIFEST'];\n  }\n  \n  return allValid;\n}\n```\n\nAcceptance Criteria:\n- Track A orders can't go to S20\n- Track B orders can't go to S19\n- API respects track routing"
  },

  // ==================== BRIDGE EPIC: API EXTENSION ====================
  {
    title: "BRIDGE-009: Extend /api/orders/[id]/state for S20-S26",
    description: "Type: Code Modification\nPriority: P0\nDepends On: BRIDGE-008\nEpic: Bridge - API Extension\n\nDescription:\nExtend EXISTING state transition API to handle logistics states.\n\nExisting File: src/app/api/orders/[id]/state/route.ts\n\nModifications:\n1. Import extended state machine\n2. Add track-aware validation\n3. Trigger logistics side effects for S20-S26\n\nSide Effects to Add:\n- S20: Create flight manifest entry\n- S21: Update flight status\n- S22: Trigger customs notification\n- S24: Run VRPTW, assign van\n- S26: Trigger delivery confirmation, tailor payout\n\nAcceptance Criteria:\n- Existing S01-S19 transitions work\n- S20-S26 transitions work for Track B\n- Side effects trigger correctly"
  },
  {
    title: "BRIDGE-010: Extend /api/orders/[id]/valid-transitions for track",
    description: "Type: Code Modification\nPriority: P1\nDepends On: BRIDGE-009\nEpic: Bridge - API Extension\n\nDescription:\nExtend EXISTING valid-transitions API to respect track.\n\nExisting File: src/app/api/orders/[id]/valid-transitions/route.ts\n\nModifications:\n1. Fetch order.track from database\n2. Use getValidNextStatesForTrack() instead of getValidNextStates()\n3. Return track-appropriate options\n\nAcceptance Criteria:\n- Track A orders show S19 at S18\n- Track B orders show S20 at S18\n- Frontend displays correct options"
  },
  {
    title: "BRIDGE-011: Create /api/logistics namespace with base routes",
    description: "Type: New Code\nPriority: P0\nDepends On: BRIDGE-005\nEpic: Bridge - API Extension\n\nDescription:\nCreate new logistics API namespace following existing patterns.\n\nNew Directory: src/app/api/logistics/\n\nNew Files:\n1. tailors/route.ts - CRUD for tailors\n2. flights/route.ts - CRUD for flights\n3. vans/route.ts - CRUD for vans\n4. qc-stations/route.ts - CRUD for QC stations\n\nFollow existing patterns from:\n- src/app/api/orders/route.ts\n- src/app/api/fabrics/route.ts\n\nAcceptance Criteria:\n- All CRUD endpoints work\n- Proper error handling\n- TypeScript types defined"
  },
  {
    title: "BRIDGE-012: Create /api/logistics/assign-tailors endpoint",
    description: "Type: New Code\nPriority: P0\nDepends On: BRIDGE-011, TASK-PB-OPT-001\nEpic: Bridge - API Extension\n\nDescription:\nCreate tailor assignment endpoint using existing Prisma client.\n\nNew File: src/app/api/logistics/assign-tailors/route.ts\n\nEndpoint: POST /api/logistics/assign-tailors\nInput: { orderItemId: string }\nOutput: { primaryTailor: Tailor, backupTailor: Tailor }\n\nLogic:\n1. Get orderItem with suitConfig\n2. Find tailors with matching fabric, <10min to QC\n3. Score by: qcPassRate, currentLoad, distance\n4. Assign top 2 as primary/backup\n5. Update orderItem with tailorIds\n6. Create SuitTimeline entry\n\nAcceptance Criteria:\n- Dual assignment works\n- Uses existing Prisma client\n- Returns both tailors"
  },

  // ==================== BRIDGE EPIC: VAPI EXTENSION ====================
  {
    title: "BRIDGE-013: Extend vapi-client.ts for tailor calls",
    description: "Type: Code Modification\nPriority: P1\nDepends On: Existing src/lib/vapi-client.ts\nEpic: Bridge - VAPI Extension\n\nDescription:\nExtend EXISTING VAPI client with tailor-specific call functions.\n\nExisting File: src/lib/vapi-client.ts\n\nNew Functions to Add:\n```typescript\nexport async function callTailorsParallel(\n  tailorIds: string[],\n  suitDetails: SuitDetails\n): Promise<CallResult[]>\n\nexport async function callTailorForRework(\n  tailorId: string,\n  reworkDetails: ReworkDetails\n): Promise<CallResult>\n\nexport async function callCustomerDeliveryUpdate(\n  customerId: string,\n  deliveryEta: Date\n): Promise<CallResult>\n```\n\nAcceptance Criteria:\n- Existing VAPI functions unchanged\n- New functions use same VAPI instance\n- Parallel calls work (Promise.all)"
  },
  {
    title: "BRIDGE-014: Create VAPI prompt for tailor assignment",
    description: "Type: Configuration\nPriority: P1\nDepends On: BRIDGE-013\nEpic: Bridge - VAPI Extension\n\nDescription:\nCreate VAPI conversation flow for tailor job offers.\n\nExisting Pattern: src/lib/vapi-llm-config.ts\n\nNew Config:\n```typescript\nexport const TAILOR_ASSIGNMENT_PROMPT = {\n  systemPrompt: `You are calling a tailor about a suit job.\n  Speak in Hindi/Punjabi. Be respectful.\n  Explain: suit type, fabric, deadline, payment (INR 8,500).\n  Ask if they can accept. If yes, confirm and end.\n  If no, thank them and end.`,\n  \n  firstMessage: 'Namaste, {tailorName} ji. Same Day Suits se bol raha hoon...',\n  \n  extractionSchema: {\n    accepted: 'boolean',\n    reason: 'string?',\n    estimatedCompletionHours: 'number?'\n  }\n};\n```\n\nAcceptance Criteria:\n- Hindi/Punjabi script natural\n- Extracts acceptance decision\n- Times out after 60s"
  },

  // ==================== BRIDGE EPIC: DASHBOARD EXTENSION ====================
  {
    title: "BRIDGE-015: Extend OrderStateFilter with S20-S26",
    description: "Type: Code Modification\nPriority: P1\nDepends On: BRIDGE-007\nEpic: Bridge - Dashboard\n\nDescription:\nExtend EXISTING OrderStateFilter component with logistics states.\n\nExisting File: src/components/OrderStateFilter.tsx\n\nModifications:\n1. Import extended OrderState enum\n2. Add filter group for 'Logistics' states\n3. Show S20-S26 in filter dropdown\n4. Add color-coded badges\n\nAcceptance Criteria:\n- All 26 states visible in filter\n- Grouped: Manufacturing (S01-S19), Logistics (S20-S26)\n- Colors match ORDER_STATE_CONFIG"
  },
  {
    title: "BRIDGE-016: Extend OrderStateActions with logistics actions",
    description: "Type: Code Modification\nPriority: P1\nDepends On: BRIDGE-015\nEpic: Bridge - Dashboard\n\nDescription:\nExtend EXISTING OrderStateActions component for logistics.\n\nExisting File: src/components/admin/OrderStateActions.tsx\n\nModifications:\n1. Add logistics-specific action buttons\n2. Show 'Add to Flight' button at S20\n3. Show 'Assign Van' button at S24\n4. Show 'Confirm Delivery' button at S25\n\nAcceptance Criteria:\n- Existing actions unchanged\n- New buttons appear at correct states\n- Actions call correct API endpoints"
  },
  {
    title: "BRIDGE-017: Create /admin/logistics dashboard page",
    description: "Type: New Code\nPriority: P1\nDepends On: BRIDGE-016\nEpic: Bridge - Dashboard\n\nDescription:\nCreate new logistics dashboard following existing admin patterns.\n\nExisting Pattern: src/app/admin/orders/page.tsx\n\nNew File: src/app/admin/logistics/page.tsx\n\nFeatures:\n1. Track B orders list with risk colors\n2. Active flights panel\n3. Van status panel\n4. QC station status\n\nUse existing components:\n- Layout from admin pages\n- DataTable patterns\n- State badges\n\nAcceptance Criteria:\n- Matches existing admin style\n- Shows Track B orders only\n- Real-time updates (SSE)"
  },

  // ==================== BRIDGE EPIC: SEED DATA ====================
  {
    title: "BRIDGE-018: Create Phase B seed script",
    description: "Type: New Code\nPriority: P1\nDepends On: BRIDGE-005\nEpic: Bridge - Seed Data\n\nDescription:\nCreate seed script for Phase B test data.\n\nExisting Pattern: prisma/seed.ts or seed.js\n\nNew File: prisma/seed-phase-b.ts\n\nSeed Data:\n1. 20 tailors in Amritsar zones\n2. 5 QC stations\n3. 3 vans in UAE\n4. 1 sample flight\n5. 2 sample Track B orders\n\nAcceptance Criteria:\n- Script runs without errors\n- Data visible in Prisma Studio\n- Test orders can transition through S20-S26"
  }
];

async function main() {
  console.log('Creating V4B → Phase B Bridging Tasks...');
  console.log('Project ID:', PROJECT_ID);
  console.log('Total tasks:', bridgingTasks.length);
  console.log('');

  let created = 0;
  let failed = 0;

  for (const task of bridgingTasks) {
    try {
      const response = await fetch(API_BASE + '/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: PROJECT_ID,
          title: task.title,
          description: task.description,
          status: 'todo'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('FAILED:', task.title);
        console.log('  Error:', error);
        failed++;
      } else {
        console.log('CREATED:', task.title);
        created++;
      }
    } catch (err) {
      console.log('ERROR:', task.title);
      console.log('  ', err.message);
      failed++;
    }
  }

  console.log('');
  console.log('=== SUMMARY ===');
  console.log('Created:', created);
  console.log('Failed:', failed);
}

main().catch(console.error);
