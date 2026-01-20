# SUIT AI v4.b - Ralphy-Compatible Task List
## Formatted for automatic prerequisite parsing

> **Auto-generated for ralphy-loop.js**
> **Total Remaining Tasks:** ~190 (21 already completed)

---

## Completed Tasks (DO NOT IMPORT)

The following tasks have already been merged to main. Mark as DONE in vibe-kanban:

- DB-E01-S01-T01, DB-E01-S02-T02
- VIS-E01-S01-T01 through T04
- VIS-E01-S02-T01 through T04
- VIS-E02-S01-T01, T02, T03, T05, T06
- VIS-E02-S02-T01, T02, T04
- VIS-E03-S01-T01, T02

---

# MODULE: INFRA - Infrastructure & Environment

## INFRA-E01-S01-T01: Provision GPU Instance
Allocate AWS g4dn.xlarge with RTX 5090, Ubuntu 22.04 LTS

**Prerequisites:** None
**DoD:** Instance accessible via SSH

---

## INFRA-E01-S01-T02: Install NVIDIA Driver
Install Driver 570.86.16 or higher

**Prerequisites:** INFRA-E01-S01-T01
**DoD:** `nvidia-smi` shows RTX 5090

---

## INFRA-E01-S01-T03: Install CUDA Toolkit
Install CUDA 12.8 system-wide

**Prerequisites:** INFRA-E01-S01-T02
**DoD:** `nvcc --version` returns 12.8

---

## INFRA-E01-S01-T04: Verify GPU Access
Run torch CUDA test

**Prerequisites:** INFRA-E01-S01-T03
**DoD:** `torch.cuda.is_available()` returns True

---

## INFRA-E01-S02-T01: Install WSL2
Install Ubuntu 22.04 on Windows 11

**Prerequisites:** None
**DoD:** `wsl --list` shows Ubuntu

---

## INFRA-E01-S02-T02: Configure Resources
Set memory/processor limits in .wslconfig

**Prerequisites:** INFRA-E01-S02-T01
**DoD:** WSL runs within resource limits

---

## INFRA-E01-S02-T03: Install NVIDIA WSL Driver
Install WSL-specific CUDA driver

**Prerequisites:** INFRA-E01-S02-T02
**DoD:** GPU visible in WSL

---

## INFRA-E02-S01-T01: Create Dockerfile
Base image: nvidia/cuda:12.8-devel-ubuntu22.04

**Prerequisites:** INFRA-E01-S01-T04
**DoD:** Dockerfile builds successfully

---

## INFRA-E02-S01-T02: Install PyTorch Nightly
pip install --pre torch --index-url cu128

**Prerequisites:** INFRA-E02-S01-T01
**DoD:** torch.cuda.is_available() in container

---

## INFRA-E02-S01-T03: Install Vision Dependencies
opencv, smplx, shapy, trimesh, pytorch3d, detectron2

**Prerequisites:** INFRA-E02-S01-T02
**DoD:** All imports succeed

---

## INFRA-E02-S01-T04: Configure GPU Passthrough
docker-compose with nvidia runtime

**Prerequisites:** INFRA-E02-S01-T03
**DoD:** Container accesses GPU

---

## INFRA-E02-S01-T05: Create docker-compose.yml
Define vision service with health checks

**Prerequisites:** INFRA-E02-S01-T04
**DoD:** `docker-compose up` starts service

---

# MODULE: DB - Database & Backend Services

## DB-E01-S01-T02: Create sessions Table
id UUID PK, user_id FK nullable, created_at, expires_at

**Prerequisites:** DB-E01-S01-T01
**DoD:** FK constraint works

---

## DB-E01-S01-T03: Add RLS Policy - Users
Users can only read/write own data

**Prerequisites:** DB-E01-S01-T01
**DoD:** RLS test passes

---

## DB-E01-S01-T04: Add RLS Policy - Sessions
Sessions accessible by owner or linked user

**Prerequisites:** DB-E01-S01-T02
**DoD:** RLS test passes

---

## DB-E01-S02-T01: Create measurements Table
28 metric fields, user_overrides JSONB, smplx_beta JSONB

**Prerequisites:** DB-E01-S01-T02
**DoD:** Table exists

---

## DB-E01-S02-T03: Create suit_configs Table
id, session_id FK, fabric_id FK, style_json JSONB, is_template BOOLEAN

**Prerequisites:** DB-E01-S02-T01, DB-E01-S02-T02
**DoD:** FKs work

---

## DB-E01-S02-T04: Seed Initial Fabrics
Insert 5 Raymond-stocked fabrics for MVP

**Prerequisites:** DB-E01-S02-T02
**DoD:** 5 rows in fabrics

---

## DB-E02-S01-T01: Create wedding_events Table
id, organizer_id FK, event_name, event_date, status

**Prerequisites:** DB-E01-S01-T02
**DoD:** Table exists

---

## DB-E02-S01-T02: Add Date Constraint
event_date must be >= NOW() + 4 weeks

**Prerequisites:** DB-E02-S01-T01
**DoD:** Constraint enforced

---

## DB-E02-S01-T03: Create wedding_templates Table
id, event_id FK, role ENUM, suit_config_id FK

**Prerequisites:** DB-E02-S01-T01, DB-E01-S02-T03
**DoD:** Table exists

---

## DB-E02-S01-T04: Create wedding_attendees Table
id, event_id FK, template_id FK, email, invite_token UNIQUE, status, measurement_id FK

