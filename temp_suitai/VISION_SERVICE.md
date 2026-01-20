# Vision Service - ArUco Scale Calculation

## Overview

The Vision Service provides image processing and calibration capabilities for the SUIT AI system, with a focus on ArUco marker detection and scale factor derivation.

## Task: VIS-E01-S02-T03 - Calculate Scale from Marker

### Objective

Derive a scale factor (mm per pixel) from known ArUco marker sizes to enable real-world measurements from camera images.

**Formula:** `scale = known_marker_size / pixel_size`

### Implementation

The implementation consists of three core modules:

#### 1. **ArUcoDetector** (`aruco_detect.py`)
Detects and extracts ArUco markers from images.

**Key Features:**
- Dictionary: DICT_4X4_50 (4x4 50-marker dictionary)
- Detects multiple markers in single image
- Returns corners, IDs, and rejected candidates
- Visualization support for detected markers and corners

**Example Usage:**
```python
from vision_service.calibration import ArUcoDetector

detector = ArUcoDetector()
corners, ids, rejected = detector.detect_markers(image)

if ids is not None:
    print(f"Detected {len(ids)} markers")
    for corner_set in corners:
        print(f"Corner points: {corner_set}")
```

#### 2. **PnPSolver** (`pnp_solver.py`)
Estimates marker pose and depth using Perspective-n-Point solving.

**Key Features:**
- IPPE_SQUARE method optimized for planar square markers
- Estimates 3D pose (rotation + translation) from 2D corners
- Validates positive depth (marker in front of camera)
- Default camera matrix (500px focal length, 320x240 principal point)

**Example Usage:**
```python
from vision_service.calibration import PnPSolver

solver = PnPSolver()
rvec, tvec = solver.solve_marker_pose(corners)
depth_mm = solver.get_marker_depth(tvec)
print(f"Marker depth: {depth_mm:.2f}mm")
```

#### 3. **ArUcoScaleCalculator** (`aruco_scale.py`)
Calculates scale factor from ArUco markers using two methods.

**Key Features:**
- **Pixel-based method:** Direct scale from marker pixel size
- **PnP-based method:** Uses depth estimation for improved accuracy
- Confidence scoring (0.0-1.0) reflecting method quality
- Comprehensive validation with warning accumulation
- Multi-marker support with best-result selection

**Validation Ranges:**
- Marker size: 5-2000 pixels
- Scale factor: 0.01-25.0 mm/px
- Real-world height: 100-2500 mm (PnP only)

**Confidence Factors:**

*Pixel-based:*
- Marker size quality (larger = more reliable)
- Scale factor reasonableness

*PnP-based:*
- Marker size quality (30%)
- Scale factor validity (30%)
- Depth estimation quality (40%)

### Acceptance Criteria ✓

- [x] **Returns mm per pixel scale factor**
  - Implemented in `ArUcoScaleCalculator.calculate_scale()`
  - Returns `ScaleFactorResult.scale_factor`

- [x] **Works with or without PnP**
  - `use_pnp=False`: Pixel-based method (default)
  - `use_pnp=True`: PnP-based method with depth

- [x] **Confidence score reflects method quality**
  - Confidence range: 0.0-1.0
  - PnP method includes depth quality assessment
  - Pixel method considers size and scale validity

## Usage Examples

### Basic Scale Calculation (Pixel Method)

```python
from vision_service.calibration import ArUcoScaleCalculator
import cv2

# Initialize calculator with known marker size
calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

# Load and process image
image = cv2.imread("image_with_marker.jpg")
result = calculator.calculate_scale(image, use_pnp=False)

# Check results
if result.is_valid:
    print(f"Scale: {result.scale_factor:.4f} mm/px")
    print(f"Confidence: {result.confidence_score:.2f}")
else:
    print(f"Validation warnings: {result.validation_warnings}")
```

### PnP-Based Scale Calculation

```python
# Use PnP method for depth-aware scaling
result = calculator.calculate_scale(image, use_pnp=True)

# Returns enhanced confidence with depth estimation
print(f"Method: {result.method}")
print(f"Scale: {result.scale_factor:.4f} mm/px")
print(f"Confidence: {result.confidence_score:.2f}")
```

### Multiple Marker Analysis

```python
# Process all detected markers
best_result, all_results = calculator.calculate_scale_multiple(image)

print(f"Found {len(all_results)} markers")
for i, result in enumerate(all_results):
    print(f"  Marker {i}: {result.scale_factor:.4f} mm/px "
          f"(confidence={result.confidence_score:.2f})")

print(f"Best result: {best_result.scale_factor:.4f} mm/px")
```

### Custom Camera Calibration

```python
import numpy as np

# Define camera intrinsics
camera_matrix = np.array([
    [fx,  0, cx],
    [ 0, fy, cy],
    [ 0,  0,  1]
], dtype=np.float32)

distortion_coeffs = np.array([k1, k2, p1, p2, k3], dtype=np.float32)

# Use custom calibration
calculator = ArUcoScaleCalculator(
    marker_size_mm=50.0,
    camera_matrix=camera_matrix
)

result = calculator.calculate_scale(image, use_pnp=True)
```

## API Reference

### ScaleFactorResult (Dataclass)

