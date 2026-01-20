# SUIT AI v4b - Complete Kanban Tasks & Roadmap

## Executive Summary

This document consolidates knowledge from 14 research documents into a structured fullstack development plan with epics, user stories, unit tests, and integration tests for the SUIT AI bespoke tailoring platform.

---

# EPIC 1: Infrastructure & DevOps Foundation

## Overview
Establish the core development environment, CI/CD pipelines, and cloud infrastructure.

### Story 1.1: Development Environment Setup
**As a** developer  
**I want** a reproducible development environment  
**So that** all team members can work consistently

**Acceptance Criteria:**
- [ ] Docker Compose configuration for local development
- [ ] WSL2 setup guide for Windows developers (GPU passthrough)
- [ ] NVIDIA Driver 570.86.16+ installation verified
- [ ] CUDA 12.8 Toolkit installed and validated
- [ ] PyTorch Nightly (cu128) installed with sm_120 support

**Unit Tests:**
```python
def test_cuda_availability():
    assert torch.cuda.is_available()
    
def test_compute_capability():
    assert torch.cuda.get_device_capability()[0] >= 12
    
def test_arch_list_includes_sm120():
    assert 'sm_120' in str(torch.cuda.get_arch_list()) or \
           'sm_90' in str(torch.cuda.get_arch_list())
```

### Story 1.2: CI/CD Pipeline Configuration
**As a** developer  
**I want** automated testing and deployment  
**So that** code quality is maintained

**Acceptance Criteria:**
- [ ] GitHub Actions workflow for PR validation
- [ ] Automated unit test execution
- [ ] Integration test suite on merge to main
- [ ] Docker image build and push to registry
- [ ] Deployment to staging environment

**Integration Tests:**
```yaml
# .github/workflows/ci.yml
test_pipeline:
  - Build Docker images
  - Run unit tests in container
  - Run integration tests
  - Generate coverage report
  - Deploy to staging (on main branch)
```

### Story 1.3: Database Infrastructure (Supabase)
**As a** developer  
**I want** a configured Supabase project  
**So that** I can persist application data

**Acceptance Criteria:**
- [ ] Supabase project created
- [ ] Database schema migrations configured
- [ ] Row Level Security policies defined
- [ ] API keys secured in environment variables
- [ ] Connection pooling configured

---

# EPIC 2: Body Scanning & Measurement Pipeline

## Overview
Implement video-based 3D body reconstruction using HMR 2.0, SMPL-X, and ArUco calibration.

### Story 2.1: Video Capture Interface
**As a** customer  
**I want** to record a 360° video of myself  
**So that** my body measurements can be extracted

**Acceptance Criteria:**
- [ ] WebRTC camera access with permission handling
- [ ] On-screen rotation guidance animation
- [ ] ArUco marker detection overlay
- [ ] Recording duration indicator (target: 8-12 seconds)
- [ ] Video upload to processing queue

**Unit Tests:**
```typescript
describe('VideoCapture', () => {
  it('should request camera permissions', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    expect(stream).toBeDefined();
  });
  
  it('should detect ArUco markers in frame', () => {
    const frame = loadTestFrame('aruco_visible.png');
    const markers = detectArUcoMarkers(frame);
    expect(markers.length).toBeGreaterThan(0);
  });
  
  it('should validate rotation coverage', () => {
    const frames = loadTestVideo('full_rotation.mp4');
    const coverage = calculateRotationCoverage(frames);
    expect(coverage).toBeGreaterThanOrEqual(330); // degrees
  });
});
```

### Story 2.2: HMR 2.0 Mesh Reconstruction
**As a** system  
**I want** to reconstruct a 3D body mesh from video  
**So that** measurements can be extracted

**Acceptance Criteria:**
- [ ] HMR 2.0 model loaded with ViTDet backbone
- [ ] Per-frame SMPL parameter prediction
- [ ] Temporal smoothing across frames
- [ ] GPU-accelerated inference (<1 second per frame)
- [ ] SMPL-X mesh output with 6,890 vertices

**Unit Tests:**
```python
def test_hmr2_inference():
    model = load_hmr2_model()
    frame = load_test_image('person_standing.jpg')
    result = model(frame)
    assert 'smpl_params' in result
    assert result['smpl_params']['betas'].shape == (10,)
    assert result['smpl_params']['body_pose'].shape == (69,)
    
def test_temporal_consistency():
    frames = load_video_frames('rotation_video.mp4')
    meshes = [hmr2_inference(f) for f in frames]
    vertex_variance = compute_temporal_variance(meshes)
    assert vertex_variance < CONSISTENCY_THRESHOLD
```

