# SUIT AI v4.b - Phase B Vibe Kanban Task List
## Dubai 24-Hour Delivery Logistics System - Atomic Tasks

**Generated:** 2026-01-20
**Source:** PHAZE-B folder analysis (VIBEKANBAN-SUIT-AI-LOGISTICS.md, Claude-Raja exclusive.md, Claude-Suit sales break-even for charter flights.md)

---

# TASK HIERARCHY

```
EPIC (Major Feature Area)
  └── STORY (User-facing capability)
        └── TASK (Atomic implementation unit)
```

---

# EPIC 1: DATABASE & CORE INFRASTRUCTURE
**Priority:** P0 - Foundation
**Dependencies:** None
**Description:** Core database schema and infrastructure for the logistics orchestration engine

---

## Story 1.1: Core Entity Tables
**Points:** 13
**Dependencies:** None

### TASK-DB-001: Create customers table
- **Type:** Database
- **Priority:** P0
- **Depends On:** None
- **Blocks:** TASK-DB-002
- **Description:** Create customers table with identity, contact, and communication preferences
- **Implementation Details:**
  - UUID primary key
  - Fields: first_name, last_name, email (unique), phone, phone_country_code
  - Communication prefs: preferred_language, whatsapp_enabled, sms_enabled
  - Email validation constraint
  - Indexes on email and phone
- **Acceptance Criteria:**
  - Table created with UUID primary key
  - Email uniqueness enforced
  - Phone number with country code stored
  - Language preference defaults to 'en'
- **Definition of Done:** Migration runs, table accessible via Supabase client

### TASK-DB-002: Create orders table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-001
- **Blocks:** TASK-DB-003
- **Description:** Create orders table linking customers to destinations with payment tracking
- **Implementation Details:**
  - UUID primary key, human-readable order_number (ORD-2026-01-19-0001)
  - Foreign key to customers
  - Destination fields: hotel_id, address, zone_id, coordinates, delivery_notes
  - Timing: ordered_at, deadline (24hr from order)
  - Payment: status, captured_at, stripe_payment_intent_id, total_amount_aed
  - Status enum: pending_payment, paid, in_production, shipped, delivered, cancelled
- **Acceptance Criteria:**
  - Human-readable order numbers generated sequentially per day
  - Foreign key to customers validated
  - 24-hour deadline auto-calculated from order time
  - Payment status tracks Stripe integration
- **Definition of Done:** Migration runs, foreign keys validated

### TASK-DB-003: Create suits table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-002
- **Blocks:** TASK-DB-004, TASK-DB-006
- **Description:** Create suits table as central tracking entity with state machine
- **Implementation Details:**
  - UUID primary key, human-readable suit_number (SUIT-2026-01-19-0847)
  - Foreign key to orders
  - Dual production support: is_backup, primary_suit_id (self-reference)
  - State tracking: status enum (17 states), current_location_type, current_location_id, current_coordinates
  - Risk tracking: risk_score (0-1), risk_factors JSONB
  - Timing: deadline, estimated_delivery, actual_delivery
- **Status States:**
  1. S01_ORDER_PLACED
  2. S02_PAYMENT_CAPTURED
  3. S03_SCAN_RECEIVED
  4. S04_PATTERN_GENERATING
  5. S05_PATTERN_READY
  6. S06_PLOTTING_QUEUED
  7. S07_PATTERN_CUT
  8. S08_JOB_POSTED
  9. S09_TAILOR_CLAIMED
  10. S10_DISPATCHED_TO_TAILOR
  11. S11_IN_TRANSIT_TO_TAILOR
  12. S12_WITH_TAILOR
  13. S13_IN_PRODUCTION
  14. S14_PRODUCTION_COMPLETE
  15. S15_QC_IN_PROGRESS
  16. S16_QC_PASSED
  17. S17_QC_FAILED
  18. S18_AT_HQ
  19. S19_PACKED
  20. S20_IN_TRANSIT_AIR
  21. S21_CUSTOMS_CLEARING
  22. S22_CUSTOMS_CLEARED
  23. S23_OUT_FOR_DELIVERY
  24. S24_DELIVERED
- **Acceptance Criteria:**
  - All 24 status states validated
  - Backup suit linking works (dual production)
  - Risk score updates tracked
  - Coordinates stored as POINT type
- **Definition of Done:** All status states validated, backup suit linking works

### TASK-DB-004: Create suit_timeline table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-EVT-001
- **Description:** Create timeline event log for complete suit journey tracking
- **Implementation Details:**
  - UUID primary key, foreign key to suits
  - Event details: event_type enum (24+ types), from_status, to_status
  - Location: location_type, location_id, coordinates
  - Actor: actor_type (system, tailor, inspector, driver, admin), actor_id
  - Metadata: JSONB, notes
  - Timing: occurred_at, recorded_at
- **Acceptance Criteria:**
  - Events can be appended immutably
  - Full journey reconstructable from timeline
  - Actor tracking for audit
- **Definition of Done:** Events can be appended, queried by suit

---

## Story 1.2: Production Tables
**Points:** 8
**Dependencies:** Story 1.1

### TASK-DB-005: Create tailors table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-DB-006, TASK-OPT-006
- **Description:** Create tailors table with location, capacity, skills, and performance metrics
- **Implementation Details:**
  - UUID primary key, identity fields (name, phone, email)
  - Location: workshop_address, workshop_coordinates (POINT), zone_id, distance_to_qc_station_meters (10 min max in new facility)
  - Capacity: max_concurrent_jobs (default 2), current_job_count
  - Skills: skill_level enum (apprentice, journeyman, master), fabric_variants_in_stock array
  - Performance: total_jobs_completed, qc_pass_rate (decimal), avg_production_time_minutes
  - Status: active, unavailable, suspended
  - Payment: upi_vpa (Virtual Payment Address)
- **Acceptance Criteria:**
  - Tailor profiles created with UPI details
  - QC pass rate calculated and stored
  - Distance to QC station tracked for routing
- **Definition of Done:** Tailor profiles can be created and queried

### TASK-DB-006: Create tailor_assignments table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-003, TASK-DB-005
- **Blocks:** TASK-OPT-008
- **Description:** Create assignment junction tracking suit-to-tailor relationships for dual production
- **Implementation Details:**
  - UUID primary key, foreign keys to suits and tailors
  - assignment_type: 'primary' or 'backup' (dual production model)
  - Status enum: pending, claimed, in_production, completed, abandoned, reassigned
  - Timing: posted_at, claimed_at, production_started_at, production_completed_at
  - SLA: sla_deadline, sla_breached boolean
  - Payout: payout_amount_inr (8500), payout_status, payout_transaction_id
- **Acceptance Criteria:**
  - Two assignments can exist per suit (primary + backup)
  - Payout tracks INR 8,500 per suit
  - SLA breach flagged automatically
- **Definition of Done:** Dual assignments can be created for single suit

### TASK-DB-007: Create qc_inspections table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-006
- **Blocks:** TASK-API-009
- **Description:** Create QC inspection records with scoring and evidence
- **Implementation Details:**
  - UUID primary key, foreign keys to suit, tailor_assignment, inspector
  - Timing: requested_at, started_at, completed_at
  - Result enum: pass, fail, conditional_pass
  - Scores: visual (1-5), measurement (1-5), construction (1-5), finishing (1-5), overall_score
  - Issues JSONB array: [{category, description, severity, photo_url}]
  - Evidence: photos JSONB array, inspector_notes
- **Acceptance Criteria:**
  - QC records with photos stored
  - Pass/fail triggers next workflow
  - Issues documented for tailor feedback
- **Definition of Done:** QC records with photos can be stored and queried

---

## Story 1.3: Logistics Tables - Air
**Points:** 13
**Dependencies:** Story 1.1

### TASK-DB-008: Create airports table
- **Type:** Database
- **Priority:** P0
- **Depends On:** None
- **Blocks:** TASK-DB-009
- **Description:** Create airports reference table with capabilities and contacts
- **Implementation Details:**
  - UUID primary key, IATA code (unique), name, city, country
  - Location: coordinates (POINT), timezone
  - Capabilities: cargo_capable, customs_preclearance_available
  - Costs: landing_fee_usd, handling_fee_usd
  - Operations: operating_hours_start, operating_hours_end
  - Contacts: cargo_handler_contact JSONB, customs_broker_contact JSONB
- **Seed Data:**
  - ATQ (Amritsar Sri Guru Ram Dass Jee)
  - SHJ (Sharjah - primary UAE hub)
  - AUH (Abu Dhabi)
  - DWC (Dubai World Central)
  - MCT (Muscat - fuel stop)
- **Acceptance Criteria:**
  - All required airports seeded
  - Cargo capabilities flagged
  - Customs pre-clearance availability tracked
- **Definition of Done:** ATQ, SHJ, AUH, DWC, MCT airports seeded

### TASK-DB-009: Create flights table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-008
- **Blocks:** TASK-DB-010, TASK-LOG-001
- **Description:** Create charter flight records with routing and manifest tracking
- **Implementation Details:**
  - UUID primary key, flight_number (CHARTER-2026-01-19-AM/PM)
  - Aircraft: type ('SAAB_340F'), registration, capacity_suits (1800 theoretical, ~540 practical)
  - Route: route_type ('single_hub_SHJ', 'single_hub_AUH', 'dual_drop_AUH_SHJ')
  - Status enum: scheduled, boarding, departed, fuel_stop, in_transit, landed, unloading, completed
  - Timing: scheduled_departure, actual_departure, scheduled_arrival, actual_arrival
  - Manifest: suits_loaded, manifest_closed_at
  - Cost: charter_cost_gbp (17000 Saab single, 20000 dual-drop)
- **Acceptance Criteria:**
  - Flights scheduled with correct route types
  - Manifest capacity tracked
  - Charter costs recorded
- **Definition of Done:** Flights can be scheduled with capacity tracking

### TASK-DB-010: Create flight_legs table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-009
- **Blocks:** TASK-DB-011
- **Description:** Create multi-leg flight tracking for dual-drop routes
- **Implementation Details:**
  - UUID primary key, foreign key to flight
  - Sequence: leg_number (1, 2, 3...)
  - Route: origin_airport_id, destination_airport_id
  - Purpose: leg_type enum (positioning, fuel_stop, cargo_drop, final)
  - Timing: scheduled_departure, actual_departure, scheduled_arrival, actual_arrival
  - Cargo: suits_to_unload, unload_completed_at, customs_cleared_at
  - Status enum: pending, departed, arrived, unloading, cleared, completed
- **Example Route (Dual-Drop):**
  - Leg 1: ATQ → MCT (fuel_stop)
  - Leg 2: MCT → AUH (cargo_drop - Abu Dhabi suits)
  - Leg 3: AUH → SHJ (final - Dubai suits)
- **Acceptance Criteria:**
  - Multi-leg routes represented correctly
  - Each leg tracks its own timing and cargo
  - Customs clearance tracked per leg
- **Definition of Done:** ATQ→MCT→AUH→SHJ route can be represented

### TASK-DB-011: Create suit_flight_assignments table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-010
- **Blocks:** TASK-OPT-004
- **Description:** Create junction linking suits to flights and unload points
- **Implementation Details:**
  - UUID primary key, foreign keys to suit, flight, unload_leg
  - load_sequence integer (loading order)
  - Timing: loaded_at, unloaded_at
  - Unique constraint on suit + flight
- **Acceptance Criteria:**
  - Suits assigned to specific unload legs
  - Loading sequence tracked for efficient unloading
- **Definition of Done:** Suits can be assigned to specific unload legs

---

## Story 1.4: Logistics Tables - Ground
**Points:** 13
**Dependencies:** Story 1.3

### TASK-DB-012: Create vans table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-008
- **Blocks:** TASK-DB-014
- **Description:** Create UAE delivery fleet tracking
- **Implementation Details:**
  - UUID primary key, van_number, license_plate
  - Base: home_airport_id (SHJ or AUH), home_zone_id
  - Capacity: max_suits (25), current_suit_count
  - State: status enum (available, loading, en_route, delivering, returning, maintenance, off_duty)
  - Location: current_coordinates (POINT), current_zone_id, last_location_update
  - Current driver reference
  - Spatial index on coordinates
- **Acceptance Criteria:**
  - Van positions tracked in real-time
  - Capacity limits enforced
  - Home airport assignment for routing
- **Definition of Done:** Van positions can be tracked in real-time

### TASK-DB-013: Create drivers table
- **Type:** Database
- **Priority:** P0
- **Depends On:** None
- **Blocks:** TASK-DB-014
- **Description:** Create UAE driver records with licensing and performance
- **Implementation Details:**
  - UUID primary key, identity fields (name, phone, email)
  - License: license_number, license_expiry
  - Status: available, on_shift, on_break, off_duty
  - Shift: shift_start, shift_end, hours_worked_today
  - Performance: total_deliveries, on_time_rate