```python
@dataclass
class ScaleFactorResult:
    scale_factor: float              # mm per pixel
    confidence_score: float          # 0.0-1.0
    validation_warnings: List[str]   # List of warnings
    is_valid: bool                   # Overall validity
    method: str                      # 'pixel_size' or 'pnp'
```

### ArUcoScaleCalculator

**Constructor:**
```python
ArUcoScaleCalculator(
    marker_size_mm: float = 50.0,
    camera_matrix: Optional[np.ndarray] = None
)
```

**Methods:**

`calculate_scale(image, use_pnp=False) -> ScaleFactorResult`
- Calculates scale from first detected marker

`calculate_scale_multiple(image, use_pnp=False) -> Tuple[ScaleFactorResult, List[ScaleFactorResult]]`
- Calculates scale for all markers, returns best + all results

`_calculate_pixel_size(corners) -> float`
- Calculates marker size in pixels (diagonal distance)

`_calculate_confidence_pixel(pixel_size, scale_factor) -> float`
- Confidence scoring for pixel-based method

`_calculate_confidence_pnp(pixel_size, scale_factor, depth_mm) -> float`
- Confidence scoring for PnP-based method

## Testing

Comprehensive test suite with 12 test cases:

```bash
python test_aruco_scale.py
```

**Test Coverage:**
1. Pixel-based scale calculation
2. PnP-based scale calculation
3. No markers detected handling
4. Large marker confidence scoring
5. Small marker confidence scoring
6. Pixel size calculation accuracy
7. Validation warnings
8. Multiple marker detection
9. Marker size parameter validation
10. ScaleFactorResult structure
11. Error handling
12. PnP confidence scoring

**Test Results:** 12/12 passing ✓

## Error Handling

The calculator gracefully handles errors:

- **No markers detected:** Returns `is_valid=False`, scale=0.0
- **Invalid inputs:** Catches exceptions, returns error result
- **Negative depth:** PnP solver validates positive depth
- **Out-of-range scales:** Adds validation warnings, flags as invalid
- **Detection failures:** Logs warnings, returns best available result

## Implementation Details

### Confidence Scoring Algorithm

**Pixel-Based Method:**
```
size_confidence =
  - 0.3 if pixel_size < 20
  - 0.6 if 20 <= pixel_size < 50
  - 0.8 if 50 <= pixel_size < 100
  - 1.0 if 100 <= pixel_size < 500
  - 0.7 if pixel_size >= 500

scale_confidence =
  - 1.0 if 0.05 <= scale < 5.0
  - 0.7 if (0.01 <= scale < 0.05) or (5.0 <= scale <= 25.0)
  - 0.0 otherwise

confidence = (size_confidence + scale_confidence) / 2.0
```

**PnP-Based Method:**
```
depth_confidence =
  - 1.0 if 200 <= depth <= 2000
  - 0.8 if (100 <= depth < 200) or (2000 < depth <= 2500)
  - 0.3 otherwise

confidence = size_confidence * 0.3 + scale_confidence * 0.3 + depth_confidence * 0.4
```

### Validation Flow

1. **Marker Detection:** Detect ArUco markers in image
2. **Size Validation:** Check pixel size is within 5-2000px range
3. **Scale Calculation:** Compute scale = marker_size_mm / pixel_size
4. **Scale Validation:** Verify scale is within 0.01-25.0 mm/px range
5. **Depth Validation (PnP only):** Check depth is 100-2500mm
6. **Confidence Scoring:** Assign confidence based on method and quality factors
7. **Result Assembly:** Return ScaleFactorResult with all metadata

## Project Structure

```
vision_service/
├── __init__.py                   # Module initialization
└── calibration/
    ├── __init__.py              # Submodule exports
    ├── aruco_detect.py          # ArUco marker detection
    ├── pnp_solver.py            # PnP pose estimation
    └── aruco_scale.py           # Scale factor calculation

test_aruco_scale.py              # Comprehensive test suite
```

## Dependencies

- **OpenCV (cv2):** ArUco detection, PnP solving
- **NumPy (np):** Array operations, matrix math
- **Python 3.7+:** Type hints, dataclasses

## Future Enhancements

Potential improvements for future iterations:

1. **Multi-scale Fusion:** Combine results from multiple markers
2. **Temporal Filtering:** Smooth scale estimates over video frames
3. **Adaptive Camera Matrix:** Estimate intrinsics from marker homography
4. **ChArUco Boards:** Support for ChArUco calibration boards
5. **Distortion Modeling:** Support for camera lens distortion
6. **Real-time Processing:** GPU acceleration for live streams
7. **Scale Caching:** Memory efficient scale estimation history

## References

- OpenCV ArUco Documentation: https://docs.opencv.org/master/d5/dae/tutorial_aruco_detection.html
- PnP Problem: https://en.wikipedia.org/wiki/Perspective-n-point
- IPPE Algorithm: https://docs.opencv.org/master/d9/d0c/group__calib3d.html

## Changelog

### v1.0 (Initial Implementation)
- ArUco marker detection with DICT_4X4_50
- Pixel-based scale calculation
- PnP-based scale calculation with depth estimation
- Comprehensive confidence scoring
- Full error handling and validation
- 12-test comprehensive test suite
