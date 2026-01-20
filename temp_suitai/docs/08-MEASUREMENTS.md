# SUIT AI v4.b - 28 Measurement Fields Reference
## Body Measurement Specification

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. Complete Measurement List

All measurements are stored in **millimeters** for precision.

| # | Field Name | Type | Unit | Description | Typical Range (Male) |
|---|------------|------|------|-------------|---------------------|
| 1 | `chest_girth` | DECIMAL(5,1) | mm | Chest circumference at nipple line | 850-1200 |
| 2 | `waist_girth` | DECIMAL(5,1) | mm | Waist circumference at navel | 700-1100 |
| 3 | `hip_girth` | DECIMAL(5,1) | mm | Hip circumference at widest point | 850-1150 |
| 4 | `shoulder_width` | DECIMAL(5,1) | mm | Shoulder point to shoulder point (back) | 400-500 |
| 5 | `back_width` | DECIMAL(5,1) | mm | Across back at armhole level | 350-450 |
| 6 | `chest_width` | DECIMAL(5,1) | mm | Across chest at armhole level | 320-420 |
| 7 | `neck_girth` | DECIMAL(5,1) | mm | Neck circumference at base | 350-450 |
| 8 | `bicep_girth` | DECIMAL(5,1) | mm | Upper arm circumference at widest | 280-400 |
| 9 | `wrist_girth` | DECIMAL(5,1) | mm | Wrist circumference | 150-200 |
| 10 | `sleeve_length` | DECIMAL(5,1) | mm | Shoulder point to wrist bone | 580-700 |
| 11 | `arm_length` | DECIMAL(5,1) | mm | Shoulder point to elbow | 320-380 |
| 12 | `back_length` | DECIMAL(5,1) | mm | Nape of neck to natural waist | 400-480 |
| 13 | `front_length` | DECIMAL(5,1) | mm | High point shoulder (HPS) to waist | 420-500 |
| 14 | `jacket_length` | DECIMAL(5,1) | mm | Collar seam to jacket hem | 700-800 |
| 15 | `thigh_girth` | DECIMAL(5,1) | mm | Upper thigh circumference | 500-700 |
| 16 | `knee_girth` | DECIMAL(5,1) | mm | Knee circumference | 350-450 |
| 17 | `calf_girth` | DECIMAL(5,1) | mm | Calf circumference at widest | 320-420 |
| 18 | `ankle_girth` | DECIMAL(5,1) | mm | Ankle circumference above bone | 200-280 |
| 19 | `inseam` | DECIMAL(5,1) | mm | Crotch to floor (inner leg) | 750-900 |
| 20 | `outseam` | DECIMAL(5,1) | mm | Waist to floor (outer leg) | 1000-1150 |
| 21 | `crotch_depth` | DECIMAL(5,1) | mm | Waist to crotch (seated) | 250-320 |
| 22 | `rise` | DECIMAL(5,1) | mm | Crotch seam to waistband top | 250-300 |
| 23 | `trouser_length` | DECIMAL(5,1) | mm | Waist to trouser hem | 980-1100 |
| 24 | `shoulder_slope` | DECIMAL(4,2) | deg | Angle of shoulder from horizontal | 15-25 |
| 25 | `posture_angle` | DECIMAL(4,2) | deg | Forward lean angle | -5 to +10 |
| 26 | `arm_hole_depth` | DECIMAL(5,1) | mm | Vertical depth of armhole | 200-260 |
| 27 | `seat_depth` | DECIMAL(5,1) | mm | Depth of seat curve | 30-60 |
| 28 | `height` | DECIMAL(5,1) | mm | Total standing height | 1600-2000 |

---

## 2. Measurement Visualization

