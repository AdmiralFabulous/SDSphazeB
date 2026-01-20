# SUIT AI v4.b

**Camera-Based Digital Tailoring Platform: "Pixel-to-Pattern"**

A full-stack application that enables anyone with a standard webcam to obtain sub-centimeter accurate body measurements and order a made-to-measure suit, combining advanced computer vision with traditional craftsmanship.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Vision Service](#vision-service)
- [Order State Machine](#order-state-machine)
- [API Reference](#api-reference)
- [Business Tracks](#business-tracks)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SUIT AI v4.b is a "Pixel-to-Pattern" platform that democratizes bespoke tailoring by:

1. **Capturing 3D body scans** using a standard webcam with ArUco marker calibration
2. **Extracting 28 precise body measurements** via computer vision (target: less than 1cm accuracy)
3. **Allowing customers to design custom suits** with fabric/style selection via an interactive 3D configurator
4. **Processing orders** through a manual-to-automated manufacturing pipeline

The MVP implements a "Manual Bridge" strategy - presenting a seamless AI-driven digital experience to customers while backend fulfillment relies on skilled human operators using Optitex PDS software and Raja Exclusive Tailors in Amritsar, India.

### Business Model

| Metric | Track A (Retail) | Track B (Wedding) |
|--------|------------------|-------------------|
| Gross Sale | £1,500 | £1,500 |
| Net Retained | £1,004.72 | £904.01 |

---

## Features

### Core Features (MVP)

- **Anonymous Session Management** - Design before login, claim session on checkout
- **3D Body Scanning** - SMPL-X based mesh reconstruction from webcam video
- **ArUco/Height Calibration** - Metric accuracy using A4 paper markers or height input
- **28-Measurement Extraction** - Full body measurements for manufacturing
- **3D Suit Configurator** - React Three Fiber powered visualization
- **Fabric Selection** - 5 premium fabric options with real-time preview
- **Style Customization** - Lapel, vents, buttons, pockets, lining options
- **Stripe Checkout** - Secure payment processing
- **Wedding Event Management** - Track B for organizing groomsmen suits
- **Invite System** - Token-based attendee onboarding for weddings
- **Admin Dashboard** - Operator queue management and order tracking
- **Runner Mobile App** - QA workflow for field logistics
- **19-State Order Machine** - Full production tracking from payment to delivery

### Planned Features (Post-MVP)

- Voice Scan Director (Vapi.ai integration)
- Exploded View Animation
- DiffCloth Physics Simulation
- AI Pattern Generation
- Multi-language Support

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUIT AI v4.b Architecture                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│   │   Customer   │    │   Operator   │    │    Runner    │          │
│   │   Web App    │    │  Dashboard   │    │   PWA App    │          │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│          │                   │                   │                   │
│          └───────────────────┼───────────────────┘                   │
│                              │                                       │
│                              ▼                                       │
│                    ┌──────────────────┐                              │
│                    │   Next.js API    │                              │
│                    │   (REST Routes)  │                              │
│                    └────────┬─────────┘                              │
│                             │                                        │
│          ┌──────────────────┼──────────────────┐                     │
│          │                  │                  │                     │
│          ▼                  ▼                  ▼                     │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│   │  Supabase   │   │   Stripe    │   │   Vision    │               │
│   │ (PostgreSQL)│   │  (Payments) │   │  Service    │               │
│   └─────────────┘   └─────────────┘   └──────┬──────┘               │
│                                              │                       │
│                                              ▼                       │
│                                    ┌──────────────────┐              │
│                                    │  GPU Container   │              │
│                                    │  (PyTorch/CUDA)  │              │
│                                    │                  │              │
│                                    │  SAM 3 + Body4D  │              │
│                                    │  HMR 2.0 + SHAPY │              │
│                                    │  SMPL-X Models   │              │
│                                    └──────────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.3 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| React Three Fiber | - | 3D visualization |
| Zustand | 4.x | State management |
| Tailwind CSS | 3.x | Styling |
| Zod | 4.3.5 | Schema validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | - | PostgreSQL database + Auth |
| Prisma | 5.22.0 | ORM for database access |
| Stripe | - | Payment processing |
| Resend | - | Transactional email |

### Vision Service (GPU)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| PyTorch | 2.0+ | Deep learning framework |
| CUDA | 12.8 | GPU acceleration |
| OpenCV | 4.5+ | Computer vision |
| SAM 3 | - | Instance segmentation |
| SMPL-X | - | Parametric body model |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| NVIDIA Container Toolkit | GPU passthrough |
| Vercel | Frontend deployment |
| GitHub Actions | CI/CD |

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Python** 3.10+ (for vision service)
- **Docker** with NVIDIA GPU support (for vision service)
- **Supabase** account (or local Supabase instance)
- **Stripe** account (test keys for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdmiralFabulous/SUIT-AI-v4b.git
   cd SUIT-AI-v4b/KANBAN-BUILD/PRODUCTION
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Vision Service dependencies** (optional, for body scanning)
   ```bash
   cd vision_service
   pip install -r requirements.txt
   cd ..
   ```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# =============================================================================
# REQUIRED - Core Configuration
# =============================================================================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (for Prisma)
DATABASE_URL=file:./dev.db

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# =============================================================================
# OPTIONAL - Enhanced Features
# =============================================================================

# Vision Service
VISION_SERVICE_URL=http://localhost:8000
VISION_SERVICE_API_KEY=vs_...

# Voice (Vapi.ai)
VAPI_API_KEY=vapi_...
VAPI_ASSISTANT_ID=asst_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=orders@suitai.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE=false
NEXT_PUBLIC_ENABLE_TRACK_B=true
NEXT_PUBLIC_ENVIRONMENT=development
```

See `docs/10-ENV-VARIABLES.md` for complete environment configuration.

### Database Setup

**Option 1: Using Prisma (SQLite for development)**
```bash
npx prisma migrate dev
npx prisma generate
```

**Option 2: Using Supabase (PostgreSQL for production)**
```bash
# Apply migrations
npx supabase db push

# Or run migration files manually
psql -f supabase/migrations/001_create_users_table.sql
psql -f supabase/migrations/20260119070000_create_fabrics_table.sql
```

### Running the Application

**Development mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Production build:**
```bash
npm run build
npm start
```

**Vision Service (requires NVIDIA GPU):**
```bash
cd vision_service
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Project Structure

```
PRODUCTION/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── sessions/      # Session management
│   │   │   ├── measurements/  # Body measurements
│   │   │   ├── orders/        # Order management
│   │   │   └── admin/         # Admin endpoints
│   │   ├── booking/           # Booking wizard pages
│   │   ├── admin/             # Admin dashboard
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── scanner/           # Body scanner UI
│   │   ├── configurator/      # 3D suit configurator
│   │   └── admin/             # Admin components
│   └── lib/                   # Shared utilities
│       ├── supabase.ts        # Supabase clients
│       ├── prisma.ts          # Prisma client
│       ├── pricing.ts         # Pricing calculations
│       └── orderStates.ts     # State machine logic
│
├── vision_service/            # Python ML/CV pipeline
│   ├── calibration/           # ArUco & height calibration
│   │   ├── aruco_detect.py    # Marker detection
│   │   ├── pnp_solver.py      # 3D positioning
│   │   └── mesh_height.py     # Height fallback
│   ├── segmentation/          # Person segmentation
│   │   └── sam_segment.py     # SAM 3 wrapper
│   ├── reconstruction/        # 3D mesh reconstruction
│   │   ├── body4d.py          # SAM-Body4D mesh
│   │   ├── hmr_pose.py        # HMR 2.0 pose
│   │   ├── shapy.py           # Shape parameters
│   │   └── mhr_bridge.py      # SMPL-X retargeting
│   ├── filtering/             # Temporal smoothing
│   │   ├── kalman_filter.py   # Kalman filter
│   │   └── one_euro_filter.py # 1-Euro filter
│   └── measurements/          # Measurement extraction
│       ├── landmarks.py       # SMPL-X landmarks
│       └── apose.py           # A-pose normalization
│
├── prisma/
│   └── schema.prisma          # Database schema
│
├── supabase/
│   └── migrations/            # PostgreSQL migrations
│
├── docs/                      # Documentation
│   ├── 01-PRD.md             # Product requirements
│   ├── 02-ARCHITECTURE.md    # System architecture
│   ├── 03-DATABASE-SCHEMA.md # Database design
│   ├── 04-ROADMAP.md         # Development roadmap
│   ├── 07-STATE-MACHINE.md   # Order states
│   ├── 08-MEASUREMENTS.md    # 28 measurement specs
│   └── 10-ENV-VARIABLES.md   # Environment config
│
├── __tests__/                 # Test files
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## Vision Service

The Vision Service is a GPU-accelerated Python pipeline that processes webcam video to extract body measurements.

### Pipeline Architecture

```
Webcam Video → Calibration → Segmentation → Reconstruction → Filtering → Measurements
     │              │              │              │              │            │
     │              ▼              ▼              ▼              ▼            ▼
     │         ArUco/Height    SAM 3         Body4D+HMR     Kalman+1€    28 Metrics
     │         Detection       Person        SMPL-X Mesh    Smoothing    Extraction
     │                         Mask
     └─────────────────────────────────────────────────────────────────────────────►
                                   30 FPS WebSocket Stream
```

### Models Used

| Model | Purpose | Output |
|-------|---------|--------|
| **SAM 3** | Instance segmentation | Person mask |
| **SAM-Body4D** | 4D mesh reconstruction | MHR mesh (73K vertices) |
| **HMR 2.0** | Pose estimation | Joint rotations |
| **SHAPY** | Shape regression | 10-dim beta vector |
| **SMPL-X** | Parametric body | Final mesh + landmarks |

### 28 Body Measurements

The system extracts these measurements (all in millimeters):

**Circumferences:** chest, waist, hip, neck, bicep, wrist, thigh, knee, calf, ankle

**Lengths:** sleeve, arm, back, front, jacket, inseam, outseam, trouser

**Widths:** shoulder, back, chest, armhole depth, seat depth

**Other:** crotch depth, shoulder slope (degrees), posture angle (degrees), height

### GPU Requirements

- NVIDIA GPU with CUDA 12.8 support
- Minimum 8GB VRAM (RTX 3070 or better)
- Recommended: RTX 4090 or RTX 5090 for real-time processing

---

## Order State Machine

Orders progress through 19 states from payment to delivery:

```
S01: PAID
 │
 ▼
S02: SCAN_RECEIVED
 │
 ▼
S03: MEASUREMENTS_CONFIRMED
 │
 ▼
S04: PENDING_PATTERN
 │
 ▼
S05: PATTERN_GENERATED
 │
 ▼
S06: SENT_TO_PRINTER ──────► S08: PRINT_REJECTED (Ruler test failed)
 │                                      │
 │                                      └──► Back to S06 (retry)
 ▼
S07: PRINT_COLLECTED
 │
 ▼
S09: DELIVERED_TO_RAJA
 │
 ▼
S10: CUTTING
 │
 ▼
S11: SEWING
 │
 ▼
S12: READY_FOR_QC ─────────► S14: QC_FAIL
 │                                  │
 │                                  └──► Back to S11 (rework)
 ▼
S13: QC_PASS
 │
 ▼
S15: COLLECTED_FROM_RAJA
 │
 ▼
S16: PACKAGED
 │
 ▼
S17: SHIPPED
 │
 ▼
S18: DELIVERED
 │
 ▼
S19: COMPLETE
```

See `docs/07-STATE-MACHINE.md` for detailed state transition rules.

---

## API Reference

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Create anonymous session |
| GET | `/api/sessions/[id]` | Get session details |
| POST | `/api/sessions/[id]/height` | Store calibration height |
| POST | `/api/sessions/[id]/claim` | Claim session on login |

### Measurements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/measurements` | Store extracted measurements |
| GET | `/api/measurements/[id]` | Get measurement details |
| PATCH | `/api/measurements/[id]` | Update with manual overrides |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/[id]` | Get order details |
| POST | `/api/orders/[id]/transition` | Transition order state |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | List orders with filters |
| GET | `/api/admin/orders/queue` | Get operator queue |
| POST | `/api/admin/pattern-files` | Upload pattern files |

---

## Business Tracks

### Track A: Retail Customers

Individual customers purchasing suits for themselves.

**Journey:**
1. Land on homepage (anonymous session created)
2. Configure suit (fabric, style, lining)
3. Complete body scan (30-second webcam capture)
4. Review measurements (edit if needed)
5. Checkout with Stripe
6. Track order through delivery

### Track B: Wedding/Events

Organizers managing suits for multiple attendees (groomsmen, etc.).

**Organizer Journey:**
1. Create wedding event (set date, min 4 weeks ahead)
2. Design templates per role (Groom, Best Man, Groomsman)
3. Invite attendees via email/link
4. Monitor completion progress
5. Batch payment when all scans complete

**Attendee Journey:**
1. Receive invite link
2. View locked template (cannot change style)
3. Complete body scan
4. Confirm measurements
5. Done (organizer handles payment)

---

## Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| `01-PRD.md` | Product requirements, personas, features |
| `02-ARCHITECTURE.md` | System design, data flows, security |
| `03-DATABASE-SCHEMA.md` | Complete SQL schema with RLS |
| `04-ROADMAP.md` | 5-phase development plan |
| `06-CICD-PROTOCOL.md` | Git branching and PR rules |
| `07-STATE-MACHINE.md` | 19-state order lifecycle |
| `08-MEASUREMENTS.md` | 28 measurement specifications |
| `09-FILE-STRUCTURE.md` | Project organization |
| `10-ENV-VARIABLES.md` | Environment configuration |

---

## Contributing

1. Check `COMPLETED-TASKS.md` to avoid re-implementing existing features
2. Follow the task ID format from `docs/05-KANBAN-TASKS.md`
3. Create feature branches from `main`
4. Submit PRs with clear descriptions
5. Ensure TypeScript compiles without errors

---

## License

Proprietary - All rights reserved.

---

## Support

For questions or issues:
- Review documentation in `docs/`
- Check `CLAUDE.md` for AI assistant context
- Open an issue on GitHub

---

*Built with precision for the modern tailor.*