### Story 2.3: ArUco Calibration System
**As a** system  
**I want** to calibrate pixel-to-metric conversion  
**So that** measurements are accurate in centimeters

**Acceptance Criteria:**
- [ ] ArUco dictionary (4x4_50) marker detection
- [ ] PnP solver for camera-to-marker distance
- [ ] A4 paper reference (210mm × 297mm) scaling
- [ ] Global scale factor applied to mesh
- [ ] Calibration confidence score output

**Unit Tests:**
```python
def test_aruco_detection():
    image = load_test_image('a4_marker.jpg')
    corners, ids = detect_aruco(image)
    assert len(corners) >= 4  # All 4 corners detected
    
def test_scale_factor_accuracy():
    image = load_calibration_image()
    scale = compute_scale_factor(image)
    # A4 width = 210mm, expect scale within 2%
    expected_scale = 210 / measured_pixel_width
    assert abs(scale - expected_scale) / expected_scale < 0.02
```

### Story 2.4: Measurement Extraction Engine
**As a** system  
**I want** to extract 28 body measurements from SMPL-X mesh  
**So that** patterns can be generated

**Acceptance Criteria:**
- [ ] Landmark vertex identification on mesh
- [ ] Geodesic path computation for circumferences
- [ ] Plane intersection for cross-sections
- [ ] 28 measurement extraction (see Measurements Schema)
- [ ] Measurement validation against anatomical constraints

**28 Required Measurements:**
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

**Unit Tests:**
```python
def test_chest_circumference_extraction():
    mesh = load_test_mesh('average_male.obj')
    chest = extract_chest_circumference(mesh)
    # Average male chest ~100cm
    assert 85 < chest < 130
    
def test_measurement_symmetry():
    mesh = load_test_mesh('symmetric_body.obj')
    left_arm = extract_arm_length(mesh, 'left')
    right_arm = extract_arm_length(mesh, 'right')
    assert abs(left_arm - right_arm) < 1.0  # Within 1cm
```

### Story 2.5: SHAPY Refinement Integration
**As a** system  
**I want** to refine SMPL predictions with SHAPY  
**So that** measurements are more accurate

**Acceptance Criteria:**
- [ ] SHAPY model integration
- [ ] Height/weight correlation refinement
- [ ] Metric measurement prediction head
- [ ] SMPL to SMPL-X shape transfer
- [ ] Confidence interval output per measurement

**Integration Test:**
```python
def test_shapy_pipeline_integration():
    video = load_test_video('full_body_rotation.mp4')
    
    # Stage 1: HMR 2.0
    smpl_params = hmr2_inference(video)
    
    # Stage 2: SHAPY refinement
    refined_params = shapy_refine(smpl_params)
    
    # Stage 3: Measurement extraction
    measurements = extract_measurements(refined_params)
    
    # Validate against ground truth (tape measure)
    ground_truth = load_ground_truth('test_subject_001.json')
    for key in measurements:
        error = abs(measurements[key] - ground_truth[key])
        assert error < 2.0, f"{key} error {error}cm exceeds 2cm threshold"
```

---

# EPIC 3: 3D Configurator & Visualization

## Overview
Build the interactive Three.js-based suit configurator with React Three Fiber.

### Story 3.1: Scene Setup & Camera Controls
**As a** customer  
**I want** to orbit around a 3D mannequin  
**So that** I can view the suit from all angles

**Acceptance Criteria:**
- [ ] React Three Fiber canvas initialization
- [ ] OrbitControls with touch support
- [ ] Double-tap to focus on body region
- [ ] Two-finger pan for camera translation
- [ ] Pinch-to-zoom functionality

**Unit Tests:**
```typescript
describe('CameraControls', () => {
  it('should initialize with default position', () => {
    const { camera } = renderScene();
    expect(camera.position.z).toBeCloseTo(5);
  });
  
  it('should respond to orbit gestures', async () => {
    const { controls } = renderScene();
    await simulateOrbitGesture({ deltaX: 100, deltaY: 0 });
    expect(controls.getAzimuthalAngle()).not.toBe(0);
  });
});
```

### Story 3.2: SMPL-X Body Morphing
**As a** customer  
**I want** to see a mannequin matching my body shape  
**So that** I can visualize how the suit will fit

