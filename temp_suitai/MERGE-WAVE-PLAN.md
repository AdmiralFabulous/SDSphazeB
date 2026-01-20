# SUIT AI v4.b - Merge Wave Plan

## Summary

| Wave | Component | Tasks | Priority |
|------|-----------|-------|----------|
| 0 | INFRA | 15 | Pre-requisite |
| 1 | DB | 16 | Foundation |
| 2 | API | 22 | Services |
| 3A | FE | 23 | Features |
| 3B | ADMIN | 34 | Features |
| 3C | RUNNER | 22 | Features |
| 3D | VIS | 14 | Features |
| 3E | VOICE | 14 | Features |
| 3F | FIN | 9 | Features |
| **Total** | | **169** | |

---

## WAVE 0: INFRASTRUCTURE (15 tasks)
*Pre-requisite - Docker, CUDA, WSL setup*

### Status: 1 done, 1 in-progress, 13 in-review

```
DONE:
  vk/7bb4-infra-e02-s01-t0  INFRA-E02-S01-T05: Create docker-compose.yml

IN-PROGRESS:
  vk/a0a9-infra-e01-s02-t0  INFRA-E01-S02-T03: Install NVIDIA WSL Driver

IN-REVIEW:
  vk/20f3-infra-e01-s01-t0  INFRA-E01-S01-T01: Provision GPU Instance
  vk/2646-infra-e01-s01-t0  INFRA-E01-S01-T02: Install NVIDIA Driver
  vk/3328-infra-e01-s01-t0  INFRA-E01-S01-T01: Provision GPU Instance (dup)
  vk/3fdc-infra-e01-s01-t0  INFRA-E01-S01-T04: Verify GPU Access
  vk/5032-infra-e02-s01-t0  INFRA-E02-S01-T01: Create Vision Dockerfile
  vk/6f3f-infra-e02-s01-t0  INFRA-E02-S01-T02: Install PyTorch Nightly
  vk/8d6d-infra-e01-s02-t0  INFRA-E01-S02-T01: Install WSL2
  vk/93d7-infra-e01-s02-t0  INFRA-E01-S02-T01: Install WSL2 (dup)
  vk/9f34-infra-e01-s01-t0  INFRA-E01-S01-T03: Install CUDA Toolkit
  vk/a520-infra-e01-s01-t0  INFRA-E01-S01-T01: Provision GPU Instance (dup)
  vk/bb49-infra-e01-s01-t0  INFRA-E01-S01-T01: Provision GPU Instance (dup)
  vk/cbe6-infra-e02-s01-t0  INFRA-E02-S01-T03: Install Vision Dependencies
  vk/ed1d-infra-e01-s02-t0  INFRA-E01-S02-T02: Configure WSL Resources
```

---

## WAVE 1: DATABASE (16 tasks)
*Foundation - All Prisma schema changes must merge first*

### Merge Order (dependencies in sequence):
1. Core tables (sessions, measurements, configs)
2. Wedding tables (events, templates, attendees)
3. Order tables (orders, items, history, pattern_files)
4. RLS policies and constraints
5. Seed data

```
TABLES (merge first):
  vk/83d9-db-e01-s01-t02-c  DB-E01-S01-T02: Create sessions Table
  vk/d0e3-db-e01-s02-t01-c  DB-E01-S02-T01: Create measurements Table
  vk/2b69-db-e01-s02-t03-c  DB-E01-S02-T03: Create suit_configs Table
  vk/672c-db-e02-s01-t01-c  DB-E02-S01-T01: Create wedding_events Table
  vk/3008-db-e02-s01-t03-c  DB-E02-S01-T03: Create wedding_templates Table
  vk/69e6-db-e02-s01-t04-c  DB-E02-S01-T04: Create wedding_attendees Table
  vk/82df-db-e03-s01-t01-c  DB-E03-S01-T01: Create orders Table
  vk/84fc-db-e03-s01-t02-c  DB-E03-S01-T02: Create order_items Table
  vk/878e-db-e03-s01-t03-c  DB-E03-S01-T03: Create order_state_history Table
  vk/2ba7-db-e03-s01-t04-c  DB-E03-S01-T04: Create pattern_files Table

CONSTRAINTS (merge after tables):
  vk/5473-db-e02-s01-t02-a  DB-E02-S01-T02: Add Wedding Date Constraint

RLS POLICIES (merge after constraints):
  vk/a4eb-db-e01-s01-t03-a  DB-E01-S01-T03: Add RLS Policy - Users
  vk/bf11-db-e01-s01-t04-a  DB-E01-S01-T04: Add RLS Policy - Sessions
  vk/f2f8-db-e02-s01-t05-a  DB-E02-S01-T05: Add RLS - Organizer Access

FUNCTIONS (merge after RLS):
  vk/8aed-db-e03-s01-t05-c  DB-E03-S01-T05: Create State Transition Function

SEED DATA (merge last):
  vk/ab6f-db-e01-s02-t04-s  DB-E01-S02-T04: Seed Initial Fabrics
```