**Prerequisites:** DB-E02-S01-T03
**DoD:** Table exists

---

## DB-E02-S01-T05: Add RLS - Organizer Access
Organizer can manage their event

**Prerequisites:** DB-E02-S01-T01
**DoD:** RLS test passes

---

## DB-E03-S01-T01: Create orders Table
id, user_id FK, track_type ENUM('A','B'), stripe_payment_intent, current_state ENUM(S01-S19), total_amount

**Prerequisites:** DB-E01-S01-T02
**DoD:** Table exists

---

## DB-E03-S01-T02: Create order_items Table
id, order_id FK, suit_config_id FK, measurement_id FK, price, status

**Prerequisites:** DB-E03-S01-T01, DB-E01-S02-T03
**DoD:** Table exists

---

## DB-E03-S01-T03: Create order_state_history Table
id, order_id FK, from_state, to_state, changed_by FK, notes, created_at

**Prerequisites:** DB-E03-S01-T01
**DoD:** Table exists

---

## DB-E03-S01-T04: Create pattern_files Table
id, order_item_id FK, file_type, file_url, calibration_verified BOOLEAN

**Prerequisites:** DB-E03-S01-T02
**DoD:** Table exists

---

## DB-E03-S01-T05: Create State Transition Function
Validate legal state transitions

**Prerequisites:** DB-E03-S01-T01
**DoD:** Function rejects invalid transitions

---

# MODULE: API - Core API & User Management

## API-E01-S01-T01: POST /api/sessions
Create anonymous session, return UUID

**Prerequisites:** DB-E01-S01-T02
**DoD:** Returns valid session ID

---

## API-E01-S01-T02: GET /api/sessions/:id
Retrieve session data including measurements

**Prerequisites:** API-E01-S01-T01
**DoD:** Returns session object

---

## API-E01-S01-T03: PUT /api/sessions/:id
Update session (measurements, configs)

**Prerequisites:** API-E01-S01-T01
**DoD:** Updates persist

---

## API-E01-S01-T04: POST /api/sessions/:id/claim
Link session to authenticated user

**Prerequisites:** API-E01-S01-T01
**DoD:** Session.user_id updated

---

## API-E01-S02-T01: Configure Supabase Auth
Magic link + OAuth providers

**Prerequisites:** DB-E01-S01-T01
**DoD:** Auth flow works

---

## API-E01-S02-T02: POST /api/auth/callback
Handle Supabase auth callback

**Prerequisites:** API-E01-S02-T01
**DoD:** Session created on login

---

## API-E01-S02-T03: Implement Session Merge
Merge anonymous session on login

**Prerequisites:** API-E01-S02-T02, API-E01-S01-T04
**DoD:** Data transfers correctly

---

## API-E02-S01-T01: POST /api/configs
Create suit configuration

**Prerequisites:** DB-E01-S02-T03
**DoD:** Config created

---

## API-E02-S01-T02: GET /api/configs/:id
Retrieve configuration with fabric details

**Prerequisites:** API-E02-S01-T01
**DoD:** Returns full config

---

## API-E02-S01-T03: PUT /api/configs/:id
Update configuration (check template lock)

**Prerequisites:** API-E02-S01-T01
**DoD:** Updates work, locked templates rejected

---

## API-E02-S01-T04: DELETE /api/configs/:id
Delete configuration

**Prerequisites:** API-E02-S01-T01
**DoD:** Config removed

---

## API-E02-S01-T05: GET /api/configs/:id/preview
Return 3D preview data (textures, meshes)

**Prerequisites:** API-E02-S01-T01
**DoD:** Returns asset URLs

---

## API-E02-S02-T01: POST /api/wedding-events
Create wedding event

**Prerequisites:** DB-E02-S01-T01
**DoD:** Event created with valid date

---

## API-E02-S02-T02: GET /api/wedding-events/:id
Retrieve event with templates and attendees

**Prerequisites:** API-E02-S02-T01
**DoD:** Returns full event

---

## API-E02-S02-T03: POST /api/wedding-events/:id/templates
Create role template

**Prerequisites:** API-E02-S02-T01
**DoD:** Template created, is_template=true

---

## API-E02-S02-T04: POST /api/wedding-events/:id/attendees
Add attendee, generate invite_token

**Prerequisites:** API-E02-S02-T01
**DoD:** Attendee created with unique token

---

## API-E02-S02-T05: GET /api/invites/:token
Validate token, return locked template

**Prerequisites:** API-E02-S02-T04
**DoD:** Returns template if valid

---

## API-E02-S02-T06: POST /api/invites/:token/confirm
Confirm attendee measurements

**Prerequisites:** API-E02-S02-T05
**DoD:** Status updated, organizer notified

---

## API-E03-S01-T01: POST /api/orders
Create order (called by webhook)

**Prerequisites:** DB-E03-S01-T01
**DoD:** Order created at S01

---

## API-E03-S01-T02: GET /api/orders
List user's orders

**Prerequisites:** API-E03-S01-T01
**DoD:** Returns order list

---

## API-E03-S01-T03: GET /api/orders/:id
Get order details with items

**Prerequisites:** API-E03-S01-T01
**DoD:** Returns full order

---

## API-E03-S01-T04: PATCH /api/orders/:id/state
Transition order state (admin only)

**Prerequisites:** API-E03-S01-T01
**DoD:** State updated, history logged

---

## API-E03-S01-T05: Implement State Validation
Check legal transitions

**Prerequisites:** API-E03-S01-T04
**DoD:** Invalid transitions rejected

