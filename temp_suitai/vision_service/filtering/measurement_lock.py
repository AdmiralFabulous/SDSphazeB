"""
Measurement locking module for stabilizing and averaging measurement data.

This module implements measurement lock functionality that:
- Tracks measurements over multiple frames
- Detects stability based on coefficient of variation
- Locks measurements after 300 stable frames
- Computes geometric median (robust to outliers)
- Generates unique Universal Measurement ID
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple
import hashlib
import uuid
import numpy as np


@dataclass
class MeasurementLockConfig:
    """Configuration for measurement locking behavior."""

    lock_frame_threshold: int = 300
    """Number of stable frames required to lock measurements."""

    stability_window_size: int = 20
    """Number of recent frames used to compute stability metric."""

    cv_threshold: float = 0.05
    """Coefficient of variation threshold for stability (std/mean)."""

    geometric_median_iterations: int = 100
    """Max iterations for geometric median computation."""

    geometric_median_tolerance: float = 1e-6
    """Convergence tolerance for geometric median."""


@dataclass
class MeasurementLockState:
    """State of the measurement lock system."""

    is_locked: bool = False
    """Whether measurements are currently locked."""

    frame_count: int = 0
    """Total number of frames processed."""

    stable_frame_count: int = 0
    """Number of consecutive stable frames."""

    measurements: List[np.ndarray] = field(default_factory=list)
    """All measurements collected in current lock cycle."""

    locked_measurements: Optional[List[np.ndarray]] = None
    """Measurements at time of lock (None until locked)."""

    geometric_median: Optional[np.ndarray] = None
    """Geometric median of locked measurements (None until locked)."""

    universal_measurement_id: Optional[str] = None
    """Unique identifier for this measurement lock."""

    stability_score: float = 0.0
    """Stability confidence score (0.0-1.0) for UI."""

    confidence: float = 0.0
    """Overall confidence in locked measurement (0.0-1.0)."""

    timestamp: datetime = field(default_factory=datetime.now)
    """Timestamp when lock state was last updated."""

    warnings: List[str] = field(default_factory=list)
    """Diagnostic warnings or notes."""

    metadata: dict = field(default_factory=dict)
    """Additional metadata about the lock."""


class MeasurementLock:
    """
    Locks measurement stream after 300 stable frames using geometric median.

    The geometric median is more robust to outliers than the arithmetic mean,
    making it ideal for extracting stable measurements from noisy sensor data.
    """

    def __init__(self, config: Optional[MeasurementLockConfig] = None):
        """
        Initialize measurement lock.

        Args:
            config: Configuration object. Uses defaults if None.
        """
        self.config = config or MeasurementLockConfig()
        self.state = MeasurementLockState()
        self._stability_window: List[np.ndarray] = []

    def add_measurement(self, measurement: np.ndarray) -> MeasurementLockState:
        """
        Add a measurement and check lock criteria.

        Args:
            measurement: Measurement vector (typically 10D for beta parameters).

        Returns:
            Current MeasurementLockState with lock status.

        Raises:
            ValueError: If measurement has invalid shape or contains NaN/inf.
        """
        # Validate input
        measurement = np.asarray(measurement, dtype=np.float32)
        if measurement.ndim != 1:
            raise ValueError(f"Measurement must be 1D, got shape {measurement.shape}")
        if not np.isfinite(measurement).all():
            raise ValueError("Measurement contains NaN or infinite values")

        # Add to measurements and update frame count
        self.state.measurements.append(measurement.copy())
        self.state.frame_count += 1

        # Update stability window
        self._stability_window.append(measurement)
        if len(self._stability_window) > self.config.stability_window_size:
            self._stability_window.pop(0)

        # Update stability score
        if not self.state.is_locked:
            self._update_stability()

        # Check if we should lock
        if not self.state.is_locked and self._should_lock():
            self._perform_lock()

        self.state.timestamp = datetime.now()
        return self.state

    def _update_stability(self) -> None:
        """Compute and update stability metrics."""
        if len(self._stability_window) == 0:
            self.state.stability_score = 0.0
            self.state.stable_frame_count = 0
            return

        # With only 1 measurement, assume it's stable (first frame)
        if len(self._stability_window) == 1:
            self.state.stable_frame_count += 1
            progress = min(self.state.stable_frame_count / self.config.lock_frame_threshold, 1.0)
            self.state.stability_score = progress
            return

        # Compute coefficient of variation for each dimension
        measurements_array = np.array(self._stability_window)
        means = np.mean(measurements_array, axis=0)
        stds = np.std(measurements_array, axis=0)

        # Avoid division by zero
        cvs = np.divide(stds, np.abs(means) + 1e-10,
                       out=np.full_like(stds, np.inf),
                       where=np.abs(means) > 1e-10)

        # Overall CV is max across dimensions (most sensitive measure)
        max_cv = np.nanmax(cvs[np.isfinite(cvs)]) if np.any(np.isfinite(cvs)) else np.inf

        # Check stability
        is_stable = max_cv < self.config.cv_threshold

        if is_stable:
            self.state.stable_frame_count += 1
        else:
            self.state.stable_frame_count = 0

        # Stability score increases as we approach lock threshold
        progress = min(self.state.stable_frame_count / self.config.lock_frame_threshold, 1.0)
        self.state.stability_score = progress

        # Add warning if CV is high
        if max_cv > self.config.cv_threshold * 2:
            self.state.warnings.append(
                f"High variation in frame {self.state.frame_count}: CV={max_cv:.4f}"
            )

    def _should_lock(self) -> bool:
        """Check if lock criteria are met."""
        return self.state.stable_frame_count >= self.config.lock_frame_threshold

    def _perform_lock(self) -> None:
        """Lock measurements and compute geometric median."""
        self.state.is_locked = True
        self.state.locked_measurements = self.state.measurements.copy()

        # Compute geometric median
        measurements_array = np.array(self.state.locked_measurements, dtype=np.float64)
        self.state.geometric_median = self._compute_geometric_median(measurements_array)

        # Generate unique ID
        self.state.universal_measurement_id = self._generate_measurement_id()

        # Compute confidence from stability
        self.state.confidence = min(self.state.stability_score, 1.0)

        self.state.metadata = {
            "num_measurements": len(self.state.locked_measurements),
            "frame_count_at_lock": self.state.frame_count,
            "stable_frames": self.state.stable_frame_count,
            "measurement_dimension": len(self.state.geometric_median),
        }

    def _compute_geometric_median(self, measurements: np.ndarray) -> np.ndarray:
        """
        Compute geometric median of measurements.

        The geometric median is the point that minimizes the sum of distances
        to all input points. It's more robust to outliers than the arithmetic mean.

        Args:
            measurements: Array of shape (N, D) where N is number of measurements
                         and D is the dimension.

        Returns:
            Geometric median as array of shape (D,).
        """
        # Initialize with arithmetic mean
        median = np.mean(measurements, axis=0)

        # Weiszfeld's algorithm for geometric median
        for iteration in range(self.config.geometric_median_iterations):
            # Compute distances from median to all points
            distances = np.linalg.norm(measurements - median, axis=1, keepdims=True)

            # Avoid division by zero
            distances = np.maximum(distances, 1e-10)

            # Compute weights (inverse distances)
            weights = 1.0 / distances
            weight_sum = np.sum(weights)

            if weight_sum < 1e-10:
                break

            # Compute weighted mean
            weighted_sum = np.sum(weights * measurements, axis=0)
            new_median = weighted_sum / weight_sum

            # Check convergence
            delta = np.linalg.norm(new_median - median)
            median = new_median

            if delta < self.config.geometric_median_tolerance:
                break

        return median.astype(np.float32)

    def _generate_measurement_id(self) -> str:
        """
        Generate unique Universal Measurement ID.

        The ID combines:
        - Timestamp of lock
        - Hash of locked measurement data
        - Random component for uniqueness

        Returns:
            Unique measurement ID string.
        """
        # Create deterministic hash from measurements
        measurements_bytes = self.state.geometric_median.tobytes()
        data_hash = hashlib.sha256(measurements_bytes).hexdigest()[:12]

        # Add timestamp component
        timestamp_str = self.state.timestamp.isoformat().replace(":", "").replace("-", "")[:14]

        # Add random component for true uniqueness
        random_id = str(uuid.uuid4())[:8]

        # Combine components
        universal_id = f"UMI_{timestamp_str}_{data_hash}_{random_id}"

        return universal_id

    def reset(self) -> None:
        """Reset lock state for new measurement cycle."""
        self.state = MeasurementLockState()
        self._stability_window = []

    def get_locked_measurements(self) -> Optional[List[np.ndarray]]:
        """Get the locked measurements buffer (if locked)."""
        return self.state.locked_measurements

    def get_geometric_median(self) -> Optional[np.ndarray]:
        """Get the geometric median (if locked)."""
        return self.state.geometric_median

    def get_universal_id(self) -> Optional[str]:
        """Get the Universal Measurement ID (if locked)."""
        return self.state.universal_measurement_id

    def get_progress(self) -> Tuple[int, int]:
        """
        Get progress toward lock.

        Returns:
            Tuple of (current_stable_frames, required_stable_frames).
        """
        return (self.state.stable_frame_count, self.config.lock_frame_threshold)
