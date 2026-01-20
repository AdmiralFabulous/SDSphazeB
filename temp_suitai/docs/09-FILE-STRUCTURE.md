# SUIT AI v4.b - Project File Structure
## Repository Organization

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. Root Directory Structure

```
suit-ai/
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml              # Main CI pipeline
│   │   ├── vision.yml          # Vision service pipeline
│   │   └── deploy.yml          # Deployment workflow
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── apps/                       # Application packages
│   ├── web/                    # Next.js frontend
│   └── runner/                 # Runner PWA
│
├── packages/                   # Shared packages
│   ├── database/               # Supabase schema & migrations
│   ├── api-types/              # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configurations
│
├── services/                   # Backend services
│   └── vision/                 # GPU vision container
│
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── guides/                 # User guides
│   └── architecture/           # Architecture diagrams
│
├── scripts/                    # Utility scripts
│   ├── setup.sh                # Development setup
│   ├── seed.ts                 # Database seeding
│   └── deploy.sh               # Deployment helper
│
├── docker-compose.yml          # Local development stack
├── docker-compose.prod.yml     # Production stack
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace config
├── .env.example                # Environment template
├── .gitignore
├── .prettierrc
├── .eslintrc.js
└── README.md
```

---

## 2. Web Application (`apps/web/`)