- **Acceptance Criteria:**
  - Driver availability tracked
  - Hours worked monitored for compliance
  - Performance metrics calculated
- **Definition of Done:** Drivers can be assigned to vans

### TASK-DB-014: Create delivery_routes table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-012, TASK-DB-013
- **Blocks:** TASK-DB-015
- **Description:** Create optimized route plans for vans
- **Implementation Details:**
  - UUID primary key, foreign keys to van, driver, flight_leg (origin)
  - Origin: origin_airport_id
  - Timing: created_at, started_at, completed_at
  - Optimization: total_stops, total_distance_km, estimated_duration_minutes, actual_duration_minutes
  - Waypoints JSONB: [{sequence, hotel_id, suit_ids, eta, actual_arrival}]
  - Status: planned, active, completed, aborted
  - current_stop_index (for tracking progress)
- **Acceptance Criteria:**
  - Routes generated with optimized sequences
  - Waypoints include ETAs
  - Progress tracked in real-time
- **Definition of Done:** Route optimization results can be stored

### TASK-DB-015: Create deliveries table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-014
- **Blocks:** TASK-API-013
- **Description:** Create individual delivery records for each suit
- **Implementation Details:**
  - UUID primary key, foreign keys to suit, route, hotel
  - Sequence: stop_sequence in route
  - Destination: delivery_address, delivery_coordinates, recipient_name, recipient_phone
  - Timing: estimated_arrival, actual_arrival
  - Status: pending, en_route, arrived, delivered, failed
  - Outcome: delivered_to (customer, concierge, front_desk), signature_url, photo_url
  - Issues: delivery_attempts, last_attempt_at, failure_reason
- **Acceptance Criteria:**
  - Each suit has individual delivery record
  - Proof of delivery (photo) stored
  - Failed attempts tracked
- **Definition of Done:** Deliveries can be tracked per-suit

---

## Story 1.5: Reference & Monitoring Tables
**Points:** 8
**Dependencies:** Story 1.4

### TASK-DB-016: Create zones table
- **Type:** Database
- **Priority:** P0
- **Depends On:** None
- **Blocks:** TASK-DB-017
- **Description:** Create UAE geographic zones for delivery routing
- **Implementation Details:**
  - UUID primary key, code (DUBAI-MARINA, ABU-DHABI-CITY), name, city, country
  - Geography: boundary (POLYGON), center_coordinates
  - Logistics: primary_airport_id (SHJ or AUH), avg_delivery_time_from_airport_minutes
  - Traffic: peak_hours JSONB [{day_of_week, start_hour, end_hour, multiplier}]
  - Spatial index on boundary
- **Seed Zones:**
  - DUBAI-MARINA, DUBAI-DOWNTOWN, DUBAI-PALM, DUBAI-CREEK, DUBAI-DEIRA
  - ABU-DHABI-CITY, ABU-DHABI-SAADIYAT, ABU-DHABI-YAS
  - SHARJAH-CITY, AJMAN, RAK
- **Acceptance Criteria:**
  - All major delivery zones defined
  - Traffic patterns captured
  - Primary airport assigned per zone
- **Definition of Done:** Dubai, Abu Dhabi, Sharjah zones seeded

### TASK-DB-017: Create hotels table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-016
- **Blocks:** TASK-API-001
- **Description:** Create luxury hotel reference with delivery instructions
- **Implementation Details:**
  - UUID primary key, name, brand, star_rating
  - Location: address, coordinates (POINT), zone_id
  - Contacts: concierge_phone, concierge_whatsapp, concierge_email, front_desk_phone
  - Delivery: delivery_entrance, delivery_notes, requires_advance_notice, advance_notice_minutes
  - Access: guest_verification_required boolean
  - Tier: 'flagship', 'priority', 'standard'
- **Seed Hotels:**
  - Burj Al Arab, Atlantis The Palm, Four Seasons DIFC, Armani Hotel
  - Emirates Palace, St. Regis Abu Dhabi, Mandarin Oriental
- **Acceptance Criteria:**
  - Key luxury hotels seeded
  - Concierge contacts stored
  - Delivery instructions documented
- **Definition of Done:** Key Dubai/Abu Dhabi hotels seeded

### TASK-DB-018: Create events table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-016
- **Blocks:** TASK-LOG-002
- **Description:** Create event calendar for demand forecasting and hub selection
- **Implementation Details:**
  - UUID primary key, name, event_type enum (expo, conference, sports, cultural, religious)
  - Location: city, venue, primary_zone_id
  - Timing: start_date, end_date
  - Impact: expected_demand_multiplier, expected_dubai_ratio, expected_abu_dhabi_ratio
  - Config: recommended_hub ('SHJ', 'AUH', 'dual_drop'), recommended_flights_per_day
  - Notes
- **Seed Events:**
  - Dubai Expo (80% Dubai / 20% Abu Dhabi)
  - Abu Dhabi Finance Week (30% Dubai / 70% Abu Dhabi)
  - Abu Dhabi F1 Yas Marina (40% Dubai / 60% Abu Dhabi)
- **Acceptance Criteria:**
  - Key events seeded with demand patterns
  - Hub recommendations pre-configured
- **Definition of Done:** Key events seeded with demand patterns

### TASK-DB-019: Create alerts table
- **Type:** Database
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-API-018
- **Description:** Create alert/exception tracking with response workflow
- **Implementation Details:**
  - UUID primary key, entity_type (suit, flight, van, tailor), entity_id
  - Alert: alert_type, severity enum (info, warning, critical)
  - Content: title, description, metadata JSONB
  - Risk context: risk_score_at_alert, risk_factors JSONB
  - Response: status enum (open, acknowledged, resolved, escalated), acknowledged_at, acknowledged_by, resolved_at, resolved_by, resolution_notes
  - Auto-response: auto_response_triggered, auto_response_action, auto_response_at
- **Acceptance Criteria:**
  - Alerts created on risk threshold breach
  - Response workflow tracked
  - Auto-responses logged
- **Definition of Done:** Alerts can be raised and resolved

### TASK-DB-020: Create system_metrics table
- **Type:** Database
- **Priority:** P1
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-WEB-003
- **Description:** Create time-series metrics for dashboard and analytics
- **Implementation Details:**
  - UUID primary key, recorded_at, period_type enum (hourly, daily, weekly)
  - Pipeline: orders_received, suits_in_production, suits_in_transit, suits_delivered
  - Risk: suits_green, suits_amber, suits_red, suits_critical
  - Performance: avg_production_time_minutes, avg_delivery_time_minutes, on_time_rate, qc_pass_rate
  - Capacity: tailor_utilization, van_utilization, flight_utilization
  - Cost: total_charter_cost_gbp, avg_cost_per_suit_gbp
- **Acceptance Criteria:**
  - Hourly metrics recorded automatically
  - Historical data retained for trending
- **Definition of Done:** Hourly metrics can be recorded and queried

---

## Story 1.6: Database Views
**Points:** 5
**Dependencies:** Stories 1.1-1.5

### TASK-DB-021: Create v_suits_pending_flight_assignment view
- **Type:** Database
- **Priority:** P1
- **Depends On:** TASK-DB-003, TASK-DB-011
- **Blocks:** TASK-OPT-001
- **Description:** View for suits ready to be assigned to flights
- **Implementation Details:**
  - Returns suits with status='S19_PACKED' and no flight assignment
  - Includes: suit_id, deadline, destination_zone, primary_airport, hotel_name, coordinates
  - Calculates: hours_until_deadline
  - Ordered by deadline ASC
- **Acceptance Criteria:**
  - Correctly identifies packed suits without flights
  - Deadline urgency calculated
- **Definition of Done:** View returns correct suits for flight planning

### TASK-DB-022: Create v_active_routes_with_capacity view
- **Type:** Database
- **Priority:** P1
- **Depends On:** TASK-DB-014, TASK-DB-012
- **Blocks:** TASK-OPT-016
- **Description:** View for vans with available delivery capacity
- **Implementation Details:**
  - Joins routes, vans, drivers
  - Returns: route_id, van_id, van_number, driver details, current_suit_count, max_suits
  - Calculates: available_capacity
  - Filters: status IN (loading, en_route, delivering)
- **Acceptance Criteria:**
  - Active vans with spare capacity identified
- **Definition of Done:** Delivery routing can query available vans

### TASK-DB-023: Create v_tailor_availability view
- **Type:** Database
- **Priority:** P1
- **Depends On:** TASK-DB-005, TASK-DB-006
- **Blocks:** TASK-OPT-006
- **Description:** View for tailors with capacity to accept jobs
- **Implementation Details:**
  - Returns active tailors where current_job_count < max_concurrent_jobs
  - Includes: skill_level, fabric_variants_in_stock, qc_pass_rate, avg_production_time_minutes
  - Includes: distance_to_qc_station_meters
  - Ordered by qc_pass_rate DESC, avg_production_time ASC
- **Acceptance Criteria:**
  - Only qualified available tailors returned
  - Ranked by quality metrics
- **Definition of Done:** Tailor assignment can query eligible tailors

---

# EPIC 2: OPTIMIZATION ALGORITHMS
**Priority:** P0 - Core Logic
**Dependencies:** Epic 1
**Description:** The optimization engines for flight planning, tailor assignment, and vehicle routing

---

## Story 2.1: Flight Planning Optimizer
**Points:** 21
**Dependencies:** Story 1.3

### TASK-OPT-001: Implement demand analysis function
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-DB-021
- **Blocks:** TASK-OPT-004
- **Description:** Analyze geographic distribution of pending suits for hub selection
- **Implementation Details:**
  ```python
  def analyze_demand(suits: List[Suit]) -> DemandAnalysis:
      # Count suits by zone and airport
      # Calculate Dubai vs Abu Dhabi ratio
      # Determine if dual-drop is warranted
      return {
          'total_suits': len(suits),
          'by_zone': zone_counts,
          'by_airport': {'SHJ': shj_count, 'AUH': auh_count},
          'abu_dhabi_ratio': auh_count / total,
          'dubai_ratio': shj_count / total,
          'recommend_dual_drop': abu_dhabi_ratio > 0.4
      }
  ```
- **Acceptance Criteria:**
  - Correct count by zone and airport
  - Dual-drop recommendation when Abu Dhabi >= 40%
- **Definition of Done:** Correctly identifies when to use dual-drop routing

### TASK-OPT-002: Implement feasibility calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-001
- **Blocks:** TASK-OPT-004
- **Description:** Calculate if flight option can deliver all suits on time
- **Implementation Details:**
  - For each suit, find best unload leg based on ground delivery time
  - Calculate buffer_minutes = deadline - estimated_delivery
  - Mark suit feasible if buffer >= 0
  - Return feasibility rate and list of infeasible suits
- **Acceptance Criteria:**
  - All suits checked against delivery window
  - Infeasible suits flagged with reason
- **Definition of Done:** Can determine if route serves all suits on time

### TASK-OPT-003: Implement cost calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-001
- **Blocks:** TASK-OPT-004
- **Description:** Calculate total cost for flight option including ground distribution
- **Implementation Details:**
  - Base costs: Saab single_hub = 17000 GBP, dual_drop = 20000 GBP
  - Ground costs: Estimate vans needed = ceil(suits/20)
  - Van cost per trip = ~100 GBP
  - Return breakdown and per-suit cost
- **Acceptance Criteria:**
  - Accurate cost comparison between routes
  - Per-suit cost calculated
- **Definition of Done:** Saab single-hub vs dual-drop costs compared correctly

### TASK-OPT-004: Implement flight planning orchestrator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-001, TASK-OPT-002, TASK-OPT-003, TASK-DB-011
- **Blocks:** TASK-OPT-005
- **Description:** Main optimizer selecting optimal flight configuration
- **Implementation Details:**
  ```python
  def optimize_flight(flight_id: str) -> FlightPlan:
      suits = get_pending_suits()
      demand = analyze_demand(suits)
      
      options = [
          ('single_hub_SHJ', check_feasibility_shj(suits)),
          ('single_hub_AUH', check_feasibility_auh(suits)),
          ('dual_drop', check_feasibility_dual(suits))
      ]
      
      viable = [(opt, cost) for opt, feas in options if feas.viable]
      if not viable:
          return {'status': 'infeasible', 'reason': '...'}
      
      best = min(viable, key=lambda x: x[1])
      return create_flight_plan(best)
  ```
- **Acceptance Criteria:**
  - Selects minimum cost viable option
  - Returns full assignment details
  - Handles infeasible cases gracefully
- **Definition of Done:** Selects optimal route based on demand pattern

### TASK-OPT-005: Create flight planning API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-OPT-004
- **Blocks:** TASK-LOG-003
- **Description:** REST endpoint to trigger flight planning
- **Implementation Details:**
  - POST /api/logistics/optimize-flight
  - Accepts flight_id or next_departure flag
  - Calls optimizer, persists assignments
  - Emits FlightManifestClosedEvent