---

# MODULE: VIS - Vision & Measurement Service

## VIS-E02-S01-T04: Implement SHAPY Shape
Extract accurate beta (shape) parameters

**Prerequisites:** INFRA-E02-S01-T05
**DoD:** Returns shape vector

---

## VIS-E02-S02-T03: Implement Warm-up Period
Wait 60 frames before locking

**Prerequisites:** VIS-E02-S02-T01
**DoD:** beta_is_stable flag

---

## VIS-E03-S01-T03: Implement Geodesic Measurements
Dijkstra pathfinding for lengths

**Prerequisites:** VIS-E03-S01-T01, VIS-E03-S01-T02
**DoD:** Length measurements

---

## VIS-E03-S01-T04: Implement Planar Slicing
Plane-mesh intersection for circumferences

**Prerequisites:** VIS-E03-S01-T01, VIS-E03-S01-T02
**DoD:** Circumference measurements

---

## VIS-E03-S01-T05: Extract 28 Measurements
chest, waist, hip, shoulder, sleeve, inseam, etc.

**Prerequisites:** VIS-E03-S01-T03, VIS-E03-S01-T04
**DoD:** Full measurement JSON

---

## VIS-E03-S01-T06: Store in Database
Save to measurements table with session link

**Prerequisites:** VIS-E03-S01-T05
**DoD:** Measurements persisted

---

## VIS-E03-S02-T01: Define Differentiable Measurement Function
PyTorch forward pass

**Prerequisites:** VIS-E03-S01-T05
**DoD:** Gradient flows

---

## VIS-E03-S02-T02: Implement Optimization Loop
L2 loss + shape prior regularization

**Prerequisites:** VIS-E03-S02-T01
**DoD:** Converges in <3 sec

---

## VIS-E03-S02-T03: Create Re-optimization Endpoint
POST /api/measurements/:id/optimize

**Prerequisites:** VIS-E03-S02-T02
**DoD:** Returns updated beta

---

## VIS-E03-S02-T04: Update Frontend Mesh
Stream new mesh back to client

**Prerequisites:** VIS-E03-S02-T03
**DoD:** Avatar updates live

---

# MODULE: FE - Frontend Web Application

## FE-E01-S01-T01: Initialize Next.js 14
Create app with TypeScript

**Prerequisites:** None
**DoD:** Project runs

---

## FE-E01-S01-T02: Configure Tailwind
Set up utility classes

**Prerequisites:** FE-E01-S01-T01
**DoD:** Styles work

---

## FE-E01-S01-T03: Set Up Zustand Store
Create store structure with slices

**Prerequisites:** FE-E01-S01-T01
**DoD:** Store functional

---

## FE-E01-S01-T04: Configure Environment
Set up .env files for different environments

**Prerequisites:** FE-E01-S01-T01
**DoD:** Configs load correctly

---

## FE-E01-S02-T01: Implement Dual-Track Router
Parse invite_token URL param

**Prerequisites:** FE-E01-S01-T04
**DoD:** Correct route selected

---

## FE-E01-S02-T02: Create Layout Components
Header, Footer, Sidebar

**Prerequisites:** FE-E01-S01-T02
**DoD:** Layouts render

---

## FE-E01-S02-T03: Implement Responsive Design
Mobile-first approach

**Prerequisites:** FE-E01-S02-T02
**DoD:** Works on all devices

---

## FE-E01-S03-T01: Create useSession Hook
Generate UUID, store in localStorage

**Prerequisites:** FE-E01-S01-T03
**DoD:** Session persists

---

## FE-E01-S03-T02: Call Session API
POST /api/sessions on first load

**Prerequisites:** FE-E01-S03-T01, API-E01-S01-T01
**DoD:** Session created

---

## FE-E01-S03-T03: Implement Session Restore
Load existing session on return

**Prerequisites:** FE-E01-S03-T01
**DoD:** Data restored

---

## FE-E02-S01-T01: Set Up R3F Canvas
Configure with frameloop="demand"

**Prerequisites:** FE-E01-S01-T01
**DoD:** Canvas renders

---

## FE-E02-S01-T02: Implement GPU Tier Detection
Use detect-gpu library

**Prerequisites:** FE-E02-S01-T01
**DoD:** Tier detected

---

## FE-E02-S01-T03: Configure Tiered Rendering
Tier A/B/C quality settings

**Prerequisites:** FE-E02-S01-T02
**DoD:** Correct quality per device

---

## FE-E02-S01-T04: Set Up Lighting
Environment map + key light

**Prerequisites:** FE-E02-S01-T01
**DoD:** Scene lit properly

---

## FE-E02-S01-T05: Implement Camera Controls
OrbitControls with touch support

**Prerequisites:** FE-E02-S01-T01
**DoD:** Camera rotates/zooms

---

## FE-E02-S02-T01: Implement GLTF Loader
useGLTF with Draco compression

**Prerequisites:** FE-E02-S01-T04
**DoD:** Models load

---

## FE-E02-S02-T02: Create Asset Manager
Lazy load/dispose textures

**Prerequisites:** FE-E02-S02-T01
**DoD:** No memory leaks

---

## FE-E02-S02-T03: Implement Suspense Boundaries
Loading states for 3D assets

**Prerequisites:** FE-E02-S02-T01
**DoD:** Loading shown

---

## FE-E02-S03-T01: Build Fabric Selector
Grid of swatches from /api/fabrics

**Prerequisites:** FE-E02-S02-T03, API-E02-S01-T02
**DoD:** Fabrics display