**Acceptance Criteria:**
- [ ] SMPL-X mesh loading from GLTF
- [ ] Beta parameter application for shape morphing
- [ ] Real-time shape updates (<16ms)
- [ ] Draco compression for bandwidth optimization
- [ ] Gender-neutral model option

**Unit Tests:**
```typescript
describe('BodyMorphing', () => {
  it('should apply beta parameters to mesh', () => {
    const mesh = loadSMPLX();
    const originalVertices = mesh.geometry.attributes.position.clone();
    
    applyBetaParameters(mesh, { height: 1.8, chest: 100 });
    
    expect(mesh.geometry.attributes.position).not.toEqual(originalVertices);
  });
  
  it('should converge A2B optimization in <3 seconds', async () => {
    const start = performance.now();
    const betas = await measurementsToBetas({
      chest: 100,
      waist: 85,
      hips: 95
    });
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(3000);
    expect(betas).toHaveLength(10);
  });
});
```

### Story 3.3: Fabric Material System
**As a** customer  
**I want** to see realistic fabric rendering  
**So that** I can evaluate material choices

**Acceptance Criteria:**
- [ ] MeshPhysicalMaterial with sheen (0.5-1.0 for wool)
- [ ] Anisotropic reflections for silk/twill
- [ ] Dual normal maps (macro wrinkles + micro weave)
- [ ] KTX2/Basis Universal texture compression
- [ ] Lazy loading with disposal on switch

**Unit Tests:**
```typescript
describe('FabricMaterial', () => {
  it('should create material with sheen for wool', () => {
    const material = createFabricMaterial('wool_navy');
    expect(material.sheen).toBeGreaterThanOrEqual(0.5);
    expect(material.sheenRoughness).toBeGreaterThan(0.3);
  });
  
  it('should apply anisotropy for silk', () => {
    const material = createFabricMaterial('silk_burgundy');
    expect(material.anisotropy).toBeGreaterThan(0);
  });
  
  it('should dispose textures on material switch', () => {
    const material1 = createFabricMaterial('fabric_a');
    const disposeSpy = jest.spyOn(material1.map, 'dispose');
    
    switchFabric('fabric_b');
    
    expect(disposeSpy).toHaveBeenCalled();
  });
});
```

### Story 3.4: Animation Retargeting (Mixamo → SMPL-X)
**As a** customer  
**I want** to see the mannequin in different poses  
**So that** I can evaluate fit during movement

**Acceptance Criteria:**
- [ ] Mixamo animation loading (GLTF)
- [ ] Bone name mapping dictionary
- [ ] Delta quaternion calculation for rest pose differences
- [ ] Runtime retargeting without baking
- [ ] Shape-agnostic animation (works with any body shape)

**Unit Tests:**
```typescript
describe('AnimationRetargeting', () => {
  it('should map Mixamo bones to SMPL-X', () => {
    const mapping = getBoneMapping();
    expect(mapping['mixamorig:Hips']).toBe('pelvis');
    expect(mapping['mixamorig:Spine']).toBe('spine1');
  });
  
  it('should preserve animation after body morph', () => {
    const mannequin = createMannequin();
    const animation = loadMixamoAnimation('walking');
    
    applyAnimation(mannequin, animation);
    const pose1 = mannequin.getBoneRotation('pelvis');
    
    morphBody(mannequin, { height: 1.9 });
    const pose2 = mannequin.getBoneRotation('pelvis');
    
    expect(pose1.equals(pose2)).toBe(true);
  });
});
```

### Story 3.5: Physics Simulation (Ammo.js)
**As a** customer  
**I want** to see realistic cloth draping  
**So that** I can evaluate fit and movement

**Acceptance Criteria:**
- [ ] Ammo.js WASM integration
- [ ] Kinematic compound collider (capsules + spheres)
- [ ] Soft body suit mesh with anchor points
- [ ] Collision shape scaling with body morph
- [ ] Tiered physics (full/kinematic/static by device)

**Unit Tests:**
```typescript
describe('PhysicsSimulation', () => {
  it('should scale colliders with body morph', () => {
    const physics = initPhysics();
    const originalRadius = physics.getCollider('chest').radius;
    
    morphBody({ chest: 110 }); // Larger chest
    
    expect(physics.getCollider('chest').radius).toBeGreaterThan(originalRadius);
  });
  
  it('should detect cloth-body collision', () => {
    const physics = initPhysics();
    const cloth = createSoftBody();
    
    simulateFrames(60);
    
    const penetrations = physics.getPenetrationCount();
    expect(penetrations).toBe(0);
  });
});
```