- **Acceptance Criteria:**
  - API triggers optimization
  - Results persisted to database
  - Event emitted for downstream systems
- **Definition of Done:** Flight planning can be triggered via API

---

## Story 2.2: Tailor Assignment Optimizer
**Points:** 13
**Dependencies:** Story 1.2

### TASK-OPT-006: Implement tailor eligibility filter
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-DB-005, TASK-DB-023
- **Blocks:** TASK-OPT-007
- **Description:** Filter tailors who can accept a specific job
- **Implementation Details:**
  - Check available_slots > 0
  - Check fabric_variant in tailor.fabric_variants_in_stock
  - Check skill_level meets job.complexity requirement
  - Return list of eligible TailorProfile objects
- **Acceptance Criteria:**
  - Only qualified tailors returned
  - Fabric availability checked
- **Definition of Done:** Only qualified tailors returned for jobs

### TASK-OPT-007: Implement tailor scoring algorithm
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-006
- **Blocks:** TASK-OPT-008
- **Description:** Calculate composite score for tailor-job match
- **Implementation Details:**
  - QC Pass Rate: 35% weight (higher = better)
  - Production Speed: 25% weight (faster vs 390min baseline)
  - Current Load: 15% weight (less loaded = better)
  - Distance to QC: 15% weight (closer = better, vs 10min baseline)
  - Skill Match: 10% weight (exact match 100, overqualified 80)
  - Return score 0-100
- **Acceptance Criteria:**
  - Scores correctly weighted
  - High QC pass rate tailors ranked higher
- **Definition of Done:** High QC pass rate tailors ranked higher

### TASK-OPT-008: Implement dual-posting selection
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-007, TASK-DB-006
- **Blocks:** TASK-OPT-009
- **Description:** Select primary and backup tailors for dual production
- **Implementation Details:**
  - Score and sort all eligible tailors
  - Select top 2 as primary/backup
  - Both produce the suit simultaneously (redundancy)
  - Return next 20 as VAPI call list for unclaimed escalation
- **Acceptance Criteria:**
  - Two best tailors assigned
  - Call list prepared for VAPI escalation
- **Definition of Done:** Two tailors assigned per suit for redundancy

### TASK-OPT-009: Implement unclaimed job escalation
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-008
- **Blocks:** TASK-VOI-006
- **Description:** Handle jobs unclaimed after timeout with VAPI calls
- **Implementation Details:**
  - Configurable claim_timeout_minutes (default 10)
  - After timeout, trigger VAPI voice AI
  - Call up to 20 tailors simultaneously
  - Auto-assign to first acceptor
- **Acceptance Criteria:**
  - Timeout triggers escalation
  - VAPI integration prepared
- **Definition of Done:** Integrates with VAPI voice AI for escalation

### TASK-OPT-010: Create tailor assignment API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-OPT-008
- **Blocks:** TASK-API-005
- **Description:** REST endpoint for assigning tailors to suits
- **Implementation Details:**
  - POST /api/production/assign-tailor
  - Accepts suit_id, calls optimizer
  - Creates tailor_assignment records (primary + backup)
  - Emits TailorJobPostedEvent
- **Acceptance Criteria:**
  - Dual assignments created
  - Events emitted for notifications
- **Definition of Done:** Dual production assignments created via API

---

## Story 2.3: Vehicle Routing Optimizer (VRPTW)
**Points:** 21
**Dependencies:** Story 1.4

### TASK-OPT-011: Implement distance/time matrix builder
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-DB-015, TASK-DB-017
- **Blocks:** TASK-OPT-012
- **Description:** Build matrices for routing using Haversine distance
- **Implementation Details:**
  - Input: list of coordinates (depot + delivery points)
  - Calculate Haversine distance between all pairs
  - Apply average speed (40 km/h urban UAE)
  - Apply traffic_multiplier from zone data
  - Output: distance_matrix (km), time_matrix (minutes)
- **Acceptance Criteria:**
  - Matrices generated correctly
  - Traffic multipliers applied
- **Definition of Done:** Matrices generated for 50+ delivery points in <1s

### TASK-OPT-012: Implement Clarke-Wright savings algorithm
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-011
- **Blocks:** TASK-OPT-013
- **Description:** Calculate savings for route merging
- **Implementation Details:**
  - Savings(i,j) = Distance(depot,i) + Distance(depot,j) - Distance(i,j)
  - Calculate for all delivery point pairs
  - Sort by savings descending
  - Return sorted list of merge candidates
- **Acceptance Criteria:**
  - Savings calculated correctly
  - Sorted for greedy selection
- **Definition of Done:** Savings correctly identify mergeable routes

### TASK-OPT-013: Implement route builder using savings
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-012
- **Blocks:** TASK-OPT-014
- **Description:** Build initial routes using Clarke-Wright algorithm
- **Implementation Details:**
  - Initialize each delivery as own route
  - Iterate savings list, merge routes if:
    - Combined load <= van capacity (25 suits)
    - Time windows still feasible
  - Return list of routes with stops and loads
- **Acceptance Criteria:**
  - Routes respect capacity
  - Initial solution generated quickly
- **Definition of Done:** Routes generated respecting 25-suit van capacity

### TASK-OPT-014: Implement 2-opt route optimization
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-013
- **Blocks:** TASK-OPT-015
- **Description:** Local search optimization for route sequences
- **Implementation Details:**
  - For each route, try all 2-opt swaps
  - Accept swap if improves total time
  - Validate time windows after each swap
  - Continue until no improvement found
- **Acceptance Criteria:**
  - Route sequences improved
  - Time windows still valid
- **Definition of Done:** Route sequences optimized within time windows

### TASK-OPT-015: Implement time window validation
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-014
- **Blocks:** TASK-OPT-016
- **Description:** Validate and repair routes violating delivery deadlines
- **Implementation Details:**
  - Check each delivery ETA against suit deadline
  - Identify infeasible deliveries
  - Attempt repair by resequencing or reassigning to other vans
  - Return validation result with list of issues
- **Acceptance Criteria:**
  - All deadlines checked
  - Repair attempted for violations
- **Definition of Done:** No route violates 24-hour delivery promise

### TASK-OPT-016: Implement VRPTW orchestrator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-011, TASK-OPT-012, TASK-OPT-013, TASK-OPT-014, TASK-OPT-015, TASK-DB-022
- **Blocks:** TASK-OPT-017, TASK-OPT-018
- **Description:** Main optimizer coordinating all VRPTW components
- **Implementation Details:**
  ```python
  def optimize_routes(deliveries, vans, depot, current_time):
      matrix = build_distance_time_matrix(deliveries, depot)
      savings = calculate_savings(matrix)
      routes = build_initial_routes(savings, vans, deliveries)
      routes = optimize_2opt(routes)
      validation = validate_time_windows(routes)
      if not validation.all_feasible:
          routes = repair_routes(routes, validation.issues)
      return format_route_plan(routes)
  ```
- **Acceptance Criteria:**
  - Full optimization pipeline runs
  - Routes formatted for dispatch
- **Definition of Done:** Full route plans generated for 540 daily deliveries

### TASK-OPT-017: Implement dynamic re-optimization
- **Type:** Backend/Python
- **Priority:** P1
- **Depends On:** TASK-OPT-016
- **Blocks:** TASK-EVT-007
- **Description:** Re-optimize routes when exceptions occur
- **Implementation Details:**
  - Handle triggers: delivery_failed, van_breakdown, traffic_delay, new_urgent_delivery
  - Calculate affected routes
  - Re-optimize only affected portions
  - Return updated routes and reassignments
- **Acceptance Criteria:**
  - Exceptions handled without full re-plan
  - Affected deliveries reassigned
- **Definition of Done:** Van breakdown triggers automatic reassignment

### TASK-OPT-018: Create vehicle routing API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-OPT-016
- **Blocks:** TASK-LOG-007
- **Description:** REST endpoint to trigger route optimization
- **Implementation Details:**
  - POST /api/logistics/optimize-routes
  - Accepts flight_leg_id (for arrivals) or manual trigger
  - Returns route plans for all vans
  - Persists delivery_routes and deliveries
  - Emits RoutesOptimizedEvent
- **Acceptance Criteria:**
  - API triggers on flight arrival
  - Routes persisted and events emitted
- **Definition of Done:** Routes generated on flight arrival

---

## Story 2.4: Risk Scoring Engine
**Points:** 13
**Dependencies:** Stories 1.1, 2.1-2.3

### TASK-OPT-019: Implement time risk calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-OPT-023
- **Description:** Calculate risk based on time remaining vs stages left
- **Implementation Details:**
  - Map status to expected remaining hours
  - Risk = 1 - (time_remaining / expected_remaining)
  - Apply stage-specific buffers
  - Return time_risk (0-1)
- **Acceptance Criteria:**
  - Time pressure accurately reflected
  - Stage expectations calibrated
- **Definition of Done:** Suits with 2 hours remaining and 4 hours of stages = high risk

### TASK-OPT-020: Implement stage risk calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-OPT-023
- **Description:** Calculate risk based on current production stage
- **Implementation Details:**
  - Assign base risk per stage (higher for late stages)
  - Detect if stage is taking longer than average
  - Factor in tailor's historical performance
  - Return stage_risk (0-1)
- **Acceptance Criteria:**
  - Stalled stages detected
  - Historical comparison used
- **Definition of Done:** Stalled QC inspection flagged as high risk

### TASK-OPT-021: Implement resource risk calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-DB-005, TASK-DB-012
- **Blocks:** TASK-OPT-023
- **Description:** Calculate risk based on assigned resources
- **Implementation Details:**
  - Check tailor QC pass rate (low = higher risk)
  - Check van driver on-time rate
  - Check resource availability
  - Return resource_risk (0-1)
- **Acceptance Criteria:**
  - Low-performing resources increase risk
  - Availability constraints reflected
- **Definition of Done:** Suits assigned to low-pass-rate tailor flagged

### TASK-OPT-022: Implement external risk calculator
- **Type:** Backend/Python
- **Priority:** P1
- **Depends On:** TASK-DB-009
- **Blocks:** TASK-OPT-023
- **Description:** Calculate risk from external factors
- **Implementation Details:**
  - Check flight status (delay increases risk)
  - Check weather conditions (API integration)
  - Check traffic conditions for delivery zone
  - Check customs status
  - Return external_risk (0-1)
- **Acceptance Criteria:**
  - External factors integrated
  - Delays propagated to risk
- **Definition of Done:** Flight delay propagates risk to all suits on manifest

### TASK-OPT-023: Implement composite risk scorer
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-OPT-019, TASK-OPT-020, TASK-OPT-021, TASK-OPT-022
- **Blocks:** TASK-OPT-024
- **Description:** Combine all risk factors with weights
- **Implementation Details:**
  - Weights: time=30%, stage=20%, resource=15%, external=15%, historical=10%, buffer=10%
  - Calculate weighted sum
  - Determine severity: green (<0.3), amber (0.3-0.6), red (0.6-0.8), critical (>0.8)
  - Generate recommended_action based on score
- **Acceptance Criteria:**
  - Composite score calculated
  - Severity thresholds trigger alerts
- **Definition of Done:** Risk scores update in real-time, alerts trigger at thresholds

### TASK-OPT-024: Create risk scoring API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-OPT-023
- **Blocks:** TASK-WEB-004
- **Description:** REST endpoint to get/recalculate risk scores
- **Implementation Details:**
  - GET /api/suits/:id/risk - get current score
  - POST /api/suits/:id/risk/recalculate - force recalculation
  - GET /api/suits/at-risk?severity=red - list suits by risk level
  - Risk auto-updates on status changes
- **Acceptance Criteria:**
  - API exposes risk data
  - At-risk suits queryable by severity
- **Definition of Done:** Dashboard can display real-time risk scores

---

# EPIC 3: REAL-TIME EVENT SYSTEM
**Priority:** P0 - Core Infrastructure
**Dependencies:** Epic 1
**Description:** Event publishing, subscription, and WebSocket real-time updates

---

## Story 3.1: Event Publishing
**Points:** 13
**Dependencies:** Story 1.1

### TASK-EVT-001: Define event type interfaces
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-DB-004
- **Blocks:** TASK-EVT-002
- **Description:** Create TypeScript interfaces for all event types
- **Event Types:**
  - BaseEvent: id, type, timestamp, source, correlation_id, metadata
  - SuitStatusChangedEvent, SuitLocationUpdatedEvent, SuitRiskChangedEvent, SuitDeliveredEvent
  - TailorJobPostedEvent, TailorJobClaimedEvent, ProductionStageCompletedEvent, QCCompletedEvent
  - FlightScheduledEvent, FlightDepartedEvent, FlightDelayedEvent, FlightLandedEvent, CustomsClearedEvent
  - VanDispatchedEvent, VanLocationUpdatedEvent, DeliveryAttemptedEvent, DeliveryCompletedEvent
  - AlertCreatedEvent, AlertResolvedEvent