---

## FE-E02-S03-T02: Implement Fabric Selection
Update store, apply texture

**Prerequisites:** FE-E02-S03-T01
**DoD:** Material changes

---

## FE-E02-S03-T03: Build Style Selector
Dropdowns for lapel, vents, buttons

**Prerequisites:** FE-E02-S01-T05
**DoD:** Options display

---

## FE-E02-S03-T04: Implement Mesh Swapping
Swap visible mesh on style change

**Prerequisites:** FE-E02-S03-T03
**DoD:** Correct variant shown

---

## FE-E02-S03-T05: Build Lining Selector
Color/pattern picker

**Prerequisites:** FE-E02-S01-T05
**DoD:** Lining customizable

---

## FE-E02-S04-T01: Add disabled Prop
Accept locked prop on configurator

**Prerequisites:** FE-E02-S03-T05
**DoD:** Prop accepted

---

## FE-E02-S04-T02: Render Read-Only Controls
Disable all selectors when locked

**Prerequisites:** FE-E02-S04-T01
**DoD:** Controls disabled

---

## FE-E02-S04-T03: Display Template Values
Show pre-defined selections

**Prerequisites:** FE-E02-S04-T01
**DoD:** Values visible

---

## FE-E02-S04-T04: Replace Add to Cart Button
Show "Confirm Measurements" instead

**Prerequisites:** FE-E02-S04-T01
**DoD:** Correct CTA shown

---

## FE-E02-S05-T01: Implement Exploded View
Translate layers along normals

**Prerequisites:** FE-E02-S02-T02
**DoD:** Layers separate

---

## FE-E02-S05-T02: Implement Lining Flash
Animate jacket panel rotation

**Prerequisites:** FE-E02-S02-T02
**DoD:** Lining revealed

---

## FE-E02-S05-T03: Implement Pose Controls
Toggle Standing/Walking/Sitting

**Prerequisites:** FE-E02-S02-T02
**DoD:** Poses work

---

## FE-E02-S05-T04: Add Animation Library
gsap or react-spring

**Prerequisites:** FE-E02-S01-T01
**DoD:** Smooth animations

---

## FE-E03-S01-T01: Build Permission Dialog
Explain why camera is needed

**Prerequisites:** FE-E01-S02-T02
**DoD:** Dialog shows

---

## FE-E03-S01-T02: Implement react-webcam
Access user camera

**Prerequisites:** FE-E03-S01-T01
**DoD:** Video feed displays

---

## FE-E03-S01-T03: Add Camera Selection
Support multi-camera devices

**Prerequisites:** FE-E03-S01-T02
**DoD:** Cameras listed

---

## FE-E03-S01-T04: Display Preview Feed
Mirror mode option

**Prerequisites:** FE-E03-S01-T02
**DoD:** Feed visible

---

## FE-E03-S02-T01: Build Height Input
Collect user height

**Prerequisites:** FE-E03-S01-T04, VIS-E01-S01-T01
**DoD:** Height stored

---

## FE-E03-S02-T02: Build ArUco Guidance
Instructions to hold A4 paper

**Prerequisites:** FE-E03-S01-T04
**DoD:** UI guides user

---

## FE-E03-S02-T03: Show Calibration Status
Visual feedback when marker detected

**Prerequisites:** FE-E03-S02-T02, VIS-E01-S02-T04
**DoD:** Status updates

---

## FE-E03-S02-T04: Display Locked Indicator
Show when calibration locked

**Prerequisites:** FE-E03-S02-T03
**DoD:** Lock shown

---

## FE-E03-S03-T01: Implement WebSocket Streaming
Send frames at 30fps

**Prerequisites:** FE-E03-S01-T04, VIS-E02-S01-T06
**DoD:** Frames transmitted

---

## FE-E03-S03-T02: Build AR Overlay Canvas
Layer R3F on video feed

**Prerequisites:** FE-E03-S03-T01
**DoD:** Canvas overlays video

---

## FE-E03-S03-T03: Render SMPL-X Mesh
Display reconstructed body

**Prerequisites:** FE-E03-S03-T02, VIS-E02-S01-T06
**DoD:** Mesh aligned with video

---

## FE-E03-S03-T04: Show Rotation Progress
0-360 degree indicator

**Prerequisites:** FE-E03-S03-T01
**DoD:** Progress updates

---

## FE-E03-S03-T05: Show Speed Feedback
Warn if rotating too fast

**Prerequisites:** FE-E03-S03-T01
**DoD:** Warning displays

---

## FE-E03-S04-T01: Build Measurement Cards
Display 28 values

**Prerequisites:** VIS-E03-S01-T05
**DoD:** All measurements shown

---

## FE-E03-S04-T02: Implement Virtual Tape Measure
Animated line on mesh surface

**Prerequisites:** FE-E03-S03-T03
**DoD:** Line wraps body

---

## FE-E03-S04-T03: Add Edit Capability
Click to edit individual values

**Prerequisites:** FE-E03-S04-T01
**DoD:** Values editable

---

## FE-E03-S04-T04: Trigger Re-optimization
Call /api/measurements/:id/optimize

**Prerequisites:** FE-E03-S04-T03, VIS-E03-S02-T03
**DoD:** Mesh updates

---

## FE-E03-S04-T05: Build Confirmation Button
"Confirm All" to proceed

**Prerequisites:** FE-E03-S04-T01
**DoD:** Confirmation works

---

## FE-E04-S01-T01: Build Cart State
Add/remove/update items in Zustand