### Story 3.6: Suit Configuration UI
**As a** customer  
**I want** to customize suit options  
**So that** I can design my perfect suit

**Acceptance Criteria:**
- [ ] Fabric selector with inventory status
- [ ] Lapel style selector (Notch, Peak, Shawl)
- [ ] Button configuration (1x1, 2x1, 6x2)
- [ ] Vent options (Single, Double, None)
- [ ] Regional dialect presets (Neapolitan, British, Italian)
- [ ] Lining material and pattern selector
- [ ] Real-time 3D preview updates

**Unit Tests:**
```typescript
describe('SuitConfiguration', () => {
  it('should update mesh on lapel change', () => {
    const configurator = renderConfigurator();
    const initialMesh = configurator.getMeshId('lapel');
    
    configurator.setLapelStyle('peak');
    
    expect(configurator.getMeshId('lapel')).not.toBe(initialMesh);
  });
  
  it('should apply regional dialect preset', () => {
    const config = new SuitConfig();
    config.applyDialect('neapolitan');
    
    expect(config.shoulderStyle).toBe('soft');
    expect(config.waistSuppression).toBe('high');
  });
});
```

### Story 3.7: Exploded View & Lining Flash
**As a** customer  
**I want** to see internal construction details  
**So that** I can appreciate the craftsmanship

**Acceptance Criteria:**
- [ ] Exploded view separating mesh layers
- [ ] Canvas, interlining, lining visibility
- [ ] Lining flash animation (rotate + reveal)
- [ ] Smooth camera interpolation
- [ ] Reset to default view

**Integration Test:**
```typescript
describe('ExplodedView', () => {
  it('should animate layer separation', async () => {
    const scene = renderScene();
    
    await scene.triggerExplodedView();
    
    const layers = scene.getLayerPositions();
    expect(layers.fabric.z).toBeGreaterThan(layers.canvas.z);
    expect(layers.canvas.z).toBeGreaterThan(layers.lining.z);
  });
});
```

---

# EPIC 4: Pattern Generation & Manufacturing Bridge

## Overview
Implement automated pattern generation from measurements and DXF export for manufacturing.

### Story 4.1: Measurements-to-Betas (A2B) Optimization
**As a** system  
**I want** to convert measurements to SMPL-X beta parameters  
**So that** the body mesh matches user measurements

**Acceptance Criteria:**
- [ ] Objective function: E(β) = Σ w_i(M_target - M_virtual(β))² + λ||β||²
- [ ] SLSQP or L-BFGS-B optimizer from scipy
- [ ] Convergence in <3 seconds
- [ ] Validity warning for non-converging inputs
- [ ] Measurement prioritization weights (collar, waist highest)

**Unit Tests:**
```python
def test_a2b_convergence():
    target = {
        'chest': 100,
        'waist': 85,
        'hips': 95,
        'height': 180
    }
    
    betas, converged = a2b_optimize(target)
    
    assert converged
    assert len(betas) == 10
    
def test_a2b_measurement_accuracy():
    target = {'chest': 100, 'waist': 85}
    betas, _ = a2b_optimize(target)
    
    mesh = generate_smplx_mesh(betas)
    actual_chest = extract_chest_circumference(mesh)
    
    assert abs(actual_chest - 100) < 1.0  # Within 1cm
```

### Story 4.2: Seamly2D XML Generation
**As a** system  
**I want** to generate Seamly2D measurement files  
**So that** patterns can be created

**Acceptance Criteria:**
- [ ] XML generation with .smis schema (not legacy .vit)
- [ ] Root element: `<smis>`
- [ ] Personal metadata section
- [ ] Body measurements with correct variable names
- [ ] Custom ease variables (@ease_chest, @ease_waist)

**Unit Tests:**
```python
def test_smis_generation():
    measurements = load_test_measurements()
    xml = generate_smis(measurements)
    
    root = ET.fromstring(xml)
    assert root.tag == 'smis'
    
    chest = root.find(".//m[@name='chest_circ']")
    assert chest is not None
    assert float(chest.get('value')) == measurements['chest']
    
def test_ease_injection():
    xml = generate_smis(measurements, fit_style='slim')
    root = ET.fromstring(xml)
    
    ease = root.find(".//m[@name='@ease_chest']")
    assert float(ease.get('value')) == 4.0  # Slim fit = 4cm ease
```

