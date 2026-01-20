# SUIT AI v4.b - Technical Architecture
## System Design & Technology Stack

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Web Application   │  │   Operator Dashboard │  │   Runner Mobile     │ │
│  │   (React + R3F)     │  │   (React Admin)      │  │   (React PWA)       │ │
│  │   - 3D Configurator │  │   - Order Queue      │  │   - Task List       │ │
│  │   - Body Scanner    │  │   - Measurement View │  │   - Ruler Test      │ │
│  │   - Checkout        │  │   - State Controls   │  │   - Photo Upload    │ │
│  └─────────┬───────────┘  └─────────┬───────────┘  └─────────┬───────────┘ │
└────────────┼─────────────────────────┼─────────────────────────┼────────────┘
             │                         │                         │
             ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    API Gateway (Next.js + FastAPI)                       ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │ Auth Service │ │ Session API  │ │ Order API    │ │ Wedding API  │   ││
│  │  │ (Supabase)   │ │ (Anonymous)  │ │ (State Mgmt) │ │ (Track B)    │   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │ Measurement  │ │ Config API   │ │ Fabric API   │ │ Webhook API  │   ││
│  │  │ API          │ │              │ │              │ │ (Stripe)     │   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
             │                         │                         │
             ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Vision Service    │  │   Voice Service     │  │   Pattern Service   │ │
│  │   (GPU Container)   │  │   (Vapi.ai)         │  │   (Future: Seamly)  │ │
│  │   ─────────────────│  │   ─────────────────│  │   ─────────────────│ │
│  │   • SAM 3           │  │   • Scan Director   │  │   • JBlockCreator   │ │
│  │   • SAM-Body4D      │  │   • State FSM       │  │   • Deepnest        │ │
│  │   • HMR 2.0         │  │   • Function Calls  │  │   • ezdxf           │ │
│  │   • SHAPY           │  │   • WebRTC          │  │   • DXF-AAMA        │ │
│  │   • SMPL-X          │  │                     │  │                     │ │
│  │   • ArUco Calibrate │  │                     │  │                     │ │
│  │   • Kalman Filter   │  │                     │  │                     │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
             │                         │                         │
             ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      Supabase (PostgreSQL)                               ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           ││
│  │  │   users    │ │  sessions  │ │measurements│ │  fabrics   │           ││
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘           ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           ││
│  │  │suit_configs│ │wedding_    │ │wedding_    │ │wedding_    │           ││
│  │  │            │ │events      │ │templates   │ │attendees   │           ││
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘           ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           ││
│  │  │   orders   │ │order_items │ │order_state │ │pattern_    │           ││
│  │  │            │ │            │ │_history    │ │files       │           ││
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      File Storage (Supabase/S3)                          ││
│  │  • GLTF/GLB meshes  • Fabric textures  • Pattern PDFs  • QC photos      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MANUFACTURING LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Optitex PDS       │  │   Print Shop        │  │   Raja Exclusive    │ │
│  │   (Manual MVP)      │  │   (Amritsar)        │  │   (Tailors)         │ │
│  │   ─────────────────│  │   ─────────────────│  │   ─────────────────│ │
│  │   • Pattern Design  │  │   • A0 Plotter      │  │   • Sacrificial Cut │ │
│  │   • 10cm Calibration│  │   • Ruler Test      │  │   • Assembly        │ │
│  │   • DXF Export      │  │   • Delivery        │  │   • S19 QC          │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 14.x | React framework with SSR |
| 3D Engine | React Three Fiber | 8.x | Three.js React bindings |
| State | Zustand | 4.x | Transient state management |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Forms | React Hook Form | 7.x | Form management |
| Validation | Zod | 3.x | Schema validation |
| Testing | Jest + Playwright | - | Unit + E2E tests |

### 2.2 Backend Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| API | Next.js API Routes | 14.x | REST endpoints |
| Database | Supabase (PostgreSQL) | 2.x | Data persistence |
| Auth | Supabase Auth | 2.x | Authentication |
| Storage | Supabase Storage | 2.x | File storage |
| Payments | Stripe | - | Payment processing |
| Email | Resend | - | Transactional email |

