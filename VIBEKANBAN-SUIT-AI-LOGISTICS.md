# SUIT AI v4.b - VibeKanban Epic & Story Structure
## Dubai 24-Hour Delivery Logistics System

**Generated:** 2026-01-19
**Source:** Claude-Suit sales break-even for charter flights.md, Claude-Raja exclusive.md

---

# EPIC 1: DATABASE & CORE INFRASTRUCTURE
**Priority:** P0 - Foundation
**Dependencies:** None
**Description:** Core database schema and infrastructure for the logistics orchestration engine

## Story 1.1: Core Entity Tables
**Points:** 13

### TASK-DB-001: Create customers table
- **Type:** Database
- **Priority:** P0
- **Description:** Create customers table with identity, contact, and communication preferences
- **Acceptance Criteria:**
  - Table created with UUID primary key
  - Fields: first_name, last_name, email (unique), phone, phone_country_code
  - Communication prefs: preferred_language, whatsapp_enabled, sms_enabled
  - Email validation constraint
  - Indexes on email and phone
- **Definition of Done:** Migration runs, table accessible via Supabase client

### TASK-DB-002: Create orders table
- **Type:** Database
- **Priority:** P0
- **Description:** Create orders table linking customers to destinations with payment tracking
- **Acceptance Criteria:**
  - UUID primary key, human-readable order_number (ORD-2026-01-19-0001)
  - Foreign key to customers
  - Destination fields: hotel_id, address, zone_id, coordinates, delivery_notes
  - Timing: ordered_at, deadline (24hr from order)
  - Payment: status, captured_at, stripe_payment_intent_id, total_amount_aed
  - Status enum constraint
  - Indexes on customer, status, deadline, zone
- **Definition of Done:** Migration runs, foreign keys validated

### TASK-DB-003: Create suits table
- **Type:** Database
- **Priority:** P0
- **Description:** Create suits table as central tracking entity with state machine
- **Acceptance Criteria:**
  - UUID primary key, human-readable suit_number (SUIT-2026-01-19-0847)
  - Foreign key to orders
  - Dual production support: is_backup, primary_suit_id
  - State tracking: status enum (17 states), current_location_type, current_location_id, current_coordinates
  - Risk tracking: risk_score (0-1), risk_factors JSONB
  - Timing: deadline, estimated_delivery, actual_delivery
  - Indexes on order, status, risk_score, deadline
- **Definition of Done:** All 17 status states validated, backup suit linking works

### TASK-DB-004: Create suit_timeline table
- **Type:** Database
- **Priority:** P0
- **Description:** Create timeline event log for complete suit journey tracking
- **Acceptance Criteria:**
  - UUID primary key, foreign key to suits
  - Event details: event_type enum (24 types), from_status, to_status
  - Location: location_type, location_id, coordinates
  - Actor: actor_type, actor_id
  - Metadata: JSONB, notes
  - Timing: occurred_at, recorded_at
  - Indexes on suit, occurred_at, event_type
- **Definition of Done:** Events can be appended, queried by suit

---

## Story 1.2: Production Tables
**Points:** 8

### TASK-DB-005: Create tailors table
- **Type:** Database
- **Priority:** P0
- **Description:** Create tailors table with location, capacity, skills, and performance metrics
- **Acceptance Criteria:**
  - UUID primary key, identity fields (name, phone, email)
  - Location: workshop_address, workshop_coordinates (POINT), zone_id, distance_to_qc_station_meters
  - Capacity: max_concurrent_jobs, current_job_count
  - Skills: skill_level enum, fabric_variants_in_stock array
  - Performance: total_jobs_completed, qc_pass_rate, avg_production_time_minutes
  - Status enum, available_from timestamp
  - Payment: stripe_connect_id
  - Indexes on zone, status, availability
- **Definition of Done:** Tailor profiles can be created and queried

### TASK-DB-006: Create tailor_assignments table
- **Type:** Database
- **Priority:** P0
- **Description:** Create assignment junction tracking suit-to-tailor relationships
- **Acceptance Criteria:**
  - UUID primary key, foreign keys to suits and tailors
  - assignment_type: 'primary' or 'backup' (dual production)
  - Status enum: pending, claimed, in_production, completed, abandoned, reassigned
  - Timing: posted_at, claimed_at, production_started_at, production_completed_at
  - SLA: sla_deadline, sla_breached boolean
  - Outcome tracking, payout fields
  - Indexes on suit, tailor, status, sla_deadline
- **Definition of Done:** Dual assignments can be created for single suit

### TASK-DB-007: Create qc_inspections table
- **Type:** Database
- **Priority:** P0
- **Description:** Create QC inspection records with scoring and evidence
- **Acceptance Criteria:**
  - UUID primary key, foreign keys to suit, tailor_assignment, inspector
  - Timing: requested_at, started_at, completed_at
  - Result enum: pass, fail, conditional_pass
  - Scores: visual, measurement, construction, finishing (1-5), overall_score
  - Issues JSONB array: {category, description, severity}
  - Photos JSONB array
  - Inspector notes
  - Indexes on suit, inspector, result
- **Definition of Done:** QC records with photos can be stored and queried

---

## Story 1.3: Logistics Tables - Air
**Points:** 13

### TASK-DB-008: Create airports table
- **Type:** Database
- **Priority:** P0
- **Description:** Create airports reference table with capabilities and contacts
- **Acceptance Criteria:**
  - UUID primary key, IATA code (unique), name, city, country
  - Location: coordinates (POINT), timezone
  - Capabilities: cargo_capable, customs_preclearance_available
  - Costs: landing_fee_usd, handling_fee_usd
  - Operations: operating_hours_start, operating_hours_end
  - Contacts: cargo_handler_contact JSONB, customs_broker_contact JSONB
- **Definition of Done:** ATQ, SHJ, AUH, DWC airports seeded

### TASK-DB-009: Create flights table
- **Type:** Database
- **Priority:** P0
- **Description:** Create charter flight records with routing and manifest tracking
- **Acceptance Criteria:**
  - UUID primary key, flight_number (CHARTER-2026-01-19-AM)
  - Aircraft: type ('SAAB_340F', 'B737_400F'), registration, capacity_suits
  - Route: route_type ('single_hub', 'dual_drop')
  - Status enum (9 states)
  - Timing: scheduled/actual departure/arrival
  - Manifest: suits_loaded, manifest_closed_at
  - Cost: charter_cost_gbp
  - Indexes on status, departure
- **Definition of Done:** Flights can be scheduled with capacity tracking

### TASK-DB-010: Create flight_legs table
- **Type:** Database
- **Priority:** P0
- **Description:** Create multi-leg flight tracking for dual-drop routes
- **Acceptance Criteria:**
  - UUID primary key, foreign key to flight
  - Sequence: leg_number
  - Route: origin_airport_id, destination_airport_id
  - Purpose: leg_type enum (positioning, fuel_stop, cargo_drop, final)
  - Timing: scheduled/actual departure/arrival
  - Cargo: suits_to_unload, unload_completed_at, customs_cleared_at
  - Status enum
  - Unique constraint on flight_id + leg_number
  - Indexes on flight, destination
- **Definition of Done:** ATQ→MCT→AUH→SHJ route can be represented

### TASK-DB-011: Create suit_flight_assignments table
- **Type:** Database
- **Priority:** P0
- **Description:** Create junction linking suits to flights and unload points
- **Acceptance Criteria:**
  - UUID primary key, foreign keys to suit, flight, unload_leg
  - Load_sequence integer
  - Timing: loaded_at, unloaded_at
  - Unique constraint on suit + flight
  - Indexes on suit, flight
- **Definition of Done:** Suits can be assigned to specific unload legs

---

## Story 1.4: Logistics Tables - Ground
**Points:** 13

### TASK-DB-012: Create vans table
- **Type:** Database
- **Priority:** P0
- **Description:** Create UAE delivery fleet tracking
- **Acceptance Criteria:**
  - UUID primary key, van_number, license_plate
  - Base: home_airport_id, home_zone_id
  - Capacity: max_suits (25), current_suit_count
  - State: status enum (8 states), current_coordinates, current_zone_id, last_location_update
  - Current driver reference
  - Spatial index on coordinates
- **Definition of Done:** Van positions can be tracked in real-time

### TASK-DB-013: Create drivers table
- **Type:** Database
- **Priority:** P0
- **Description:** Create UAE driver records with licensing and performance
- **Acceptance Criteria:**
  - UUID primary key, identity fields
  - License: license_number, license_expiry
  - Status enum (5 states), shift tracking, hours_worked_today
  - Performance: total_deliveries, on_time_rate
  - Index on status
- **Definition of Done:** Drivers can be assigned to vans