### Story 4.3: Seamly2D CLI Integration
**As a** system  
**I want** to generate patterns via headless Seamly2D  
**So that** DXF files are created for manufacturing

**Acceptance Criteria:**
- [ ] Seamly2D v0.3.4+ installation
- [ ] Headless CLI invocation
- [ ] Template loading with measurement injection
- [ ] DXF export with correct layer mapping
- [ ] PDF export for visualization

**Command Template:**
```bash
seamly2d --no-gui \
  --mfile measurements.smis \
  --export-format dxf \
  --destination output/ \
  pattern_template.sm2d
```

**Integration Test:**
```python
def test_seamly2d_export():
    measurements = load_test_measurements()
    smis_file = generate_smis_file(measurements)
    
    result = subprocess.run([
        'seamly2d', '--no-gui',
        '--mfile', smis_file,
        '--export-format', 'dxf',
        '--destination', 'output/',
        'jacket_template.sm2d'
    ], capture_output=True)
    
    assert result.returncode == 0
    assert os.path.exists('output/jacket_template.dxf')
```

### Story 4.4: DXF Layer Mapping (AAMA/ASTM)
**As a** system  
**I want** to export DXF with correct layer conventions  
**So that** manufacturers can process files correctly

**Acceptance Criteria:**
- [ ] AAMA 292 / ASTM D6685 compliance
- [ ] Layer 1: External cut lines
- [ ] Layer 4: Internal cut lines
- [ ] Layer 7: Grain lines
- [ ] Layer 8: Notches
- [ ] Layer 11: Drill holes
- [ ] 10cm × 10cm calibration square

**Unit Tests:**
```python
def test_dxf_layer_compliance():
    dxf = load_dxf('output/jacket.dxf')
    
    assert 'CUT_LINE' in dxf.layers
    assert 'GRAIN_LINE' in dxf.layers
    assert 'NOTCH' in dxf.layers
    
def test_calibration_square():
    dxf = load_dxf('output/jacket.dxf')
    cal_square = find_calibration_square(dxf)
    
    assert cal_square is not None
    assert abs(cal_square.width - 100) < 0.1  # 10cm = 100mm
    assert abs(cal_square.height - 100) < 0.1
```

### Story 4.5: Blender UV Unwrap Pipeline
**As a** system  
**I want** to unwrap 3D garment mesh to 2D patterns  
**So that** manufacturing patterns are generated

**Acceptance Criteria:**
- [ ] ABF++ (Angle Based Flattening) algorithm
- [ ] Seam definition on garment mesh
- [ ] UV island generation per pattern piece
- [ ] Seam allowance addition (1.5cm default)
- [ ] Notch generation for alignment

**Unit Tests:**
```python
def test_uv_unwrap():
    mesh = load_garment_mesh('jacket.blend')
    uv_islands = unwrap_mesh(mesh, method='ABF++')
    
    assert len(uv_islands) >= 10  # Jacket has many pieces
    
    for island in uv_islands:
        overlap = check_overlap(island)
        assert overlap == 0, f"UV island has overlapping faces"
        
def test_seam_allowance():
    pattern = load_pattern_piece('front_panel')
    with_allowance = add_seam_allowance(pattern, 15)  # 15mm
    
    original_area = pattern.area
    new_area = with_allowance.area
    
    assert new_area > original_area
```

---

# EPIC 5: Backend API & Database

## Overview
Build the Supabase-backed API with order management and state machine.

### Story 5.1: User Authentication Flow
**As a** customer  
**I want** to create an account or continue anonymously  
**So that** I can complete my purchase

**Acceptance Criteria:**
- [ ] Anonymous session creation (UUID in localStorage)
- [ ] Session claiming on checkout (link to user record)
- [ ] Email/password authentication
- [ ] OAuth providers (Google, Apple)
- [ ] Password reset flow

**Unit Tests:**
```typescript
describe('Authentication', () => {
  it('should create anonymous session', async () => {
    const session = await createAnonymousSession();
    expect(session.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(session.user_id).toBeNull();
  });
  
  it('should claim session on signup', async () => {
    const session = await createAnonymousSession();
    const user = await signup('test@example.com', 'password');
    
    await claimSession(session.id, user.id);
    
    const claimed = await getSession(session.id);
    expect(claimed.user_id).toBe(user.id);
  });
});
```

### Story 5.2: Measurement Storage API
**As a** system  
**I want** to store and retrieve measurements  
**So that** they persist across sessions