---

## WAVE 2: API (22 tasks)
*Services - Depends on DB schema being complete*

### Merge Order (by endpoint group):
1. Session endpoints (E01-S01)
2. Auth endpoints (E01-S02)
3. Config endpoints (E02-S01)
4. Wedding endpoints (E02-S02)
5. Order endpoints (E03-S01)

```
SESSION ENDPOINTS:
  vk/b4da-api-e01-s01-t01  API-E01-S01-T01: POST /api/sessions
  vk/f7c2-api-e01-s01-t02  API-E01-S01-T02: GET /api/sessions/:id
  vk/100f-api-e01-s01-t03  API-E01-S01-T03: PUT /api/sessions/:id
  vk/84a5-api-e01-s01-t04  API-E01-S01-T04: POST /api/sessions/:id/claim

AUTH ENDPOINTS:
  vk/5cf1-api-e01-s02-t02  API-E01-S02-T02: POST /api/auth/callback
  vk/cad2-api-e01-s02-t03  API-E01-S02-T03: Implement Session Merge

CONFIG ENDPOINTS:
  vk/5065-api-e02-s01-t01  API-E02-S01-T01: POST /api/configs
  vk/986b-api-e02-s01-t02  API-E02-S01-T02: GET /api/configs/:id
  vk/1c33-api-e02-s01-t03  API-E02-S01-T03: PUT /api/configs/:id
  vk/db6d-api-e02-s01-t04  API-E02-S01-T04: DELETE /api/configs/:id
  vk/10f9-api-e02-s01-t05  API-E02-S01-T05: GET /api/configs/:id/preview

WEDDING ENDPOINTS:
  vk/c6a7-api-e02-s02-t01  API-E02-S02-T01: POST /api/wedding-events
  vk/2629-api-e02-s02-t02  API-E02-S02-T02: GET /api/wedding-events/:id
  vk/c2a1-api-e02-s02-t03  API-E02-S02-T03: POST /api/wedding-events/:id/templates
  vk/9c6c-api-e02-s02-t04  API-E02-S02-T04: POST /api/wedding-events/:id/attendees
  vk/887f-api-e02-s02-t05  API-E02-S02-T05: GET /api/invites/:token
  vk/d0bd-api-e02-s02-t06  API-E02-S02-T06: POST /api/invites/:token/confirm

ORDER ENDPOINTS:
  vk/53f6-api-e03-s01-t01  API-E03-S01-T01: POST /api/orders
  vk/6284-api-e03-s01-t02  API-E03-S01-T02: GET /api/orders
  vk/83fb-api-e03-s01-t03  API-E03-S01-T03: GET /api/orders/:id
  vk/7339-api-e03-s01-t04  API-E03-S01-T04: PATCH /api/orders/:id/state
  vk/0bcf-api-e03-s01-t05  API-E03-S01-T05: Implement State Validation
```

---

## WAVE 3A: FRONTEND (23 tasks)
*Features - Depends on API being complete*