### 2.3 Vision Stack (GPU Container)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Docker | - | Containerization |
| Base Image | nvidia/cuda | 12.8-devel-ubuntu22.04 | CUDA support |
| Framework | PyTorch Nightly | cu128 | Deep learning |
| Body Model | SMPL-X | - | Parametric body |
| Pose | HMR 2.0 | - | Pose estimation |
| Shape | SHAPY | - | Shape regression |
| Segmentation | SAM 3 | - | Instance segmentation |
| Reconstruction | SAM-Body4D | - | 4D mesh recovery |
| Calibration | OpenCV ArUco | 4.x | Metric calibration |
| Anthropometry | SMPL-Anthropometry | - | Landmark extraction |

### 2.4 Infrastructure Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| GPU Hardware | NVIDIA RTX 5090 | Blackwell architecture |
| Driver | 570.86.16+ | Blackwell support |
| CUDA | 12.8 | sm_120 compute |
| Host OS | Windows 11 + WSL2 | Hybrid environment |
| Container OS | Ubuntu 22.04 LTS | Linux native |
| CI/CD | GitHub Actions | Automation |
| Monitoring | Sentry | Error tracking |

---

## 3. Data Flow: Pixel-to-Pattern Pipeline

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER CAPTURE PHASE                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   Webcam    │───▶│  Browser    │───▶│  WebSocket  │                  │
│  │   Video     │    │  Capture    │    │  Stream     │                  │
│  │   (30fps)   │    │  (Canvas)   │    │  (Frames)   │                  │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                  │
│                                               │                          │
│  User holds A4 paper with ArUco marker        │                          │
│  User rotates 360° slowly (~15°/sec)          │                          │
│                                               ▼                          │
└──────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         VISION PROCESSING PHASE                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   SAM 3     │───▶│ SAM-Body4D  │───▶│  MHR Mesh   │                  │
│  │ Segmentation│    │ Reconstruct │    │  (73K verts)│                  │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                  │
│                                               │                          │
│  ┌─────────────┐    ┌─────────────┐           │                          │
│  │   ArUco     │───▶│   Scale     │───────────┤                          │
│  │  Detection  │    │   Factor    │           │                          │
│  └─────────────┘    └─────────────┘           │                          │
│                                               ▼                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ MHR→SMPL-X  │───▶│   Kalman    │───▶│  Stable     │                  │
│  │  Retarget   │    │   Filter    │    │  SMPL-X     │                  │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                  │
│                                               │                          │
│  Formula: Mesh_scaled = SMPL-X(θ_hmr, β_shapy) × scale_factor            │
│                                               │                          │
│                                               ▼                          │
└──────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       MEASUREMENT EXTRACTION PHASE                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │  A-Pose     │───▶│   SMPL-     │───▶│  28 Metrics │                  │
│  │ Normalize   │    │ Anthropo-   │    │  Extracted  │                  │
│  │             │    │ metry       │    │             │                  │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                  │
│                                               │                          │
│  70+ landmarks extracted using:               │                          │
│  • Geodesic pathfinding (lengths)             │                          │
│  • Planar slicing (circumferences)            │                          │
│                                               │                          │
│  Output: {                                    │                          │
│    "chest_girth": 102.5,                      │                          │
│    "waist_girth": 88.0,                       │                          │
│    "sleeve_length": 64.0,                     │                          │
│    ... (28 total)                             │                          │
│  }                                            │                          │
│                                               ▼                          │
└──────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         PATTERN GENERATION PHASE                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    MVP: Manual Bridge                            │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │    │
│  │  │  Operator   │───▶│   Optitex   │───▶│  DXF + PDF  │         │    │
│  │  │  Dashboard  │    │    PDS      │    │  with 10cm  │         │    │
│  │  │             │    │  (Manual)   │    │  calibration│         │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │    │
│  │                                                                  │    │
│  │  Neuro-Stitch Ease Vectors Applied:                             │    │
│  │  • Slim Fit: +20mm chest, +15mm waist                           │    │
│  │  • Regular Fit: +45mm chest, +30mm waist                        │    │
│  │  • Classic Fit: +70mm chest, +50mm waist                        │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    FUTURE: Automated Pipeline                    │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │    │
│  │  │ JBlockCreator│───▶│  Deepnest   │───▶│   ezdxf    │         │    │
│  │  │  (Java API) │    │  (Nesting)  │    │ (DXF-AAMA) │         │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                               │                          │
│                                               ▼                          │
└──────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         MANUFACTURING PHASE                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ Print Shop  │───▶│   Runner    │───▶│    Raja     │                  │
│  │  (A0 Plot)  │    │ Ruler Test  │    │  Exclusive  │                  │
│  │             │    │ (10cm ±0.1) │    │             │                  │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                  │
│                                               │                          │
│  "Sacrificial Cut" Protocol:                  │                          │
│  Paper pattern pinned to fabric,              │                          │
│  both cut simultaneously                      │                          │
│                                               │                          │
│  S19 QC: Physical measurement vs              │                          │
│  AI landmarks (±5mm tolerance)                ▼                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        DELIVERED SUIT                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Vision Pipeline Deep Dive