**Prerequisites:** FE-E01-S01-T03
**DoD:** Cart state works

---

## FE-E04-S01-T02: Build Add to Cart Button
Snapshot config on click

**Prerequisites:** FE-E02-S03-T02
**DoD:** Item added

---

## FE-E04-S01-T03: Build Cart Badge
Show count in header

**Prerequisites:** FE-E04-S01-T01
**DoD:** Badge updates

---

## FE-E04-S01-T04: Build Cart Page
List items with edit/remove

**Prerequisites:** FE-E04-S01-T01
**DoD:** Cart page works

---

## FE-E04-S01-T05: Calculate Totals
Base + fabric modifier + VAT

**Prerequisites:** FE-E04-S01-T01
**DoD:** Totals correct

---

## FE-E04-S02-T01: Implement Session Claiming
Require login/signup

**Prerequisites:** FE-E01-S03-T03, API-E01-S02-T03
**DoD:** Session linked to user

---

## FE-E04-S02-T02: Install Stripe Elements
@stripe/react-stripe-js

**Prerequisites:** FE-E01-S01-T01
**DoD:** Stripe loaded

---

## FE-E04-S02-T03: Build Payment Form
CardElement for card input

**Prerequisites:** FE-E04-S02-T02
**DoD:** Form displays

---

## FE-E04-S02-T04: Build Address Form
Shipping address collection

**Prerequisites:** FE-E01-S01-T02
**DoD:** Address collected

---

## FE-E04-S02-T05: Handle Payment
Create PaymentIntent, confirm

**Prerequisites:** FE-E04-S02-T03, FIN-E01-S01-T03
**DoD:** Payment processed

---

## FE-E04-S02-T06: Build Confirmation Page
Order number, email receipt

**Prerequisites:** FE-E04-S02-T05
**DoD:** Confirmation shown

---

## FE-E05-S01-T01: Build Event Creation Form
Name, date (min 4 weeks)

**Prerequisites:** FE-E01-S02-T02, API-E02-S02-T01
**DoD:** Event created

---

## FE-E05-S01-T02: Build Template Designer
Use configurator for each role

**Prerequisites:** FE-E02-S03-T05
**DoD:** Templates designed

---

## FE-E05-S01-T03: Build Lock Confirmation
Confirm template immutability

**Prerequisites:** FE-E05-S01-T02
**DoD:** Templates locked

---

## FE-E05-S01-T04: Build Attendee Manager
Add/edit/remove attendees

**Prerequisites:** API-E02-S02-T04
**DoD:** Attendees managed

---

## FE-E05-S01-T05: Generate Invite Links
Display/copy token URLs

**Prerequisites:** FE-E05-S01-T04
**DoD:** Links generated

---

## FE-E05-S01-T06: Build Status Dashboard
Progress tracking per attendee

**Prerequisites:** FE-E05-S01-T04
**DoD:** Status visible

---

## FE-E05-S02-T01: Calculate Batch Total
price x attendee count

**Prerequisites:** FE-E05-S01-T04
**DoD:** Total calculated

---

## FE-E05-S02-T02: Implement Stripe Connect
Batch payment processing

**Prerequisites:** FIN-E01-S01-T05
**DoD:** Payment works

---

## FE-E05-S02-T03: Create Order Items
Pending measurement status

**Prerequisites:** FE-E05-S02-T02, API-E03-S01-T01
**DoD:** Items created

---

## FE-E05-S03-T01: Handle Invite URL
Parse token from URL

**Prerequisites:** FE-E01-S02-T01
**DoD:** Token extracted

---

## FE-E05-S03-T02: Validate Token
Call /api/invites/:token

**Prerequisites:** FE-E05-S03-T01, API-E02-S02-T05
**DoD:** Template loaded

---

## FE-E05-S03-T03: Render Locked Configurator
Show template read-only

**Prerequisites:** FE-E05-S03-T02, FE-E02-S04-T04
**DoD:** Template displayed

---

## FE-E05-S03-T04: Enable Scanner Only
Skip configuration, go to scan

**Prerequisites:** FE-E03-S04-T05
**DoD:** Scanner accessible

---

## FE-E05-S03-T05: Build Confirm Measurements
Update attendee status

**Prerequisites:** API-E02-S02-T06
**DoD:** Status updated

---

## FE-E05-S03-T06: Notify Organizer
Trigger notification

**Prerequisites:** FE-E05-S03-T05
**DoD:** Organizer notified

---

# MODULE: ADMIN - Operator Dashboard

## ADMIN-E01-S01-T01: Create Admin Route
/admin with protection

**Prerequisites:** FE-E01-S01-T01
**DoD:** Route protected

---

## ADMIN-E01-S01-T02: Implement Admin Auth
Separate admin role check

**Prerequisites:** API-E01-S02-T02
**DoD:** Only admins access

---

## ADMIN-E01-S01-T03: Build Admin Layout
Navigation sidebar

**Prerequisites:** ADMIN-E01-S01-T01
**DoD:** Layout renders

---

## ADMIN-E01-S02-T01: Build Queue View
Table with filters by state

**Prerequisites:** ADMIN-E01-S01-T03
**DoD:** Orders display

---

## ADMIN-E01-S02-T02: Implement State Filter
Dropdown to filter S01-S19

**Prerequisites:** ADMIN-E01-S02-T01
**DoD:** Filter works

---

## ADMIN-E01-S02-T03: Add Sort Options
Sort by date, priority