### TASK-DB-014: Create delivery_routes table
- **Type:** Database
- **Priority:** P0
- **Description:** Create optimized route plans for vans
- **Acceptance Criteria:**
  - UUID primary key, foreign keys to van, driver, flight_leg
  - Origin airport reference
  - Timing: created_at, started_at, completed_at
  - Optimization: total_stops, total_distance_km, estimated/actual_duration_minutes
  - Waypoints JSONB: [{sequence, hotel_id, suit_ids, eta}]
  - Status enum, current_stop_index
  - Indexes on van, status, flight
- **Definition of Done:** Route optimization results can be stored

### TASK-DB-015: Create deliveries table
- **Type:** Database
- **Priority:** P0
- **Description:** Create individual delivery records for each suit
- **Acceptance Criteria:**
  - UUID primary key, foreign keys to suit, route, hotel
  - Sequence: stop_sequence
  - Destination: delivery_address, delivery_coordinates, recipient details
  - Timing: estimated_arrival, actual_arrival
  - Status enum (6 states)
  - Outcome: delivered_to, signature_url, photo_url
  - Issues: delivery_attempts, last_attempt_at, failure_reason
  - Indexes on suit, route, status, eta
- **Definition of Done:** Deliveries can be tracked per-suit

---

## Story 1.5: Reference & Monitoring Tables
**Points:** 8

### TASK-DB-016: Create zones table
- **Type:** Database
- **Priority:** P0
- **Description:** Create UAE geographic zones for delivery routing
- **Acceptance Criteria:**
  - UUID primary key, code (DUBAI-MARINA), name, city, country
  - Geography: boundary (POLYGON), center_coordinates
  - Logistics: primary_airport_id, avg_delivery_time_from_airport_minutes
  - Traffic: peak_hours JSONB
  - Spatial index on boundary
- **Definition of Done:** Dubai, Abu Dhabi, Sharjah zones seeded

### TASK-DB-017: Create hotels table
- **Type:** Database
- **Priority:** P0
- **Description:** Create luxury hotel reference with delivery instructions
- **Acceptance Criteria:**
  - UUID primary key, name, brand, star_rating
  - Location: address, coordinates, zone_id
  - Contacts: concierge_phone, concierge_whatsapp, concierge_email, front_desk_phone
  - Delivery: delivery_entrance, delivery_notes, requires_advance_notice, advance_notice_minutes
  - Access: guest_verification_required
  - Tier: 'flagship', 'priority', 'standard'
  - Spatial index, tier index
- **Definition of Done:** Key Dubai hotels seeded (Burj Al Arab, Atlantis, etc.)

### TASK-DB-018: Create events table
- **Type:** Database
- **Priority:** P0
- **Description:** Create event calendar for demand forecasting and hub selection
- **Acceptance Criteria:**
  - UUID primary key, name, event_type enum
  - Location: city, venue, primary_zone_id
  - Timing: start_date, end_date
  - Impact: expected_demand_multiplier, expected_dubai_ratio, expected_abu_dhabi_ratio
  - Config: recommended_hub, recommended_flights_per_day
  - Notes
  - Index on dates, city
- **Definition of Done:** Dubai Expo, Abu Dhabi Finance Week events seeded

### TASK-DB-019: Create alerts table
- **Type:** Database
- **Priority:** P0
- **Description:** Create alert/exception tracking with response workflow
- **Acceptance Criteria:**
  - UUID primary key, entity_type, entity_id
  - Alert: alert_type, severity enum (info, warning, critical)
  - Content: title, description, metadata JSONB
  - Risk context: risk_score_at_alert, risk_factors JSONB
  - Response: status enum, acknowledged_at/by, resolved_at/by, resolution_notes
  - Auto-response: auto_response_triggered, auto_response_action, auto_response_at
  - Indexes on entity, status, severity, created_at
- **Definition of Done:** Alerts can be raised and resolved

### TASK-DB-020: Create system_metrics table
- **Type:** Database
- **Priority:** P1
- **Description:** Create time-series metrics for dashboard and analytics
- **Acceptance Criteria:**
  - UUID primary key, recorded_at, period_type enum
  - Pipeline: orders_received, suits_in_production, suits_in_transit, suits_delivered
  - Risk: suits_green/amber/red/critical counts
  - Performance: avg_production_time, avg_delivery_time, on_time_rate, qc_pass_rate
  - Capacity: tailor/van/flight utilization rates
  - Cost: total_charter_cost_gbp, avg_cost_per_suit_gbp
  - Index on time, period
- **Definition of Done:** Hourly metrics can be recorded and queried

---

## Story 1.6: Database Views
**Points:** 5

### TASK-DB-021: Create v_suits_pending_flight_assignment view
- **Type:** Database
- **Priority:** P1
- **Description:** View for suits ready to be assigned to flights
- **Acceptance Criteria:**
  - Returns suits with status='packed' and no flight assignment
  - Includes deadline, destination_zone, primary_airport, hotel_name, coordinates
  - Calculates hours_until_deadline
  - Ordered by deadline ASC
- **Definition of Done:** View returns correct suits for flight planning

### TASK-DB-022: Create v_active_routes_with_capacity view
- **Type:** Database
- **Priority:** P1
- **Description:** View for vans with available delivery capacity
- **Acceptance Criteria:**
  - Joins routes, vans, drivers
  - Returns route_id, van details, capacity info
  - Includes available_capacity calculation
  - Filters to active statuses
- **Definition of Done:** Delivery routing can query available vans

### TASK-DB-023: Create v_tailor_availability view
- **Type:** Database
- **Priority:** P1
- **Description:** View for tailors with capacity to accept jobs
- **Acceptance Criteria:**
  - Returns active tailors with available_slots > 0
  - Includes skill_level, fabric_variants, qc_pass_rate, avg_production_time
  - Includes location info
  - Ordered by qc_pass_rate DESC, production_time ASC
- **Definition of Done:** Tailor assignment can query eligible tailors

---

# EPIC 2: OPTIMIZATION ALGORITHMS
**Priority:** P0 - Core Logic
**Dependencies:** Epic 1
**Description:** The three main optimization engines for flight planning, tailor assignment, and vehicle routing

## Story 2.1: Flight Planning Optimizer
**Points:** 21

### TASK-OPT-001: Implement demand analysis function
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Analyze geographic distribution of pending suits for hub selection
- **Acceptance Criteria:**
  - Input: list of Suit objects with destinations
  - Output: {total_suits, by_zone dict, by_airport dict, abu_dhabi_ratio, dubai_ratio, recommend_dual_drop}
  - Dual-drop threshold: Abu Dhabi >= 100 suits
- **Definition of Done:** Correctly identifies when to use dual-drop routing

### TASK-OPT-002: Implement feasibility calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate if flight option can deliver all suits on time
- **Acceptance Criteria:**
  - For each suit, find best unload leg based on ground delivery time
  - Calculate buffer_minutes = deadline - estimated_delivery
  - Mark suit feasible if buffer >= 0
  - Return {viable: bool, assignments: [], infeasible_suits: [], feasibility_rate}
- **Definition of Done:** Can determine if ATQ→MCT→AUH→SHJ serves all suits on time

### TASK-OPT-003: Implement cost calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate total cost for flight option including ground distribution
- **Acceptance Criteria:**
  - Sum flight base_cost + additional_stop_cost (if dual-drop)
  - Estimate vans needed per airport: ceil(suits/20)
  - Calculate ground_cost = vans × van_cost_per_trip
  - Return {flight_cost, ground_cost, total, per_suit, suits_count}
- **Definition of Done:** Saab single-hub vs dual-drop costs compared correctly

### TASK-OPT-004: Implement flight planning orchestrator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Main optimizer selecting optimal flight configuration
- **Acceptance Criteria:**
  - Runs at manifest close time (2 hours before departure)
  - Calls demand analysis → feasibility → cost for each flight option
  - Selects minimum cost viable option
  - Returns {status, flight_id, route_type, total_cost, cost_breakdown, assignments, demand_analysis}
  - Handles infeasible case with reason
- **Definition of Done:** Selects SHJ single-hub for Dubai-heavy, AUH→SHJ dual-drop for Abu Dhabi events

### TASK-OPT-005: Create flight planning API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** REST endpoint to trigger flight planning
- **Acceptance Criteria:**
  - POST /api/logistics/optimize-flight
  - Accepts flight_id or next_departure flag
  - Returns optimization result
  - Persists suit_flight_assignments
  - Emits FlightManifestClosedEvent
- **Definition of Done:** Flight planning can be triggered via API

---

## Story 2.2: Tailor Assignment Optimizer
**Points:** 13

### TASK-OPT-006: Implement tailor eligibility filter
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Filter tailors who can accept a specific job
- **Acceptance Criteria:**
  - Check available_slots > 0
  - Check fabric_variant in tailor.fabric_variants_in_stock
  - Check skill_level meets job.complexity requirement
  - Return list of eligible TailorProfile objects