```
apps/web/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts        # OAuth callback
│   │
│   ├── (configurator)/         # Main customer journey
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing/home
│   │   ├── configure/
│   │   │   └── page.tsx        # 3D configurator
│   │   └── scan/
│   │       └── page.tsx        # Body scanner
│   │
│   ├── (checkout)/             # Checkout flow
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── payment/
│   │   │   └── page.tsx
│   │   └── confirmation/
│   │       └── page.tsx
│   │
│   ├── (wedding)/              # Track B wedding routes
│   │   ├── events/
│   │   │   ├── page.tsx        # Event list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Create event
│   │   │   └── [eventId]/
│   │   │       ├── page.tsx    # Event dashboard
│   │   │       ├── templates/
│   │   │       │   └── page.tsx
│   │   │       └── attendees/
│   │   │           └── page.tsx
│   │   └── batch-payment/
│   │       └── page.tsx
│   │
│   ├── invite/                 # Attendee invite flow
│   │   └── [token]/
│   │       └── page.tsx
│   │
│   ├── admin/                  # Operator dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard home
│   │   ├── orders/
│   │   │   ├── page.tsx        # Order queue
│   │   │   └── [orderId]/
│   │   │       └── page.tsx    # Order detail
│   │   └── patterns/
│   │       └── page.tsx        # Pattern management
│   │
│   ├── account/                # User account
│   │   ├── page.tsx            # Account overview
│   │   ├── orders/
│   │   │   └── page.tsx        # Order history
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── api/                    # API routes
│   │   ├── sessions/
│   │   │   ├── route.ts        # POST /api/sessions
│   │   │   └── [id]/
│   │   │       ├── route.ts    # GET/PUT /api/sessions/:id
│   │   │       └── claim/
│   │   │           └── route.ts
│   │   ├── configs/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── measurements/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── optimize/
│   │   │           └── route.ts
│   │   ├── wedding-events/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── templates/
│   │   │       │   └── route.ts
│   │   │       └── attendees/
│   │   │           └── route.ts
│   │   ├── invites/
│   │   │   └── [token]/
│   │   │       ├── route.ts
│   │   │       └── confirm/
│   │   │           └── route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── state/
│   │   │           └── route.ts
│   │   ├── fabrics/
│   │   │   └── route.ts
│   │   ├── create-payment-intent/
│   │   │   └── route.ts
│   │   └── webhook/
│   │       └── stripe/
│   │           └── route.ts
│   │
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── error.tsx               # Error boundary
│
├── components/                 # React components
│   ├── 3d/                     # Three.js/R3F components
│   │   ├── Canvas.tsx          # Main R3F canvas
│   │   ├── SuitModel.tsx       # GLTF suit model
│   │   ├── Lighting.tsx        # Scene lighting
│   │   ├── Controls.tsx        # Camera controls
│   │   ├── FabricMaterial.tsx  # Dynamic materials
│   │   └── ExplodedView.tsx    # Layer animation
│   │
│   ├── configurator/           # Configurator UI
│   │   ├── FabricSelector.tsx
│   │   ├── StyleSelector.tsx
│   │   ├── LiningSelector.tsx
│   │   ├── ConfigPreview.tsx
│   │   └── AddToCartButton.tsx
│   │
│   ├── scanner/                # Body scanner UI
│   │   ├── CameraFeed.tsx
│   │   ├── CalibrationOverlay.tsx
│   │   ├── RotationProgress.tsx
│   │   ├── MeshOverlay.tsx
│   │   ├── MeasurementCards.tsx
│   │   ├── VirtualTapeMeasure.tsx
│   │   └── ConfirmButton.tsx
│   │
│   ├── checkout/               # Checkout components
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── AddressForm.tsx
│   │   └── OrderConfirmation.tsx
│   │
│   ├── wedding/                # Wedding/Track B components
│   │   ├── EventCard.tsx
│   │   ├── TemplateDesigner.tsx
│   │   ├── AttendeeList.tsx
│   │   ├── InviteLinkGenerator.tsx
│   │   ├── LockedConfigurator.tsx
│   │   └── ProgressTracker.tsx
│   │
│   ├── admin/                  # Admin components
│   │   ├── OrderQueue.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── MeasurementDisplay.tsx
│   │   ├── StateTransitionButtons.tsx
│   │   ├── PatternUpload.tsx
│   │   └── ExportButton.tsx
│   │
│   └── ui/                     # Base UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Loading.tsx
│       └── Toast.tsx
│
├── hooks/                      # Custom React hooks
│   ├── useSession.ts           # Session management
│   ├── useAuth.ts              # Authentication
│   ├── useCart.ts              # Cart operations
│   ├── useMeasurements.ts      # Measurement state
│   ├── useWebSocket.ts         # WebSocket connection
│   ├── useGPUTier.ts           # GPU detection
│   └── useVapi.ts              # Voice integration
│
├── store/                      # Zustand store
│   ├── index.ts                # Store creation
│   ├── slices/
│   │   ├── sessionSlice.ts
│   │   ├── cartSlice.ts
│   │   ├── configSlice.ts
│   │   ├── measurementSlice.ts
│   │   └── scannerSlice.ts
│   └── types.ts
│
├── lib/                        # Utilities
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── stripe.ts               # Stripe client
│   ├── api.ts                  # API helpers
│   ├── validation.ts           # Zod schemas
│   └── utils.ts                # General utilities
│
├── styles/                     # Additional styles
│   └── tailwind.css
│
├── public/                     # Static assets
│   ├── models/                 # 3D models
│   │   ├── suit-base.glb
│   │   ├── lapel-notch.glb
│   │   ├── lapel-peak.glb
│   │   └── lapel-shawl.glb
│   ├── textures/               # Fabric textures
│   │   ├── navy-001.jpg
│   │   ├── charcoal-001.jpg
│   │   └── black-001.jpg
│   ├── icons/
│   └── images/
│
├── tests/                      # Test files
│   ├── unit/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── components/
│   ├── integration/
│   └── e2e/
│       ├── track-a.spec.ts
│       ├── track-b-organizer.spec.ts
│       └── track-b-attendee.spec.ts
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── jest.config.js
├── playwright.config.ts
└── package.json
```

---

## 3. Runner PWA (`apps/runner/`)

