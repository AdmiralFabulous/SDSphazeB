"""
Calibration Lock Module

Implements a calibration lock mechanism that freezes scale measurements after
achieving 30 stable frames, based on coefficient of variation stability metric.

This module provides:
- Frame-by-frame stability tracking
- Coefficient of variation (CV) measurement
- Automatic locking after 30 stable frames
- Stability score for UI feedback (0-1 range)
- Reset functionality for recalibration

The stability metric measures the consistency of scale factor measurements.
When CV falls below the stability threshold, frames are counted as stable.
After 30 consecutive stable frames, the calibration is locked.
"""

from dataclasses import dataclass, field
from typing import Optional, List
import numpy as np


@dataclass
class StabilityMetrics:
    """Metrics describing calibration stability state.

    Attributes:
        coefficient_of_variation: The CV of recent scale factor measurements,
            used to determine frame stability. Range: 0.0 to infinity.
            Lower values indicate more stable measurements.
        stability_score: Normalized stability feedback score for UI display.
            Range: 0.0 (unstable) to 1.0 (fully stable and locked).
        is_stable: True if current frame passes stability threshold.
        is_locked: True if calibration has frozen after 30 stable frames.
        stable_frame_count: Number of consecutive stable frames counted.
        measurements_count: Total number of scale factor measurements processed.
        warnings: List of diagnostic warnings about measurement quality.
    """
    coefficient_of_variation: float
    stability_score: float
    is_stable: bool
    is_locked: bool
    stable_frame_count: int
    measurements_count: int
    warnings: List[str] = field(default_factory=list)