- **Acceptance Criteria:**
  - All event types defined with full typing
  - Base event structure consistent
- **Definition of Done:** All event types defined with full typing

### TASK-EVT-002: Implement event publisher service
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-001
- **Blocks:** TASK-EVT-003, TASK-EVT-004
- **Description:** Redis Streams-based event publisher
- **Implementation Details:**
  - Publish to categorized streams: suit, production, flight, delivery, system
  - Auto-generate event ID and timestamp
  - Include correlation_id for tracing
  - Support priority levels
  - Configurable TTL per stream
- **Acceptance Criteria:**
  - Events published to Redis Streams
  - Correlation IDs enable tracing
- **Definition of Done:** Events published to Redis Streams, retrievable

### TASK-EVT-003: Create suit event publishing helpers
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-002
- **Blocks:** TASK-API-001
- **Description:** Convenience methods for common suit events
- **Implementation Details:**
  - publishSuitStatusChange(suit_id, previous, new_status)
  - publishSuitLocation(suit_id, location_type, coordinates)
  - publishSuitRisk(suit_id, old_score, new_score, factors)
  - publishAlert(alert_details)
- **Acceptance Criteria:**
  - Status changes auto-publish events
  - Location updates tracked
- **Definition of Done:** Status changes auto-publish events

### TASK-EVT-004: Implement event subscriber service
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-002
- **Blocks:** TASK-EVT-007
- **Description:** Redis Streams consumer for background processing
- **Implementation Details:**
  - Consumer group support for horizontal scaling
  - Configurable batch size and block timeout
  - Handler registration per event type
  - Graceful shutdown
  - Dead letter handling for failed events
- **Acceptance Criteria:**
  - Multiple workers can process events
  - No duplicate processing
- **Definition of Done:** Multiple workers can process events without duplicates

---

## Story 3.2: WebSocket Real-Time Server
**Points:** 13
**Dependencies:** Story 3.1

### TASK-EVT-005: Implement WebSocket server
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-002
- **Blocks:** TASK-EVT-006
- **Description:** Real-time event broadcasting via WebSocket
- **Implementation Details:**
  - JWT authentication on connection
  - Client tracking with user context
  - Channel subscription model
  - Auto-subscribe based on user type (customer, tailor, driver, admin)
  - Heartbeat/ping-pong for connection health
- **Acceptance Criteria:**
  - Clients authenticate and connect
  - Subscriptions managed
- **Definition of Done:** Clients receive real-time updates after connecting

### TASK-EVT-006: Implement channel authorization
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-005
- **Blocks:** TASK-EVT-007
- **Description:** Permission checks for channel subscriptions
- **Implementation Details:**
  - Customers: only their own orders/suits
  - Tailors: their assigned jobs
  - Drivers: their routes
  - Inspectors: their queue
  - Admins: all channels (wildcard)
- **Acceptance Criteria:**
  - Authorization enforced per user type
  - No cross-customer visibility
- **Definition of Done:** Customers cannot spy on other customers' suits

### TASK-EVT-007: Implement Redis→WebSocket bridge
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-004, TASK-EVT-006
- **Blocks:** TASK-EVT-008
- **Description:** Subscribe to Redis and broadcast to WebSocket clients
- **Implementation Details:**
  - Subscribe to all event streams
  - Determine affected channels per event
  - Broadcast to subscribed clients only
  - Handle connection drops gracefully
  - Target latency: <500ms from DB change to client
- **Acceptance Criteria:**
  - Events flow from DB to clients in real-time
  - Latency under 500ms
- **Definition of Done:** Status change in DB → Redis → WebSocket → Client in <500ms

### TASK-EVT-008: Create client-side WebSocket handler
- **Type:** Frontend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-EVT-007
- **Blocks:** TASK-WEB-002
- **Description:** React-compatible WebSocket client
- **Implementation Details:**
  - Auto-reconnect with exponential backoff
  - Channel subscription management
  - Event handler registration
  - Connection state tracking
  - React hook: useRealtime(channels)
- **Acceptance Criteria:**
  - Client handles disconnects gracefully
  - React hook provides clean API
- **Definition of Done:** Dashboard updates without refresh

---

# EPIC 4: API ENDPOINTS
**Priority:** P0 - Integration Layer
**Dependencies:** Epics 1, 2, 3
**Description:** REST API for all system interactions

---

## Story 4.1: Customer-Facing API
**Points:** 13
**Dependencies:** Stories 1.1, 3.1

### TASK-API-001: Create order creation endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-002, TASK-DB-017, TASK-EVT-003
- **Blocks:** TASK-API-002
- **Description:** POST /api/orders - create new order
- **Implementation Details:**
  - Accept customer_id, measurements, hotel_id, payment_intent_id
  - Validate payment captured via Stripe
  - Calculate deadline (24hr from now)
  - Create order and suit records (including backup suit)
  - Trigger pattern generation pipeline
  - Return order details with suit_ids
- **Acceptance Criteria:**
  - Order and dual suits created
  - 24-hour clock starts
  - Pattern pipeline triggered
- **Definition of Done:** Order creates suits and starts pipeline

### TASK-API-002: Create order tracking endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-001
- **Blocks:** TASK-APP-002
- **Description:** GET /api/orders/:id/track - real-time order status
- **Implementation Details:**
  - Return order status, all suits with current status
  - Include timeline of events (public-facing subset)
  - Include current location for in-transit suits
  - Include ETA for pending deliveries
  - Include driver contact when out for delivery
- **Acceptance Criteria:**
  - Full journey visible to customer
  - ETAs accurate
- **Definition of Done:** Customer app can show full journey

### TASK-API-003: Create suit tracking endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-APP-003
- **Description:** GET /api/suits/:id/track - detailed suit tracking
- **Implementation Details:**
  - Return current status, location, coordinates
  - Return full timeline with timestamps
  - Return assigned resources (anonymized for customers)
  - Return delivery ETA and window
  - Support suit_number lookup as alternative
- **Acceptance Criteria:**
  - Detailed tracking available
  - Works by ID or suit_number
- **Definition of Done:** Detailed per-suit tracking available

### TASK-API-004: Create measurement submission endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-001
- **Blocks:** TASK-FAC-001
- **Description:** POST /api/measurements - submit 3D scan data
- **Implementation Details:**
  - Accept customer_id, scan_data (body measurements JSON), scan_images
  - Validate measurement completeness (required dimensions)
  - Store for pattern generation
  - Link to pending order if exists
- **Acceptance Criteria:**
  - Scan data validated and stored
  - Links to order when matched
- **Definition of Done:** Scan data flows to Optitex pipeline

---

## Story 4.2: Tailor App API
**Points:** 13
**Dependencies:** Stories 1.2, 2.2

### TASK-API-005: Create job board endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-OPT-010, TASK-DB-006
- **Blocks:** TASK-APP-003
- **Description:** GET /api/tailor/jobs/available - list claimable jobs
- **Implementation Details:**
  - Filter by tailor's skill level and fabric inventory
  - Include job details: fabric, complexity, payout (INR 8,500), deadline
  - Include distance to QC station
  - Sort by deadline urgency, then payout
  - Support filters: fabric_variant, complexity, min_payout
- **Acceptance Criteria:**
  - Only eligible jobs shown
  - Relevant details displayed
- **Definition of Done:** Tailors see relevant jobs only

### TASK-API-006: Create job claim endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-005
- **Blocks:** TASK-APP-004
- **Description:** POST /api/tailor/jobs/:id/claim - claim a job
- **Implementation Details:**
  - Validate tailor has capacity
  - Validate job still available (not claimed by other)
  - Update tailor_assignment to claimed
  - Increment tailor's current_job_count
  - Emit TailorJobClaimedEvent
  - Return assignment details with pattern download URL
- **Acceptance Criteria:**
  - Atomic claim (no race conditions)
  - Pattern immediately downloadable
- **Definition of Done:** Tailor claims job, others see it as unavailable

### TASK-API-007: Create production update endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-006
- **Blocks:** TASK-APP-005
- **Description:** POST /api/tailor/jobs/:id/progress - update production stage
- **Implementation Details:**
  - Accept stage: cutting, canvas, assembly, sleeves, collar, trousers, finishing, pressing
  - Require photo upload for each stage
  - Update suit timeline
  - Recalculate risk score
  - Emit ProductionStageCompletedEvent
- **Acceptance Criteria:**
  - Progress tracked with photos
  - Risk recalculated on update
- **Definition of Done:** Production progress tracked with photos

### TASK-API-008: Create job completion endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-007
- **Blocks:** TASK-API-009
- **Description:** POST /api/tailor/jobs/:id/complete - mark production complete
- **Implementation Details:**
  - Require final photos (front, back, detail)
  - Validate all stages completed
  - Update suit status to S14_PRODUCTION_COMPLETE
  - Tailor walks to QC station (10 min in new facility)
  - Emit ProductionCompleteEvent
- **Acceptance Criteria:**
  - All photos required
  - QC process initiated
- **Definition of Done:** Completed suit ready for QC

---

## Story 4.3: QC Inspector API
**Points:** 8
**Dependencies:** Story 4.2

### TASK-API-009: Create inspection queue endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-008, TASK-DB-007
- **Blocks:** TASK-APP-014
- **Description:** GET /api/qc/queue - list pending inspections
- **Implementation Details:**
  - Filter by inspector assignment or zone
  - Include suit details, tailor info
  - Include time since completion (urgency indicator)
  - Sort by deadline (most urgent first)
- **Acceptance Criteria:**
  - Queue prioritized by urgency
  - Inspector sees relevant details
- **Definition of Done:** Inspector sees their queue

### TASK-API-010: Create inspection submission endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-009
- **Blocks:** TASK-FIN-004
- **Description:** POST /api/qc/inspections/:id/submit - submit QC result
- **Implementation Details:**
  - Accept scores: visual, measurement, construction, finishing (1-5)
  - Accept result: pass, fail, conditional_pass
  - Accept issues array if fail: [{category, description, severity, photo_url}]
  - Require photos
  - Update suit status based on result:
    - Pass → S16_QC_PASSED → trigger packing
    - Fail → S17_QC_FAILED → check backup suit
  - Emit QCCompletedEvent
- **Acceptance Criteria:**
  - Full inspection recorded
  - Workflow continues appropriately
  - Backup suit activated if primary fails
- **Definition of Done:** QC pass moves suit to packing; fail activates backup

---

## Story 4.4: Driver App API
**Points:** 13
**Dependencies:** Stories 1.4, 2.3

### TASK-API-011: Create route assignment endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-OPT-018, TASK-DB-014
- **Blocks:** TASK-APP-009
- **Description:** GET /api/driver/route/current - get assigned route
- **Implementation Details:**
  - Return current active route for driver
  - Include all stops with sequence, hotel, suit count, ETAs
  - Include navigation details (coordinates, addresses)
  - Include contact info (concierge phones)
  - Include delivery instructions per stop
- **Acceptance Criteria:**
  - Full route details returned
  - Navigation-ready data
- **Definition of Done:** Driver has full route details

### TASK-API-012: Create arrival notification endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-011
- **Blocks:** TASK-NOT-009
- **Description:** POST /api/driver/stops/:id/arrived - mark arrival at stop
- **Implementation Details:**
  - Update delivery status to arrived
  - Record actual_arrival timestamp
  - Notify customer (SMS/WhatsApp) with ETA
  - Update van location
  - Emit DeliveryArrivedEvent
- **Acceptance Criteria:**
  - Customer notified automatically
  - Van tracking updated
- **Definition of Done:** Customer notified on driver arrival

### TASK-API-013: Create delivery confirmation endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-012, TASK-DB-015
- **Blocks:** TASK-NOT-009
- **Description:** POST /api/driver/deliveries/:id/confirm - confirm delivery
- **Implementation Details:**
  - Accept delivered_to: customer, concierge, front_desk
  - Accept signature (optional based on hotel setting)
  - Require photo of handoff
  - Update suit status to S24_DELIVERED
  - Record actual_delivery timestamp
  - Trigger customer satisfaction survey
  - Emit SuitDeliveredEvent
- **Acceptance Criteria:**
  - Delivery confirmed with proof
  - 24-hour clock stopped
- **Definition of Done:** Delivery confirmed with proof

### TASK-API-014: Create delivery issue endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-012
- **Blocks:** TASK-OPT-017
- **Description:** POST /api/driver/deliveries/:id/issue - report delivery problem
- **Implementation Details:**
  - Accept issue_type: customer_unavailable, wrong_address, access_denied, customer_refused
  - Accept notes and photos
  - Increment delivery_attempts
  - Create alert for operations
  - Trigger customer contact attempt
  - Return next action (retry, hold, escalate)
- **Acceptance Criteria:**
  - Issues tracked and escalated
  - Recovery action provided
- **Definition of Done:** Failed deliveries tracked and escalated

---

## Story 4.5: Admin Operations API
**Points:** 13
**Dependencies:** Stories 4.1-4.4

