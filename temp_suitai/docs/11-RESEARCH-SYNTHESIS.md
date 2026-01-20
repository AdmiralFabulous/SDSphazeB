# SUIT AI v4b - Research Document Synthesis

## Documents Analyzed

1. **3D Tailored Suit Mannequin System** - Complete architecture for kinetic digital twin
2. **SUIT AI v4.b Development Truth Document** - MVP architecture with manual bridge
3. **RTX 5090 PyTorch CameraScanner** - GPU integration for body reconstruction
4. **Garment Modeling and Rendering Research** - Three.js fabric rendering pipeline
5. **Optitex DXF Import Guide** - AAMA/ASTM layer standards
6. **Body Scanner Integration with SAM3** - Vision pipeline with Meta's SAM 3
7. **Video-Based 3D Body Reconstruction** - SMPL-X aggregation and ArUco calibration

---

## Core Technical Architecture

### 1. Body Morphology Engine (SMPL-X)

**Technology:** SMPL-X (Skinned Multi-Person Linear - Expressive)
- 6,890 vertex mesh
- 54 joints including face/hands
- Three parameter sets:
  - **Pose (θ):** Joint rotations
  - **Shape (β):** 10-300 PCA coefficients for body variation
  - **Expression (ψ):** Facial deformation

**Why SMPL-X over traditional rigging:**
Traditional bone scaling fails to capture non-linear human morphology. Weight changes affect belly curvature, thigh circumference, and shoulder slope correlatively—SMPL-X preserves anatomical plausibility.

### 2. Measurements-to-Betas (A2B) Algorithm

**Problem:** Users think in centimeters; system operates in abstract PCA space.

**Solution:** Iterative optimization
1. Initialize SMPL-X with neutral β = 0
2. Define virtual landmarks (vertex indices for chest, waist, etc.)
3. Minimize objective function:
   ```
   E(β) = Σ w_i(M_target - M_virtual(β))² + λ||β||²
   ```
4. Use SLSQP/L-BFGS-B optimizer
5. Converges in <3 seconds

### 3. Video-to-Mesh Pipeline

**Stage 1: HMR 2.0 Inference**
- Vision Transformer backbone (ViT-Huge)
- Per-frame SMPL parameter prediction
- ~12 FPS processing rate

**Stage 2: ArUco Calibration**
- A4 paper with ArUco markers (210mm × 297mm reference)
- PnP solver determines camera-to-marker distance
- Global scale factor converts pixels to centimeters

**Stage 3: SHAPY Refinement**
- Height/weight correlation
- Metric measurement prediction
- Replaces standard SMPL head with SMPL-X

**Stage 4: Measurement Extraction**
- Landmark vertex identification
- Geodesic path computation for circumferences
- Plane intersection for cross-sections

### 4. Animation Retargeting (Mixamo → SMPL-X)

**Problem:** Mixamo uses 22-bone humanoid; SMPL-X uses 54-joint proprietary hierarchy.

**Solution:** Runtime quaternion retargeting
1. Pre-computed bone name mapping dictionary
2. Calculate delta quaternion: Q_offset = inverse(Q_smplx_rest) × Q_mixamo_rest
3. Frame update: Q_target(t) = Q_offset × Q_source(t)

**Key insight:** Shape parameters affect bone lengths, not rotations—animations work regardless of body size.

### 5. Physics Simulation (Ammo.js)

**Challenge:** Full cloth simulation (50K+ vertices) prohibitive in browser.

**Solution:** Kinematic compound colliders
- Capsules for limbs
- Spheres for joints
- Box for chest
- Colliders scale with β parameters
- Cloth modeled as soft body with anchor points

**Tiered approach:**
- Tier A (Desktop): Full soft body physics
- Tier B (Mobile): Kinematic collision only
- Tier C (Low-end): Static pre-computed meshes

### 6. Fabric Rendering (Three.js)

**MeshPhysicalMaterial properties:**
- **Sheen:** 0.5-1.0 for wool (back-scattering simulation)
- **Anisotropy:** Directional highlights for silk/twill
- **Dual Normal Maps:**
  - Macro: Seams, wrinkles
  - Micro: Tiling fabric weave (50-100x)

**Performance optimization:**
- KTX2/Basis Universal compression (4x reduction)
- Demand frameloop (render only on interaction)
- Lazy loading with explicit disposal

### 7. Pattern Generation Pipeline