class CalibrationLock:
    """Manages calibration lock state based on scale factor stability.

    Tracks scale factor measurements frame-by-frame and locks calibration
    after 30 consecutive stable frames, where stability is measured by
    coefficient of variation. Provides stability metrics and UI feedback.

    Parameters:
        cv_threshold: Coefficient of variation threshold for frame stability.
            Measurements below this CV are counted as stable frames.
            Default: 0.05 (5% variation).
        stable_frame_threshold: Number of consecutive stable frames required
            to lock calibration. Default: 30 frames.
        window_size: Size of sliding window for CV calculation.
            More frames provide better stability estimates.
            Default: 10 frames.
        min_measurements: Minimum measurements before CV calculation begins.
            Default: 3 (sufficient for meaningful variation metric).

    Example:
        >>> lock = CalibrationLock()
        >>> for scale in scale_measurements:
        ...     metrics = lock.add_measurement(scale)
        ...     if metrics.is_locked:
        ...         print("Calibration locked!")
        ...         break
    """

    def __init__(
        self,
        cv_threshold: float = 0.05,
        stable_frame_threshold: int = 30,
        window_size: int = 10,
        min_measurements: int = 2,
    ):
        """Initialize calibration lock tracker.

        Args:
            cv_threshold: Coefficient of variation threshold for stability.
                Recommended range: 0.01-0.1 (1%-10%).
            stable_frame_threshold: Frames to lock after. Typical: 20-30.
            window_size: Measurements to track for CV. Typical: 5-20.
            min_measurements: Minimum measurements before evaluation.
                Should be >= 2 for valid CV calculation.

        Raises:
            ValueError: If parameters are outside valid ranges.
        """
        if cv_threshold < 0:
            raise ValueError("cv_threshold must be non-negative")
        if stable_frame_threshold < 1:
            raise ValueError("stable_frame_threshold must be >= 1")
        if window_size < 2:
            raise ValueError("window_size must be >= 2")
        if min_measurements < 2:
            raise ValueError("min_measurements must be >= 2")

        self._cv_threshold = cv_threshold
        self._stable_frame_threshold = stable_frame_threshold
        self._window_size = window_size
        self._min_measurements = min_measurements

        # State tracking
        self._measurements: List[float] = []
        self._stable_frame_count = 0
        self._is_locked = False
        self._locked_scale: Optional[float] = None
        self._warnings: List[str] = []

    def add_measurement(self, scale_factor: float) -> StabilityMetrics:
        """Process a new scale factor measurement.

        Updates stability tracking and determines if calibration should lock.
        A measurement is considered "stable" if the coefficient of variation
        of recent measurements falls below the cv_threshold.

        Args:
            scale_factor: New scale factor measurement (typically in mm/unit).
                Must be positive and finite.

        Returns:
            StabilityMetrics object with current calibration state.

        Raises:
            ValueError: If scale_factor is invalid (non-positive or NaN/Inf).

        Raises:
            RuntimeError: If calibration is already locked (cannot add more measurements).
        """
        # Validation
        if not isinstance(scale_factor, (int, float)):
            raise ValueError(f"scale_factor must be numeric, got {type(scale_factor)}")
        if scale_factor <= 0:
            raise ValueError(f"scale_factor must be positive, got {scale_factor}")
        if not np.isfinite(scale_factor):
            raise ValueError(f"scale_factor must be finite, got {scale_factor}")

        if self._is_locked:
            raise RuntimeError(
                "Calibration is locked. Call reset() to start new calibration cycle."
            )

        # Add measurement to window
        self._measurements.append(float(scale_factor))

        # Keep only the most recent measurements (sliding window)
        if len(self._measurements) > self._window_size:
            self._measurements = self._measurements[-self._window_size:]

        # Calculate metrics
        cv = self._calculate_coefficient_of_variation()
        is_stable = self._is_frame_stable(cv)

        # Update stable frame counter
        if is_stable:
            self._stable_frame_count += 1
        else:
            # Reset counter on unstable frame
            self._stable_frame_count = 0

        # Check if we should lock
        if self._stable_frame_count >= self._stable_frame_threshold:
            self._is_locked = True
            self._locked_scale = float(np.mean(self._measurements))

        # Generate stability feedback score
        stability_score = self._calculate_stability_score(cv, is_stable)

        # Build warnings list
        self._warnings = self._generate_warnings(cv, is_stable)

        return StabilityMetrics(
            coefficient_of_variation=cv,
            stability_score=stability_score,
            is_stable=is_stable,
            is_locked=self._is_locked,
            stable_frame_count=self._stable_frame_count,
            measurements_count=len(self._measurements),
            warnings=self._warnings.copy(),
        )

    def reset(self) -> None:
        """Reset calibration lock state for new calibration cycle.

        Clears all measurements and counters. The calibration lock can then
        be recomputed with new measurements.
        """
        self._measurements = []
        self._stable_frame_count = 0
        self._is_locked = False
        self._locked_scale = None
        self._warnings = []

    def get_locked_scale(self) -> Optional[float]:
        """Retrieve the locked scale factor if calibration is locked.

        Returns:
            The mean scale factor from the locked state, or None if not yet locked.
        """
        return self._locked_scale

    def is_locked(self) -> bool:
        """Check if calibration is currently locked.

        Returns:
            True if 30 stable frames have been achieved, False otherwise.
        """
        return self._is_locked

    def get_stability_metrics(self) -> StabilityMetrics:
        """Get current stability metrics without adding new measurement.

        Useful for UI updates between measurements or diagnostics.

        Returns:
            Current StabilityMetrics state.
        """
        cv = self._calculate_coefficient_of_variation()
        is_stable = self._is_frame_stable(cv)
        stability_score = self._calculate_stability_score(cv, is_stable)

        return StabilityMetrics(
            coefficient_of_variation=cv,
            stability_score=stability_score,
            is_stable=is_stable,
            is_locked=self._is_locked,
            stable_frame_count=self._stable_frame_count,
            measurements_count=len(self._measurements),
            warnings=self._warnings.copy(),
        )

    # Private helper methods

    def _calculate_coefficient_of_variation(self) -> float:
        """Calculate coefficient of variation of recent measurements.

        CV = (std dev / mean) * 100, expressed as decimal (0.05 = 5%).
        Measures relative variability; lower values indicate consistency.

        Returns:
            CV as decimal (0.0 to infinity). Returns 0.0 if insufficient data.
        """
        if len(self._measurements) < self._min_measurements:
            return 0.0

        measurements_array = np.array(self._measurements)
        mean = np.mean(measurements_array)
        std_dev = np.std(measurements_array)

        # Avoid division by zero
        if mean == 0:
            return float('inf')

        cv = std_dev / mean
        return float(cv)

    def _is_frame_stable(self, cv: float) -> bool:
        """Determine if current frame meets stability threshold.

        A frame is stable if:
        1. We have enough measurements for reliable CV calculation
        2. The coefficient of variation is below threshold

        Args:
            cv: Current coefficient of variation.

        Returns:
            True if frame is stable, False otherwise.
        """
        if len(self._measurements) < self._min_measurements:
            return False

        return cv <= self._cv_threshold

    def _calculate_stability_score(self, cv: float, is_stable: bool) -> float:
        """Generate normalized stability score for UI feedback (0.0-1.0).

        Score combines multiple factors:
        - CV-based stability: Inverse relationship (lower CV = higher score)
        - Frame stability: Binary boost when threshold is met
        - Progress toward lock: Partial credit based on stable frame count

        The score increases as:
        1. CV decreases (measurements become more consistent)
        2. Frame passes stability threshold
        3. Stable frames accumulate toward the 30-frame lock threshold

        Returns:
            Score from 0.0 (completely unstable) to 1.0 (locked).
        """
        if self._is_locked:
            return 1.0

        # CV-based component (0-0.7): Lower CV is better
        # Map CV from threshold to 0 -> 0.7 to 0.0
        # cv=0 -> 0.7, cv=threshold -> 0.35, cv>threshold -> lower
        cv_component = max(0.0, (self._cv_threshold - cv) / self._cv_threshold * 0.7)

        # Frame stability component (0.15): Binary boost
        stability_component = 0.15 if is_stable else 0.0

        # Progress component (0-0.15): Accumulation toward lock
        progress = min(self._stable_frame_count / self._stable_frame_threshold, 1.0)
        progress_component = progress * 0.15

        score = cv_component + stability_component + progress_component
        return float(np.clip(score, 0.0, 1.0))

    def _generate_warnings(self, cv: float, is_stable: bool) -> List[str]:
        """Generate diagnostic warnings about measurement quality.

        Args:
            cv: Current coefficient of variation.
            is_stable: Whether current frame is stable.

        Returns:
            List of warning strings for debugging and diagnostics.
        """
        warnings = []

        if len(self._measurements) < self._min_measurements:
            warnings.append(
                f"Insufficient measurements ({len(self._measurements)}/{self._min_measurements}) "
                "for stability evaluation"
            )

        if not is_stable and len(self._measurements) >= self._min_measurements:
            warnings.append(
                f"Unstable frame: CV={cv:.4f} exceeds threshold={self._cv_threshold:.4f}"
            )

            if self._stable_frame_count > 0:
                warnings.append(
                    f"Stability counter reset (was {self._stable_frame_count})"
                )

        if self._stable_frame_count > 0 and self._stable_frame_count < 5:
            warnings.append(
                f"Early in stability phase ({self._stable_frame_count}/"
                f"{self._stable_frame_threshold} frames)"
            )

        return warnings