**Prerequisites:** ADMIN-E01-S02-T01
**DoD:** Sort works

---

## ADMIN-E01-S02-T04: Add Search
Search by order ID, customer

**Prerequisites:** ADMIN-E01-S02-T01
**DoD:** Search works

---

## ADMIN-E01-S02-T05: Implement Auto-Refresh
Poll for new orders

**Prerequisites:** ADMIN-E01-S02-T01
**DoD:** Queue updates

---

## ADMIN-E01-S03-T01: Build Detail View
Full order information

**Prerequisites:** ADMIN-E01-S02-T01
**DoD:** Details display

---

## ADMIN-E01-S03-T02: Display 28 Measurements
Clear format for transcription

**Prerequisites:** ADMIN-E01-S03-T01, VIS-E03-S01-T05
**DoD:** Measurements shown

---

## ADMIN-E01-S03-T03: Display Configuration
Fabric, style, lining

**Prerequisites:** ADMIN-E01-S03-T01
**DoD:** Config shown

---

## ADMIN-E01-S03-T04: Display Customer Info
Name, email, shipping

**Prerequisites:** ADMIN-E01-S03-T01
**DoD:** Customer shown

---

## ADMIN-E01-S03-T05: Show State History
Timeline of transitions

**Prerequisites:** ADMIN-E01-S03-T01
**DoD:** History visible

---

## ADMIN-E01-S04-T01: Build Transition Controls
Buttons for valid next states

**Prerequisites:** ADMIN-E01-S03-T01, API-E03-S01-T04
**DoD:** Controls display

---

## ADMIN-E01-S04-T02: Implement State API Call
PATCH /api/orders/:id/state

**Prerequisites:** ADMIN-E01-S04-T01
**DoD:** State updates

---

## ADMIN-E01-S04-T03: Add Confirmation Modal
Confirm before critical transitions

**Prerequisites:** ADMIN-E01-S04-T01
**DoD:** Confirmation required

---

## ADMIN-E01-S04-T04: Add Notes Field
Optional notes for transitions

**Prerequisites:** ADMIN-E01-S04-T01
**DoD:** Notes saved

---

## ADMIN-E02-S01-T01: Build Export View
Formatted measurement display

**Prerequisites:** ADMIN-E01-S03-T02
**DoD:** View displays

---

## ADMIN-E02-S01-T02: Add Copy to Clipboard
One-click copy for each value

**Prerequisites:** ADMIN-E02-S01-T01
**DoD:** Copy works

---

## ADMIN-E02-S01-T03: Add Export All
Copy all as CSV/JSON

**Prerequisites:** ADMIN-E02-S01-T01
**DoD:** Export works

---

## ADMIN-E02-S01-T04: Generate Optitex Format
Format specifically for Optitex

**Prerequisites:** ADMIN-E02-S01-T01
**DoD:** Format correct

---

## ADMIN-E02-S02-T01: Build Upload Interface
Accept PDF/DXF files

**Prerequisites:** ADMIN-E01-S03-T01
**DoD:** Upload UI shows

---

## ADMIN-E02-S02-T02: Validate File Format
Check file type and size

**Prerequisites:** ADMIN-E02-S02-T01
**DoD:** Invalid files rejected

---

## ADMIN-E02-S02-T03: Store Pattern File
Save to Supabase Storage

**Prerequisites:** ADMIN-E02-S02-T01
**DoD:** File stored

---

## ADMIN-E02-S02-T04: Update pattern_files Table
Link file to order_item

**Prerequisites:** ADMIN-E02-S02-T03, DB-E03-S01-T04
**DoD:** Record created

---

## ADMIN-E02-S02-T05: Auto-Transition State
Move to S05 PATTERN_GENERATED

**Prerequisites:** ADMIN-E02-S02-T04
**DoD:** State updated

---

## ADMIN-E02-S03-T01: Build Email Interface
Compose email with pattern attachment

**Prerequisites:** ADMIN-E02-S02-T05
**DoD:** Email UI shows

---

## ADMIN-E02-S03-T02: Implement Email Send
Send via Resend API

**Prerequisites:** ADMIN-E02-S03-T01
**DoD:** Email sent

---

## ADMIN-E02-S03-T03: Mark as Sent
Button to update state to S06

**Prerequisites:** ADMIN-E02-S03-T02
**DoD:** State updated

---

## ADMIN-E02-S03-T04: Track Delivery
Note field for delivery confirmation

**Prerequisites:** ADMIN-E02-S03-T03
**DoD:** Notes saved

---

# MODULE: RUNNER - Runner Mobile App

## RUNNER-E01-S01-T01: Create PWA Shell
Mobile-optimized React app

**Prerequisites:** FE-E01-S01-T01
**DoD:** PWA works offline

---

## RUNNER-E01-S01-T02: Implement Runner Auth
Login with runner credentials

**Prerequisites:** API-E01-S02-T02
**DoD:** Auth works

---

## RUNNER-E01-S01-T03: Build Mobile Layout
Touch-friendly UI

**Prerequisites:** RUNNER-E01-S01-T01
**DoD:** Layout responsive

---

## RUNNER-E01-S02-T01: Build Task List View
List orders in relevant states

**Prerequisites:** RUNNER-E01-S01-T03, API-E03-S01-T02
**DoD:** Tasks display

---

## RUNNER-E01-S02-T02: Filter by Task Type
Collect print, reserve fabric, deliver

**Prerequisites:** RUNNER-E01-S02-T01
**DoD:** Filters work

---