- **Definition of Done:** Only qualified tailors returned for bespoke jobs

### TASK-OPT-007: Implement tailor scoring algorithm
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate composite score for tailor-job match
- **Acceptance Criteria:**
  - QC Pass Rate: 35% weight (higher = better)
  - Production Speed: 25% weight (faster vs 480min baseline)
  - Current Load: 15% weight (less loaded = better)
  - Distance to QC: 15% weight (closer = better, vs 1000m baseline)
  - Skill Match: 10% weight (exact match 100, overqualified 80)
  - Return score 0-100
- **Definition of Done:** High QC pass rate tailors ranked higher

### TASK-OPT-008: Implement dual-posting selection
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Select primary and backup tailors for dual production
- **Acceptance Criteria:**
  - Score and sort all eligible tailors
  - Select top 2 as primary/backup
  - Return next 8 as VAPI call list for unclaimed escalation
  - Include assignment details: estimated_production_time, qc_pass_probability
- **Definition of Done:** Two tailors assigned per suit for redundancy

### TASK-OPT-009: Implement unclaimed job escalation
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Handle jobs unclaimed after timeout with VAPI calls
- **Acceptance Criteria:**
  - Configurable claim_timeout_minutes (default 10)
  - After timeout, return action='vapi_escalation'
  - Include call_list of up to 20 tailors
  - Include auto_assign_after_minutes (5) and auto_assign_to (first in list)
- **Definition of Done:** Integrates with VAPI voice AI for escalation

### TASK-OPT-010: Create tailor assignment API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** REST endpoint for assigning tailors to suits
- **Acceptance Criteria:**
  - POST /api/production/assign-tailor
  - Accepts suit_id, calls optimizer
  - Creates tailor_assignment records (primary + backup)
  - Emits TailorJobPostedEvent
  - Returns assignment details
- **Definition of Done:** Dual production assignments created via API

---

## Story 2.3: Vehicle Routing Optimizer (VRPTW)
**Points:** 21

### TASK-OPT-011: Implement distance/time matrix builder
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Build matrices for routing using Haversine distance
- **Acceptance Criteria:**
  - Input: list of coordinates (depot + delivery points)
  - Output: distance_matrix (km), time_matrix (minutes)
  - Apply traffic_multiplier to time calculations
  - Use average van speed (40 km/h in urban UAE)
- **Definition of Done:** Matrices generated for 50+ delivery points in <1s

### TASK-OPT-012: Implement Clarke-Wright savings algorithm
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate savings for route merging
- **Acceptance Criteria:**
  - Savings(i,j) = Distance(depot,i) + Distance(depot,j) - Distance(i,j)
  - Calculate for all delivery point pairs
  - Sort by savings descending
  - Return list of (savings, point_i, point_j) tuples
- **Definition of Done:** Savings correctly identify mergeable routes

### TASK-OPT-013: Implement route builder using savings
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Build initial routes using Clarke-Wright algorithm
- **Acceptance Criteria:**
  - Initialize each delivery as own route
  - Merge routes based on savings, checking van capacity
  - Respect time windows during merging
  - Return list of route dictionaries with stops and loads
- **Definition of Done:** Routes generated respecting 25-suit van capacity

### TASK-OPT-014: Implement 2-opt route optimization
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Local search optimization for route sequences
- **Acceptance Criteria:**
  - For each route, try all 2-opt swaps
  - Accept swap if improves total time
  - Validate time windows after each swap
  - Continue until no improvement found
- **Definition of Done:** Route sequences optimized within time windows

### TASK-OPT-015: Implement time window validation
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Validate and repair routes violating delivery deadlines
- **Acceptance Criteria:**
  - Check each delivery ETA against deadline
  - Identify infeasible deliveries
  - Attempt repair by resequencing or reassigning to other vans
  - Return validation result with list of issues
- **Definition of Done:** No route violates 24-hour delivery promise

### TASK-OPT-016: Implement VRPTW orchestrator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Main optimizer coordinating all VRPTW components
- **Acceptance Criteria:**
  - Input: deliveries, available vans, depot location, current time
  - Build matrices → Calculate savings → Build routes → 2-opt → Validate
  - Format output with ETAs, sequences, assigned vans
  - Handle empty/no-vehicle edge cases
- **Definition of Done:** Full route plans generated for 540 daily deliveries

### TASK-OPT-017: Implement dynamic re-optimization
- **Type:** Backend/Python
- **Priority:** P1
- **Description:** Re-optimize routes when exceptions occur
- **Acceptance Criteria:**
  - Handle: delivery_failed, van_breakdown, traffic_delay, new_urgent_delivery
  - Calculate affected routes
  - Re-optimize only affected portions
  - Return updated routes and reassignments
- **Definition of Done:** Van breakdown triggers automatic reassignment

### TASK-OPT-018: Create vehicle routing API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** REST endpoint to trigger route optimization
- **Acceptance Criteria:**
  - POST /api/logistics/optimize-routes
  - Accepts flight_leg_id (for arrivals) or manual trigger
  - Returns route plans for all vans
  - Persists delivery_routes and deliveries
  - Emits RoutesOptimizedEvent
- **Definition of Done:** Routes generated on flight arrival

---

## Story 2.4: Risk Scoring Engine
**Points:** 13

### TASK-OPT-019: Implement time risk calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate risk based on time remaining vs stages left
- **Acceptance Criteria:**
  - Input: deadline, current_status, current_time
  - Map status to expected remaining hours
  - Risk = 1 - (time_remaining / expected_remaining)
  - Apply stage-specific buffers
  - Return time_risk (0-1)
- **Definition of Done:** Suits with 2 hours remaining and 4 hours of stages = high risk

### TASK-OPT-020: Implement stage risk calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate risk based on current production stage
- **Acceptance Criteria:**
  - Assign base risk per stage (higher for late stages)
  - Factor in historical stage durations
  - Detect if stage is taking longer than average
  - Return stage_risk (0-1)
- **Definition of Done:** Stalled QC inspection flagged as high risk

### TASK-OPT-021: Implement resource risk calculator
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Calculate risk based on assigned resources
- **Acceptance Criteria:**
  - Check tailor QC pass rate (low = higher risk)
  - Check van driver on-time rate
  - Check resource availability (driver hours, van capacity)
  - Return resource_risk (0-1)
- **Definition of Done:** Suits assigned to low-pass-rate tailor flagged

### TASK-OPT-022: Implement external risk calculator
- **Type:** Backend/Python
- **Priority:** P1
- **Description:** Calculate risk from external factors
- **Acceptance Criteria:**
  - Check flight status (delay increases risk)
  - Check weather conditions
  - Check traffic conditions for delivery zone
  - Check customs status
  - Return external_risk (0-1)
- **Definition of Done:** Flight delay propagates risk to all suits on manifest

### TASK-OPT-023: Implement composite risk scorer
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Combine all risk factors with weights
- **Acceptance Criteria:**
  - Weights: time=30%, stage=20%, resource=15%, external=15%, historical=10%, buffer=10%
  - Calculate weighted sum
  - Determine severity: green (<0.3), amber (0.3-0.6), red (0.6-0.8), critical (>0.8)
  - Include recommended_action based on score
- **Definition of Done:** Risk scores update in real-time, alerts trigger at thresholds

### TASK-OPT-024: Create risk scoring API endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** REST endpoint to get/recalculate risk scores
- **Acceptance Criteria:**
  - GET /api/suits/:id/risk - get current score
  - POST /api/suits/:id/risk/recalculate - force recalculation
  - GET /api/suits/at-risk?severity=red - list suits by risk level
  - Risk auto-updates on status changes
- **Definition of Done:** Dashboard can display real-time risk scores

---

# EPIC 3: REAL-TIME EVENT SYSTEM
**Priority:** P0 - Core Infrastructure
**Dependencies:** Epic 1
**Description:** Event publishing, subscription, and WebSocket real-time updates

## Story 3.1: Event Publishing
**Points:** 13

### TASK-EVT-001: Define event type interfaces
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Create TypeScript interfaces for all event types
- **Acceptance Criteria:**
  - BaseEvent with id, type, timestamp, source, correlation_id, metadata
  - SuitStatusChangedEvent, SuitLocationUpdatedEvent, SuitRiskChangedEvent, SuitDeliveredEvent
  - TailorJobClaimedEvent, ProductionStageCompletedEvent, QCCompletedEvent
  - FlightStatusChangedEvent, FlightDelayedEvent, FlightLandedEvent, CustomsClearedEvent
  - VanDispatchedEvent, VanLocationUpdatedEvent, DeliveryAttemptedEvent
  - AlertCreatedEvent, AlertResolvedEvent
- **Definition of Done:** All 17 event types defined with full typing