**Acceptance Criteria:**
- [ ] POST /api/measurements - Store measurement data
- [ ] GET /api/measurements/:id - Retrieve measurements
- [ ] PATCH /api/measurements/:id - Update with user overrides
- [ ] Measurement validation (anatomical constraints)
- [ ] Link to session or user

**API Schema:**
```typescript
interface Measurement {
  id: string;
  session_id: string;
  user_id?: string;
  data: {
    chest: number;
    waist: number;
    // ... 28 measurements
  };
  user_overrides: Record<string, number>;
  created_at: string;
  updated_at: string;
}
```

### Story 5.3: Suit Configuration API
**As a** customer  
**I want** to save my suit configuration  
**So that** I can complete purchase later

**Acceptance Criteria:**
- [ ] POST /api/configs - Create configuration
- [ ] GET /api/configs/:id - Retrieve configuration
- [ ] PATCH /api/configs/:id - Update configuration
- [ ] Fabric inventory validation
- [ ] Price calculation endpoint

**Unit Tests:**
```typescript
describe('SuitConfig API', () => {
  it('should create configuration', async () => {
    const config = await createConfig({
      fabric_id: 'navy_wool_001',
      lapel: 'peak',
      buttons: '2x1',
      vents: 'double'
    });
    
    expect(config.id).toBeDefined();
    expect(config.price).toBeGreaterThan(0);
  });
  
  it('should reject out-of-stock fabric', async () => {
    await expect(createConfig({
      fabric_id: 'out_of_stock_fabric'
    })).rejects.toThrow('Fabric not available');
  });
});
```

### Story 5.4: Order State Machine (S01-S19)
**As a** system  
**I want** to track order state transitions  
**So that** fulfillment is coordinated

**State Definitions:**
| State | Name | Trigger |
|-------|------|---------|
| S01 | PAID | Stripe webhook: payment_intent.succeeded |
| S02 | PENDING_MEASUREMENTS | Awaiting Track B attendee scan |
| S03 | MEASUREMENTS_CONFIRMED | User clicks "Confirm" |
| S04 | QUEUED_FOR_PATTERN | In operator queue |
| S05 | PATTERN_GENERATED | Operator uploads PDF |
| S06 | SENT_TO_PRINTER | Email sent to Amritsar |
| S07 | PRINT_COLLECTED | Runner passes ruler test |
| S08 | PRINT_REJECTED | Calibration failed |
| S09 | DELIVERED_TO_RAJA | At manufacturing |
| S10 | CUTTING | Sacrificial cut in progress |
| S11 | SEWING | Assembly in progress |
| S12 | QC_PASS | Quality control passed |
| S13 | QC_FAIL | Quality control failed |
| S14 | SHIPPED | In transit |
| S15 | DELIVERED | Customer received |
| S16 | ALTERATION_REQUESTED | Customer requests changes |
| S17 | ALTERATION_COMPLETE | Changes made |
| S18 | COMPLETE | Order fulfilled |
| S19 | REFUNDED | Order refunded |

**Unit Tests:**
```typescript
describe('OrderStateMachine', () => {
  it('should transition S01 → S03 on measurement confirm', () => {
    const order = createOrder({ state: 'S01' });
    const next = order.transition('CONFIRM_MEASUREMENTS');
    expect(next.state).toBe('S03');
  });
  
  it('should reject invalid transitions', () => {
    const order = createOrder({ state: 'S01' });
    expect(() => order.transition('SHIP')).toThrow('Invalid transition');
  });
  
  it('should trigger webhook on state change', async () => {
    const webhookSpy = jest.spyOn(webhooks, 'send');
    const order = createOrder({ state: 'S05' });
    
    await order.transition('SEND_TO_PRINTER');
    
    expect(webhookSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'order.state_changed' })
    );
  });
});
```

### Story 5.5: Wedding Party (Track B) API
**As an** organizer  
**I want** to manage wedding party orders  
**So that** all attendees get matching suits

**Acceptance Criteria:**
- [ ] POST /api/weddings - Create wedding event
- [ ] POST /api/weddings/:id/templates - Create role templates
- [ ] POST /api/weddings/:id/attendees - Add attendees
- [ ] GET /api/invite/:token - Attendee invite validation
- [ ] Template locking after organizer design
- [ ] Batch payment processing