### TASK-API-015: Create dashboard summary endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-020
- **Blocks:** TASK-WEB-003
- **Description:** GET /api/admin/dashboard - operations summary
- **Implementation Details:**
  - Return pipeline counts: in_production, qc_queue, packed, in_transit, delivered
  - Return risk summary: suits by severity (green, amber, red, critical)
  - Return flight status for today
  - Return van fleet status
  - Return alerts summary
  - Support date range filter
- **Acceptance Criteria:**
  - Real-time operational view
  - All key metrics included
- **Definition of Done:** Control tower dashboard populated

### TASK-API-016: Create suits list endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-003
- **Blocks:** TASK-WEB-004
- **Description:** GET /api/admin/suits - searchable suit list
- **Implementation Details:**
  - Search by suit_number, order_number, customer name
  - Filter by status, risk_severity, destination_zone
  - Sort by deadline, risk_score, created_at
  - Pagination with cursor
  - Include basic details: status, location, deadline, risk
- **Acceptance Criteria:**
  - Fast search across all suits
  - Flexible filtering
- **Definition of Done:** Ops can find any suit quickly

### TASK-API-017: Create manual intervention endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-016
- **Blocks:** TASK-APP-020
- **Description:** POST /api/admin/suits/:id/intervene - manual status change
- **Implementation Details:**
  - Accept action: reassign_tailor, expedite, cancel, override_status
  - Require reason for audit trail
  - Validate state transition is legal
  - Create timeline event with actor
  - Resolve any open alerts
  - Notify affected parties
- **Acceptance Criteria:**
  - Actions logged with reason
  - Downstream notifications sent
- **Definition of Done:** Ops can manually fix stuck suits

### TASK-API-018: Create alert management endpoints
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-019
- **Blocks:** TASK-APP-019
- **Description:** Alert CRUD operations
- **Implementation Details:**
  - GET /api/admin/alerts - list alerts with filters (severity, status, entity_type)
  - POST /api/admin/alerts/:id/acknowledge - mark acknowledged
  - POST /api/admin/alerts/:id/resolve - mark resolved with notes
  - POST /api/admin/alerts/:id/escalate - escalate to higher tier
  - Include response SLA tracking
- **Acceptance Criteria:**
  - Full alert lifecycle managed
  - SLA tracked
- **Definition of Done:** Alert workflow complete

---

# EPIC 5: NOTIFICATION SYSTEM
**Priority:** P1 - Customer Communication
**Dependencies:** Epics 3, 4
**Description:** Multi-channel notifications (SMS, WhatsApp, Push) with templates

---

## Story 5.1: Notification Infrastructure
**Points:** 13
**Dependencies:** Story 3.1

### TASK-NOT-001: Create notification templates table
- **Type:** Database
- **Priority:** P1
- **Depends On:** TASK-DB-001
- **Blocks:** TASK-NOT-004
- **Description:** Store notification template configurations
- **Implementation Details:**
  - Template code (unique), category (order, production, delivery, alert)
  - Target audience: customer, tailor, driver, inspector, admin
  - Channels array: sms, whatsapp, push
  - Priority level, bypass_quiet_hours flag
  - Templates per channel with language variants (en, ar, hi)
- **Acceptance Criteria:**
  - Templates stored with multi-language support
  - Channel preferences configurable
- **Definition of Done:** Templates stored and retrievable

### TASK-NOT-002: Create notification log table
- **Type:** Database
- **Priority:** P1
- **Depends On:** TASK-NOT-001
- **Blocks:** TASK-NOT-008
- **Description:** Track all sent notifications
- **Implementation Details:**
  - Template reference, recipient details
  - Channel used, content sent
  - Status: pending, sent, delivered, failed
  - Provider message ID
  - Retry tracking (attempts, last_attempt, next_retry)
- **Acceptance Criteria:**
  - Full notification audit trail
  - Retry status tracked
- **Definition of Done:** Full notification audit trail

### TASK-NOT-003: Implement notification preference service
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-DB-001
- **Blocks:** TASK-NOT-008
- **Description:** Manage user notification preferences
- **Implementation Details:**
  - Per-user channel preferences (sms, whatsapp, push enabled/disabled)
  - Per-category preferences
  - Quiet hours settings with timezone
  - Language preference
  - API to get/set preferences
- **Acceptance Criteria:**
  - Users can control channels
  - Quiet hours respected
- **Definition of Done:** Users can control notification channels

### TASK-NOT-004: Implement template rendering service
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-NOT-001
- **Blocks:** TASK-NOT-008
- **Description:** Render notification templates with context
- **Implementation Details:**
  - Variable interpolation: {{customer_name}}, {{suit_number}}, {{eta}}
  - Language selection based on preference
  - Channel-specific formatting (SMS plain, WhatsApp rich)
  - Render all channels for a template code
- **Acceptance Criteria:**
  - Templates render with real data
  - Language and channel formatting correct
- **Definition of Done:** Templates render with real data

---

## Story 5.2: Channel Integrations
**Points:** 13
**Dependencies:** Story 5.1

### TASK-NOT-005: Implement Twilio SMS integration
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-NOT-004
- **Blocks:** TASK-NOT-008
- **Description:** Send SMS via Twilio
- **Implementation Details:**
  - Configure sender number per region (UAE, UK, India)
  - Send with status callback
  - Handle delivery receipts
  - Log all sends with message_id
- **Acceptance Criteria:**
  - SMS delivered to UAE/UK/India numbers
  - Delivery tracked
- **Definition of Done:** SMS messages delivered

### TASK-NOT-006: Implement WhatsApp Business API integration
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-NOT-004
- **Blocks:** TASK-NOT-008
- **Description:** Send WhatsApp messages via Meta Business API
- **Implementation Details:**
  - Support template messages (pre-approved by Meta)
  - Support text messages
  - Support location sharing (for deliveries)
  - Support interactive buttons
  - Handle status webhooks
  - Handle incoming messages
- **Acceptance Criteria:**
  - Templates sent and tracked
  - Interactive messages supported
- **Definition of Done:** WhatsApp templates sent and tracked

### TASK-NOT-007: Implement Firebase Push Notifications
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-NOT-004
- **Blocks:** TASK-NOT-008
- **Description:** Send push notifications via FCM
- **Implementation Details:**
  - Configure for each app (customer, tailor, driver, inspector, admin)
  - Support multicast to multiple tokens
  - Android and iOS specific payloads
  - Handle invalid token cleanup
  - Deep link data for navigation
- **Acceptance Criteria:**
  - Push delivered to all apps
  - Deep links functional
- **Definition of Done:** Push notifications delivered to apps

### TASK-NOT-008: Implement notification orchestrator
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-NOT-003, TASK-NOT-004, TASK-NOT-005, TASK-NOT-006, TASK-NOT-007
- **Blocks:** TASK-NOT-009
- **Description:** Main service coordinating notification sends
- **Implementation Details:**
  - Accept template_code and context
  - Determine channels based on preferences and template config
  - Check quiet hours (bypass if critical)
  - Render templates
  - Send to all channels
  - Log results
  - Handle scheduling for delayed sends
- **Acceptance Criteria:**
  - Single call sends to appropriate channels
  - Preferences respected
- **Definition of Done:** Single call sends to all appropriate channels

---

## Story 5.3: Notification Templates
**Points:** 8
**Dependencies:** Story 5.2

### TASK-NOT-009: Create customer notification templates
- **Type:** Configuration
- **Priority:** P1
- **Depends On:** TASK-NOT-008
- **Blocks:** None
- **Description:** Define customer-facing notification templates
- **Templates:**
  - ORDER_CONFIRMED: SMS + WhatsApp + Push
  - PRODUCTION_STARTED: WhatsApp + Push
  - QC_PASSED: WhatsApp + Push
  - SUIT_SHIPPED: SMS + WhatsApp + Push
  - OUT_FOR_DELIVERY: SMS + WhatsApp + Push (with location)
  - ARRIVING_SOON: WhatsApp + Push (bypass quiet hours)
  - DELIVERED: SMS + WhatsApp + Push (with photo)
  - DELIVERY_DELAYED: SMS + WhatsApp + Push (bypass quiet hours)
- **Acceptance Criteria:**
  - Full customer journey notified
  - Multi-language content
- **Definition of Done:** Customer journey fully notified

### TASK-NOT-010: Create tailor notification templates
- **Type:** Configuration
- **Priority:** P1
- **Depends On:** TASK-NOT-008
- **Blocks:** None
- **Description:** Define tailor-facing notification templates
- **Templates:**
  - JOB_AVAILABLE: SMS + Push
  - JOB_CLAIMED_CONFIRMATION: SMS + Push
  - PATTERN_READY: SMS + Push
  - SLA_WARNING: SMS + Push (bypass quiet hours)
  - QC_RESULT: SMS + Push
  - PAYOUT_SENT: SMS + Push
- **Acceptance Criteria:**
  - Tailors notified at all key points
  - Hindi language support
- **Definition of Done:** Tailor app notifications working

### TASK-NOT-011: Create operations notification templates
- **Type:** Configuration
- **Priority:** P1
- **Depends On:** TASK-NOT-008
- **Blocks:** None
- **Description:** Define driver, inspector, admin templates
- **Templates:**
  - Driver: ROUTE_ASSIGNED, CUSTOMS_CLEARED, ROUTE_UPDATE
  - Inspector: INSPECTION_ASSIGNED, INSPECTION_URGENT
  - Admin: ALERT_CRITICAL, DAILY_SUMMARY
- **Acceptance Criteria:**
  - All staff roles notified appropriately
- **Definition of Done:** All staff roles notified appropriately

---

# EPIC 6: VAPI VOICE AI INTEGRATION
**Priority:** P1 - Escalation Automation
**Dependencies:** Epic 4
**Description:** Automated voice calls for job escalation and customer coordination

---

## Story 6.1: VAPI Assistants
**Points:** 13
**Dependencies:** Story 4.2

### TASK-VOI-001: Create tailor job escalation assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Depends On:** TASK-OPT-009
- **Blocks:** TASK-VOI-005
- **Description:** Voice AI for calling tailors about unclaimed jobs
- **Implementation Details:**
  - Hindi/English language support
  - First message announces job opportunity (fabric, payout INR 8500, deadline)
  - Collects: accepted (yes/no), reason if declined, callback_requested
  - Functions: record_response, accept_job
  - Max duration: 90 seconds
  - End call phrases: "I'll take it", "No thank you"
- **Acceptance Criteria:**
  - Tailor can accept job via voice
  - Response recorded
- **Definition of Done:** Tailor can accept job via voice call

### TASK-VOI-002: Create tailor SLA warning assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Depends On:** TASK-OPT-023
- **Blocks:** TASK-VOI-005
- **Description:** Voice AI for checking on at-risk production
- **Implementation Details:**
  - First message states urgency and time remaining
  - Collects: current_stage, estimated_completion, issues, needs_support
  - Functions: report_status, request_support
  - Empathetic tone acknowledging pressure
  - Max duration: 120 seconds
- **Acceptance Criteria:**
  - Production status captured
  - Support requests logged
- **Definition of Done:** At-risk tailors checked automatically

### TASK-VOI-003: Create customer delivery assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Depends On:** TASK-API-012
- **Blocks:** TASK-VOI-005
- **Description:** Voice AI for delivery coordination
- **Implementation Details:**
  - Arabic/English language support
  - First message announces imminent delivery
  - Collects: available (yes/no), alternate_recipient, special_instructions
  - Functions: record_preference, update_delivery_instructions
  - Polite luxury brand tone
  - Max duration: 90 seconds
- **Acceptance Criteria:**
  - Customer availability confirmed
  - Instructions captured
- **Definition of Done:** Customer availability confirmed pre-delivery

### TASK-VOI-004: Create inspector dispatch assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Depends On:** TASK-API-009
- **Blocks:** TASK-VOI-005
- **Description:** Voice AI for urgent inspection assignments
- **Implementation Details:**
  - First message describes urgent inspection need
  - Collects: accepted, available_time, reason_declined
  - Functions: record_availability, accept_inspection
  - Max duration: 60 seconds
- **Acceptance Criteria:**
  - Inspector acceptance captured
  - Availability recorded
- **Definition of Done:** Inspectors dispatched for urgent QC

---

## Story 6.2: VAPI Integration Service
**Points:** 8
**Dependencies:** Story 6.1

### TASK-VOI-005: Implement VAPI client wrapper
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-VOI-001, TASK-VOI-002, TASK-VOI-003, TASK-VOI-004
- **Blocks:** TASK-VOI-006
- **Description:** API client for VAPI voice calls
- **Implementation Details:**
  - Authenticate with VAPI API key
  - Single call method with assistant overrides
  - Bulk call method with concurrency control
  - Get call status and transcript
  - End call method
- **Acceptance Criteria:**
  - Calls initiated programmatically
  - Status tracked
- **Definition of Done:** Voice calls can be initiated programmatically