```
SETUP (E01-S01):
  vk/b13c-fe-e01-s01-t01-i  FE-E01-S01-T01: Initialize Next.js 14
  vk/7dcb-fe-e01-s01-t02-c  FE-E01-S01-T02: Configure Tailwind
  vk/eee7-fe-e01-s01-t03-s  FE-E01-S01-T03: Set Up Zustand Store
  vk/3701-fe-e01-s01-t04-c  FE-E01-S01-T04: Configure Environment

LAYOUT (E01-S02):
  vk/5b66-fe-e01-s02-t01-i  FE-E01-S02-T01: Implement Dual-Track Router
  vk/00ce-fe-e01-s02-t02-c  FE-E01-S02-T02: Create Layout Components
  vk/50fd-fe-e01-s02-t03-i  FE-E01-S02-T03: Implement Responsive Design

SESSION (E01-S03):
  vk/33c8-fe-e01-s03-t01-c  FE-E01-S03-T01: Create useSession Hook
  vk/0853-fe-e01-s03-t02-c  FE-E01-S03-T02: Call Session API
  vk/7548-fe-e01-s03-t03-i  FE-E01-S03-T03: Implement Session Restore

3D VIEWER (E02-S01):
  vk/69c0-fe-e02-s01-t01-s  FE-E02-S01-T01: Set Up R3F Canvas
  vk/fea8-fe-e02-s01-t02-i  FE-E02-S01-T02: Implement GPU Tier Detection
  vk/e31b-fe-e02-s01-t03-c  FE-E02-S01-T03: Configure Tiered Rendering
  vk/04e2-fe-e02-s01-t04-s  FE-E02-S01-T04: Set Up Lighting
  vk/06dc-fe-e02-s01-t05-i  FE-E02-S01-T05: Implement Camera Controls

ASSETS (E02-S02):
  vk/42d8-fe-e02-s02-t01-i  FE-E02-S02-T01: Implement GLTF Loader
  vk/3c1f-fe-e02-s02-t02-c  FE-E02-S02-T02: Create Asset Manager
  vk/b108-fe-e02-s02-t03-i  FE-E02-S02-T03: Implement Suspense Boundaries

CONFIGURATOR (E02-S03):
  vk/c5de-fe-e02-s03-t01-b  FE-E02-S03-T01: Build Fabric Selector
  vk/4194-fe-e02-s03-t02-i  FE-E02-S03-T02: Implement Fabric Selection
  vk/e2f6-fe-e02-s03-t03-b  FE-E02-S03-T03: Build Style Selector
  vk/ad31-fe-e02-s03-t04-i  FE-E02-S03-T04: Implement Mesh Swapping
  vk/dd1d-fe-e02-s03-t05-b  FE-E02-S03-T05: Build Lining Selector
```

---

## WAVE 3B: ADMIN (34 tasks)
*Features - Admin dashboard for order management*

```
AUTH & LAYOUT (E01-S01):
  vk/4cd4-admin-e01-s01-t0  ADMIN-E01-S01-T01: Create Admin Route
  vk/6afa-admin-e01-s01-t0  ADMIN-E01-S01-T02: Implement Admin Auth
  vk/9f32-admin-e01-s01-t0  ADMIN-E01-S01-T03: Build Admin Layout

QUEUE VIEW (E01-S02):
  vk/194e-admin-e01-s02-t0  ADMIN-E01-S02-T01: Build Queue View
  vk/7a99-admin-e01-s02-t0  ADMIN-E01-S02-T02: Implement State Filter
  vk/9c3e-admin-e01-s02-t0  ADMIN-E01-S02-T03: Add Sort Options
  vk/b47c-admin-e01-s02-t0  ADMIN-E01-S02-T04: Add Search
  vk/026f-admin-e01-s02-t0  ADMIN-E01-S02-T05: Implement Auto-Refresh

DETAIL VIEW (E01-S03):
  vk/7019-admin-e01-s03-t0  ADMIN-E01-S03-T01: Build Detail View
  vk/a87e-admin-e01-s03-t0  ADMIN-E01-S03-T02: Display 28 Measurements
  vk/5374-admin-e01-s03-t0  ADMIN-E01-S03-T03: Display Configuration
  vk/c31c-admin-e01-s03-t0  ADMIN-E01-S03-T04: Display Customer Info
  vk/468c-admin-e01-s03-t0  ADMIN-E01-S03-T05: Show State History

STATE TRANSITIONS (E01-S04):
  vk/6b9c-admin-e01-s04-t0  ADMIN-E01-S04-T01: Build Transition Controls
  vk/8dc5-admin-e01-s04-t0  ADMIN-E01-S04-T02: Implement State API Call
  vk/8212-admin-e01-s04-t0  ADMIN-E01-S04-T03: Add Confirmation Modal
  vk/7dc6-admin-e01-s04-t0  ADMIN-E01-S04-T04: Add Notes Field

EXPORT (E02-S01):
  vk/f606-admin-e02-s01-t0  ADMIN-E02-S01-T01: Build Export View
  vk/fdeb-admin-e02-s01-t0  ADMIN-E02-S01-T02: Add Copy to Clipboard
  vk/5009-admin-e02-s01-t0  ADMIN-E02-S01-T03: Add Export All
  vk/7aa5-admin-e02-s01-t0  ADMIN-E02-S01-T04: Generate Optitex Format

PATTERN UPLOAD (E02-S02):
  vk/c42c-admin-e02-s02-t0  ADMIN-E02-S02-T01: Build Upload Interface
  vk/480b-admin-e02-s02-t0  ADMIN-E02-S02-T02: Validate File Format
  vk/e51c-admin-e02-s02-t0  ADMIN-E02-S02-T03: Store Pattern File
  vk/d96d-admin-e02-s02-t0  ADMIN-E02-S02-T04: Update pattern_files Table
  vk/fc3c-admin-e02-s02-t0  ADMIN-E02-S02-T05: Auto-Transition State

EMAIL (E02-S03):
  vk/4f47-admin-e02-s03-t0  ADMIN-E02-S03-T01: Build Email Interface
  vk/555e-admin-e02-s03-t0  ADMIN-E02-S03-T02: Implement Email Send
  vk/3cb2-admin-e02-s03-t0  ADMIN-E02-S03-T03: Mark as Sent
  vk/7cbe-admin-e02-s03-t0  ADMIN-E02-S03-T04: Track Delivery

(+ 4 duplicate tasks from parallel workers)
```