### TASK-EVT-002: Implement event publisher service
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Redis Streams-based event publisher
- **Acceptance Criteria:**
  - Publish to categorized streams (suit, production, flight, delivery, system)
  - Auto-generate event ID and timestamp
  - Include correlation_id for tracing
  - Support priority levels
  - Configurable TTL per stream
- **Definition of Done:** Events published to Redis Streams, retrievable

### TASK-EVT-003: Create suit event publishing helpers
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Convenience methods for common suit events
- **Acceptance Criteria:**
  - publishSuitStatusChange(suit_id, previous, new_status)
  - publishSuitLocation(suit_id, location_type, coordinates)
  - publishAlert(alert_details)
  - Auto-determine priority based on event type
- **Definition of Done:** Status changes auto-publish events

### TASK-EVT-004: Implement event subscriber service
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Redis Streams consumer for background processing
- **Acceptance Criteria:**
  - Consumer group support for scaling
  - Configurable batch size and block timeout
  - Handler registration per event type
  - Graceful shutdown
  - Dead letter handling for failed events
- **Definition of Done:** Multiple workers can process events without duplicates

---

## Story 3.2: WebSocket Real-Time Server
**Points:** 13

### TASK-EVT-005: Implement WebSocket server
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Real-time event broadcasting via WebSocket
- **Acceptance Criteria:**
  - JWT authentication on connection
  - Client tracking with user context
  - Channel subscription model
  - Auto-subscribe based on user type (customer, tailor, driver, admin)
  - Heartbeat/ping-pong for connection health
- **Definition of Done:** Clients receive real-time updates after connecting

### TASK-EVT-006: Implement channel authorization
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Permission checks for channel subscriptions
- **Acceptance Criteria:**
  - Customers can only subscribe to their own orders/suits
  - Tailors can subscribe to their assigned jobs
  - Drivers can subscribe to their routes
  - Admins can subscribe to all channels
  - Support wildcard subscriptions for admins
- **Definition of Done:** Customers cannot spy on other customers' suits

### TASK-EVT-007: Implement Redis→WebSocket bridge
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Subscribe to Redis and broadcast to WebSocket clients
- **Acceptance Criteria:**
  - Subscribe to all event streams
  - Determine affected channels per event
  - Broadcast to subscribed clients only
  - Handle connection drops gracefully
- **Definition of Done:** Status change in DB → Redis → WebSocket → Client in <500ms

### TASK-EVT-008: Create client-side WebSocket handler
- **Type:** Frontend/TypeScript
- **Priority:** P0
- **Description:** React-compatible WebSocket client
- **Acceptance Criteria:**
  - Auto-reconnect with exponential backoff
  - Channel subscription management
  - Event handler registration
  - Connection state tracking
  - React hook: useRealtime(channels)
- **Definition of Done:** Dashboard updates without refresh

---

# EPIC 4: API ENDPOINTS
**Priority:** P0 - Integration Layer
**Dependencies:** Epic 1, Epic 2, Epic 3
**Description:** REST API for all system interactions

## Story 4.1: Customer-Facing API
**Points:** 13

### TASK-API-001: Create order creation endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/orders - create new order
- **Acceptance Criteria:**
  - Accept customer_id, measurements, destination, payment_intent
  - Validate payment captured
  - Calculate deadline (24hr)
  - Create order and suit records
  - Trigger pattern generation
  - Return order details with suit_ids
- **Definition of Done:** Order creates suit and starts pipeline

### TASK-API-002: Create order tracking endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/orders/:id/track - real-time order status
- **Acceptance Criteria:**
  - Return order status, all suits with current status
  - Include timeline of events
  - Include current location for in-transit suits
  - Include ETA for pending deliveries
  - Include driver contact when out for delivery
- **Definition of Done:** Customer app can show full journey

### TASK-API-003: Create suit tracking endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/suits/:id/track - detailed suit tracking
- **Acceptance Criteria:**
  - Return current status, location, coordinates
  - Return full timeline with timestamps
  - Return assigned resources (anonymized for customers)
  - Return delivery ETA and window
  - Support suit_number lookup
- **Definition of Done:** Detailed per-suit tracking available

### TASK-API-004: Create measurement submission endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/measurements - submit 3D scan data
- **Acceptance Criteria:**
  - Accept customer_id, scan_data (body measurements), scan_images
  - Validate measurement completeness
  - Store for pattern generation
  - Link to pending order if exists
- **Definition of Done:** Scan data flows to Optitex pipeline

---

## Story 4.2: Tailor App API
**Points:** 13

### TASK-API-005: Create job board endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/tailor/jobs/available - list claimable jobs
- **Acceptance Criteria:**
  - Filter by tailor's skill level and fabric inventory
  - Include job details: fabric, complexity, payout, deadline
  - Include distance to QC station
  - Sort by payout descending, deadline ascending
  - Support filters: fabric_variant, complexity, min_payout
- **Definition of Done:** Tailors see relevant jobs only

### TASK-API-006: Create job claim endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/tailor/jobs/:id/claim - claim a job
- **Acceptance Criteria:**
  - Validate tailor has capacity
  - Validate job still available (not claimed by other)
  - Update tailor_assignment to claimed
  - Increment tailor's current_job_count
  - Emit TailorJobClaimedEvent
  - Return assignment details with pattern download URL
- **Definition of Done:** Tailor claims job, others see it as unavailable

### TASK-API-007: Create production update endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/tailor/jobs/:id/progress - update production stage
- **Acceptance Criteria:**
  - Accept stage: cutting, canvas, assembly, sleeves, collar, trousers, finishing, pressing
  - Require photo upload for each stage
  - Update suit timeline
  - Recalculate risk score
  - Emit ProductionStageCompletedEvent
- **Definition of Done:** Production progress tracked with photos

### TASK-API-008: Create job completion endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/tailor/jobs/:id/complete - mark production complete
- **Acceptance Criteria:**
  - Require final photos (front, back, detail)
  - Validate all stages completed
  - Update suit status to production_complete
  - Create QC inspection request
  - Notify QC inspector
  - Emit ProductionCompleteEvent
- **Definition of Done:** Completed suit queued for QC

---

## Story 4.3: QC Inspector API
**Points:** 8

### TASK-API-009: Create inspection queue endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/qc/queue - list pending inspections
- **Acceptance Criteria:**
  - Filter by inspector assignment or zone
  - Include suit details, tailor info, location
  - Include time since completion (urgency)
  - Sort by deadline (most urgent first)
- **Definition of Done:** Inspector sees their queue

### TASK-API-010: Create inspection submission endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/qc/inspections/:id/submit - submit QC result
- **Acceptance Criteria:**
  - Accept scores: visual, measurement, construction, finishing (1-5)
  - Accept result: pass, fail, conditional_pass
  - Accept issues array if fail: [{category, description, severity}]
  - Require photos
  - Update suit status based on result
  - If pass: trigger packing
  - If fail: notify tailor, update assignment
  - Emit QCCompletedEvent
- **Definition of Done:** QC pass moves suit to packing

---

## Story 4.4: Driver App API
**Points:** 13

### TASK-API-011: Create route assignment endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/driver/route/current - get assigned route
- **Acceptance Criteria:**
  - Return current active route for driver
  - Include all stops with sequence, hotel, suit count, ETAs
  - Include navigation details (coordinates, addresses)
  - Include contact info (concierge phones)
  - Include delivery instructions per stop
- **Definition of Done:** Driver has full route details

### TASK-API-012: Create arrival notification endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/driver/stops/:id/arrived - mark arrival at stop
- **Acceptance Criteria:**
  - Update delivery status to arrived
  - Record actual_arrival timestamp
  - Notify customer (SMS/WhatsApp) with ETA
  - Update van location
  - Emit DeliveryArrivedEvent
- **Definition of Done:** Customer notified on driver arrival

### TASK-API-013: Create delivery confirmation endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/driver/deliveries/:id/confirm - confirm delivery
- **Acceptance Criteria:**
  - Accept delivered_to: customer, concierge, front_desk
  - Accept signature (optional based on hotel)
  - Require photo of handoff
  - Update suit status to delivered
  - Record actual_delivery timestamp
  - Trigger customer satisfaction survey
  - Emit SuitDeliveredEvent
- **Definition of Done:** Delivery confirmed with proof

### TASK-API-014: Create delivery issue endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/driver/deliveries/:id/issue - report delivery problem
- **Acceptance Criteria:**
  - Accept issue_type: customer_unavailable, wrong_address, access_denied, customer_refused
  - Accept notes and photos
  - Increment delivery_attempts
  - Create alert for operations
  - Trigger customer contact attempt
  - Return next action (retry, hold, escalate)
- **Definition of Done:** Failed deliveries tracked and escalated

---

## Story 4.5: Admin Operations API
**Points:** 13