```
                    ┌─────┐
                    │  7  │  Neck Girth
                    └──┬──┘
         ┌────────────┼────────────┐
         │            │            │
    ┌────┤     4      │      4     ├────┐
    │    │  Shoulder  │  Shoulder  │    │
    │    │   Width    │   Width    │    │
    │    └────────────┴────────────┘    │
    │            ┌─────────┐            │
   10            │    6    │           10
Sleeve          │  Chest  │         Sleeve
Length          │  Width  │         Length
    │            ├─────────┤            │
   11           │    1    │           11
Arm             │  Chest  │           Arm
Length          │  Girth  │         Length
    │            ├─────────┤            │
    8            │    5    │            8
  Bicep          │  Back   │          Bicep
  Girth          │  Width  │          Girth
    │            ├─────────┤            │
    │            │   12    │            │
    │            │  Back   │            │
    │            │ Length  │            │
    9            ├─────────┤            9
  Wrist          │    2    │          Wrist
  Girth          │  Waist  │          Girth
                 │  Girth  │
                 ├─────────┤
                 │   21    │
                 │ Crotch  │
                 │  Depth  │
                 ├────┬────┤
                 │    │    │
        ┌────────┤ 3  │  3 ├────────┐
        │        │Hip │Hip │        │
        │        │Girth   │        │
       20        ├────┴────┤       20
     Outseam     │   15    │     Outseam
        │        │  Thigh  │        │
        │        │  Girth  │        │
       19        ├─────────┤       19
     Inseam      │   16    │     Inseam
        │        │  Knee   │        │
        │        │  Girth  │        │
        │        ├─────────┤        │
        │        │   17    │        │
        │        │  Calf   │        │
        │        │  Girth  │        │
        │        ├─────────┤        │
        │        │   18    │        │
        │        │ Ankle   │        │
        │        │ Girth   │        │
        └────────┴─────────┴────────┘
```

---

## 3. SMPL-X Landmark Mapping

Each measurement maps to specific vertices on the SMPL-X mesh:

```python
LANDMARKS = {
    # Circumferences (use planar slicing)
    'chest_girth': {
        'method': 'circumference',
        'plane_center': 3078,  # Chest center vertex
        'plane_normal': [0, 1, 0],  # Horizontal plane
        'height_offset': 0
    },
    'waist_girth': {
        'method': 'circumference',
        'plane_center': 3500,  # Navel vertex
        'plane_normal': [0, 1, 0],
        'height_offset': 0
    },
    'hip_girth': {
        'method': 'circumference',
        'plane_center': 3134,  # Hip center vertex
        'plane_normal': [0, 1, 0],
        'height_offset': 0
    },
    'neck_girth': {
        'method': 'circumference',
        'plane_center': 3068,  # Neck base vertex
        'plane_normal': [0, 1, 0],
        'height_offset': 0
    },
    
    # Linear measurements (use geodesic distance)
    'shoulder_width': {
        'method': 'geodesic',
        'start_vertex': 5273,  # Left shoulder point
        'end_vertex': 5274,    # Right shoulder point
        'path': 'back'
    },
    'sleeve_length': {
        'method': 'geodesic',
        'start_vertex': 5273,  # Shoulder point
        'end_vertex': 5361,    # Wrist point
        'path': 'arm_outer'
    },
    'inseam': {
        'method': 'geodesic',
        'start_vertex': 3149,  # Crotch point
        'end_vertex': 3327,    # Ankle point
        'path': 'leg_inner'
    },
    
    # Angles (use vertex normals)
    'shoulder_slope': {
        'method': 'angle',
        'vertex_a': 5273,  # Left shoulder
        'vertex_b': 5274,  # Right shoulder
        'reference': [1, 0, 0]  # Horizontal
    },
    'posture_angle': {
        'method': 'angle',
        'vertex_a': 3068,  # Neck base
        'vertex_b': 3500,  # Waist center
        'reference': [0, 1, 0]  # Vertical
    }
}
```

---

## 4. Neuro-Stitch Ease Vectors

Pattern generation adds "ease" (extra fabric) based on fit preference:

| Fit Style | Chest Ease | Waist Ease | Hip Ease | Shoulder Ease |
|-----------|------------|------------|----------|---------------|
| **Slim** | +20mm | +15mm | +15mm | +5mm |
| **Regular** | +45mm | +30mm | +30mm | +10mm |
| **Classic** | +70mm | +50mm | +45mm | +15mm |

### Application Formula
```python
def apply_ease(body_measurement: float, fit_style: str, measurement_name: str) -> float:
    ease_vectors = {
        'slim': {'chest_girth': 20, 'waist_girth': 15, 'hip_girth': 15},
        'regular': {'chest_girth': 45, 'waist_girth': 30, 'hip_girth': 30},
        'classic': {'chest_girth': 70, 'waist_girth': 50, 'hip_girth': 45}
    }
    
    ease = ease_vectors.get(fit_style, {}).get(measurement_name, 0)
    return body_measurement + ease
```