## RUNNER-E01-S02-T03: Show Task Details
Order summary for each task

**Prerequisites:** RUNNER-E01-S02-T01
**DoD:** Details visible

---

## RUNNER-E01-S02-T04: Implement Pull to Refresh
Manual refresh gesture

**Prerequisites:** RUNNER-E01-S02-T01
**DoD:** Refresh works

---

## RUNNER-E02-S01-T01: Build Ruler Test Screen
Instructions + input field

**Prerequisites:** RUNNER-E01-S02-T01
**DoD:** Screen displays

---

## RUNNER-E02-S01-T02: Add Numeric Input
Field for measured value in cm

**Prerequisites:** RUNNER-E02-S01-T01
**DoD:** Input accepts numbers

---

## RUNNER-E02-S01-T03: Implement Validation
Accept 9.9-10.1cm only

**Prerequisites:** RUNNER-E02-S01-T02
**DoD:** Validation enforced

---

## RUNNER-E02-S01-T04: Handle Pass
Update state to S07 PRINT_COLLECTED

**Prerequisites:** RUNNER-E02-S01-T03, API-E03-S01-T04
**DoD:** State updated

---

## RUNNER-E02-S01-T05: Handle Fail
Update state to S08 PRINT_REJECTED

**Prerequisites:** RUNNER-E02-S01-T03, API-E03-S01-T04
**DoD:** State updated

---

## RUNNER-E02-S01-T06: Block Printer Payment
Alert operator on failure

**Prerequisites:** RUNNER-E02-S01-T05
**DoD:** Alert sent

---

## RUNNER-E02-S02-T01: Build Photo Upload Screen
Camera access + preview

**Prerequisites:** RUNNER-E01-S01-T03
**DoD:** Screen displays

---

## RUNNER-E02-S02-T02: Implement File Input
Capture from camera or gallery

**Prerequisites:** RUNNER-E02-S02-T01
**DoD:** Photo captured

---

## RUNNER-E02-S02-T03: Upload Photo
Save to Supabase Storage

**Prerequisites:** RUNNER-E02-S02-T02
**DoD:** Photo stored

---

## RUNNER-E02-S02-T04: Link to Order
Update order record with photo URL

**Prerequisites:** RUNNER-E02-S02-T03
**DoD:** Record updated

---

## RUNNER-E02-S02-T05: Confirm Reservation
Mark fabric reserved

**Prerequisites:** RUNNER-E02-S02-T04
**DoD:** Status updated

---

## RUNNER-E03-S01-T01: Build Delivery Screen
List items to deliver

**Prerequisites:** RUNNER-E01-S02-T01
**DoD:** Screen displays

---

## RUNNER-E03-S01-T02: Add Confirmation Checklist
Verify pattern + tech pack

**Prerequisites:** RUNNER-E03-S01-T01
**DoD:** Checklist works

---

## RUNNER-E03-S01-T03: Capture Signature/Photo
Proof of delivery

**Prerequisites:** RUNNER-E03-S01-T01
**DoD:** Capture works

---

## RUNNER-E03-S01-T04: Update State
Move to S09 DELIVERED_TO_RAJA

**Prerequisites:** RUNNER-E03-S01-T03, API-E03-S01-T04
**DoD:** State updated

---

# MODULE: FIN - Financial Integration

## FIN-E01-S01-T01: Configure Stripe Account
UK account with test/live modes

**Prerequisites:** None
**DoD:** Account configured

---

## FIN-E01-S01-T02: Set Up API Keys
Store in environment variables

**Prerequisites:** FIN-E01-S01-T01
**DoD:** Keys secured

---

## FIN-E01-S01-T03: Create PaymentIntent Endpoint
POST /api/create-payment-intent

**Prerequisites:** API-E01-S01-T01, FIN-E01-S01-T02
**DoD:** Endpoint works

---

## FIN-E01-S01-T04: Handle Track A Amount
Base price + fabric modifier

**Prerequisites:** FIN-E01-S01-T03
**DoD:** Amount correct

---

## FIN-E01-S01-T05: Handle Track B Amount
Batch total calculation

**Prerequisites:** FIN-E01-S01-T03
**DoD:** Amount correct

---

## FIN-E01-S02-T01: Create Webhook Endpoint
POST /api/webhook/stripe

**Prerequisites:** FIN-E01-S01-T03
**DoD:** Endpoint exists

---

## FIN-E01-S02-T02: Verify Webhook Signature
Validate Stripe signature

**Prerequisites:** FIN-E01-S02-T01
**DoD:** Invalid rejected

---

## FIN-E01-S02-T03: Handle payment_intent.succeeded
Create order at S01 PAID

**Prerequisites:** FIN-E01-S02-T02, DB-E03-S01-T01
**DoD:** Order created

---

## FIN-E01-S02-T04: Handle payment_intent.failed
Log failure, notify user

**Prerequisites:** FIN-E01-S02-T02
**DoD:** Failure handled

---

## FIN-E01-S02-T05: Handle Track B Specifics
Create order_items for all attendees

**Prerequisites:** FIN-E01-S02-T03
**DoD:** Items created

---

# MODULE: VOICE - Voice Integration

## VOICE-E01-S01-T01: Create Vapi Account
Set up Vapi.ai dashboard

**Prerequisites:** None
**DoD:** Account active

---

## VOICE-E01-S01-T02: Configure Assistant
Create Scan Director persona

**Prerequisites:** VOICE-E01-S01-T01
**DoD:** Assistant created

---

## VOICE-E01-S01-T03: Write System Prompt
Define personality and goals