### TASK-API-015: Create dashboard summary endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/admin/dashboard - operations summary
- **Acceptance Criteria:**
  - Return pipeline counts: in_production, packed, in_transit, delivered
  - Return risk summary: suits by severity
  - Return flight status for today
  - Return van fleet status
  - Return alerts summary
  - Support date range filter
- **Definition of Done:** Control tower dashboard populated

### TASK-API-016: Create suits list endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** GET /api/admin/suits - searchable suit list
- **Acceptance Criteria:**
  - Search by suit_number, order_number, customer
  - Filter by status, risk_severity, destination_zone
  - Sort by deadline, risk_score, created_at
  - Pagination with cursor
  - Include basic details: status, location, deadline, risk
- **Definition of Done:** Ops can find any suit quickly

### TASK-API-017: Create manual intervention endpoint
- **Type:** Backend/API
- **Priority:** P0
- **Description:** POST /api/admin/suits/:id/intervene - manual status change
- **Acceptance Criteria:**
  - Accept action: reassign_tailor, expedite, cancel, override_status
  - Require reason for audit
  - Validate state transition is legal
  - Create timeline event with actor
  - Resolve any open alerts
  - Notify affected parties
- **Definition of Done:** Ops can manually fix stuck suits

### TASK-API-018: Create alert management endpoints
- **Type:** Backend/API
- **Priority:** P0
- **Description:** Alert CRUD operations
- **Acceptance Criteria:**
  - GET /api/admin/alerts - list alerts with filters
  - POST /api/admin/alerts/:id/acknowledge - mark acknowledged
  - POST /api/admin/alerts/:id/resolve - mark resolved with notes
  - POST /api/admin/alerts/:id/escalate - escalate to higher tier
  - Include response SLA tracking
- **Definition of Done:** Alert workflow complete

---

# EPIC 5: NOTIFICATION SYSTEM
**Priority:** P1 - Customer Communication
**Dependencies:** Epic 3, Epic 4
**Description:** Multi-channel notifications (SMS, WhatsApp, Push) with templates

## Story 5.1: Notification Infrastructure
**Points:** 13

### TASK-NOT-001: Create notification templates table
- **Type:** Database
- **Priority:** P1
- **Description:** Store notification template configurations
- **Acceptance Criteria:**
  - Template code, category (order, production, delivery, alert)
  - Target audience: customer, tailor, driver, inspector, admin
  - Channels array: sms, whatsapp, push
  - Priority level
  - bypass_quiet_hours flag
  - Templates per channel with language variants
- **Definition of Done:** Templates stored and retrievable

### TASK-NOT-002: Create notification log table
- **Type:** Database
- **Priority:** P1
- **Description:** Track all sent notifications
- **Acceptance Criteria:**
  - Template reference
  - Recipient details
  - Channel used
  - Content sent
  - Status: pending, sent, delivered, failed
  - Provider message ID
  - Retry tracking
- **Definition of Done:** Full notification audit trail

### TASK-NOT-003: Implement notification preference service
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Manage user notification preferences
- **Acceptance Criteria:**
  - Per-user channel preferences (sms, whatsapp, push enabled/disabled)
  - Per-category preferences
  - Quiet hours settings with timezone
  - Language preference
  - API to get/set preferences
- **Definition of Done:** Users can control notification channels

### TASK-NOT-004: Implement template rendering service
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Render notification templates with context
- **Acceptance Criteria:**
  - Variable interpolation: {{customer_name}}, {{suit_number}}, etc.
  - Language selection based on preference
  - Channel-specific formatting (SMS plain, WhatsApp rich)
  - Render all channels for a template code
- **Definition of Done:** Templates render with real data

---

## Story 5.2: Channel Integrations
**Points:** 13

### TASK-NOT-005: Implement Twilio SMS integration
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Send SMS via Twilio
- **Acceptance Criteria:**
  - Configure sender number per region
  - Send with status callback
  - Handle delivery receipts
  - Log all sends
  - Return message_id
- **Definition of Done:** SMS messages delivered

### TASK-NOT-006: Implement WhatsApp Business API integration
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Send WhatsApp messages via Meta Business API
- **Acceptance Criteria:**
  - Support template messages (pre-approved)
  - Support text messages
  - Support location sharing (for deliveries)
  - Support interactive buttons
  - Handle status webhooks
  - Handle incoming messages
- **Definition of Done:** WhatsApp templates sent and tracked

### TASK-NOT-007: Implement Firebase Push Notifications
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Send push notifications via FCM
- **Acceptance Criteria:**
  - Configure for each app (tailor, driver, inspector, admin)
  - Support multicast to multiple tokens
  - Android and iOS specific payloads
  - Handle invalid token cleanup
  - Deep link data for navigation
- **Definition of Done:** Push notifications delivered to apps

### TASK-NOT-008: Implement notification orchestrator
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Main service coordinating notification sends
- **Acceptance Criteria:**
  - Accept template_code and context
  - Determine channels based on preferences and template config
  - Check quiet hours (bypass if configured)
  - Render templates
  - Send to all channels
  - Log results
  - Handle scheduling for delayed sends
- **Definition of Done:** Single call sends to all appropriate channels

---

## Story 5.3: Notification Templates
**Points:** 8

### TASK-NOT-009: Create customer notification templates
- **Type:** Configuration
- **Priority:** P1
- **Description:** Define customer-facing notification templates
- **Acceptance Criteria:**
  - ORDER_CONFIRMED: SMS + WhatsApp + Push
  - PRODUCTION_STARTED: WhatsApp + Push
  - QC_PASSED: WhatsApp + Push
  - SUIT_SHIPPED: SMS + WhatsApp + Push
  - OUT_FOR_DELIVERY: SMS + WhatsApp + Push (with location)
  - ARRIVING_SOON: WhatsApp + Push (bypass quiet hours)
  - DELIVERED: SMS + WhatsApp + Push (with photo)
  - DELIVERY_DELAYED: SMS + WhatsApp + Push (bypass quiet hours)
- **Definition of Done:** Customer journey fully notified

### TASK-NOT-010: Create tailor notification templates
- **Type:** Configuration
- **Priority:** P1
- **Description:** Define tailor-facing notification templates
- **Acceptance Criteria:**
  - JOB_AVAILABLE: SMS + Push
  - JOB_CLAIMED_CONFIRMATION: SMS + Push
  - PATTERN_DISPATCHED: SMS + Push
  - SLA_WARNING: SMS + Push (bypass quiet hours)
  - QC_RESULT: SMS + Push
  - PAYOUT_SENT: SMS + Push
- **Definition of Done:** Tailor app notifications working

### TASK-NOT-011: Create operations notification templates
- **Type:** Configuration
- **Priority:** P1
- **Description:** Define driver, inspector, admin templates
- **Acceptance Criteria:**
  - Driver: ROUTE_ASSIGNED, CUSTOMS_CLEARED, ROUTE_UPDATE
  - Inspector: INSPECTION_ASSIGNED, INSPECTION_URGENT
  - Admin: ALERT_CRITICAL, DAILY_SUMMARY
- **Definition of Done:** All staff roles notified appropriately

---

# EPIC 6: VAPI VOICE AI INTEGRATION
**Priority:** P1 - Escalation Automation
**Dependencies:** Epic 4
**Description:** Automated voice calls for job escalation and customer coordination

## Story 6.1: VAPI Assistants
**Points:** 13

### TASK-VOI-001: Create tailor job escalation assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Description:** Voice AI for calling tailors about unclaimed jobs
- **Acceptance Criteria:**
  - Hindi/English language support
  - First message announces job opportunity
  - Collects: accepted (yes/no), reason if declined, callback_requested
  - Functions: record_response
  - Max duration: 90 seconds
  - End call phrases: "I'll take it", "No thank you", etc.
- **Definition of Done:** Tailor can accept job via voice call

### TASK-VOI-002: Create tailor SLA warning assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Description:** Voice AI for checking on at-risk production
- **Acceptance Criteria:**
  - First message states urgency and time remaining
  - Collects: current_stage, estimated_completion, issues, needs_support
  - Functions: report_status
  - Empathetic tone acknowledging pressure
  - Max duration: 120 seconds
- **Definition of Done:** At-risk tailors checked automatically

### TASK-VOI-003: Create customer delivery assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Description:** Voice AI for delivery coordination
- **Acceptance Criteria:**
  - Arabic/English language support
  - First message announces imminent delivery
  - Collects: available (yes/no), alternate_recipient, special_instructions
  - Functions: record_preference
  - Polite luxury brand tone
  - Max duration: 90 seconds
- **Definition of Done:** Customer availability confirmed pre-delivery

