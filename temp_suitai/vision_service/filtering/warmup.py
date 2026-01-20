"""
Warm-up period module for stabilizing initial measurements.

This module implements warm-up period functionality that:
- Waits for 60 frames before considering beta measurements stable
- Provides beta_is_stable flag for downstream processing
- Tracks stability score for UI feedback
- Handles reset for new scans
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import numpy as np


@dataclass
class WarmupConfig:
    """Configuration for warm-up period behavior."""

    warmup_frame_threshold: int = 60
    """Number of frames required before considering beta stable."""


@dataclass
class WarmupState:
    """State of the warm-up system."""

    frame_count: int = 0
    """Total number of frames processed in current warm-up cycle."""

    beta_is_stable: bool = False
    """Whether the warm-up period is complete and beta is considered stable."""

    stability_score: float = 0.0
    """Progress toward stability (0.0-1.0) for UI feedback."""

    timestamp: datetime = field(default_factory=datetime.now)
    """Timestamp when warm-up state was last updated."""

    metadata: dict = field(default_factory=dict)
    """Additional metadata about the warm-up."""


class Warmup:
    """
    Implements warm-up period for beta stability.

    The warm-up period ensures that the measurement system has processed
    enough frames before considering beta measurements stable. This helps
    filter out transient noise and startup artifacts.
    """

    def __init__(self, config: Optional[WarmupConfig] = None):
        """
        Initialize warm-up module.

        Args:
            config: Configuration object. Uses defaults if None.
        """
        self.config = config or WarmupConfig()
        self.state = WarmupState()

    def update(self, measurement: np.ndarray) -> WarmupState:
        """
        Process a measurement frame and update warm-up state.

        Args:
            measurement: Measurement vector (typically 10D for beta parameters).

        Returns:
            Current WarmupState with stability flag and progress.

        Raises:
            ValueError: If measurement has invalid shape or contains NaN/inf.
        """
        # Validate input
        measurement = np.asarray(measurement, dtype=np.float32)
        if measurement.ndim != 1:
            raise ValueError(f"Measurement must be 1D, got shape {measurement.shape}")
        if not np.isfinite(measurement).all():
            raise ValueError("Measurement contains NaN or infinite values")

        # Increment frame count
        self.state.frame_count += 1

        # Update stability flag and score
        self._update_stability()

        self.state.timestamp = datetime.now()
        return self.state

    def _update_stability(self) -> None:
        """Compute and update stability metrics."""
        # Check if we've reached the warmup threshold
        frames_remaining = max(0, self.config.warmup_frame_threshold - self.state.frame_count)

        # Update stability score as progress (0.0 to 1.0)
        # Handle zero threshold case (immediate stability)
        if self.config.warmup_frame_threshold == 0:
            progress = 1.0
        else:
            progress = min(
                self.state.frame_count / self.config.warmup_frame_threshold,
                1.0
            )
        self.state.stability_score = progress

        # Set beta_is_stable flag when threshold is reached
        self.state.beta_is_stable = (self.state.frame_count >= self.config.warmup_frame_threshold)

        # Update metadata
        self.state.metadata = {
            "frames_remaining": frames_remaining,
            "progress_percent": int(progress * 100),
        }

    def reset(self) -> None:
        """Reset warm-up state for new measurement cycle."""
        self.state = WarmupState()

    def get_progress(self) -> tuple[int, int]:
        """
        Get progress toward warm-up completion.

        Returns:
            Tuple of (current_frames, required_frames).
        """
        return (self.state.frame_count, self.config.warmup_frame_threshold)

    def is_stable(self) -> bool:
        """
        Check if beta is considered stable.

        Returns:
            True if warm-up period is complete, False otherwise.
        """
        return self.state.beta_is_stable