---

## 5. Measurement Extraction Algorithm

```python
import numpy as np
from smplx import SMPLX
import trimesh

def extract_all_measurements(mesh: trimesh.Trimesh, scale_factor: float) -> dict:
    """
    Extract 28 tailoring measurements from SMPL-X mesh.
    
    Args:
        mesh: SMPL-X mesh in A-pose
        scale_factor: Calibration scale (pixels to mm)
    
    Returns:
        Dictionary of 28 measurements in mm
    """
    measurements = {}
    
    # Apply scale
    scaled_vertices = mesh.vertices * scale_factor
    
    # Circumferences via planar slicing
    measurements['chest_girth'] = measure_circumference(
        scaled_vertices, mesh.faces,
        plane_origin=scaled_vertices[LANDMARKS['chest_girth']['plane_center']],
        plane_normal=np.array([0, 1, 0])
    )
    
    measurements['waist_girth'] = measure_circumference(
        scaled_vertices, mesh.faces,
        plane_origin=scaled_vertices[LANDMARKS['waist_girth']['plane_center']],
        plane_normal=np.array([0, 1, 0])
    )
    
    # ... repeat for all circumference measurements
    
    # Linear measurements via geodesic distance
    measurements['sleeve_length'] = geodesic_distance(
        mesh,
        start_idx=LANDMARKS['sleeve_length']['start_vertex'],
        end_idx=LANDMARKS['sleeve_length']['end_vertex']
    ) * scale_factor
    
    measurements['inseam'] = geodesic_distance(
        mesh,
        start_idx=LANDMARKS['inseam']['start_vertex'],
        end_idx=LANDMARKS['inseam']['end_vertex']
    ) * scale_factor
    
    # ... repeat for all linear measurements
    
    # Angles (no scaling needed)
    measurements['shoulder_slope'] = calculate_angle(
        scaled_vertices[LANDMARKS['shoulder_slope']['vertex_a']],
        scaled_vertices[LANDMARKS['shoulder_slope']['vertex_b']],
        reference=np.array([1, 0, 0])
    )
    
    return measurements


def measure_circumference(vertices, faces, plane_origin, plane_normal):
    """Calculate circumference by slicing mesh with plane."""
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
    slice_path = mesh.section(plane_origin=plane_origin, plane_normal=plane_normal)
    
    if slice_path is None:
        return None
    
    # Get the closed loop length
    return slice_path.length


def geodesic_distance(mesh, start_idx, end_idx):
    """Calculate shortest path on mesh surface using Dijkstra."""
    import networkx as nx
    
    # Build graph from mesh edges
    G = nx.Graph()
    for edge in mesh.edges:
        length = np.linalg.norm(mesh.vertices[edge[0]] - mesh.vertices[edge[1]])
        G.add_edge(edge[0], edge[1], weight=length)
    
    # Find shortest path
    path = nx.shortest_path(G, start_idx, end_idx, weight='weight')
    
    # Calculate total distance
    total = 0
    for i in range(len(path) - 1):
        total += G[path[i]][path[i+1]]['weight']
    
    return total
```

---

## 6. Validation Rules

### Range Validation
```python
VALID_RANGES = {
    'chest_girth': (700, 1500),
    'waist_girth': (500, 1400),
    'hip_girth': (700, 1400),
    'shoulder_width': (350, 600),
    'neck_girth': (300, 550),
    'height': (1400, 2200),
    # ... etc
}

def validate_measurement(name: str, value: float) -> tuple[bool, str]:
    if name not in VALID_RANGES:
        return True, ""
    
    min_val, max_val = VALID_RANGES[name]
    if value < min_val:
        return False, f"{name} too small: {value}mm (min: {min_val}mm)"
    if value > max_val:
        return False, f"{name} too large: {value}mm (max: {max_val}mm)"
    
    return True, ""
```

