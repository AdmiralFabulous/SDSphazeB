# Measurement Locking Module

## Overview

The Measurement Locking module provides stabilization and averaging of measurement data using the **geometric median** for robustness to outliers. This module implements task **VIS-E02-S02-T04** for the Vision & Measurement Service.

## Features

✅ **300-Frame Stability Lock**: Measurements are locked after detecting 300 consecutive stable frames
✅ **Geometric Median**: Robust statistical measure resistant to outliers (better than arithmetic mean)
✅ **Stability Detection**: Coefficient of Variation (CV) based stability metric with sliding window
✅ **Universal Measurement ID**: Unique identifiers combining timestamp, data hash, and random component
✅ **Progress Tracking**: Real-time progress reporting (0-1.0 confidence score for UI)
✅ **Comprehensive Diagnostics**: Warnings and metadata tracking for debugging

## Architecture

### Module Structure

```
vision_service/
├── __init__.py                          # Package initialization
└── filtering/
    ├── __init__.py                      # Filtering subpackage
    ├── measurement_lock.py              # Main implementation (this file)
    └── test_measurement_lock.py         # Comprehensive unit tests (30 tests)
```

### Key Classes

#### `MeasurementLockConfig` (Dataclass)
Configuration parameters for the measurement locking behavior.

**Parameters:**
- `lock_frame_threshold` (int, default=300): Number of stable frames required to lock
- `stability_window_size` (int, default=20): Size of sliding window for stability calculation
- `cv_threshold` (float, default=0.05): Coefficient of Variation threshold for stability
- `geometric_median_iterations` (int, default=100): Max iterations for Weiszfeld algorithm
- `geometric_median_tolerance` (float, default=1e-6): Convergence tolerance

**Example:**
```python
config = MeasurementLockConfig(
    lock_frame_threshold=300,
    cv_threshold=0.05
)
```

#### `MeasurementLockState` (Dataclass)
Represents the current state of measurement locking.

**Key Fields:**
- `is_locked` (bool): Whether measurements are currently locked
- `frame_count` (int): Total frames processed
- `stable_frame_count` (int): Consecutive stable frames
- `measurements` (List[ndarray]): All collected measurements
- `locked_measurements` (Optional[List[ndarray]]): Measurements at lock time
- `geometric_median` (Optional[ndarray]): The computed geometric median
- `universal_measurement_id` (Optional[str]): Unique measurement ID
- `stability_score` (float 0-1): UI confidence indicator
- `confidence` (float 0-1): Overall measurement confidence
- `warnings` (List[str]): Diagnostic warnings
- `metadata` (dict): Additional tracking information

#### `MeasurementLock` (Main Class)
Orchestrates measurement collection, stability detection, and locking.

**Methods:**

##### `add_measurement(measurement: np.ndarray) -> MeasurementLockState`
Process a new measurement and check lock criteria.

```python
lock = MeasurementLock()
state = lock.add_measurement(np.array([1.0, 2.0, 3.0]))
if state.is_locked:
    print(f"Locked! ID: {state.universal_measurement_id}")
```

##### `get_locked_measurements() -> Optional[List[np.ndarray]]`
Retrieve the buffer of measurements at lock time (or None if not locked).

##### `get_geometric_median() -> Optional[np.ndarray]`
Get the computed geometric median (or None if not locked).

##### `get_universal_id() -> Optional[str]`
Get the Universal Measurement ID (or None if not locked).

##### `get_progress() -> Tuple[int, int]`
Get progress as `(current_stable_frames, required_stable_frames)`.

```python
current, total = lock.get_progress()
progress_percent = (current / total) * 100
print(f"Progress: {progress_percent:.1f}%")
```

##### `reset() -> None`
Reset state for a new measurement cycle.

## Algorithm Details

### Stability Detection (Coefficient of Variation)

The module uses **Coefficient of Variation (CV)** to detect measurement stability:

```
CV = std_dev / mean
```

For multi-dimensional measurements:
- Compute CV for each dimension independently
- Take the **maximum CV** across dimensions (most conservative)
- Compare against configurable threshold (default 0.05)
- If CV < threshold for a window of frames, increment stable counter
- If CV >= threshold, reset stable counter to 0

**Example:**
- Measurement: [1.0, 2.0, 3.0]
- Window (last 5): all identical values
- CV: 0.0 (perfect stability) ✅
- Result: stable_frame_count += 1

### Geometric Median Computation

The geometric median minimizes the sum of Euclidean distances to all input points:

```
argmin_x Σ ||x_i - x||
```

**Algorithm: Weiszfeld's Iteration**
1. Initialize with arithmetic mean
2. Iteratively:
   - Compute distances to all points
   - Compute weights (inverse distances)
   - Compute weighted mean
   - Check convergence
3. Return converged point

**Benefits over Arithmetic Mean:**
- **Robust to outliers**: Single outlier has limited influence
- **Geometric interpretation**: True center of mass distribution
- **Convergence guaranteed**: Weiszfeld algorithm proven convergence

**Example:**
```python
measurements = [
    [1.0, 2.0],
    [1.0, 2.0],
    [1.0, 2.0],
    [100.0, 200.0]  # Outlier
]
geometric_median ≈ [1.0, 2.0]  # Outlier doesn't shift result much
arithmetic_mean ≈ [25.75, 51.5]  # Mean heavily influenced by outlier
```

### Universal Measurement ID Generation

IDs combine three components for uniqueness and traceability:

```
UMI_<timestamp>_<data_hash>_<random>
```

1. **Timestamp** (14 chars): ISO format timestamp when lock occurred
   - Format: `YYYYMMDDHHmmss`
   - Example: `20260119074255`