---

## WAVE 3C: RUNNER (22 tasks)
*Features - Mobile PWA for runners*

```
PWA SETUP (E01-S01):
  vk/5f6c-runner-e01-s01-t  RUNNER-E01-S01-T01: Create PWA Shell
  vk/01fa-runner-e01-s01-t  RUNNER-E01-S01-T03: Build Mobile Layout

TASK LIST (E01-S02):
  vk/617e-runner-e01-s02-t  RUNNER-E01-S02-T01: Build Task List View
  vk/9ab8-runner-e01-s02-t  RUNNER-E01-S02-T02: Filter by Task Type
  vk/5d05-runner-e01-s02-t  RUNNER-E01-S02-T03: Show Task Details

RULER TEST (E02-S01):
  vk/945e-runner-e02-s01-t  RUNNER-E02-S01-T01: Build Ruler Test Screen
  vk/73a7-runner-e02-s01-t  RUNNER-E02-S01-T02: Add Numeric Input
  vk/7ad2-runner-e02-s01-t  RUNNER-E02-S01-T03: Implement Validation
  vk/68cc-runner-e02-s01-t  RUNNER-E02-S01-T04: Handle Pass
  vk/2b5d-runner-e02-s01-t  RUNNER-E02-S01-T06: Block Printer Payment

PHOTO CAPTURE (E02-S02):
  vk/261b-runner-e02-s02-t  RUNNER-E02-S02-T02: Implement File Input
  vk/01b9-runner-e02-s02-t  RUNNER-E02-S02-T04: Link to Order

DELIVERY (E03-S01):
  vk/6291-runner-e03-s01-t  RUNNER-E03-S01-T01: Build Delivery Screen
  vk/198e-runner-e03-s01-t  RUNNER-E03-S01-T03: Capture Signature/Photo
  vk/155f-runner-e03-s01-t  RUNNER-E03-S01-T04: Update State

(+ remaining tasks)
```

---

## WAVE 3D: VIS (14 tasks)
*Features - Vision/measurement service*

```
HEIGHT DETECTION (E01-S01):
  vk/46af-vis-e01-s01-t02  VIS-E01-S01-T02: Calculate Mesh Height
  vk/7101-vis-e01-s01-t04  VIS-E01-S01-T04: Apply Scale to Mesh

CALIBRATION (E01-S02):
  vk/bd3c-vis-e01-s02-t01  VIS-E01-S02-T01: Implement ArUco Detection
  vk/50f9-vis-e01-s02-t02  VIS-E01-S02-T02: Implement PnP Solver

BODY MODEL (E02):
  vk/daaa-vis-e02-s01-t04  VIS-E02-S01-T04: Implement SHAPY Shape
  vk/9cdd-vis-e02-s02-t03  VIS-E02-S02-T03: Implement Warm-up Period

MEASUREMENTS (E03-S01):
  vk/cf1f-vis-e03-s01-t03  VIS-E03-S01-T03: Implement Geodesic Measurements
  vk/cde0-vis-e03-s01-t04  VIS-E03-S01-T04: Implement Planar Slicing
  vk/8ed8-vis-e03-s01-t05  VIS-E03-S01-T05: Extract 28 Measurements
  vk/cdbb-vis-e03-s01-t06  VIS-E03-S01-T06: Store in Database

OPTIMIZATION (E03-S02):
  vk/bc8c-vis-e03-s02-t01  VIS-E03-S02-T01: Define Differentiable Measurement Function
  vk/d19e-vis-e03-s02-t02  VIS-E03-S02-T02: Implement Optimization Loop
  vk/2911-vis-e03-s02-t03  VIS-E03-S02-T03: Create Re-optimization Endpoint
  vk/d89e-vis-e03-s02-t04  VIS-E03-S02-T04: Update Frontend Mesh
```