### TASK-VOI-006: Implement tailor escalation service
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-VOI-005, TASK-OPT-009
- **Blocks:** None
- **Description:** Orchestrate tailor escalation calls
- **Implementation Details:**
  - Accept job and list of tailors to call (up to 20)
  - Call all 20 simultaneously (VAPI concurrent calls)
  - Stop calling when job claimed
  - Record all call results
  - Log claim method (app vs voice)
  - Return results with success/failure
- **Acceptance Criteria:**
  - 20 tailors called in parallel
  - First acceptor gets job
- **Definition of Done:** 20 tailors called in parallel for unclaimed job

### TASK-VOI-007: Implement VAPI webhook handler
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-VOI-005
- **Blocks:** None
- **Description:** Handle VAPI call completion webhooks
- **Implementation Details:**
  - Verify webhook signature
  - Parse function call results
  - Update relevant records (assignments, inspections)
  - Log transcripts
  - Handle status updates (call_started, call_ended)
- **Acceptance Criteria:**
  - Voice call results update system state
  - Full transcript logged
- **Definition of Done:** Voice call results update system state

---

# EPIC 7: MOBILE APPS
**Priority:** P1 - Field Operations
**Dependencies:** Epics 4, 5
**Description:** Mobile applications for tailors, drivers, and inspectors

---

## Story 7.1: Tailor App
**Points:** 21
**Dependencies:** Story 4.2

### TASK-APP-001: Create tailor app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** None
- **Blocks:** TASK-APP-002
- **Description:** Initialize React Native project with navigation
- **Implementation Details:**
  - Expo managed workflow
  - React Navigation with bottom tabs
  - Authentication context
  - API client configuration
  - Push notification setup (FCM)
- **Acceptance Criteria:**
  - App builds for iOS and Android
  - Authentication flow working
- **Definition of Done:** App builds and runs on iOS/Android

### TASK-APP-002: Implement tailor home screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-001, TASK-API-002
- **Blocks:** TASK-APP-003
- **Description:** Dashboard showing earnings and active jobs
- **Implementation Details:**
  - Today's earnings card (INR)
  - Active jobs list with progress indicators
  - Performance stats (QC pass rate, avg time)
  - Quick action: View Job Board
- **Acceptance Criteria:**
  - Real-time earnings displayed
  - Active jobs visible
- **Definition of Done:** Tailor sees their status at a glance

### TASK-APP-003: Implement job board screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-002, TASK-API-005
- **Blocks:** TASK-APP-004
- **Description:** List of available jobs to claim
- **Implementation Details:**
  - Filter by fabric, complexity
  - Job cards showing: fabric thumbnail, payout (INR 8,500), deadline, distance to QC
  - Sort by deadline urgency
  - Pull to refresh
  - Tap to view details
- **Acceptance Criteria:**
  - Jobs filterable and sortable
  - Clear payout and deadline visibility
- **Definition of Done:** Tailors can browse available work

### TASK-APP-004: Implement job details and claim flow
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-003, TASK-API-006
- **Blocks:** TASK-APP-005
- **Description:** View job details and claim
- **Implementation Details:**
  - Full specification display
  - Measurements visualization
  - Payout breakdown
  - SLA timeline
  - "Claim Job" button with confirmation
  - Download pattern files
- **Acceptance Criteria:**
  - All job details visible
  - Claim is atomic
- **Definition of Done:** Tailor claims job and downloads pattern

### TASK-APP-005: Implement active job tracking screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-004, TASK-API-007
- **Blocks:** TASK-APP-006
- **Description:** Track progress on claimed job
- **Implementation Details:**
  - Stage progress stepper (cutting→canvas→assembly→sleeves→collar→trousers→finishing→pressing)
  - "Update Stage" button requiring photo
  - Timer showing time on current stage
  - SLA countdown with color coding
  - "Report Issue" action
  - "Mark Complete" requiring final photos
- **Acceptance Criteria:**
  - Progress tracked stage by stage
  - Photos required at each stage
- **Definition of Done:** Production tracked with photo evidence

### TASK-APP-006: Implement tailor earnings screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-005
- **Blocks:** None
- **Description:** View earnings history and payouts
- **Implementation Details:**
  - Period selector: today, week, month
  - Earnings chart
  - Transaction list with job references
  - Payout status (pending, processing, paid via UPI)
  - Download statement
- **Acceptance Criteria:**
  - Earnings history visible
  - UPI payout status tracked
- **Definition of Done:** Tailor tracks their income

---

## Story 7.2: Driver App
**Points:** 21
**Dependencies:** Story 4.4

### TASK-APP-007: Create driver app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** None
- **Blocks:** TASK-APP-008
- **Description:** Initialize driver app with GPS tracking
- **Implementation Details:**
  - Expo managed workflow
  - Background location tracking
  - Maps integration (Google Maps)
  - Authentication
  - Push notifications
- **Acceptance Criteria:**
  - Background GPS tracking working
  - Maps rendering
- **Definition of Done:** App tracks location in background

### TASK-APP-008: Implement driver home screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-007
- **Blocks:** TASK-APP-009
- **Description:** Dashboard with route status and van assignment
- **Implementation Details:**
  - Current van assignment
  - Today's route summary (stops, suits, estimated time)
  - Status toggle: Available/On Break
  - Quick action: Start Route
- **Acceptance Criteria:**
  - Van and route visible
  - Status controls working
- **Definition of Done:** Driver sees their assignment

### TASK-APP-009: Implement active route screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-008, TASK-API-011
- **Blocks:** TASK-APP-010
- **Description:** Turn-by-turn navigation for deliveries
- **Implementation Details:**
  - Map showing route with all stops
  - Current stop highlighted
  - Next stop card with hotel name, suits, ETA
  - "Navigate" button to open Google Maps
  - "Arrived" button
  - Progress indicator (3/15 stops)
- **Acceptance Criteria:**
  - Route displayed on map
  - Navigation integrated
- **Definition of Done:** Driver navigates full route

### TASK-APP-010: Implement stop details screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-009
- **Blocks:** TASK-APP-011
- **Description:** Delivery information for current stop
- **Implementation Details:**
  - Hotel name and address
  - Delivery entrance instructions
  - Concierge contact (call button)
  - List of suits for this stop
  - Customer names (for verification)
  - Special instructions
- **Acceptance Criteria:**
  - All delivery details visible
  - Contact buttons functional
- **Definition of Done:** Driver has all info for delivery

### TASK-APP-011: Implement delivery confirmation flow
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-010, TASK-API-013
- **Blocks:** TASK-APP-012
- **Description:** Confirm successful delivery
- **Implementation Details:**
  - Recipient selector: Customer, Concierge, Front Desk
  - Signature capture (optional by hotel)
  - Photo of handoff (required)
  - "Confirm Delivery" submits and moves to next stop
- **Acceptance Criteria:**
  - Photo proof captured
  - Delivery confirmed atomically
- **Definition of Done:** Deliveries confirmed with proof

### TASK-APP-012: Implement delivery issue flow
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-011, TASK-API-014
- **Blocks:** None
- **Description:** Report delivery problems
- **Implementation Details:**
  - Issue type selector
  - Photo capture (optional)
  - Notes field
  - Submit creates alert
  - System provides next action
- **Acceptance Criteria:**
  - Issues reported with context
  - Next action displayed
- **Definition of Done:** Issues escalated to operations

---

## Story 7.3: Inspector App
**Points:** 13
**Dependencies:** Story 4.3

### TASK-APP-013: Create inspector app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** None
- **Blocks:** TASK-APP-014
- **Description:** Initialize inspector app
- **Implementation Details:**
  - Expo managed workflow
  - Camera optimization for quality photos
  - Authentication
  - Push notifications
- **Acceptance Criteria:**
  - Camera quality suitable for QC photos
- **Definition of Done:** App ready for QC workflow

### TASK-APP-014: Implement inspector home screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-013, TASK-API-009
- **Blocks:** TASK-APP-015
- **Description:** Queue and performance dashboard
- **Implementation Details:**
  - Queue toggle: At Facility
  - Pending inspections count
  - Inspection queue list with urgency indicators
  - Today's stats (completed, pass rate)
- **Acceptance Criteria:**
  - Queue prioritized by urgency
  - Stats displayed
- **Definition of Done:** Inspector sees their workload

### TASK-APP-015: Implement QC checklist screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-014
- **Blocks:** TASK-APP-016
- **Description:** Full QC inspection workflow
- **Implementation Details:**
  - Sections: Visual, Measurements, Construction, Finishing
  - Visual: 5 checkbox items (grain alignment, color match, pressing, symmetry, buttonhole quality)
  - Measurements: Input fields with target and tolerance (chest, waist, sleeve, etc.)
  - Construction: 4 checkbox items
  - Finishing: 4 checkbox items
  - Photo capture required per section
  - Save progress, Submit result
- **Acceptance Criteria:**
  - Full checklist digitized
  - Photos required
- **Definition of Done:** Full QC checklist digital

### TASK-APP-016: Implement QC result submission
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-015, TASK-API-010
- **Blocks:** None
- **Description:** Submit pass/fail decision
- **Implementation Details:**
  - Summary of all scores
  - Result selector: Pass, Conditional Pass, Fail
  - Issues picker for Fail (categorized)
  - Rework instructions field for Fail
  - Notes field (optional for Pass)
  - Submit updates suit status
- **Acceptance Criteria:**
  - Result recorded with full context
  - Workflow triggered
- **Definition of Done:** QC results recorded and actioned

---

## Story 7.4: Admin App
**Points:** 13
**Dependencies:** Story 4.5

### TASK-APP-017: Create admin app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** None
- **Blocks:** TASK-APP-018
- **Description:** Initialize admin/operations app
- **Implementation Details:**
  - Expo managed workflow
  - Role-based feature access
  - Push notifications for alerts
  - Real-time WebSocket connection
- **Acceptance Criteria:**
  - Role-based access working
  - Real-time updates received
- **Definition of Done:** Admin app scaffolded

### TASK-APP-018: Implement control tower dashboard
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-017, TASK-API-015
- **Blocks:** TASK-APP-019
- **Description:** Real-time operations overview
- **Implementation Details:**
  - Pipeline funnel visualization
  - Risk summary cards (suits by severity)
  - Flight status cards
  - Van fleet status with map
  - Alerts badge
  - Tap any card to drill down
- **Acceptance Criteria:**
  - Full operational visibility
  - Real-time updates
- **Definition of Done:** Ops manager has mobile visibility

### TASK-APP-019: Implement alerts management
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-018, TASK-API-018
- **Blocks:** TASK-APP-020
- **Description:** View and respond to alerts
- **Implementation Details:**
  - Filter by severity, status
  - Alert cards with entity context
  - Swipe to acknowledge
  - Tap for details and actions
  - Resolve with notes
  - Escalate to another role
- **Acceptance Criteria:**
  - Alert workflow complete on mobile
- **Definition of Done:** Alerts actioned from mobile

### TASK-APP-020: Implement suit lookup and intervention
- **Type:** Mobile/React Native
- **Priority:** P1
- **Depends On:** TASK-APP-019, TASK-API-017
- **Blocks:** None
- **Description:** Find and manage individual suits
- **Implementation Details:**
  - Search by suit_number, order_number, customer
  - Suit detail view with full timeline
  - Action buttons: Contact Customer, Reassign, Expedite, Cancel
  - Requires reason for actions
  - Updates timeline
- **Acceptance Criteria:**
  - Any suit findable
  - Interventions logged
- **Definition of Done:** Manual interventions from mobile

---

# EPIC 8: WEB DASHBOARD
**Priority:** P1 - Operations Control
**Dependencies:** Epics 3, 4
**Description:** Web-based operations dashboard for control tower

---

## Story 8.1: Dashboard Core
**Points:** 13
**Dependencies:** Story 3.2

### TASK-WEB-001: Create dashboard project structure
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** None
- **Blocks:** TASK-WEB-002
- **Description:** Initialize React dashboard with routing
- **Implementation Details:**
  - Next.js or Vite
  - Tailwind CSS
  - React Query for data fetching
  - WebSocket integration
  - Authentication flow
- **Acceptance Criteria:**
  - Dashboard shell running
  - Auth integrated
- **Definition of Done:** Dashboard shell running

### TASK-WEB-002: Implement real-time data hooks
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-001, TASK-EVT-008
- **Blocks:** TASK-WEB-003
- **Description:** React Query hooks with WebSocket updates
- **Implementation Details:**
  - usePipelineSummary() with real-time updates
  - useActiveSuits(filters) with live risk updates
  - useFlightsDashboard() with status updates
  - useGroundFleet() with live locations
  - useAlerts(filters) with new alert push
- **Acceptance Criteria:**
  - Data updates without refresh
  - Efficient re-rendering
- **Definition of Done:** Dashboard updates without refresh