2. **Data Hash** (12 chars): SHA-256 hash of geometric median values
   - First 12 hex characters of hash
   - Deterministic: same measurement → same hash

3. **Random Component** (8 chars): UUID suffix for true uniqueness
   - Even identical measurements get different IDs
   - Prevents ID collisions in rapid sequences

**Example ID:** `UMI_20260119074255_a3f2b9c4e1d7_8f5e9c2b`

## Usage Patterns

### Basic Usage
```python
import numpy as np
from vision_service.filtering.measurement_lock import MeasurementLock, MeasurementLockConfig

# Initialize with default config
lock = MeasurementLock()

# Add measurements from sensor
for frame_id in range(500):
    measurement = get_sensor_measurement()  # Returns np.array
    state = lock.add_measurement(measurement)

    # Report progress to UI
    if frame_id % 30 == 0:
        progress, total = lock.get_progress()
        confidence = state.stability_score
        print(f"Frame {frame_id}: {progress}/{total} stable frames, "
              f"confidence: {confidence:.1%}")

    # Handle lock event
    if state.is_locked and not state.was_locked_before:
        print(f"Measurement locked!")
        print(f"ID: {state.universal_measurement_id}")
        print(f"Median: {state.geometric_median}")
```

### Custom Configuration
```python
# For faster locking with more tolerance
config = MeasurementLockConfig(
    lock_frame_threshold=100,      # Lock after 100 stable frames
    cv_threshold=0.1,              # More tolerance for variation
    stability_window_size=10,      # Smaller window
)
lock = MeasurementLock(config)
```

### Multi-Cycle Processing
```python
for cycle in range(10):
    lock = MeasurementLock()

    # Collect measurements
    while not lock.state.is_locked:
        measurement = get_measurement()
        state = lock.add_measurement(measurement)

    # Process locked data
    process_locked_measurement(
        median=state.geometric_median,
        id=state.universal_measurement_id,
        confidence=state.confidence
    )

    # Next cycle
    lock.reset()
```

## Error Handling

The module validates input measurements:

```python
# Valid: 1D numpy array
lock.add_measurement(np.array([1.0, 2.0, 3.0]))  # ✅

# Invalid: 2D array
lock.add_measurement(np.array([[1.0, 2.0]]))     # ❌ ValueError

# Invalid: NaN values
lock.add_measurement(np.array([1.0, np.nan]))    # ❌ ValueError

# Invalid: Infinite values
lock.add_measurement(np.array([1.0, np.inf]))    # ❌ ValueError
```

## Testing

Comprehensive unit tests covering 30 test cases:

```bash
cd vision_service/filtering
python -m pytest test_measurement_lock.py -v
```

**Test Coverage:**
- Configuration and state initialization
- Measurement addition and validation
- Stability detection and frame counting
- Geometric median computation
  - Single point, identical points, symmetric distributions
  - Outlier robustness verification
- 300-frame lock threshold
- Locked measurements capture
- Universal ID generation and uniqueness
- Progress tracking and confidence scoring
- Reset functionality and multi-cycle operation
- Metadata recording
- Getter methods

**Result:** ✅ All 30 tests passing

## Performance Characteristics

| Aspect | Details |
|--------|---------|
| **Time Complexity** | O(n×d×i) where n=measurements, d=dimensions, i=iterations |
| **Space Complexity** | O(n×d) for storing measurements |
| **Geometric Median** | ~100 iterations for convergence (typically 10-20) |
| **Typical Lock Time** | ~10 seconds at 30 FPS for 300 frames |
| **Memory per Lock** | ~300×dimensionality × 4 bytes (float32) |

## Integration with Vision Pipeline

```
Input Stream → [Kalman Filter] → [Warmup] → [Measurement Lock] → Locked Data
    (raw)         (smoothing)    (60 frames)  (300 stable frames)  (geometric median)
```

## Metadata and Diagnostics

When locked, the module provides metadata:

```python
metadata = state.metadata
# {
#     "num_measurements": 350,
#     "frame_count_at_lock": 350,
#     "stable_frames": 300,
#     "measurement_dimension": 10
# }
```

Warnings list provides diagnostic feedback:

```python
if state.warnings:
    for warning in state.warnings:
        print(f"Warning: {warning}")
    # "Warning: High variation in frame 42: CV=0.1234"
```

## Dependencies

- `numpy`: Array operations and geometric median computation
- `dataclasses`: State representation
- `datetime`: Timestamp tracking
- `hashlib`: Unique ID generation
- `uuid`: Random ID components

## Acceptance Criteria Verification

✅ **Locks after 300 stable frames**
- Frame counter tracks consecutive stable measurements
- Default threshold is 300, configurable
- Test: `test_lock_after_300_stable_frames`

✅ **Uses geometric median (robust to outliers)**
- Weiszfeld algorithm implemented
- Convergence guaranteed with configurable tolerance
- Test: `test_geometric_median_outlier_robustness`

✅ **Generates unique "Universal Measurement ID"**
- Format: `UMI_<timestamp>_<hash>_<random>`
- Uniqueness verified with timestamp + hash + UUID
- Test: `test_id_uniqueness`

✅ **Provides progress/confidence for UI**
- `stability_score`: Progress toward lock (0.0-1.0)
- `confidence`: Overall measurement confidence
- `get_progress()`: Returns (current, total) for progress bars
- Test: `test_progress_before_lock`, `test_confidence_at_lock`

## Future Enhancements

- Adaptive CV threshold based on sensor characteristics
- Parallel geometric median for very high-dimensional data
- Streaming mode for online updates
- Integration with ML for anomaly detection
- Temporal smoothing with time-weighted windows
