/**
 * Create Phase B Tasks in Vibe Kanban
 * Uses simple string concatenation to avoid template literal issues
 */

const PROJECT_ID = 'e9f51260-db58-4e17-b0a8-7ad898206bf5';
const API_BASE = 'http://127.0.0.1:63846/api';

// Define tasks with simple objects
const tasks = [
  // EPIC 1: DATABASE EXTENSION
  {
    title: "TASK-PB-DB-001: Extend suits table with logistics fields",
    description: "Type: Database Migration\nPriority: P0\nDepends On: Existing suits table from v4b\nEpic: 1 - Database Extension\n\nDescription:\nExtend existing suits table with logistics tracking fields for Dubai delivery.\n\nImplementation Details:\n- Add dual production fields: is_backup, primary_suit_id\n- Add 24 status states (S01-S24)\n- Add location tracking fields\n- Add risk_score (0-1), risk_factors JSONB\n- Add deadline, estimated_delivery, actual_delivery\n\nAcceptance Criteria:\n- Migration runs without errors\n- All 24 status states can be stored\n- Backup suit linking works\n- Risk score updates in real-time"
  },
  {
    title: "TASK-PB-DB-002: Create suit_timeline table",
    description: "Type: Database Migration\nPriority: P0\nDepends On: TASK-PB-DB-001\nEpic: 1 - Database Extension\n\nDescription:\nCreate table to track every suit state transition with full audit trail.\n\nImplementation Details:\n- suit_id FK, previous_state, new_state\n- changed_at timestamp, changed_by\n- location_at_change, coordinates\n- reason (assignment, qc_pass, qc_fail, etc)\n\nAcceptance Criteria:\n- Timeline tracks all 24 state transitions\n- Location recorded at each change\n- Query suits by state history"
  },
  {
    title: "TASK-PB-DB-003: Create tailors table",
    description: "Type: Database Migration\nPriority: P0\nDepends On: None\nEpic: 1 - Database Extension\n\nDescription:\nCreate tailors table for Amritsar workshop network.\n\nImplementation Details:\n- Profile: name, phone (WhatsApp), workshop_coordinates, zone_id\n- Capacity: max_concurrent_jobs (default 2), current_job_count\n- Skills: skill_level enum, fabric_variants_in_stock\n- Performance: total_jobs_completed, qc_pass_rate, avg_production_time\n- Payment: upi_vpa for INR 8,500 payouts\n\nAcceptance Criteria:\n- Tailor profiles with UPI details\n- QC pass rate stored as decimal\n- Distance to QC station tracked"
  },
  {
    title: "TASK-PB-DB-004: Create tailor_assignments table",
    description: "Type: Database Migration\nPriority: P0\nDepends On: TASK-PB-DB-001, TASK-PB-DB-003\nEpic: 1 - Database Extension\n\nDescription:\nTrack suit-to-tailor assignments for dual production model.\n\nImplementation Details:\n- suit_id FK, tailor_id FK, is_primary boolean\n- assigned_at, accepted_at, started_at, completed_at\n- payment_status enum, payment_id (Razorpay)\n\nAcceptance Criteria:\n- Two tailors can be assigned per suit\n- Primary/backup clearly marked\n- Payment tracking integrated"
  },
  {
    title: "TASK-PB-DB-005: Create qc_stations table",
    description: "Type: Database Migration\nPriority: P0\nDepends On: None\nEpic: 1 - Database Extension\n\nDescription:\nCreate QC stations table for 10-minute proximity zones.\n\nImplementation Details:\n- station_id, name, coordinates\n- zone_id, zone_radius_meters (10 min walking)\n- inspector_count, capacity_per_hour\n- operating_hours JSONB\n\nAcceptance Criteria:\n- QC stations have location data\n- Zone radius configured\n- Operating hours stored"
  },
  {
    title: "TASK-PB-DB-006: Create flights table",
    description: "Type: Database Migration\nPriority: P0\nDepends On: None\nEpic: 1 - Database Extension\n\nDescription:\nCreate flights table for Saab 340F charter logistics.\n\nImplementation Details:\n- flight_id, aircraft_type (Saab 340F)\n- departure_airport, arrival_airport(s) array for multi-stop\n- scheduled_departure, actual_departure\n- status enum, cargo_manifest_id\n- cost_gbp, suits_on_board count\n\nAcceptance Criteria:\n- Multi-stop flights supported (ATQ->MCT->AUH->SHJ)\n- Cost tracking per flight\n- Suit count on manifest"
  },
  {
    title: "TASK-PB-DB-007: Create vans table",
    description: "Type: Database Migration\nPriority: P0\nDepends On: None\nEpic: 1 - Database Extension\n\nDescription:\nCreate UAE ground fleet management table.\n\nImplementation Details:\n- van_id, driver_name, driver_phone\n- current_location, current_route_id\n- capacity (suits), current_load\n- status enum (available, en_route, delivering)\n\nAcceptance Criteria:\n- Van locations tracked\n- Capacity management works\n- Driver contact stored"
  },
  {
    title: "TASK-PB-DB-008: Create deliveries table",
    description: "Type: Database Migration\nPriority: P1\nDepends On: TASK-PB-DB-001, TASK-PB-DB-007\nEpic: 1 - Database Extension\n\nDescription:\nTrack last-mile delivery to customers in UAE.\n\nImplementation Details:\n- delivery_id, suit_id FK, van_id FK\n- customer_address, customer_coordinates\n- scheduled_window_start/end\n- actual_arrival, delivery_status\n- signature_image_url, photo_proof_url\n\nAcceptance Criteria:\n- Time windows enforced\n- Photo proof captured\n- Delivery confirmation stored"
  },

  // EPIC 2: OPTIMIZATION ALGORITHMS
  {
    title: "TASK-PB-OPT-001: Implement tailor assignment algorithm",
    description: "Type: Algorithm\nPriority: P0\nDepends On: TASK-PB-DB-003, TASK-PB-DB-004\nEpic: 2 - Optimization Algorithms\n\nDescription:\nImplement optimal tailor selection for dual production model.\n\nImplementation Details:\n- Score tailors by: distance to QC (<10min = +50pts)\n- Factor in: skill level, QC pass rate, current load\n- Select top 2 tailors, mark primary/backup\n- Handle fabric variant availability\n\nAcceptance Criteria:\n- Dual assignment in <500ms\n- QC proximity prioritized\n- Load balancing works"
  },
  {
    title: "TASK-PB-OPT-002: Implement VRPTW solver",
    description: "Type: Algorithm\nPriority: P0\nDepends On: TASK-PB-DB-007, TASK-PB-DB-008\nEpic: 2 - Optimization Algorithms\n\nDescription:\nVehicle Routing Problem with Time Windows for UAE delivery.\n\nImplementation Details:\n- Input: delivery addresses, time windows, van capacities\n- Optimize: minimize total distance while meeting windows\n- Use OR-Tools or similar solver\n- Output: route per van with ETAs\n\nAcceptance Criteria:\n- Routes computed in <5s for 50 deliveries\n- Time windows respected\n- Van capacity not exceeded"
  },
  {
    title: "TASK-PB-OPT-003: Implement risk scoring engine",
    description: "Type: Algorithm\nPriority: P0\nDepends On: TASK-PB-DB-001, TASK-PB-DB-002\nEpic: 2 - Optimization Algorithms\n\nDescription:\nReal-time composite risk score (0-1) for each suit.\n\nImplementation Details:\n- Factors: time_remaining/deadline_ratio, current_state progress\n- Factor: tailor QC history, distance to next checkpoint\n- Weights configurable per factor\n- Thresholds: green <0.3, amber 0.3-0.6, red 0.6-0.8, critical >0.8\n\nAcceptance Criteria:\n- Score computed on each state change\n- Dashboard shows color-coded risks\n- Alerts fire at critical threshold"
  },
  {
    title: "TASK-PB-OPT-004: Implement hub selection algorithm",
    description: "Type: Algorithm\nPriority: P1\nDepends On: TASK-PB-DB-006\nEpic: 2 - Optimization Algorithms\n\nDescription:\nDynamic hub selection: single-hub SHJ vs dual-drop routing.\n\nImplementation Details:\n- Count suits by destination emirate\n- If Abu Dhabi >40%: use dual-drop (ATQ->MCT->AUH->SHJ)\n- Otherwise: single-hub SHJ\n- Calculate cost difference (GBP 17k vs 20k)\n\nAcceptance Criteria:\n- Automatic hub recommendation\n- Cost comparison displayed\n- Manual override available"
  },

  // EPIC 3: REAL-TIME EVENTS
  {
    title: "TASK-PB-RT-001: Implement WebSocket event bus",
    description: "Type: Infrastructure\nPriority: P0\nDepends On: None\nEpic: 3 - Real-Time Events\n\nDescription:\nReal-time event bus for suit state changes.\n\nImplementation Details:\n- WebSocket server on existing Next.js app\n- Events: suit.state_changed, suit.risk_updated\n- Events: tailor.assigned, qc.passed, qc.failed\n- Client subscription by suit_id or all\n\nAcceptance Criteria:\n- Events broadcast <100ms after change\n- Clients reconnect automatically\n- Event replay on reconnect"
  },
  {
    title: "TASK-PB-RT-002: Implement SSE for dashboard",
    description: "Type: Infrastructure\nPriority: P1\nDepends On: TASK-PB-RT-001\nEpic: 3 - Real-Time Events\n\nDescription:\nServer-Sent Events for web dashboard updates.\n\nImplementation Details:\n- SSE endpoint /api/events/dashboard\n- Stream suit status changes, risk updates\n- Filter by emirate, risk level\n- Heartbeat every 30s\n\nAcceptance Criteria:\n- Dashboard updates without refresh\n- Filtering works\n- Connection stable for hours"
  },

  // EPIC 4: VAPI VOICE AI
  {
    title: "TASK-PB-VAPI-001: Implement VAPI parallel dialer",
    description: "Type: Integration\nPriority: P0\nDepends On: TASK-PB-DB-003\nEpic: 4 - VAPI Voice AI\n\nDescription:\nParallel VAPI calls to 20 tailors simultaneously.\n\nImplementation Details:\n- Trigger: suit unclaimed after 10 minutes\n- Call 20 nearest tailors with availability\n- VAPI script: suit details, deadline, payment\n- First to accept gets assignment\n\nAcceptance Criteria:\n- 20 calls initiated within 5s\n- First accept wins (race condition handled)\n- Others get cancellation call"
  },
  {
    title: "TASK-PB-VAPI-002: Implement escalation call flows",
    description: "Type: Integration\nPriority: P1\nDepends On: TASK-PB-VAPI-001\nEpic: 4 - VAPI Voice AI\n\nDescription:\nVoice escalation for risk conditions.\n\nImplementation Details:\n- Risk >0.8: call ops team with suit details\n- QC fail: call tailor with rework instructions\n- Delivery delay: call customer with update\n- Record all calls for audit\n\nAcceptance Criteria:\n- Escalation calls trigger automatically\n- Call recordings stored\n- Transcripts available"
  },

  // EPIC 5: LOGISTICS APIs
  {
    title: "TASK-PB-API-001: POST /api/logistics/assign-tailors",
    description: "Type: API Endpoint\nPriority: P0\nDepends On: TASK-PB-OPT-001\nEpic: 5 - Logistics APIs\n\nDescription:\nAPI to trigger dual tailor assignment.\n\nImplementation Details:\n- Input: suit_id\n- Runs tailor assignment algorithm\n- Creates two tailor_assignments records\n- Triggers VAPI confirmation calls\n- Returns: primary_tailor, backup_tailor\n\nAcceptance Criteria:\n- Returns within 2s\n- Both tailors assigned\n- Confirmation calls triggered"
  },
  {
    title: "TASK-PB-API-002: POST /api/logistics/qc-result",
    description: "Type: API Endpoint\nPriority: P0\nDepends On: TASK-PB-DB-002\nEpic: 5 - Logistics APIs\n\nDescription:\nQC station records pass/fail result.\n\nImplementation Details:\n- Input: suit_id, station_id, result (pass/fail), notes, images[]\n- Update suit state to S08 (pass) or S07 (fail)\n- If fail: trigger VAPI rework call to tailor\n- Update tailor qc_pass_rate\n\nAcceptance Criteria:\n- State transition recorded\n- Tailor stats updated\n- Rework flow triggers on fail"
  },
  {
    title: "TASK-PB-API-003: GET /api/logistics/routes",
    description: "Type: API Endpoint\nPriority: P0\nDepends On: TASK-PB-OPT-002\nEpic: 5 - Logistics APIs\n\nDescription:\nGet optimized delivery routes for UAE vans.\n\nImplementation Details:\n- Input: date, emirate (optional)\n- Runs VRPTW solver\n- Returns: routes[] with van_id, stops[], ETAs\n\nAcceptance Criteria:\n- Routes computed in <10s\n- ETAs accurate to 15 min\n- Capacity constraints met"
  },
  {
    title: "TASK-PB-API-004: POST /api/logistics/delivery-confirmed",
    description: "Type: API Endpoint\nPriority: P1\nDepends On: TASK-PB-DB-008\nEpic: 5 - Logistics APIs\n\nDescription:\nRecord successful delivery with proof.\n\nImplementation Details:\n- Input: delivery_id, signature_image, photo_proof, notes\n- Update suit state to S24 (delivered)\n- Trigger payment release to tailors\n- Send customer confirmation\n\nAcceptance Criteria:\n- Delivery recorded with proof\n- Tailor payment triggered\n- Customer notified"
  },

  // EPIC 6: MOBILE APPS
  {
    title: "TASK-PB-MOB-001: Tailor WhatsApp bot integration",
    description: "Type: Mobile Integration\nPriority: P0\nDepends On: TASK-PB-API-001\nEpic: 6 - Mobile Apps\n\nDescription:\nWhatsApp bot for tailor job management.\n\nImplementation Details:\n- WhatsApp Business API integration\n- Commands: /jobs, /accept [id], /complete [id], /photo [id]\n- Push notifications for new assignments\n- Photo upload for completion proof\n\nAcceptance Criteria:\n- Tailors receive job alerts\n- Can accept/complete via WhatsApp\n- Photos upload successfully"
  },
  {
    title: "TASK-PB-MOB-002: Driver mobile app (React Native)",
    description: "Type: Mobile App\nPriority: P1\nDepends On: TASK-PB-API-003\nEpic: 6 - Mobile Apps\n\nDescription:\nReact Native app for UAE delivery drivers.\n\nImplementation Details:\n- Login, today's route view\n- Turn-by-turn navigation integration\n- Delivery confirmation with photo/signature\n- Real-time location sharing\n\nAcceptance Criteria:\n- Route displayed on map\n- Navigation launches\n- Delivery confirmation works"
  },

  // EPIC 7: WEB DASHBOARD
  {
    title: "TASK-PB-DASH-001: Operations dashboard - suit tracker",
    description: "Type: Frontend\nPriority: P0\nDepends On: TASK-PB-RT-002\nEpic: 7 - Web Dashboard\n\nDescription:\nReal-time suit tracking dashboard for ops team.\n\nImplementation Details:\n- List view: all suits with state, risk color\n- Filter: by state, risk level, deadline\n- Click suit: detailed timeline view\n- Auto-refresh via SSE\n\nAcceptance Criteria:\n- Shows all active suits\n- Risk colors accurate\n- Updates without refresh"
  },
  {
    title: "TASK-PB-DASH-002: Operations dashboard - map view",
    description: "Type: Frontend\nPriority: P1\nDepends On: TASK-PB-DASH-001\nEpic: 7 - Web Dashboard\n\nDescription:\nMap view showing suit and van locations.\n\nImplementation Details:\n- Mapbox/Google Maps integration\n- Suit pins colored by risk\n- Van icons with current route\n- Click for details popup\n\nAcceptance Criteria:\n- Map loads quickly\n- Pins update in real-time\n- Routes displayed"
  },
  {
    title: "TASK-PB-DASH-003: Charter flight booking interface",
    description: "Type: Frontend\nPriority: P1\nDepends On: TASK-PB-OPT-004\nEpic: 7 - Web Dashboard\n\nDescription:\nInterface to book charter flights based on demand.\n\nImplementation Details:\n- Show pending suits for next flight\n- Hub recommendation with cost comparison\n- One-click booking confirmation\n- Manifest generation\n\nAcceptance Criteria:\n- Demand visible\n- Hub recommendation shown\n- Booking triggers flight creation"
  },

  // EPIC 8: FINANCIAL INTEGRATION
  {
    title: "TASK-PB-FIN-001: Razorpay UPI payout integration",
    description: "Type: Integration\nPriority: P0\nDepends On: TASK-PB-DB-004\nEpic: 8 - Financial Integration\n\nDescription:\nAutomatic INR 8,500 payout to tailors on completion.\n\nImplementation Details:\n- Razorpay Route API for payouts\n- Trigger: suit reaches S08 (QC passed)\n- Payout to tailor.upi_vpa\n- Record payment_id in tailor_assignments\n\nAcceptance Criteria:\n- Payout triggers automatically\n- UPI transfer completes\n- Payment recorded"
  },
  {
    title: "TASK-PB-FIN-002: Commission calculation service",
    description: "Type: Backend Service\nPriority: P1\nDepends On: TASK-PB-FIN-001\nEpic: 8 - Financial Integration\n\nDescription:\nCalculate commissions per Raja Exclusive model.\n\nImplementation Details:\n- Wedding planner: 10% of GBP 1,500 gross = GBP 150\n- Ops (Amritsar): 5% of net after tax, quarterly\n- Track per-suit and aggregate\n\nAcceptance Criteria:\n- Commission calculated per sale\n- Quarterly reports generated\n- Payout triggers quarterly"
  },

  // EPIC 9: CHARTER LOGISTICS
  {
    title: "TASK-PB-CHARTER-001: Flight manifest generation",
    description: "Type: Backend Service\nPriority: P0\nDepends On: TASK-PB-DB-006\nEpic: 9 - Charter Logistics\n\nDescription:\nGenerate cargo manifest for Saab 340F flights.\n\nImplementation Details:\n- Group suits by flight\n- Generate PDF manifest with suit IDs, weights\n- Include customs documentation\n- Email to charter company\n\nAcceptance Criteria:\n- Manifest PDF generated\n- All suit IDs listed\n- Customs docs included"
  },
  {
    title: "TASK-PB-CHARTER-002: Flight status tracking integration",
    description: "Type: Integration\nPriority: P1\nDepends On: TASK-PB-CHARTER-001\nEpic: 9 - Charter Logistics\n\nDescription:\nTrack charter flight status from provider.\n\nImplementation Details:\n- Webhook or polling for flight updates\n- Update flight status in DB\n- Trigger events: departed, landed\n- Update all suit states on flight\n\nAcceptance Criteria:\n- Flight status tracked\n- Suit states update on landing\n- Delays visible in dashboard"
  },
  {
    title: "TASK-PB-CHARTER-003: Van dispatch on arrival",
    description: "Type: Backend Service\nPriority: P0\nDepends On: TASK-PB-CHARTER-002, TASK-PB-OPT-002\nEpic: 9 - Charter Logistics\n\nDescription:\nAutomatic van dispatch when flight lands.\n\nImplementation Details:\n- Trigger: flight.status = landed\n- Run VRPTW for suits on flight\n- Assign vans to routes\n- Notify drivers via app\n\nAcceptance Criteria:\n- Routes computed on landing\n- Drivers notified\n- Van loading tracked"
  },

  // EPIC 10: TESTING
  {
    title: "TASK-PB-TEST-001: Integration tests for logistics flow",
    description: "Type: Testing\nPriority: P1\nDepends On: All P0 tasks\nEpic: 10 - Testing\n\nDescription:\nEnd-to-end tests for full logistics pipeline.\n\nImplementation Details:\n- Test: order -> tailor assignment -> production -> QC -> flight -> delivery\n- Mock external services (VAPI, Razorpay)\n- Assert state transitions correct\n- Assert payments triggered\n\nAcceptance Criteria:\n- Full flow test passes\n- All states covered\n- Edge cases tested"
  },
  {
    title: "TASK-PB-TEST-002: Load testing for 200 suits/day",
    description: "Type: Testing\nPriority: P2\nDepends On: TASK-PB-TEST-001\nEpic: 10 - Testing\n\nDescription:\nLoad test system with target throughput.\n\nImplementation Details:\n- Simulate 200 concurrent suits\n- Measure: API response times, DB queries\n- Identify bottlenecks\n- Optimize as needed\n\nAcceptance Criteria:\n- System handles 200 suits\n- API responses <500ms at load\n- No memory leaks"
  }
];

// Main execution
async function main() {
  console.log('Creating Phase B tasks in Vibe Kanban...');
  console.log('Project ID:', PROJECT_ID);
  console.log('API Base:', API_BASE);
  console.log('Total tasks:', tasks.length);
  console.log('');

  let created = 0;
  let failed = 0;

  for (const task of tasks) {
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
        const result = await response.json();
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