### TASK-WEB-003: Implement pipeline summary panel
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-002, TASK-API-015
- **Blocks:** TASK-WEB-004
- **Description:** Visual pipeline showing suit flow
- **Implementation Details:**
  - Columns: Production, QC Queue, Packed, In Air, Delivered
  - Count per stage with change indicators
  - Click to view suits in that stage
  - Color coding by risk severity
- **Acceptance Criteria:**
  - Pipeline status visible at glance
  - Drill-down functional
- **Definition of Done:** Pipeline status visible at glance

### TASK-WEB-004: Implement risk alerts panel
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-003, TASK-OPT-024
- **Blocks:** TASK-WEB-005
- **Description:** Prioritized list of at-risk suits
- **Implementation Details:**
  - Filter by severity (green, amber, red, critical)
  - Show suit, risk score, risk factors
  - Action buttons: Respond, Monitor
  - Click to view suit details
  - Real-time addition of new risks
- **Acceptance Criteria:**
  - At-risk suits surfaced immediately
  - Actions accessible
- **Definition of Done:** At-risk suits surfaced immediately

---

## Story 8.2: Fleet Visualization
**Points:** 13
**Dependencies:** Story 8.1

### TASK-WEB-005: Implement flight status panel
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-004
- **Blocks:** TASK-WEB-006
- **Description:** Show all flights for today
- **Implementation Details:**
  - Card per flight with status icon
  - Route visualization (ATQ → MCT → AUH → SHJ)
  - Manifest count
  - ETA per leg
  - Click to view manifest details
- **Acceptance Criteria:**
  - Flight status tracked visually
  - Route clear
- **Definition of Done:** Flight status tracked

### TASK-WEB-006: Implement ground fleet map
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-005
- **Blocks:** TASK-WEB-007
- **Description:** Live map of UAE delivery vans
- **Implementation Details:**
  - Map of UAE (Google Maps or Mapbox)
  - Van markers with real-time positions
  - Color by status (available, delivering, returning)
  - Click van for route details
  - Show delivery stops as pins
- **Acceptance Criteria:**
  - Van locations update in real-time
  - Route visible on click
- **Definition of Done:** Van locations live on map

### TASK-WEB-007: Implement van detail panel
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-006
- **Blocks:** TASK-WEB-008
- **Description:** Detailed view of individual van
- **Implementation Details:**
  - Van info and driver
  - Current route progress
  - Stop list with ETAs and status
  - Suits on board
  - Contact driver button
- **Acceptance Criteria:**
  - Full van context available
- **Definition of Done:** Full van context available

---

## Story 8.3: Staff Management
**Points:** 8
**Dependencies:** Story 8.2

### TASK-WEB-008: Implement staff list views
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-007
- **Blocks:** TASK-WEB-009
- **Description:** Tabbed view of all staff types
- **Implementation Details:**
  - Tabs: Tailors, Drivers, Inspectors, Admins
  - Searchable, filterable tables
  - Status badges
  - Performance metrics
  - Click for profile
- **Acceptance Criteria:**
  - All staff viewable
  - Filtering functional
- **Definition of Done:** All staff viewable

### TASK-WEB-009: Implement staff profile management
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-008
- **Blocks:** TASK-WEB-010
- **Description:** View and edit staff details
- **Implementation Details:**
  - Profile information
  - Performance history (charts)
  - Current assignments
  - Action buttons: Edit, Suspend, Deactivate, Message, Call
  - Activity log
- **Acceptance Criteria:**
  - Full profile management
- **Definition of Done:** Staff managed from dashboard

### TASK-WEB-010: Implement staff onboarding form
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-WEB-009
- **Blocks:** None
- **Description:** Add new staff members
- **Implementation Details:**
  - Role selector
  - Role-specific fields
  - Document upload (for drivers - license)
  - Send invite
  - Assign to zone/airport
- **Acceptance Criteria:**
  - New staff added via dashboard
  - Invites sent
- **Definition of Done:** New staff added via dashboard

---

# EPIC 9: AMRITSAR FACILITY OPERATIONS
**Priority:** P0 - Production Core
**Dependencies:** Epics 1, 2
**Description:** Systems for the Amritsar facility with 10-min QC proximity

---

## Story 9.1: Optitex Automation Pipeline
**Points:** 21
**Dependencies:** Story 1.1

### TASK-FAC-001: Create measurement ingestion API
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-API-004
- **Blocks:** TASK-FAC-002
- **Description:** Receive 3D scan data and queue for pattern generation
- **Implementation Details:**
  - Accept scan JSON with body measurements
  - Validate measurement completeness (all required dimensions)
  - Link to order/suit
  - Queue for Optitex processing
  - Return job_id for tracking
- **Acceptance Criteria:**
  - Scans validated and queued
  - Job ID returned for tracking
- **Definition of Done:** Scans flow into processing queue

### TASK-FAC-002: Implement Optitex API integration
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-FAC-001
- **Blocks:** TASK-FAC-003
- **Description:** Automate pattern generation via Optitex API
- **Implementation Details:**
  - Authenticate with Optitex
  - Submit measurement set
  - Poll for completion
  - Download generated pattern files
  - Download 3D mesh preview
  - Handle errors and retries
- **Acceptance Criteria:**
  - Patterns generated automatically
  - Errors handled gracefully
- **Definition of Done:** Patterns generated automatically

### TASK-FAC-003: Implement pattern file processing
- **Type:** Backend/Python
- **Priority:** P0
- **Depends On:** TASK-FAC-002
- **Blocks:** TASK-FAC-004
- **Description:** Process Optitex output for plotting
- **Implementation Details:**
  - Extract marker layout
  - Convert to plotter format (HPGL)
  - Generate cutting instructions
  - Store files with CDN URLs
  - Update suit with S05_PATTERN_READY status
- **Acceptance Criteria:**
  - Plotter-ready files generated
  - CDN URLs accessible
- **Definition of Done:** Patterns ready for plotter

### TASK-FAC-004: Implement plotter queue manager
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-FAC-003
- **Blocks:** TASK-FAC-005
- **Description:** Manage queue of patterns for 10 concurrent plotters
- **Implementation Details:**
  - Queue patterns by priority (deadline)
  - Assign to available plotter
  - Track plotter status (idle, cutting, error)
  - Handle plotter errors (reassign to another)
  - Update suit status on print completion
- **Acceptance Criteria:**
  - 10 plotters managed concurrently
  - Failures handled with reassignment
- **Definition of Done:** 540+ patterns/day capacity with 10 plotters

### TASK-FAC-005: Create Optitex operator dashboard
- **Type:** Frontend/React
- **Priority:** P0
- **Depends On:** TASK-FAC-004
- **Blocks:** None
- **Description:** Monitoring UI for automated pipeline
- **Implementation Details:**
  - Queue status (pending, processing, complete, failed)
  - Plotter status per machine (10 machines)
  - Manual intervention for failures
  - Override pattern if needed
  - Production rate metrics
- **Acceptance Criteria:**
  - Full pipeline visibility
  - Manual intervention possible
- **Definition of Done:** 1 operator per shift can monitor 180 patterns

---

## Story 9.2: QC Station Management
**Points:** 13
**Dependencies:** Story 9.1

### TASK-FAC-006: Implement QC station assignment
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-API-009
- **Blocks:** TASK-FAC-007
- **Description:** Assign suits to QC stations (tailors walk in, 10 min from all workshops)
- **Implementation Details:**
  - Track QC stations
  - Assign suit to available station
  - Track inspector at station
  - Handle suit movement (tailor arrival → station → passed/failed)
  - Update location in real-time
- **Acceptance Criteria:**
  - QC flow tracked
  - Station utilization monitored
- **Definition of Done:** QC flow tracked

### TASK-FAC-007: Implement QC throughput monitoring
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-FAC-006
- **Blocks:** TASK-FAC-008
- **Description:** Track QC capacity and utilization
- **Implementation Details:**
  - Track inspections per inspector per shift
  - Calculate average inspection time
  - Alert if throughput drops
  - Predict end-of-shift completion
- **Acceptance Criteria:**
  - Bottlenecks detected early
  - Predictions accurate
- **Definition of Done:** QC bottlenecks detected early

### TASK-FAC-008: Create QC station dashboard
- **Type:** Frontend/React
- **Priority:** P0
- **Depends On:** TASK-FAC-007
- **Blocks:** None
- **Description:** Display for QC zone
- **Implementation Details:**
  - Wall-mounted display
  - Station status cards
  - Queue depth per inspector
  - Shift totals and targets
  - Alert highlight for urgent suits
- **Acceptance Criteria:**
  - QC team has visibility
  - Urgency highlighted
- **Definition of Done:** QC team has visibility

---

## Story 9.3: Packing and Dispatch
**Points:** 8
**Dependencies:** Story 9.2

### TASK-FAC-009: Implement packing station workflow
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-API-010
- **Blocks:** TASK-FAC-010
- **Description:** Track suit through packing process
- **Implementation Details:**
  - Scan suit barcode
  - Display packing checklist
  - Generate shipping label
  - Record packing completion
  - Update suit status to S19_PACKED
- **Acceptance Criteria:**
  - Suits packed with documentation
  - Status updated
- **Definition of Done:** Suits packed with documentation

### TASK-FAC-010: Implement flight manifest builder
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-FAC-009, TASK-OPT-004
- **Blocks:** TASK-LOG-003
- **Description:** Prepare manifest for charter flight
- **Implementation Details:**
  - Query all packed suits for next flight
  - Group by unload airport (SHJ vs AUH)
  - Generate manifest document
  - Calculate weights and counts
  - Submit customs pre-clearance documentation
- **Acceptance Criteria:**
  - Manifest ready 2 hours before departure
  - Customs docs submitted
- **Definition of Done:** Manifest ready 2 hours before departure

### TASK-FAC-011: Create packing station interface
- **Type:** Frontend/React
- **Priority:** P0
- **Depends On:** TASK-FAC-009
- **Blocks:** None
- **Description:** UI for packing stations
- **Implementation Details:**
  - Barcode scanner input
  - Packing checklist display
  - Print label button
  - Next suit in queue
  - Shift totals
- **Acceptance Criteria:**
  - Packing stations operational
  - Efficient workflow
- **Definition of Done:** Packing stations operational

---

# EPIC 10: CHARTER LOGISTICS
**Priority:** P0 - Delivery Core
**Dependencies:** Epics 2, 4
**Description:** Saab 340F charter operations ATQ → UAE (single-hub or dual-drop)

---

## Story 10.1: Flight Scheduling
**Points:** 13
**Dependencies:** Story 1.3

### TASK-LOG-001: Create flight schedule API
- **Type:** Backend/API
- **Priority:** P0
- **Depends On:** TASK-DB-009
- **Blocks:** TASK-LOG-002
- **Description:** Manage charter flight schedules
- **Implementation Details:**
  - Create flight with schedule, aircraft type (Saab 340F), route type
  - Update flight status through lifecycle
  - Query flights by date, status
  - Calculate capacity remaining
- **Acceptance Criteria:**
  - Flights scheduled and tracked
  - Capacity managed
- **Definition of Done:** Flights can be scheduled

### TASK-LOG-002: Implement hub selection logic
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-001, TASK-DB-018
- **Blocks:** TASK-LOG-003
- **Description:** Auto-determine single-hub vs dual-drop based on demand
- **Implementation Details:**
  - Analyze order destinations 6 hours before departure
  - Check event calendar for demand pattern
  - Decision logic:
    - Abu Dhabi ratio > 40%: dual-drop (ATQ→MCT→AUH→SHJ)
    - Abu Dhabi ratio > 20%: evaluate cost trade-off
    - Else: single-hub SHJ
  - Persist recommendation for ops approval
- **Acceptance Criteria:**
  - Route auto-selected based on demand
  - Event calendar influences decision
- **Definition of Done:** Route auto-selected based on demand pattern

### TASK-LOG-003: Implement manifest close workflow
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-002, TASK-FAC-010
- **Blocks:** TASK-LOG-004
- **Description:** Close manifest and finalize assignments
- **Implementation Details:**
  - 2 hours before departure: close manifest
  - Run flight planning optimizer
  - Generate final manifest with suit-to-leg assignments
  - Create customs pre-clearance request
  - Notify dispatch team
- **Acceptance Criteria:**
  - Manifest locked on time
  - Customs docs generated
- **Definition of Done:** Manifest locked 2 hours pre-departure

### TASK-LOG-004: Implement flight tracking integration
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-003
- **Blocks:** TASK-OPT-022
- **Description:** Track flight position via ADS-B/FlightAware
- **Implementation Details:**
  - Query flight position every 5 minutes
  - Update flight status on departure/arrival
  - Detect delays automatically
  - Propagate delay to all suits on manifest (risk score update)
  - Alert operations on significant delay (>30 min)
- **Acceptance Criteria:**
  - Real-time flight tracking
  - Delays trigger risk updates
- **Definition of Done:** Flight delays detected in real-time

---