### TASK-VOI-004: Create inspector dispatch assistant
- **Type:** VAPI Configuration
- **Priority:** P1
- **Description:** Voice AI for urgent inspection assignments
- **Acceptance Criteria:**
  - First message describes urgent inspection need
  - Collects: accepted, available_time, reason_declined
  - Functions: record_availability
  - Max duration: 60 seconds
- **Definition of Done:** Inspectors dispatched for urgent QC

---

## Story 6.2: VAPI Integration Service
**Points:** 8

### TASK-VOI-005: Implement VAPI client wrapper
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** API client for VAPI voice calls
- **Acceptance Criteria:**
  - Authenticate with VAPI API key
  - Single call method with assistant overrides
  - Bulk call method with concurrency control
  - Get call status and transcript
  - End call method
- **Definition of Done:** Voice calls can be initiated programmatically

### TASK-VOI-006: Implement tailor escalation service
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Orchestrate tailor escalation calls
- **Acceptance Criteria:**
  - Accept job and list of tailors to call
  - Call in batches of 5 with 30s delay between batches
  - Stop calling when job claimed
  - Record all call results
  - Log claim method (app vs voice)
  - Return results with success/failure
- **Definition of Done:** 20 tailors called in parallel for unclaimed job

### TASK-VOI-007: Implement VAPI webhook handler
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Handle VAPI call completion webhooks
- **Acceptance Criteria:**
  - Verify webhook signature
  - Parse function call results
  - Update relevant records (assignments, inspections)
  - Log transcripts
  - Handle status updates (call_started, call_ended)
- **Definition of Done:** Voice call results update system state

---

# EPIC 7: MOBILE APPS
**Priority:** P1 - Field Operations
**Dependencies:** Epic 4, Epic 5
**Description:** Mobile applications for tailors, drivers, and inspectors

## Story 7.1: Tailor App
**Points:** 21

### TASK-APP-001: Create tailor app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Initialize React Native project with navigation
- **Acceptance Criteria:**
  - Expo managed workflow
  - React Navigation with bottom tabs
  - Authentication context
  - API client configuration
  - Push notification setup
- **Definition of Done:** App builds and runs on iOS/Android

### TASK-APP-002: Implement tailor home screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Dashboard showing earnings and active jobs
- **Acceptance Criteria:**
  - Today's earnings card
  - Active jobs list with progress indicators
  - Performance stats (QC pass rate, avg time)
  - Quick action: View Job Board
- **Definition of Done:** Tailor sees their status at a glance

### TASK-APP-003: Implement job board screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** List of available jobs to claim
- **Acceptance Criteria:**
  - Filter by fabric, complexity
  - Job cards showing: fabric thumbnail, payout, deadline, distance
  - Sort by payout/deadline
  - Pull to refresh
  - Tap to view details
- **Definition of Done:** Tailors can browse available work

### TASK-APP-004: Implement job details and claim flow
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** View job details and claim
- **Acceptance Criteria:**
  - Full specification display
  - Measurements visualization
  - Payout breakdown
  - SLA timeline
  - "Claim Job" button with confirmation
  - Download tech pack PDF
- **Definition of Done:** Tailor claims job and downloads pattern

### TASK-APP-005: Implement active job tracking screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Track progress on claimed job
- **Acceptance Criteria:**
  - Stage progress stepper (cutting→canvas→assembly→sleeves→collar→trousers→finishing→pressing)
  - "Update Stage" button requiring photo
  - Timer showing time on current stage
  - SLA countdown
  - "Report Issue" action
  - "Mark Complete" requiring final photos
- **Definition of Done:** Production tracked with photo evidence

### TASK-APP-006: Implement tailor earnings screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** View earnings history and payouts
- **Acceptance Criteria:**
  - Period selector: today, week, month
  - Earnings chart
  - Transaction list with job references
  - Payout status (pending, processing, paid)
  - Download statement
- **Definition of Done:** Tailor tracks their income

---

## Story 7.2: Driver App
**Points:** 21

### TASK-APP-007: Create driver app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Initialize driver app with GPS tracking
- **Acceptance Criteria:**
  - Expo managed workflow
  - Background location tracking
  - Maps integration (Google Maps)
  - Authentication
  - Push notifications
- **Definition of Done:** App tracks location in background

### TASK-APP-008: Implement driver home screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Dashboard with route status and van assignment
- **Acceptance Criteria:**
  - Current van assignment
  - Today's route summary (stops, suits, estimated time)
  - Status toggle: Available/On Break
  - Quick action: Start Route
- **Definition of Done:** Driver sees their assignment

### TASK-APP-009: Implement active route screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Turn-by-turn navigation for deliveries
- **Acceptance Criteria:**
  - Map showing route with all stops
  - Current stop highlighted
  - Next stop card with hotel name, suits, ETA
  - "Navigate" button to open Google Maps
  - "Arrived" button
  - Progress indicator (3/15 stops)
- **Definition of Done:** Driver navigates full route

### TASK-APP-010: Implement stop details screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Delivery information for current stop
- **Acceptance Criteria:**
  - Hotel name and address
  - Delivery entrance instructions
  - Concierge contact (call button)
  - List of suits for this stop
  - Customer names (for verification)
  - Special instructions
- **Definition of Done:** Driver has all info for delivery

### TASK-APP-011: Implement delivery confirmation flow
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Confirm successful delivery
- **Acceptance Criteria:**
  - Recipient selector: Customer, Concierge, Front Desk
  - Signature capture (optional by hotel)
  - Photo of handoff (required)
  - "Confirm Delivery" submits and moves to next stop
- **Definition of Done:** Deliveries confirmed with proof

### TASK-APP-012: Implement delivery issue flow
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Report delivery problems
- **Acceptance Criteria:**
  - Issue type selector
  - Photo capture (optional)
  - Notes field
  - Submit creates alert
  - System provides next action
- **Definition of Done:** Issues escalated to operations

---

## Story 7.3: Inspector App
**Points:** 13

### TASK-APP-013: Create inspector app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Initialize inspector app
- **Acceptance Criteria:**
  - Expo managed workflow
  - Camera optimization for quality photos
  - Authentication
  - Push notifications
- **Definition of Done:** App ready for QC workflow

### TASK-APP-014: Implement inspector home screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Queue and performance dashboard
- **Acceptance Criteria:**
  - Queue toggle: At Facility / Mobile
  - Pending inspections count
  - Inspection queue list with urgency indicators
  - Today's stats (completed, pass rate)
- **Definition of Done:** Inspector sees their workload

### TASK-APP-015: Implement QC checklist screen
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Full QC inspection workflow
- **Acceptance Criteria:**
  - Sections: Visual, Measurements, Construction, Finishing
  - Visual: 5 checkbox items (grain alignment, color match, pressing, symmetry, buttonhole quality)
  - Measurements: Input fields with target and tolerance (chest, waist, sleeve, etc.)
  - Construction: 4 checkbox items
  - Finishing: 4 checkbox items
  - Photo capture required
  - Save progress, Submit result
- **Definition of Done:** Full QC checklist digital

### TASK-APP-016: Implement QC result submission
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Submit pass/fail decision
- **Acceptance Criteria:**
  - Summary of all scores
  - Result selector: Pass, Conditional Pass, Fail
  - Issues picker for Fail (categorized)
  - Rework instructions field for Fail
  - Notes field (optional for Pass)
  - Submit updates suit status
- **Definition of Done:** QC results recorded and actioned

---

## Story 7.4: Admin App
**Points:** 13

### TASK-APP-017: Create admin app project structure
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Initialize admin/operations app
- **Acceptance Criteria:**
  - Expo managed workflow
  - Role-based feature access
  - Push notifications for alerts
  - Real-time WebSocket connection
- **Definition of Done:** Admin app scaffolded

### TASK-APP-018: Implement control tower dashboard
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Real-time operations overview
- **Acceptance Criteria:**
  - Pipeline funnel visualization
  - Risk summary cards (suits at risk by severity)
  - Flight status cards
  - Van fleet status with map
  - Alerts badge
  - Tap any card to drill down
- **Definition of Done:** Ops manager has mobile visibility

### TASK-APP-019: Implement alerts management
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** View and respond to alerts
- **Acceptance Criteria:**
  - Filter by severity, status
  - Alert cards with entity context
  - Swipe to acknowledge
  - Tap for details and actions
  - Resolve with notes
  - Escalate to another role
- **Definition of Done:** Alerts actioned from mobile

### TASK-APP-020: Implement suit lookup and intervention
- **Type:** Mobile/React Native
- **Priority:** P1
- **Description:** Find and manage individual suits
- **Acceptance Criteria:**
  - Search by suit_number, order_number, customer
  - Suit detail view with full timeline
  - Action buttons: Contact Customer, Reassign, Expedite, Cancel
  - Requires reason for actions
  - Updates timeline
- **Definition of Done:** Manual interventions from mobile

---

