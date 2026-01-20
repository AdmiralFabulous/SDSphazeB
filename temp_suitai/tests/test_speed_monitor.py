"""
Tests for Rotation Speed Monitor

Tests the speed monitoring module that extracts rotation velocity
from OneEuro filter state.
"""

import pytest
import numpy as np
from datetime import datetime, timedelta
from vision_service.filtering.one_euro_filter import OneEuroFilter, OneEuroFilterConfig
from vision_service.filtering.speed_monitor import RotationSpeedMonitor


class TestRotationSpeedMonitor:
    """Test suite for RotationSpeedMonitor class."""

    def test_initialization(self):
        """Test monitor initialization."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        assert monitor.filter is filter_obj
        assert monitor.get_last_speed() == 0.0

    def test_zero_speed_when_no_state(self):
        """Test that speed is zero when filter has no state."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        speed = monitor.get_rotation_speed()
        assert speed == 0.0

    def test_speed_calculation_from_filter_state(self):
        """Test speed calculation from filter velocity estimates."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        # Feed some data to the filter
        base_time = datetime.now()
        values = np.array([0.0, 0.0, 0.0])

        # First frame
        filter_obj.filter(values, base_time)

        # Second frame with rotation (0.5 radians change over 0.033s = ~15 rad/s)
        values = np.array([0.5, 0.0, 0.0])
        filter_obj.filter(values, base_time + timedelta(milliseconds=33))

        # Get speed
        speed = monitor.get_rotation_speed()

        # Speed should be non-zero and in degrees
        assert speed > 0.0
        assert isinstance(speed, float)

    def test_speed_increases_with_faster_rotation(self):
        """Test that faster rotation produces higher speed values."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        base_time = datetime.now()

        # Slow rotation
        filter_obj.filter(np.array([0.0, 0.0, 0.0]), base_time)
        filter_obj.filter(np.array([0.1, 0.0, 0.0]), base_time + timedelta(milliseconds=33))
        slow_speed = monitor.get_rotation_speed()

        # Reset filter
        filter_obj.reset()

        # Fast rotation
        filter_obj.filter(np.array([0.0, 0.0, 0.0]), base_time)
        filter_obj.filter(np.array([0.5, 0.0, 0.0]), base_time + timedelta(milliseconds=33))
        fast_speed = monitor.get_rotation_speed()

        assert fast_speed > slow_speed

    def test_get_last_speed(self):
        """Test that get_last_speed returns cached value."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        # Calculate speed
        base_time = datetime.now()
        filter_obj.filter(np.array([0.0, 0.0, 0.0]), base_time)
        filter_obj.filter(np.array([0.5, 0.0, 0.0]), base_time + timedelta(milliseconds=33))

        speed1 = monitor.get_rotation_speed()
        speed2 = monitor.get_last_speed()

        assert speed1 == speed2

    def test_is_speed_safe_with_default_threshold(self):
        """Test speed safety check with default threshold (30 deg/s)."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        # Manually set a low speed
        monitor._last_speed = 25.0
        assert monitor.is_speed_safe() is True

        # Set a high speed
        monitor._last_speed = 35.0
        assert monitor.is_speed_safe() is False

    def test_is_speed_safe_with_custom_threshold(self):
        """Test speed safety check with custom threshold."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        monitor._last_speed = 40.0

        # Should be safe with high threshold
        assert monitor.is_speed_safe(threshold=50.0) is True

        # Should be unsafe with low threshold
        assert monitor.is_speed_safe(threshold=30.0) is False

    def test_get_speed_warning_when_safe(self):
        """Test that no warning is returned when speed is safe."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        monitor._last_speed = 25.0
        warning = monitor.get_speed_warning(threshold=30.0)

        assert warning is None

    def test_get_speed_warning_when_unsafe(self):
        """Test that warning message is returned when speed exceeds threshold."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        monitor._last_speed = 45.0
        warning = monitor.get_speed_warning(threshold=30.0)

        assert warning is not None
        assert isinstance(warning, str)
        assert "45.0" in warning
        assert "30" in warning
        assert "slow down" in warning.lower()

    def test_multi_axis_rotation_speed(self):
        """Test speed calculation with rotation in multiple axes."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        base_time = datetime.now()

        # Rotation in all three axes
        filter_obj.filter(np.array([0.0, 0.0, 0.0]), base_time)
        filter_obj.filter(
            np.array([0.3, 0.4, 0.0]),
            base_time + timedelta(milliseconds=33)
        )

        speed = monitor.get_rotation_speed()

        # Speed should account for combined rotation (L2 norm)
        assert speed > 0.0

    def test_speed_in_degrees(self):
        """Test that speed is returned in degrees per second."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        base_time = datetime.now()

        # 1 radian change over 1 second = ~57.3 degrees/second
        filter_obj.filter(np.array([0.0]), base_time)
        filter_obj.filter(np.array([1.0]), base_time + timedelta(seconds=1))

        speed = monitor.get_rotation_speed()

        # Should be approximately 57.3 degrees/second
        assert 50.0 < speed < 65.0

    def test_consecutive_speed_calculations(self):
        """Test multiple consecutive speed calculations."""
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        monitor = RotationSpeedMonitor(filter_obj)

        base_time = datetime.now()

        speeds = []
        for i in range(5):
            values = np.array([i * 0.1, 0.0, 0.0])
            filter_obj.filter(values, base_time + timedelta(milliseconds=33 * i))
            speeds.append(monitor.get_rotation_speed())

        # All speeds should be calculated
        assert len(speeds) == 5
        assert all(isinstance(s, float) for s in speeds)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