### Proportion Checks
```python
def validate_proportions(measurements: dict) -> list[str]:
    """Check that measurements are proportionally reasonable."""
    warnings = []
    
    # Waist should be smaller than chest
    if measurements['waist_girth'] >= measurements['chest_girth']:
        warnings.append("Waist larger than chest - please verify")
    
    # Hip should be close to chest
    ratio = measurements['hip_girth'] / measurements['chest_girth']
    if ratio < 0.85 or ratio > 1.15:
        warnings.append("Unusual chest-to-hip ratio - please verify")
    
    # Inseam + rise should approximate outseam
    calculated_outseam = measurements['inseam'] + measurements['rise']
    actual_outseam = measurements['outseam']
    if abs(calculated_outseam - actual_outseam) > 50:
        warnings.append("Leg measurements inconsistent - please verify")
    
    return warnings
```

---

## 7. User Override Handling

Users can manually adjust any measurement:

```typescript
interface MeasurementOverride {
  field: string;
  original_value: number;
  override_value: number;
  reason?: string;
  timestamp: Date;
}

// Store in JSONB
{
  "user_overrides": {
    "chest_girth": {
      "original": 1020,
      "override": 1040,
      "reason": "User knows their chest is larger",
      "timestamp": "2026-01-19T10:30:00Z"
    }
  }
}
```

### Inverse Anthropometry
When user overrides a measurement, re-optimize the SMPL-X shape:

```python
def optimize_for_override(mesh, target_measurements: dict, max_iters=100):
    """
    Adjust SMPL-X beta parameters to match user-specified measurements.
    """
    beta = torch.zeros(10, requires_grad=True)
    optimizer = torch.optim.Adam([beta], lr=0.01)
    
    for i in range(max_iters):
        # Generate mesh with current beta
        current_mesh = smplx_model(beta=beta)
        
        # Extract measurements
        current_measurements = extract_measurements(current_mesh)
        
        # Compute loss
        loss = 0
        for name, target in target_measurements.items():
            current = current_measurements[name]
            loss += (current - target) ** 2
        
        # Add regularization (prefer small beta values)
        loss += 0.001 * torch.sum(beta ** 2)
        
        # Optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        if loss < 0.1:  # Converged
            break
    
    return beta.detach()
```

---

## 8. Database Schema

```sql
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    
    -- 28 Measurement Fields
    chest_girth DECIMAL(5,1),
    waist_girth DECIMAL(5,1),
    hip_girth DECIMAL(5,1),
    shoulder_width DECIMAL(5,1),
    back_width DECIMAL(5,1),
    chest_width DECIMAL(5,1),
    neck_girth DECIMAL(5,1),
    bicep_girth DECIMAL(5,1),
    wrist_girth DECIMAL(5,1),
    sleeve_length DECIMAL(5,1),
    arm_length DECIMAL(5,1),
    back_length DECIMAL(5,1),
    front_length DECIMAL(5,1),
    jacket_length DECIMAL(5,1),
    thigh_girth DECIMAL(5,1),
    knee_girth DECIMAL(5,1),
    calf_girth DECIMAL(5,1),
    ankle_girth DECIMAL(5,1),
    inseam DECIMAL(5,1),
    outseam DECIMAL(5,1),
    crotch_depth DECIMAL(5,1),
    rise DECIMAL(5,1),
    trouser_length DECIMAL(5,1),
    shoulder_slope DECIMAL(4,2),
    posture_angle DECIMAL(4,2),
    arm_hole_depth DECIMAL(5,1),
    seat_depth DECIMAL(5,1),
    height DECIMAL(5,1),
    
    -- Metadata
    user_overrides JSONB DEFAULT '{}',
    smplx_beta JSONB,  -- 10-dim shape vector
    calibration_method VARCHAR(20),
    scale_factor DECIMAL(10,6),
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Optitex Export Format

For manual pattern generation, measurements are exported in Optitex-compatible format:

```csv
Measurement,Value (cm),Notes
Chest,102.0,Circumference at bust
Waist,88.0,Natural waist
Hip,98.5,Fullest part
Shoulder,45.0,Point to point
Back Width,40.5,Across back
Neck,38.0,Base of neck
Bicep,32.0,Upper arm
Wrist,17.5,Wrist bone
Sleeve Length,64.0,Shoulder to wrist
Back Length,44.5,Nape to waist
Front Length,46.0,HPS to waist
Jacket Length,74.0,Collar to hem
Inseam,81.0,Crotch to ankle
Outseam,106.0,Waist to ankle
Rise,27.5,Crotch to waist
```

---

*End of Measurements Reference Document*