# EPIC 8: WEB DASHBOARD
**Priority:** P1 - Operations Control
**Dependencies:** Epic 4, Epic 3
**Description:** Web-based operations dashboard for control tower

## Story 8.1: Dashboard Core
**Points:** 13

### TASK-WEB-001: Create dashboard project structure
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Initialize React dashboard with routing
- **Acceptance Criteria:**
  - Next.js or Vite
  - Tailwind CSS
  - React Query for data fetching
  - WebSocket integration
  - Authentication flow
- **Definition of Done:** Dashboard shell running

### TASK-WEB-002: Implement real-time data hooks
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** React Query hooks with WebSocket updates
- **Acceptance Criteria:**
  - usePipelineSummary() with real-time updates
  - useActiveSuits(filters) with live risk updates
  - useFlightsDashboard() with status updates
  - useGroundFleet() with live locations
  - useAlerts(filters) with new alert push
- **Definition of Done:** Dashboard updates without refresh

### TASK-WEB-003: Implement pipeline summary panel
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Visual pipeline showing suit flow
- **Acceptance Criteria:**
  - Columns: Production, QC Queue, Packed, In Air, Delivered
  - Count per stage
  - Click to view suits in that stage
  - Color coding by risk
- **Definition of Done:** Pipeline status visible at glance

### TASK-WEB-004: Implement risk alerts panel
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Prioritized list of at-risk suits
- **Acceptance Criteria:**
  - Filter by severity
  - Show suit, risk score, risk factors
  - Action buttons: Respond, Monitor
  - Click to view suit details
  - Real-time addition of new risks
- **Definition of Done:** At-risk suits surfaced immediately

---

## Story 8.2: Fleet Visualization
**Points:** 13

### TASK-WEB-005: Implement flight status panel
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Show all flights for today
- **Acceptance Criteria:**
  - Card per flight with status icon
  - Route visualization (ATQ → MCT → AUH → SHJ)
  - Manifest count
  - ETA per leg
  - Click to view manifest details
- **Definition of Done:** Flight status tracked

### TASK-WEB-006: Implement ground fleet map
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Live map of UAE delivery vans
- **Acceptance Criteria:**
  - Map of UAE (Google Maps or Mapbox)
  - Van markers with real-time positions
  - Color by status (available, delivering, returning)
  - Click van for route details
  - Show delivery stops as pins
- **Definition of Done:** Van locations live on map

### TASK-WEB-007: Implement van detail panel
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Detailed view of individual van
- **Acceptance Criteria:**
  - Van info and driver
  - Current route progress
  - Stop list with ETAs and status
  - Suits on board
  - Contact driver button
- **Definition of Done:** Full van context available

---

## Story 8.3: Staff Management
**Points:** 8

### TASK-WEB-008: Implement staff list views
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Tabbed view of all staff types
- **Acceptance Criteria:**
  - Tabs: Tailors, Drivers, Inspectors, Admins
  - Searchable, filterable tables
  - Status badges
  - Performance metrics
  - Click for profile
- **Definition of Done:** All staff viewable

### TASK-WEB-009: Implement staff profile management
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** View and edit staff details
- **Acceptance Criteria:**
  - Profile information
  - Performance history
  - Current assignments
  - Action buttons: Edit, Suspend, Deactivate, Message, Call
  - Activity log
- **Definition of Done:** Staff managed from dashboard

### TASK-WEB-010: Implement staff onboarding form
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Add new staff members
- **Acceptance Criteria:**
  - Role selector
  - Role-specific fields
  - Document upload (for drivers)
  - Send invite
  - Assign to zone/airport
- **Definition of Done:** New staff added via dashboard

---

# EPIC 9: AMRITSAR FACILITY OPERATIONS
**Priority:** P0 - Production Core
**Dependencies:** Epic 1, Epic 2
**Description:** Systems for the 4000 sq ft Amritsar facility running 24/7

## Story 9.1: Optitex Automation Pipeline
**Points:** 21

### TASK-FAC-001: Create measurement ingestion API
- **Type:** Backend/API
- **Priority:** P0
- **Description:** Receive 3D scan data and queue for pattern generation
- **Acceptance Criteria:**
  - Accept scan JSON with body measurements
  - Validate measurement completeness
  - Link to order/suit
  - Queue for Optitex processing
  - Return job_id for tracking
- **Definition of Done:** Scans flow into processing queue

### TASK-FAC-002: Implement Optitex API integration
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Automate pattern generation via Optitex API
- **Acceptance Criteria:**
  - Authenticate with Optitex
  - Submit measurement set
  - Poll for completion
  - Download generated pattern files
  - Download 3D mesh preview
  - Handle errors and retries
- **Definition of Done:** Patterns generated automatically

### TASK-FAC-003: Implement pattern file processing
- **Type:** Backend/Python
- **Priority:** P0
- **Description:** Process Optitex output for plotting
- **Acceptance Criteria:**
  - Extract marker layout
  - Convert to plotter format (HPGL)
  - Generate cutting instructions
  - Store files with CDN URLs
  - Update suit with pattern_ready status
- **Definition of Done:** Patterns ready for plotter

### TASK-FAC-004: Implement plotter queue manager
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Manage queue of patterns for 3 plotters
- **Acceptance Criteria:**
  - Queue patterns by priority (deadline)
  - Assign to available plotter
  - Track plotter status
  - Handle plotter errors
  - Update suit status on print completion
- **Definition of Done:** 540 patterns/day capacity utilized

### TASK-FAC-005: Create Optitex operator dashboard
- **Type:** Frontend/React
- **Priority:** P0
- **Description:** Monitoring UI for automated pipeline
- **Acceptance Criteria:**
  - Queue status (pending, processing, complete, failed)
  - Plotter status per machine
  - Manual intervention for failures
  - Override pattern if needed
  - Production rate metrics
- **Definition of Done:** 1 operator per shift can monitor 180 patterns

---

## Story 9.2: QC Station Management
**Points:** 13

### TASK-FAC-006: Implement QC station assignment
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Assign suits to QC stations
- **Acceptance Criteria:**
  - Track 8 stations
  - Assign suit to available station
  - Track inspector at station
  - Handle suit movement (incoming rail → station → passed/failed rail)
  - Update location in real-time
- **Definition of Done:** QC flow tracked

### TASK-FAC-007: Implement QC throughput monitoring
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Track QC capacity and utilization
- **Acceptance Criteria:**
  - Track inspections per inspector per shift
  - Calculate average inspection time
  - Alert if throughput drops
  - Predict end-of-shift completion
- **Definition of Done:** QC bottlenecks detected early

### TASK-FAC-008: Create QC station dashboard
- **Type:** Frontend/React
- **Priority:** P0
- **Description:** Display for QC zone
- **Acceptance Criteria:**
  - Wall-mounted display
  - 8 station status cards
  - Queue depth per inspector
  - Shift totals and targets
  - Alert highlight for urgent suits
- **Definition of Done:** QC team has visibility

---

## Story 9.3: Packing and Dispatch
**Points:** 8

### TASK-FAC-009: Implement packing station workflow
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Track suit through packing process
- **Acceptance Criteria:**
  - Scan suit barcode
  - Display packing checklist
  - Generate shipping label
  - Record packing completion
  - Update suit status to packed
- **Definition of Done:** Suits packed with documentation

### TASK-FAC-010: Implement flight manifest builder
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Prepare manifest for charter flight
- **Acceptance Criteria:**
  - Query all packed suits for next flight
  - Group by unload airport
  - Generate manifest document
  - Calculate weights and counts
  - Submit customs documentation
- **Definition of Done:** Manifest ready 2 hours before departure

### TASK-FAC-011: Create packing station interface
- **Type:** Frontend/React
- **Priority:** P0
- **Description:** UI for packing stations
- **Acceptance Criteria:**
  - Barcode scanner input
  - Packing checklist
  - Print label button
  - Next suit in queue
  - Shift totals
- **Definition of Done:** 6 packing stations operational

---

# EPIC 10: CHARTER LOGISTICS
**Priority:** P0 - Delivery Core
**Dependencies:** Epic 2, Epic 4
**Description:** Saab 340F charter operations ATQ → UAE

## Story 10.1: Flight Scheduling
**Points:** 13

### TASK-LOG-001: Create flight schedule API
- **Type:** Backend/API
- **Priority:** P0
- **Description:** Manage charter flight schedules
- **Acceptance Criteria:**
  - Create flight with schedule, aircraft, route type
  - Update flight status
  - Query flights by date, status
  - Calculate capacity remaining
- **Definition of Done:** Flights can be scheduled

### TASK-LOG-002: Implement hub selection logic
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Auto-determine single-hub vs dual-drop
- **Acceptance Criteria:**
  - Analyze order destinations 6 hours before departure
  - If Abu Dhabi ratio > 40%: recommend dual-drop
  - If Abu Dhabi ratio > 20%: evaluate cost trade-off
  - Else: single-hub SHJ
  - Persist recommendation for ops approval