**Integration Test:**
```typescript
describe('Wedding Party Flow', () => {
  it('should complete Track B order flow', async () => {
    // Organizer creates wedding
    const wedding = await createWedding({
      event_date: '2026-06-15',
      organizer_id: 'user_123'
    });
    
    // Create template for groomsmen
    const template = await createTemplate({
      wedding_id: wedding.id,
      role: 'groomsman',
      config: groomsmanConfig
    });
    
    // Add attendees
    const attendee = await addAttendee({
      wedding_id: wedding.id,
      template_id: template.id,
      email: 'groomsman@example.com'
    });
    
    // Batch payment
    await processPayment({
      wedding_id: wedding.id,
      items: [attendee.id]
    });
    
    // Attendee completes measurement
    await submitMeasurements({
      invite_token: attendee.invite_token,
      measurements: testMeasurements
    });
    
    const order = await getOrder(attendee.order_id);
    expect(order.state).toBe('S03');
  });
});
```

### Story 5.6: Stripe Payment Integration
**As a** customer  
**I want** to pay securely  
**So that** my order is processed

**Acceptance Criteria:**
- [ ] Stripe Elements integration
- [ ] Payment Intent creation
- [ ] Webhook handling (payment_intent.succeeded)
- [ ] Refund processing
- [ ] Invoice generation

**Unit Tests:**
```typescript
describe('Stripe Integration', () => {
  it('should create payment intent', async () => {
    const intent = await createPaymentIntent({
      amount: 150000, // £1,500
      currency: 'gbp',
      metadata: { order_id: 'order_123' }
    });
    
    expect(intent.client_secret).toBeDefined();
    expect(intent.amount).toBe(150000);
  });
  
  it('should handle webhook signature validation', () => {
    const payload = '{"type": "payment_intent.succeeded"}';
    const signature = generateSignature(payload);
    
    expect(() => validateWebhook(payload, signature)).not.toThrow();
  });
});
```

---

# EPIC 6: Admin Dashboard & Operations

## Overview
Build internal tools for operators, runners, and quality control.

### Story 6.1: Operator Console
**As an** operator  
**I want** to view orders awaiting pattern generation  
**So that** I can process them in Optitex

**Acceptance Criteria:**
- [ ] Order queue sorted by date
- [ ] Measurement display for manual entry
- [ ] Pattern file upload interface
- [ ] "Email Sent" confirmation button
- [ ] Order state update triggers

### Story 6.2: Runner Mobile App
**As a** runner  
**I want** to validate print quality  
**So that** defective prints are rejected

**Acceptance Criteria:**
- [ ] Mobile-responsive web interface
- [ ] "Ruler Test" measurement input
- [ ] Pass/fail threshold (10.0cm ± 0.1cm)
- [ ] Photo upload for fabric tagging
- [ ] Delivery confirmation

**Unit Tests:**
```typescript
describe('RulerTest', () => {
  it('should pass valid measurement', () => {
    expect(validateCalibration(10.0)).toBe(true);
    expect(validateCalibration(9.95)).toBe(true);
    expect(validateCalibration(10.05)).toBe(true);
  });
  
  it('should fail invalid measurement', () => {
    expect(validateCalibration(9.8)).toBe(false);
    expect(validateCalibration(10.2)).toBe(false);
  });
});
```

### Story 6.3: Quality Control Interface
**As a** QC inspector  
**I want** to record inspection results  
**So that** defects are caught before shipping

**Acceptance Criteria:**
- [ ] Check measurement display
- [ ] Pass/fail toggle per measurement
- [ ] Defect photo upload
- [ ] Rework notes field
- [ ] State transition to S12 or S13

---

# EPIC 7: Voice Interface (Vapi.ai)

## Overview
Implement voice-guided body scanning experience.

### Story 7.1: Voice Agent Configuration
**As a** customer  
**I want** voice guidance during scanning  
**So that** I can scan without looking at the screen

**Acceptance Criteria:**
- [ ] Vapi.ai SDK integration
- [ ] WebRTC audio transport
- [ ] Custom system prompt for scanning
- [ ] State machine: Calibration → Scan → Verification
- [ ] Interrupt handling ("stop", "cancel")

### Story 7.2: Calibration Voice Prompts
**As a** customer  
**I want** to be told when marker is visible  
**So that** I can position correctly

**Acceptance Criteria:**
- [ ] "Please hold the marker at arm's length"
- [ ] "Marker detected, hold still"
- [ ] "Calibration complete, you may begin rotating"
- [ ] Corrective feedback for poor positioning

### Story 7.3: Scan Progress Feedback
**As a** customer  
**I want** to know my rotation progress  
**So that** I complete a full 360°