**Stage 1: UV Unwrapping (Blender)**
- ABF++ algorithm (preserves area better than LSCM)
- Seam definition creates pattern pieces
- UV islands converted to flat 3D mesh

**Stage 2: Seamly2D Automation**
- Measurement injection into .smis XML files
- Headless CLI execution
- DXF export with AAMA/ASTM layer compliance

**DXF Layer Standards:**
| Layer | Content |
|-------|---------|
| 1 | External cut lines |
| 4 | Internal cut lines |
| 7 | Grain lines |
| 8 | Notches |
| 11 | Drill holes |

**Critical:** 10cm × 10cm calibration square required in output.

---

## Business Architecture

### Dual-Jurisdiction Structure

**UK Entity (SUIT AI UK):**
- Customer-facing sales
- Stripe payments
- UK Corporation Tax + VAT liability

**India Entity (ATQ Logistics Limited):**
- Manufacturing coordination
- Local vendor payments
- Zero-rated exporter (GST LUT filing)

### "Wizard of Oz" Protocol

MVP presents automated AI experience; backend relies on manual orchestration:

1. **Operator Console:** Manually inputs measurements into Optitex
2. **Runner App:** Validates print quality with ruler test
3. **Manufacturing:** "Sacrificial cut" through paper + fabric simultaneously

### Order State Machine (S01-S19)

Critical states:
- S01: PAID (Stripe webhook trigger)
- S03: MEASUREMENTS_CONFIRMED
- S05: PATTERN_GENERATED (operator upload)
- S07: PRINT_COLLECTED (ruler test passed)
- S08: PRINT_REJECTED (calibration failed)
- S12: QC_PASS (triggers Raja payment)

---

## Infrastructure Requirements

### GPU Requirements (RTX 5090)
- NVIDIA Driver: 570.86.16+
- CUDA Toolkit: 12.8
- PyTorch: Nightly cu128 build
- Compute Capability: 12.0 (sm_120)

### Key Dependencies
| Component | Technology |
|-----------|-----------|
| Body Model | SMPL-X |
| Mesh Reconstruction | HMR 2.0 + SHAPY |
| Vision Segmentation | SAM 3 (optional) |
| Frontend 3D | React Three Fiber |
| Physics | Ammo.js (Bullet WASM) |
| State Management | Zustand |
| Pattern Engine | Seamly2D |
| Database | Supabase |
| Payments | Stripe |

### Docker/WSL2 Strategy
Linux vision backend in Docker container with WSL2 GPU passthrough, maintaining Windows host for UI development.

---

## 28 Body Measurements

1. Height
2. Chest circumference
3. Waist circumference
4. Hip circumference
5. Neck circumference
6. Shoulder width
7. Arm length (shoulder to wrist)
8. Bicep circumference
9. Wrist circumference
10. Back width
11. Front chest width
12. Torso length (neck to waist)
13. Inseam length
14. Outseam length
15. Thigh circumference
16. Knee circumference
17. Calf circumference
18. Ankle circumference
19. Neck to shoulder
20. Shoulder drop
21. Armhole depth
22. Jacket length (back)
23. Sleeve length (jacket)
24. Half back
25. Across back
26. Waist to hip
27. Rise (front)
28. Rise (back)

---

## Voice Interface (Vapi.ai)

**State Machine:**
1. **Calibration:** ArUco marker positioning feedback
2. **Scan:** Rotation speed monitoring
3. **Verification:** Measurement confidence check

**Components:**
- Voice Activity Detection + STT
- LLM processing with custom system prompt
- TTS synthesis (ElevenLabs/Cartesia)
- WebRTC audio transport

---

## Risk Mitigations

1. **Non-converging measurements:** Validity warning, not distorted mesh
2. **Calibration failures:** Ruler test (10cm ± 0.1cm) blocks defective prints
3. **Non-manifold geometry:** Pre-export validation, fallback to Data Transfer modifier
4. **Memory leaks:** Explicit geometry/texture disposal on asset switch
5. **Mobile performance:** Tiered rendering based on GPU capability detection

---

## Future Roadmap (v5+)

**"Neuro-Stitch" Pipeline:**
- LLM-generated parametric pattern scripts (Qwen 2.5-Coder)
- Python libraries (ezdxf, Patro) replace manual Optitex
- Physics-aware ease calculations via Finite Element Analysis
- Full automation replacing manual operator bridge