- **Definition of Done:** Route auto-selected based on demand

### TASK-LOG-003: Implement manifest close workflow
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Close manifest and finalize assignments
- **Acceptance Criteria:**
  - 2 hours before departure: close manifest
  - Run flight planning optimizer
  - Generate final manifest
  - Create customs pre-clearance request
  - Notify dispatch team
- **Definition of Done:** Manifest locked 2 hours pre-departure

### TASK-LOG-004: Implement flight tracking integration
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Track flight position via ADS-B/FlightAware
- **Acceptance Criteria:**
  - Query flight position every 5 minutes
  - Update flight status on departure/arrival
  - Detect delays automatically
  - Propagate delay to all suits on manifest
  - Alert operations on significant delay
- **Definition of Done:** Flight delays detected in real-time

---

## Story 10.2: Customs Integration
**Points:** 8

### TASK-LOG-005: Implement customs pre-clearance submission
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Submit manifest to UAE customs pre-arrival
- **Acceptance Criteria:**
  - Generate required documentation
  - Submit via customs API or broker portal
  - Track submission status
  - Handle rejections/queries
- **Definition of Done:** Pre-clearance submitted before landing

### TASK-LOG-006: Implement customs clearance tracking
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Track clearance status at UAE airports
- **Acceptance Criteria:**
  - Integrate with broker status updates
  - Update suit status on clearance
  - Alert on holds or inspections
  - Record clearance time for metrics
- **Definition of Done:** Customs status tracked per suit

---

## Story 10.3: Ground Operations UAE
**Points:** 13

### TASK-LOG-007: Implement van dispatch system
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Assign vans to delivery routes
- **Acceptance Criteria:**
  - Track van availability per airport
  - Assign vans based on route zone
  - Dispatch on customs clearance
  - Track van loading
  - Update van status through workflow
- **Definition of Done:** Vans dispatched on arrival

### TASK-LOG-008: Implement driver shift management
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Manage driver availability and hours
- **Acceptance Criteria:**
  - Track shift start/end
  - Monitor hours worked
  - Alert approaching overtime
  - Handle shift handover
- **Definition of Done:** Driver hours compliant

### TASK-LOG-009: Implement delivery zone routing
- **Type:** Backend/TypeScript
- **Priority:** P0
- **Description:** Assign deliveries to zones and vans
- **Acceptance Criteria:**
  - Group suits by zone
  - Assign zones to vans based on home zone
  - Balance load across vans
  - Handle overflow to additional vans
- **Definition of Done:** Deliveries distributed efficiently

---

# EPIC 11: FINANCIAL INTEGRATION
**Priority:** P1 - Revenue & Payments
**Dependencies:** Epic 4
**Description:** Stripe payments, tailor payouts, commission tracking

## Story 11.1: Payment Processing
**Points:** 13

### TASK-FIN-001: Implement Stripe payment capture
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Capture payments for orders
- **Acceptance Criteria:**
  - Create payment intent for order total
  - Handle 3D Secure flow
  - Confirm payment capture
  - Update order payment_status
  - Trigger order processing on capture
- **Definition of Done:** Payments captured, clock starts

### TASK-FIN-002: Implement wedding planner commission tracking
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Track 10% gross commission for referrers
- **Acceptance Criteria:**
  - Link order to referring planner
  - Calculate commission on gross sale
  - Track commission status
  - Generate payout report
  - Integrate with Stripe Connect or PayPal
- **Definition of Done:** Planner commissions tracked

### TASK-FIN-003: Implement ops commission calculation
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Calculate quarterly 5% net profit commission
- **Acceptance Criteria:**
  - Calculate net profit per order (after all costs and tax)
  - Sum quarterly
  - Calculate 5% commission
  - Generate quarterly report
  - Schedule payout
- **Definition of Done:** Quarterly ops commission calculated

---

## Story 11.2: Tailor Payouts
**Points:** 8

### TASK-FIN-004: Implement tailor payout trigger
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Trigger payout on QC pass
- **Acceptance Criteria:**
  - On QC pass, mark assignment for payout
  - Calculate payout amount (₹8,500 for full suit)
  - Queue for UPI transfer
  - Update payout_status
- **Definition of Done:** Tailors paid on quality approval

### TASK-FIN-005: Implement UPI payout integration
- **Type:** Backend/TypeScript
- **Priority:** P1
- **Description:** Execute payouts via UPI
- **Acceptance Criteria:**
  - Integrate with payment provider (Razorpay/PayU)
  - Execute UPI transfer to tailor's VPA
  - Handle failures and retries
  - Update assignment with transaction ID
- **Definition of Done:** Automated UPI payouts working

### TASK-FIN-006: Create tailor payout dashboard
- **Type:** Frontend/React
- **Priority:** P1
- **Description:** Admin view of tailor payments
- **Acceptance Criteria:**
  - List of pending payouts
  - Payout history
  - Manual payout trigger
  - Failed payout resolution
- **Definition of Done:** Finance can manage payouts

---

# EPIC 12: TESTING & QUALITY
**Priority:** P1 - Reliability
**Dependencies:** All previous epics
**Description:** Automated testing and quality assurance

## Story 12.1: Unit Testing
**Points:** 8

### TASK-TST-001: Create optimization algorithm tests
- **Type:** Testing
- **Priority:** P1
- **Description:** Unit tests for all optimization algorithms
- **Acceptance Criteria:**
  - Flight planning optimizer tests
  - Tailor assignment optimizer tests
  - VRPTW optimizer tests
  - Risk scoring tests
  - Edge cases covered
- **Definition of Done:** >80% coverage on optimization code

### TASK-TST-002: Create API endpoint tests
- **Type:** Testing
- **Priority:** P1
- **Description:** Integration tests for all API endpoints
- **Acceptance Criteria:**
  - Happy path tests
  - Validation error tests
  - Authorization tests
  - Database state verification
- **Definition of Done:** All endpoints have tests

---

## Story 12.2: End-to-End Testing
**Points:** 8

### TASK-TST-003: Create suit journey E2E tests
- **Type:** Testing
- **Priority:** P1
- **Description:** Full journey from order to delivery
- **Acceptance Criteria:**
  - Order creation → payment → production → QC → packing → flight → delivery
  - State transitions verified
  - Timeline events created
  - Notifications sent
- **Definition of Done:** Full happy path automated

### TASK-TST-004: Create exception handling E2E tests
- **Type:** Testing
- **Priority:** P1
- **Description:** Test failure scenarios
- **Acceptance Criteria:**
  - QC failure → rework flow
  - Flight delay → risk escalation
  - Delivery failure → retry flow
  - Tailor no-show → reassignment
- **Definition of Done:** Recovery paths tested

---

# SUMMARY

## Epic Overview

| Epic | Stories | Tasks | Priority |
|------|---------|-------|----------|
| 1. Database & Infrastructure | 6 | 23 | P0 |
| 2. Optimization Algorithms | 4 | 24 | P0 |
| 3. Real-Time Events | 2 | 8 | P0 |
| 4. API Endpoints | 5 | 18 | P0 |
| 5. Notifications | 3 | 11 | P1 |
| 6. VAPI Voice AI | 2 | 7 | P1 |
| 7. Mobile Apps | 4 | 20 | P1 |
| 8. Web Dashboard | 3 | 10 | P1 |
| 9. Facility Operations | 3 | 11 | P0 |
| 10. Charter Logistics | 3 | 9 | P0 |
| 11. Financial Integration | 2 | 6 | P1 |
| 12. Testing | 2 | 4 | P1 |
| **TOTAL** | **39** | **151** | |

## Dependency Order

1. **Phase 1 (Foundation):** Epic 1 (Database)
2. **Phase 2 (Core Logic):** Epic 2 (Optimization), Epic 3 (Events)
3. **Phase 3 (Integration):** Epic 4 (APIs), Epic 9 (Facility), Epic 10 (Logistics)
4. **Phase 4 (Applications):** Epic 5-8 (Notifications, VAPI, Apps, Dashboard)
5. **Phase 5 (Financial):** Epic 11 (Payments)
6. **Phase 6 (Quality):** Epic 12 (Testing)

## Key Metrics at Full Capacity

| Metric | Value |
|--------|-------|
| Weekly Suits | 3,240 |
| Daily Suits | 540 |
| Shifts | 3 x 8 hours |
| Facility Staff | 48 |
| HQ Staff | 12 |
| QC Inspectors | 21 (7/shift) |
| Charter Flights | 2/day (Saab 340F) |
| UAE Vans | 5 |
| Final Retained/Suit | £901.70 |
| Annual Retained | £151.9M |