## Story 10.2: Customs Integration
**Points:** 8
**Dependencies:** Story 10.1

### TASK-LOG-005: Implement customs pre-clearance submission
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-003
- **Blocks:** TASK-LOG-006
- **Description:** Submit manifest to UAE customs pre-arrival
- **Implementation Details:**
  - Generate required documentation (commercial invoice, packing list)
  - Submit via customs API or broker portal
  - Track submission status
  - Handle rejections/queries
- **Acceptance Criteria:**
  - Pre-clearance submitted before landing
  - Rejections handled
- **Definition of Done:** Pre-clearance submitted before landing

### TASK-LOG-006: Implement customs clearance tracking
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-005
- **Blocks:** TASK-LOG-007
- **Description:** Track clearance status at UAE airports
- **Implementation Details:**
  - Integrate with broker status updates
  - Update suit status on clearance (S22_CUSTOMS_CLEARED)
  - Alert on holds or inspections
  - Record clearance time for metrics
- **Acceptance Criteria:**
  - Customs status tracked per suit
  - Holds escalated
- **Definition of Done:** Customs status tracked per suit

---

## Story 10.3: Ground Operations UAE
**Points:** 13
**Dependencies:** Story 10.2

### TASK-LOG-007: Implement van dispatch system
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-006, TASK-OPT-018
- **Blocks:** TASK-LOG-008
- **Description:** Assign vans to delivery routes on customs clearance
- **Implementation Details:**
  - Track van availability per airport (SHJ, AUH)
  - Assign vans based on route zone
  - Dispatch on customs clearance
  - Track van loading
  - Update van status through workflow
- **Acceptance Criteria:**
  - Vans dispatched automatically
  - Loading tracked
- **Definition of Done:** Vans dispatched on arrival

### TASK-LOG-008: Implement driver shift management
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-007
- **Blocks:** TASK-LOG-009
- **Description:** Manage driver availability and hours
- **Implementation Details:**
  - Track shift start/end
  - Monitor hours worked
  - Alert approaching overtime
  - Handle shift handover
- **Acceptance Criteria:**
  - Driver hours compliant
  - Handovers smooth
- **Definition of Done:** Driver hours compliant

### TASK-LOG-009: Implement delivery zone routing
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Depends On:** TASK-LOG-008
- **Blocks:** None
- **Description:** Assign deliveries to zones and vans
- **Implementation Details:**
  - Group suits by zone
  - Assign zones to vans based on home zone
  - Balance load across vans (max 25 suits each)
  - Handle overflow to additional vans
- **Acceptance Criteria:**
  - Deliveries distributed efficiently
  - Capacity respected
- **Definition of Done:** Deliveries distributed efficiently

---

# EPIC 11: FINANCIAL INTEGRATION
**Priority:** P1 - Revenue & Payments
**Dependencies:** Epic 4
**Description:** Stripe payments, tailor UPI payouts, commission tracking (Raja Exclusive model)

---

## Story 11.1: Payment Processing
**Points:** 13
**Dependencies:** Story 4.1

### TASK-FIN-001: Implement Stripe payment capture
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-API-001
- **Blocks:** TASK-FIN-002
- **Description:** Capture payments for orders (GBP 1500 UK pricing)
- **Implementation Details:**
  - Create payment intent for order total
  - Handle 3D Secure flow
  - Confirm payment capture
  - Account for Stripe fees (2% + 20p)
  - Update order payment_status
  - Trigger order processing on capture (clock starts)
- **Acceptance Criteria:**
  - Payments captured securely
  - Fees accounted
  - Clock starts on capture
- **Definition of Done:** Payments captured, clock starts

### TASK-FIN-002: Implement wedding planner commission tracking
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-FIN-001
- **Blocks:** TASK-FIN-003
- **Description:** Track 10% gross commission for referring planners
- **Implementation Details:**
  - Link order to referring planner
  - Calculate commission on gross sale (10% of GBP 1500 = GBP 150)
  - Track commission status: pending, approved, paid
  - Generate payout report
  - Integrate with bank transfer or PayPal
- **Acceptance Criteria:**
  - Commission calculated on gross
  - Payout tracked
- **Definition of Done:** Planner commissions tracked

### TASK-FIN-003: Implement ops commission calculation
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-FIN-002
- **Blocks:** None
- **Description:** Calculate quarterly 5% net profit commission for Amritsar ops
- **Implementation Details:**
  - Calculate net profit per order (after all costs, Stripe fees, planner commission, production, shipping, tax)
  - Sum quarterly
  - Calculate 5% commission
  - Generate quarterly report
  - Schedule UPI payout
- **Acceptance Criteria:**
  - Net profit correctly calculated
  - Quarterly commission ready
- **Definition of Done:** Quarterly ops commission calculated

---

## Story 11.2: Tailor Payouts
**Points:** 8
**Dependencies:** Story 4.3

### TASK-FIN-004: Implement tailor payout trigger
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-API-010
- **Blocks:** TASK-FIN-005
- **Description:** Trigger payout on QC pass
- **Implementation Details:**
  - On QC pass, mark assignment for payout
  - Calculate payout amount: INR 8,500 for full suit
  - Queue for UPI transfer
  - Update payout_status
- **Acceptance Criteria:**
  - Payout triggered on QC pass
  - Amount correct
- **Definition of Done:** Tailors paid on quality approval

### TASK-FIN-005: Implement UPI payout integration
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Depends On:** TASK-FIN-004
- **Blocks:** TASK-FIN-006
- **Description:** Execute payouts via UPI to tailor's VPA
- **Implementation Details:**
  - Integrate with payment provider (Razorpay Payouts or PayU)
  - Execute UPI transfer to tailor's VPA
  - Handle failures and retries
  - Update assignment with transaction ID
- **Acceptance Criteria:**
  - UPI transfers executed
  - Failures retried
- **Definition of Done:** Automated UPI payouts working

### TASK-FIN-006: Create tailor payout dashboard
- **Type:** Frontend/React
- **Priority:** P1
- **Depends On:** TASK-FIN-005
- **Blocks:** None
- **Description:** Admin view of tailor payments
- **Implementation Details:**
  - List of pending payouts
  - Payout history with transaction IDs
  - Manual payout trigger
  - Failed payout resolution
- **Acceptance Criteria:**
  - Finance can manage payouts
  - History visible
- **Definition of Done:** Finance can manage payouts

---

# EPIC 12: TESTING & QUALITY
**Priority:** P1 - Reliability
**Dependencies:** All previous epics
**Description:** Automated testing and quality assurance

---

## Story 12.1: Unit Testing
**Points:** 8
**Dependencies:** Epics 1-11

### TASK-TST-001: Create optimization algorithm tests
- **Type:** Testing
- **Priority:** P1
- **Depends On:** TASK-OPT-004, TASK-OPT-010, TASK-OPT-016, TASK-OPT-023
- **Blocks:** TASK-TST-003
- **Description:** Unit tests for all optimization algorithms
- **Implementation Details:**
  - Flight planning optimizer tests (demand analysis, hub selection)
  - Tailor assignment optimizer tests (scoring, dual-posting)
  - VRPTW optimizer tests (routing, time windows)
  - Risk scoring tests (composite scoring)
  - Edge cases covered
- **Acceptance Criteria:**
  - >80% coverage on optimization code
  - Edge cases handled
- **Definition of Done:** >80% coverage on optimization code

### TASK-TST-002: Create API endpoint tests
- **Type:** Testing
- **Priority:** P1
- **Depends On:** Epic 4
- **Blocks:** TASK-TST-003
- **Description:** Integration tests for all API endpoints
- **Implementation Details:**
  - Happy path tests for all endpoints
  - Validation error tests
  - Authorization tests (role-based access)
  - Database state verification
- **Acceptance Criteria:**
  - All endpoints have tests
  - Auth verified
- **Definition of Done:** All endpoints have tests

---

## Story 12.2: End-to-End Testing
**Points:** 8
**Dependencies:** Story 12.1

### TASK-TST-003: Create suit journey E2E tests
- **Type:** Testing
- **Priority:** P1
- **Depends On:** TASK-TST-001, TASK-TST-002
- **Blocks:** TASK-TST-004
- **Description:** Full journey from order to delivery
- **Implementation Details:**
  - Order creation → payment → pattern → tailor → production → QC → packing → flight → delivery
  - Dual production path tested
  - State transitions verified
  - Timeline events created
  - Notifications sent
- **Acceptance Criteria:**
  - Full happy path automated
  - 24-hour timeline verified
- **Definition of Done:** Full happy path automated

### TASK-TST-004: Create exception handling E2E tests
- **Type:** Testing
- **Priority:** P1
- **Depends On:** TASK-TST-003
- **Blocks:** None
- **Description:** Test failure scenarios
- **Implementation Details:**
  - QC failure → backup suit activated
  - Flight delay → risk escalation
  - Delivery failure → retry flow
  - Tailor no-show → VAPI escalation
  - Both suits fail QC → emergency escalation
- **Acceptance Criteria:**
  - Recovery paths tested
  - Escalations verified
- **Definition of Done:** Recovery paths tested

---

# SUMMARY

## Epic Overview

| Epic | Stories | Tasks | Priority | Dependencies |
|------|---------|-------|----------|--------------|
| 1. Database & Infrastructure | 6 | 23 | P0 | None |
| 2. Optimization Algorithms | 4 | 24 | P0 | Epic 1 |
| 3. Real-Time Events | 2 | 8 | P0 | Epic 1 |
| 4. API Endpoints | 5 | 18 | P0 | Epics 1, 2, 3 |
| 5. Notifications | 3 | 11 | P1 | Epics 3, 4 |
| 6. VAPI Voice AI | 2 | 7 | P1 | Epic 4 |
| 7. Mobile Apps | 4 | 20 | P1 | Epics 4, 5 |
| 8. Web Dashboard | 3 | 10 | P1 | Epics 3, 4 |
| 9. Facility Operations | 3 | 11 | P0 | Epics 1, 2 |
| 10. Charter Logistics | 3 | 9 | P0 | Epics 2, 4 |
| 11. Financial Integration | 2 | 6 | P1 | Epic 4 |
| 12. Testing | 2 | 4 | P1 | All |
| **TOTAL** | **39** | **151** | | |

---

## Dependency Graph (Execution Order)

```
Phase 1 (Foundation):
  Epic 1: Database ──┬──> Epic 2: Optimization
                     ├──> Epic 3: Events
                     └──> Epic 9: Facility

Phase 2 (Core Integration):
  Epic 2 ──┬──> Epic 4: APIs ──┬──> Epic 5: Notifications
  Epic 3 ──┤                   ├──> Epic 6: VAPI
  Epic 9 ──┘                   └──> Epic 11: Financial
  
Phase 3 (Logistics):
  Epic 4 ──┬──> Epic 10: Charter Logistics
  Epic 2 ──┘

Phase 4 (Applications):
  Epic 4 ──┬──> Epic 7: Mobile Apps
  Epic 5 ──┤
  Epic 3 ──┴──> Epic 8: Web Dashboard

Phase 5 (Quality):
  All ──────> Epic 12: Testing
```

---

## Key Metrics at Full Capacity

| Metric | Value |
|--------|-------|
| Weekly Suits | 3,240 |
| Daily Suits | 540 |
| Shifts | 3 x 8 hours |
| Tailors (concurrent) | Network in 10-min radius |
| Plotters | 10 concurrent |
| QC Inspectors | 7/shift |
| Charter Flights | 2/day (Saab 340F) |
| UAE Vans | 5 |
| Dual Production | Every suit has backup |
| Production Cost (dual) | INR 17,000 / GBP 158 |
| Charter Cost/Suit | GBP 63 (540 suits, 2 flights) |
| Tailor Payout | INR 8,500 per suit |
| Wedding Planner Commission | 10% of gross |
| Ops Commission | 5% of net after tax (quarterly) |
| Final Margin/Suit | ~GBP 900+ |

---

## Critical Path Tasks

These tasks are on the critical path and block the most downstream work:

1. **TASK-DB-003** (suits table) - Central entity, blocks almost everything
2. **TASK-OPT-004** (flight planning orchestrator) - Blocks logistics
3. **TASK-OPT-016** (VRPTW orchestrator) - Blocks ground delivery
4. **TASK-EVT-002** (event publisher) - Blocks real-time updates
5. **TASK-FAC-002** (Optitex integration) - Blocks pattern generation
6. **TASK-API-001** (order creation) - Entry point for all orders

---

## Risk Mitigations Built Into System

| Risk | Mitigation |
|------|------------|
| QC Fail | Dual production (2 suits made per order) |
| Tailor claiming delay | VAPI calls 20 tailors at 10 min mark |
| Long runner collection | New facility: 10 min to all tailors |
| High Abu Dhabi volume | Dynamic dual-drop routing (AUH + SHJ) |
| Flight delay | Real-time tracking + risk propagation |
| Van breakdown | Dynamic re-optimization |

