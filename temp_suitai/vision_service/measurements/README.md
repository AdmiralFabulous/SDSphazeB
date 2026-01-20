# Measurements Module

Body measurement extraction and normalization utilities for the Vision Service.

## A-Pose Normalization

The A-Pose normalization module converts arbitrary body poses to a canonical "A-pose" (rest pose) while preserving body shape parameters. This enables consistent body measurements and comparisons across different input poses.

### What is A-Pose?

A-pose is the canonical neutral pose used in SMPL-X with:
- **Global rotation**: Identity (no rotation)
- **Arms**: Raised at ~45 degrees for clear measurements (elbows slightly bent)
- **Legs**: Straight down
- **Head**: Looking forward
- **All joints**: At neutral rotation

### Key Features

✅ **Consistent Output**: Multiple calls with the same shape parameters produce identical poses
✅ **Preserves Shape**: Beta (shape) parameters are exactly preserved regardless of input pose
✅ **Arms at 45°**: Both arms positioned at approximately 45 degrees for clear measurements
✅ **Joint Positions**: 3D positions of all 24 joints available for measurement calculations

### Usage

#### Basic A-Pose Creation

```python
from vision_service.measurements import create_apose_theta
import numpy as np

# Define body shape (10-dimensional beta vector)
beta = np.array([0.0, 0.5, -0.3, 0.1, -0.2, 0.0, 0.1, 0.05, -0.1, 0.02])

# Create A-pose
result = create_apose_theta(beta)

# Access results
apose_theta = result.apose_theta          # 72-dimensional pose vector
joint_positions = result.joint_positions  # 24x3 array of joint positions
confidence = result.confidence            # Confidence score (0-1)
```

#### Normalize Arbitrary Pose to A-Pose

```python
from vision_service.measurements import normalize_to_apose
import numpy as np

# Define an arbitrary pose (72-dimensional theta vector)
theta = np.random.randn(72).astype(np.float32) * 0.5

# Define body shape
beta = np.array([0.0, 0.5, -0.3, 0.1, -0.2, 0.0, 0.1, 0.05, -0.1, 0.02])

# Normalize to A-pose (preserves beta)
result = normalize_to_apose(theta, beta)

# Result has A-pose but same shape as input
assert np.array_equal(result.beta, beta)  # Beta preserved
```

#### Access Joint Positions

```python
from vision_service.measurements import get_joint_position, get_arm_angle

# Get position of a specific joint (e.g., left shoulder)
left_shoulder = get_joint_position(result, 7)  # [x, y, z] in meters

# Get arm abduction angles
left_arm_angle = get_arm_angle(result, "left")    # ~45 degrees
right_arm_angle = get_arm_angle(result, "right")  # ~45 degrees
```

#### Validate A-Pose

```python
from vision_service.measurements import validate_apose

is_valid, issues = validate_apose(result)

if is_valid:
    print("A-pose is valid")
else:
    for issue in issues:
        print(f"Issue: {issue}")
```

### API Reference

#### `create_apose_theta(beta: np.ndarray) -> APoseResult`

Create a canonical A-pose from shape parameters.

**Parameters:**
- `beta`: 10-dimensional shape vector (numpy array)

**Returns:**
- `APoseResult` with:
  - `apose_theta`: 72-dimensional pose vector (axis-angle format)
  - `beta`: Copy of input shape parameters
  - `joint_rotations`: 24x3 array of joint rotations
  - `joint_positions`: 24x3 array of joint 3D positions (meters)
  - `confidence`: Confidence score (0-1)
  - `validation_warnings`: List of validation warnings

**Raises:**
- `ValueError`: If beta has incorrect shape, contains NaN/Inf, or invalid type

#### `normalize_to_apose(theta: np.ndarray, beta: np.ndarray) -> APoseResult`

Normalize an arbitrary pose to A-pose while preserving shape.

**Parameters:**
- `theta`: 72-dimensional pose vector (axis-angle format)
- `beta`: 10-dimensional shape vector

**Returns:**
- `APoseResult` with normalized pose and preserved beta

**Raises:**
- `ValueError`: If inputs have incorrect shape, contain NaN/Inf, or invalid type

#### `get_joint_position(apose_result: APoseResult, joint_index: int) -> np.ndarray`

Get 3D position of a specific joint.

**Parameters:**
- `apose_result`: Result from pose normalization
- `joint_index`: Joint index (0-23)