**Acceptance Criteria:**
- [ ] "You're doing great, continue rotating"
- [ ] "Slow down a bit"
- [ ] "You've completed X percent"
- [ ] "Scan complete, processing your measurements"

---

# EPIC 8: Testing Infrastructure

## Overview
Establish comprehensive testing at all levels.

### Story 8.1: Unit Test Framework
**As a** developer  
**I want** unit tests for all components  
**So that** regressions are caught early

**Acceptance Criteria:**
- [ ] Jest for TypeScript/React components
- [ ] pytest for Python backend
- [ ] >80% code coverage target
- [ ] Mocking for external services
- [ ] CI integration

### Story 8.2: Integration Test Suite
**As a** developer  
**I want** integration tests for critical flows  
**So that** system behavior is validated

**Critical Integration Tests:**
1. Video → Mesh → Measurements → Pattern export
2. Anonymous session → Checkout → Order creation
3. Wedding party creation → Invite → Measurement → Order
4. Payment → State machine → Manufacturing
5. Operator upload → Runner validation → QC

### Story 8.3: E2E Test Automation
**As a** developer  
**I want** end-to-end tests  
**So that** user journeys are validated

**Acceptance Criteria:**
- [ ] Playwright for browser automation
- [ ] Mobile viewport testing
- [ ] Visual regression testing
- [ ] Performance budgets
- [ ] Accessibility audits

### Story 8.4: Load Testing
**As a** developer  
**I want** to validate system under load  
**So that** it scales for launch

**Acceptance Criteria:**
- [ ] k6 load test scripts
- [ ] Concurrent user simulation
- [ ] GPU processing queue validation
- [ ] Database connection pooling
- [ ] CDN cache behavior

---

# Testing Matrix

## Unit Test Coverage Requirements

| Component | Min Coverage | Critical Paths |
|-----------|--------------|----------------|
| Measurement Extraction | 90% | All 28 measurements |
| A2B Optimizer | 85% | Convergence, validation |
| State Machine | 100% | All transitions |
| Payment Processing | 95% | All Stripe events |
| Authentication | 90% | Session claiming |
| Configurator | 80% | All option combinations |

## Integration Test Scenarios

| Scenario | Components | Frequency |
|----------|------------|-----------|
| Full Scan Pipeline | Video → HMR → Measurements | Every PR |
| Checkout Flow | Cart → Payment → Order | Every PR |
| Pattern Export | Measurements → Seamly2D → DXF | Daily |
| Wedding Party | Full Track B flow | Daily |
| State Transitions | All 19 states | Every PR |

## Merge Testing Protocol

Before merging to main:
1. All unit tests pass
2. Integration test suite passes
3. No decrease in coverage
4. Performance benchmarks met
5. Security scan clean
6. Accessibility audit passes

---

# Implementation Timeline

## Phase 1: Foundation (Weeks 1-4)
- Infrastructure setup (Docker, CI/CD)
- Database schema and migrations
- Authentication flow
- Basic API endpoints

## Phase 2: Scanning Pipeline (Weeks 5-8)
- Video capture UI
- HMR 2.0 integration
- ArUco calibration
- Measurement extraction
- SHAPY refinement

## Phase 3: Configurator (Weeks 9-12)
- Three.js scene setup
- SMPL-X morphing
- Fabric rendering
- Animation retargeting
- Physics simulation (tiered)

## Phase 4: Manufacturing Bridge (Weeks 13-16)
- A2B optimization
- Seamly2D integration
- DXF export
- Operator console
- Runner app

## Phase 5: Launch Prep (Weeks 17-20)
- Wedding party flow
- Voice interface
- Load testing
- Security audit
- Soft launch

---

# Appendix: Technical Dependencies

## Python Backend
- PyTorch Nightly (cu128)
- SMPL-X
- HMR 2.0 (4D-Humans)
- SHAPY
- Detectron2
- ezdxf
- scipy
- OpenCV (ArUco)

## TypeScript Frontend
- React 18+
- React Three Fiber
- Three.js
- Zustand
- Ammo.js (WASM)
- Vapi.ai SDK

## Infrastructure
- Supabase
- Stripe
- Docker
- GitHub Actions
- Vercel (frontend)
- GPU compute (Lambda Labs / RunPod)

## Manufacturing
- Seamly2D v0.3.4+
- Optitex PDS (manual operator)
- AAMA/ASTM DXF standards