---

## WAVE 3E: VOICE (14 tasks)
*Features - Vapi voice assistant*

```
VAPI SETUP (E01-S01):
  vk/a0c0-voice-e01-s01-t0  VOICE-E01-S01-T01: Create Vapi Account
  vk/fd29-voice-e01-s01-t0  VOICE-E01-S01-T02: Configure Assistant
  vk/ae40-voice-e01-s01-t0  VOICE-E01-S01-T03: Write System Prompt
  vk/3789-voice-e01-s01-t0  VOICE-E01-S01-T04: Select LLM
  vk/8e4b-voice-e01-s01-t0  VOICE-E01-S01-T05: Select TTS

TELEMETRY (E01-S02):
  vk/8e3a-voice-e01-s02-t0  VOICE-E01-S02-T01: Create Telemetry Endpoint
  vk/1c0d-voice-e01-s02-t0  VOICE-E01-S02-T02: Expose ArUco Status
  vk/2a23-voice-e01-s02-t0  VOICE-E01-S02-T03: Expose Rotation Speed
  vk/700e-voice-e01-s02-t0  VOICE-E01-S02-T04: Expose Frame Quality

CALIBRATION DIALOGUE (E01-S03):
  vk/148e-voice-e01-s03-t0  VOICE-E01-S03-T02: Implement Calibration Dialogue

SDK INTEGRATION (E01-S04):
  vk/0193-voice-e01-s04-t0  VOICE-E01-S04-T01: Install Vapi SDK
  vk/3b75-voice-e01-s04-t0  VOICE-E01-S04-T04: Auto-Advance UI

(+ duplicates from parallel workers)
```

---

## WAVE 3F: FIN (9 tasks)
*Features - Stripe payment integration*

```
STRIPE SETUP (E01-S01):
  vk/5231-fin-e01-s01-t01  FIN-E01-S01-T01: Configure Stripe Account
  vk/d313-fin-e01-s01-t02  FIN-E01-S01-T02: Set Up API Keys
  vk/e054-fin-e01-s01-t03  FIN-E01-S01-T03: Create PaymentIntent Endpoint
  vk/8747-fin-e01-s01-t04  FIN-E01-S01-T04: Handle Track A Amount
  vk/9373-fin-e01-s01-t05  FIN-E01-S01-T05: Handle Track B Amount

WEBHOOKS (E01-S02):
  vk/db6c-fin-e01-s02-t01  FIN-E01-S02-T01: Create Webhook Endpoint
  vk/9e8f-fin-e01-s02-t02  FIN-E01-S02-T02: Verify Webhook Signature
  vk/9564-fin-e01-s02-t03  FIN-E01-S02-T03: Handle payment_intent.succeeded
  vk/5ffc-fin-e01-s02-t04  FIN-E01-S02-T04: Handle payment_intent.failed
```

---

## HIGH-RISK FILES (Conflict Analysis)

These files are modified by multiple branches and require careful merge ordering:

| File | Branches | Risk |
|------|----------|------|
| prisma/schema.prisma | 31 | HIGH |
| package.json | 17 | HIGH |
| package-lock.json | 13 | HIGH |

### Recommended Merge Strategy:
1. Merge ALL DB branches first (single prisma/schema.prisma)
2. Run `prisma migrate dev` after Wave 1
3. Merge API branches (may add to package.json)
4. Run `npm install` after Wave 2
5. Merge Feature waves in parallel (3A-3F can run simultaneously)

---

## BRANCHES WITH CONFLICTS (Need Manual Resolution)

```
vk/8b0a-install-and-inte  - Vibe Kanban Web Companion (root files conflict)
vk/c2d2-vis-e01-s01-t01   - VIS Height Input Endpoint
```

---

## Quick Reference Commands

```bash
# Merge a single branch
git checkout main
git merge --no-ff vk/BRANCH-NAME

# Merge with conflict resolution
git merge vk/BRANCH-NAME
# resolve conflicts
git add .
git commit

# After Wave 1 (DB)
npx prisma migrate dev
npx prisma generate

# After Wave 2 (API)
npm install
npm run build
```