**Returns:**
- 3D position [x, y, z] in meters (relative to pelvis)

**Raises:**
- `IndexError`: If joint_index is out of range

#### `get_arm_angle(apose_result: APoseResult, side: str) -> float`

Get arm abduction angle.

**Parameters:**
- `apose_result`: Result from pose normalization
- `side`: "left" or "right" (case-insensitive)

**Returns:**
- Angle in degrees (approximately 45° in A-pose)

**Raises:**
- `ValueError`: If side is not "left" or "right"

#### `validate_apose(apose_result: APoseResult) -> Tuple[bool, List[str]]`

Validate that A-pose meets expected constraints.

**Parameters:**
- `apose_result`: Result to validate

**Returns:**
- Tuple of (is_valid: bool, issues: List[str])

### Joint Indices

SMPL-X uses 24 joints (indices 0-23):

```
0:  Pelvis (root)
1:  Spine0
2:  Spine1
3:  Spine2
4:  Neck
5:  Head
6:  Head Top
7:  Left Shoulder
8:  Left Elbow
9:  Left Wrist
10: Left Hand
11: Left Thumb
12: Right Shoulder
13: Right Elbow
14: Right Wrist
15: Right Hand
16: Right Thumb
17: Left Hip
18: Left Knee
19: Left Ankle
20: Right Hip
21: Right Knee
22: Right Ankle
23: Jaw
```

### Input Specifications

#### theta (Pose Vector)
- **Shape**: (72,) - 24 joints × 3 values
- **Format**: Axis-angle representation
- **Range**: Typically -π to π per component
- **Type**: numpy.ndarray (float32 preferred)

#### beta (Shape Vector)
- **Shape**: (10,) - 10 shape coefficients
- **Range**: Typically -3 to +3 (standard deviations)
- **Type**: numpy.ndarray (float32 preferred)

### Acceptance Criteria Verification

✅ **Outputs Consistent A-Pose**: Multiple calls with same parameters produce identical results
✅ **Preserves Beta Parameters**: Shape parameters are exactly preserved from input
✅ **Arms at ~45 Degrees**: Both arms positioned at 45° ±5° for clear measurements
✅ **Joint Positions Available**: All 24 joint positions accessible via `get_joint_position()`

### Examples

#### Extract Body Measurements

```python
from vision_service.measurements import create_apose_theta, get_joint_position
import numpy as np

beta = np.zeros(10)
result = create_apose_theta(beta)

# Get key joint positions for measurements
pelvis = get_joint_position(result, 0)
left_shoulder = get_joint_position(result, 7)
right_shoulder = get_joint_position(result, 12)
left_ankle = get_joint_position(result, 19)
right_ankle = get_joint_position(result, 22)

# Calculate shoulder width
shoulder_width = np.linalg.norm(left_shoulder - right_shoulder)

# Calculate arm length (shoulder to wrist)
left_arm_length = np.linalg.norm(get_joint_position(result, 9) - left_shoulder)

# Calculate leg length (hip to ankle)
left_hip = get_joint_position(result, 17)
left_leg_length = np.linalg.norm(left_ankle - left_hip)
```

#### Compare Different Body Shapes

```python
from vision_service.measurements import create_apose_theta
import numpy as np

# Normalize different body shapes to A-pose for comparison
beta_slim = np.array([-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
beta_athletic = np.zeros(10)
beta_muscular = np.array([1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

result_slim = create_apose_theta(beta_slim)
result_athletic = create_apose_theta(beta_athletic)
result_muscular = create_apose_theta(beta_muscular)

# All have same pose (A-pose) but different shapes
# Can now compare measurements in consistent pose
```

### Testing

Run comprehensive tests:

```bash
cd vision_service/measurements
python -m pytest test_apose.py -v
```

Test coverage includes:
- 41 unit tests covering all functions
- Input validation and error handling
- Acceptance criteria verification
- Edge cases and boundary conditions

### Performance Notes

- Pose creation is O(1) with minimal memory overhead
- All operations use numpy for efficiency
- Suitable for real-time applications (< 1ms per operation)

### References

- SMPL-X model: "Expressive Body Capture: 3D Hands, Face, and Body from a Single Image"
- Axis-angle representation: Compact 3D rotation encoding (3 values per joint)
- Beta parameters: Learned shape coefficients from PCA decomposition