**Prerequisites:** VOICE-E01-S01-T02
**DoD:** Prompt written

---

## VOICE-E01-S01-T04: Select LLM
GPT-4o for intelligence

**Prerequisites:** VOICE-E01-S01-T02
**DoD:** LLM configured

---

## VOICE-E01-S01-T05: Select TTS
ElevenLabs for natural voice

**Prerequisites:** VOICE-E01-S01-T02
**DoD:** TTS configured

---

## VOICE-E01-S02-T01: Create Telemetry Endpoint
GET /api/scan/status

**Prerequisites:** VIS-E02-S02-T04
**DoD:** Endpoint returns status

---

## VOICE-E01-S02-T02: Expose ArUco Status
aruco_visible: boolean

**Prerequisites:** VOICE-E01-S02-T01, VIS-E01-S02-T04
**DoD:** Status included

---

## VOICE-E01-S02-T03: Expose Rotation Speed
rotation_speed: number

**Prerequisites:** VOICE-E01-S02-T01, VIS-E02-S02-T04
**DoD:** Speed included

---

## VOICE-E01-S02-T04: Expose Frame Quality
user_in_frame: boolean

**Prerequisites:** VOICE-E01-S02-T01, VIS-E02-S01-T01
**DoD:** Quality included

---

## VOICE-E01-S03-T01: Define Function Tools
Vapi function definitions

**Prerequisites:** VOICE-E01-S01-T05, VOICE-E01-S02-T04
**DoD:** Functions defined

---

## VOICE-E01-S03-T02: Implement Calibration Dialogue
Guide user to hold paper

**Prerequisites:** VOICE-E01-S03-T01
**DoD:** Dialogue works

---

## VOICE-E01-S03-T03: Implement Speed Warning
Interrupt if too fast

**Prerequisites:** VOICE-E01-S03-T01
**DoD:** Warning triggers

---

## VOICE-E01-S03-T04: Implement Completion
Announce scan complete

**Prerequisites:** VOICE-E01-S03-T01
**DoD:** Completion announced

---

## VOICE-E01-S04-T01: Install Vapi SDK
@vapi-ai/web package

**Prerequisites:** FE-E03-S03-T05
**DoD:** SDK installed

---

## VOICE-E01-S04-T02: Build Voice Toggle
Button to start/stop voice

**Prerequisites:** VOICE-E01-S04-T01
**DoD:** Toggle works

---

## VOICE-E01-S04-T03: Handle Function Calls
React to AI-triggered events

**Prerequisites:** VOICE-E01-S04-T01
**DoD:** Events handled

---

## VOICE-E01-S04-T04: Auto-Advance UI
Move to next step on command

**Prerequisites:** VOICE-E01-S04-T03
**DoD:** UI advances

---

# MODULE: TEST - Testing

## TEST-E01-S01-T01: Configure Jest
Set up Jest for Next.js

**Prerequisites:** FE-E01-S01-T01
**DoD:** Jest runs

---

## TEST-E01-S01-T02: Test Zustand Store
Test all slices and actions

**Prerequisites:** FE-E01-S03-T03
**DoD:** Store tests pass

---

## TEST-E01-S01-T03: Test UI Components
Test with React Testing Library

**Prerequisites:** FE-E01-S02-T03
**DoD:** Component tests pass

---

## TEST-E01-S01-T04: Test Hooks
Test custom hooks

**Prerequisites:** FE-E01-S03-T03
**DoD:** Hook tests pass

---

## TEST-E01-S01-T05: Test Utilities
Test helper functions

**Prerequisites:** FE-E01-S01-T04
**DoD:** Utility tests pass

---

## TEST-E01-S02-T01: Test Session API
Test all session endpoints

**Prerequisites:** API-E01-S01-T04
**DoD:** Tests pass

---

## TEST-E01-S02-T02: Test Config API
Test CRUD operations

**Prerequisites:** API-E02-S01-T05
**DoD:** Tests pass

---

## TEST-E01-S02-T03: Test Wedding API
Test event and invite flows

**Prerequisites:** API-E02-S02-T06
**DoD:** Tests pass

---

## TEST-E01-S02-T04: Test Order API
Test state transitions

**Prerequisites:** API-E03-S01-T05
**DoD:** Tests pass

---

## TEST-E01-S02-T05: Test Webhook
Test payment handling

**Prerequisites:** FIN-E01-S02-T05
**DoD:** Tests pass

---

## TEST-E02-S01-T01: Configure Playwright
Set up E2E testing

**Prerequisites:** FE-E01-S01-T01
**DoD:** Playwright runs

---

## TEST-E02-S01-T02: Test Track A Journey
Anonymous to checkout

**Prerequisites:** FE-E04-S02-T06
**DoD:** Test passes

---

## TEST-E02-S01-T03: Test Track B Organizer
Create event to invite

**Prerequisites:** FE-E05-S01-T06
**DoD:** Test passes

---

## TEST-E02-S01-T04: Test Track B Attendee
Invite to confirm

**Prerequisites:** FE-E05-S03-T06
**DoD:** Test passes

---

## TEST-E02-S01-T05: Test Admin Flow
Queue to state transition

**Prerequisites:** ADMIN-E01-S04-T04
**DoD:** Test passes

---

## TEST-E02-S01-T06: Test Mobile Runner
Task to ruler test

**Prerequisites:** RUNNER-E02-S01-T06
**DoD:** Test passes

---

*End of Ralphy-Compatible Task List*