```
apps/runner/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Task list
│   ├── login/
│   │   └── page.tsx
│   ├── tasks/
│   │   └── [taskId]/
│   │       └── page.tsx        # Task detail
│   ├── ruler-test/
│   │   └── [orderId]/
│   │       └── page.tsx
│   ├── fabric-reservation/
│   │   └── [orderId]/
│   │       └── page.tsx
│   └── delivery/
│       └── [orderId]/
│           └── page.tsx
│
├── components/
│   ├── TaskCard.tsx
│   ├── RulerTestInput.tsx
│   ├── PhotoCapture.tsx
│   ├── DeliveryChecklist.tsx
│   └── SignatureCapture.tsx
│
├── lib/
│   ├── api.ts
│   └── storage.ts              # Offline storage
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
│
├── next.config.js
└── package.json
```

---

## 4. Database Package (`packages/database/`)

```
packages/database/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_wedding_tables.sql
│   ├── 003_order_tables.sql
│   ├── 004_rls_policies.sql
│   └── 005_functions.sql
│
├── seed/
│   ├── fabrics.sql
│   └── test_data.sql
│
├── types/
│   └── database.types.ts       # Generated types
│
├── scripts/
│   ├── generate-types.ts
│   └── reset-db.ts
│
└── package.json
```

---

## 5. Vision Service (`services/vision/`)

```
services/vision/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
│
├── src/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py           # API endpoints
│   │   └── websocket.py        # WebSocket handler
│   │
│   ├── segmentation/
│   │   ├── __init__.py
│   │   ├── sam3.py             # SAM 3 wrapper
│   │   └── person_mask.py
│   │
│   ├── reconstruction/
│   │   ├── __init__.py
│   │   ├── sam_body4d.py       # SAM-Body4D wrapper
│   │   ├── hmr2.py             # HMR 2.0 pose
│   │   ├── shapy.py            # SHAPY shape
│   │   └── retarget.py         # MHR to SMPL-X
│   │
│   ├── calibration/
│   │   ├── __init__.py
│   │   ├── aruco.py            # ArUco detection
│   │   ├── height.py           # Height-based scaling
│   │   └── hybrid.py           # Combined calibration
│   │
│   ├── anthropometry/
│   │   ├── __init__.py
│   │   ├── landmarks.py        # SMPL-X landmarks
│   │   ├── measurements.py     # Extraction logic
│   │   ├── geodesic.py         # Geodesic paths
│   │   └── circumference.py    # Planar slicing
│   │
│   ├── filtering/
│   │   ├── __init__.py
│   │   ├── kalman.py           # Kalman filter
│   │   └── one_euro.py         # 1€ filter
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── smplx_model.py      # SMPL-X wrapper
│   │
│   └── utils/
│       ├── __init__.py
│       ├── mesh.py             # Mesh utilities
│       └── transforms.py
│
├── models/                     # Model weights (git-lfs)
│   ├── sam3/
│   ├── sam_body4d/
│   ├── hmr2/
│   ├── shapy/
│   └── smplx/
│
├── tests/
│   ├── __init__.py
│   ├── test_segmentation.py
│   ├── test_reconstruction.py
│   ├── test_calibration.py
│   ├── test_measurements.py
│   └── fixtures/
│       └── sample_images/
│
├── config/
│   ├── default.yaml
│   └── production.yaml
│
└── scripts/
    ├── download_models.sh
    └── benchmark.py
```

---

## 6. Shared Packages

### API Types (`packages/api-types/`)
```
packages/api-types/
├── src/
│   ├── index.ts
│   ├── session.ts
│   ├── measurement.ts
│   ├── config.ts
│   ├── order.ts
│   ├── wedding.ts
│   └── fabric.ts
├── tsconfig.json
└── package.json
```

### UI Components (`packages/ui/`)
```
packages/ui/
├── src/
│   ├── index.ts
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Select/
│   └── ...
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 7. Configuration Files

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
```

### Root `package.json`
```json
{
  "name": "suit-ai",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write .",
    "db:migrate": "pnpm --filter database migrate",
    "db:seed": "pnpm --filter database seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

---

*End of File Structure Document*
