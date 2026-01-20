# -*- coding: utf-8 -*-
"""
Rotation Speed Monitor - Extract rotation speed from filtered pose parameters.

This module monitors rotation speed by analyzing velocity estimates from the
OneEuro filter. It converts angular velocity to degrees per second for
monitoring and warning purposes.
"""

from typing import Optional
import numpy as np
from .one_euro_filter import OneEuroFilter


class RotationSpeedMonitor:
    """Monitors rotation speed from filtered pose parameters."""

    def __init__(self, filter: OneEuroFilter):
        """
        Initialize the rotation speed monitor.

        Args:
            filter: OneEuroFilter instance used for pose filtering
        """
        self.filter = filter
        self._last_speed: float = 0.0

    def get_rotation_speed(self) -> float:
        """
        Extract rotation speed from OneEuro filter state.

        The rotation speed is calculated from the velocity estimates (dx values)
        stored in the filter state. These represent the rate of change of rotation
        parameters over time.

        Returns:
            Rotation speed in degrees per second
        """
        state = self.filter.get_state()

        if not state:
            return 0.0

        # Calculate speed from velocity estimates (dx values)
        # Assuming rotation parameters are in radians
        velocities = [ch['dx'] for ch in state.values()]

        if not velocities:
            return 0.0

        # Convert to degrees per second and take magnitude
        # Using L2 norm to get overall rotation speed
        speed_rad = np.linalg.norm(velocities)
        speed_deg = np.degrees(speed_rad)

        self._last_speed = speed_deg
        return speed_deg

    def get_last_speed(self) -> float:
        """
        Get the last calculated speed without recalculating.

        Returns:
            Last rotation speed in degrees per second
        """
        return self._last_speed

    def is_speed_safe(self, threshold: float = 30.0) -> bool:
        """
        Check if current rotation speed is within safe limits.

        Args:
            threshold: Maximum safe speed in degrees per second (default: 30)

        Returns:
            True if speed is safe, False if it exceeds threshold
        """
        current_speed = self.get_rotation_speed()
        return current_speed <= threshold

    def get_speed_warning(self, threshold: float = 30.0) -> Optional[str]:
        """
        Get a warning message if speed exceeds threshold.

        Args:
            threshold: Maximum safe speed in degrees per second (default: 30)

        Returns:
            Warning message if speed exceeds threshold, None otherwise
        """
        current_speed = self.get_rotation_speed()

        if current_speed > threshold:
            return (
                f"Rotation speed ({current_speed:.1f} deg/s) exceeds safe limit "
                f"({threshold} deg/s). Please slow down."
            )

        return None