### 4.1 Frame Processing Sequence

```python
# Pseudocode for vision pipeline
def process_frame(frame, calibration_state):
    # 1. Person Segmentation
    mask = sam3.segment(frame, prompt="person")
    
    # 2. ArUco Detection (if calibration not locked)
    if not calibration_state.locked:
        corners = cv2.aruco.detectMarkers(frame, DICT_4X4_50)
        if corners:
            scale = calculate_scale(corners, known_size=210)  # A4 width
            calibration_state.update(scale)
    
    # 3. Mesh Reconstruction
    mhr_mesh = sam_body4d.reconstruct(frame, mask)
    
    # 4. Retargeting to SMPL-X
    theta = hmr2.predict_pose(frame)
    beta = shapy.predict_shape(frame)
    smplx_mesh = retarget_mhr_to_smplx(mhr_mesh, theta, beta)
    
    # 5. Temporal Filtering
    beta_filtered = kalman_filter.update(beta)
    theta_filtered = one_euro_filter.update(theta)
    
    # 6. Apply Scale
    mesh_scaled = smplx_mesh * calibration_state.scale
    
    return mesh_scaled, beta_filtered
```

### 4.2 Measurement Extraction Algorithm

```python
def extract_measurements(smplx_mesh, beta):
    # Normalize to A-pose
    mesh_apose = set_pose_to_apose(smplx_mesh)
    
    # Load landmark definitions
    landmarks = load_smpl_anthropometry_landmarks()
    
    measurements = {}
    
    # Circumference measurements (planar slicing)
    measurements['chest_girth'] = plane_slice_circumference(
        mesh_apose, 
        plane_origin=landmarks['chest_center'],
        plane_normal=[0, 1, 0]
    )
    
    # Length measurements (geodesic paths)
    measurements['sleeve_length'] = geodesic_distance(
        mesh_apose,
        start=landmarks['shoulder_point'],
        end=landmarks['wrist_point']
    )
    
    # ... repeat for all 28 measurements
    
    return measurements
```

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │───▶│  Supabase   │───▶│  Database   │
│             │    │    Auth     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
      │                  │
      │  Magic Link      │  JWT Token
      │  OAuth           │  Refresh Token
      ▼                  ▼
┌─────────────────────────────────────────────────┐
│              Session Management                  │
├─────────────────────────────────────────────────┤
│  • Anonymous sessions: UUID in localStorage     │
│  • Authenticated: JWT in httpOnly cookie        │
│  • Session claiming on login                    │
└─────────────────────────────────────────────────┘
```

### 5.2 Row Level Security (RLS)

```sql
-- Users can only access their own data
CREATE POLICY "Users access own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Sessions accessible by owner or linked user
CREATE POLICY "Session access" ON sessions
  FOR ALL USING (
    id = current_setting('app.session_id')::uuid 
    OR user_id = auth.uid()
  );

-- Organizers manage their events
CREATE POLICY "Organizer event access" ON wedding_events
  FOR ALL USING (organizer_id = auth.uid());
```

---

## 6. Scalability Considerations

### 6.1 GPU Compute Scaling

| Load Level | Strategy |
|------------|----------|
| MVP (50 orders) | Single RTX 5090 |
| Growth (500 orders) | Multiple GPU instances |
| Scale (5000+ orders) | Cloud GPU autoscaling |

### 6.2 Database Scaling

| Load Level | Strategy |
|------------|----------|
| MVP | Supabase Free/Pro tier |
| Growth | Supabase Enterprise |
| Scale | Dedicated PostgreSQL cluster |

### 6.3 CDN Strategy

```
Static Assets → Vercel Edge
Fabric Textures → Supabase CDN
3D Models → gzip compressed GLTF
Pattern PDFs → Signed URLs (24hr expiry)
```

---

*End of Architecture Document*
