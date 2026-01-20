"""
Unit tests for measurement locking functionality.

Tests verify:
- Frame counting and stability detection
- 300-frame lock threshold
- Geometric median computation
- Universal Measurement ID generation
- Progress/confidence reporting
"""

import numpy as np
import pytest
from datetime import datetime
from vision_service.filtering.measurement_lock import (
    MeasurementLock,
    MeasurementLockConfig,
    MeasurementLockState,
)


class TestMeasurementLockConfig:
    """Test configuration options."""

    def test_default_config(self):
        """Test default configuration values."""
        config = MeasurementLockConfig()
        assert config.lock_frame_threshold == 300
        assert config.stability_window_size == 20
        assert config.cv_threshold == 0.05
        assert config.geometric_median_iterations == 100
        assert config.geometric_median_tolerance == 1e-6

    def test_custom_config(self):
        """Test custom configuration."""
        config = MeasurementLockConfig(
            lock_frame_threshold=100,
            cv_threshold=0.1,
        )
        assert config.lock_frame_threshold == 100
        assert config.cv_threshold == 0.1
        assert config.stability_window_size == 20  # Still default


class TestMeasurementLockState:
    """Test state tracking."""

    def test_initial_state(self):
        """Test initial lock state."""
        state = MeasurementLockState()
        assert state.is_locked is False
        assert state.frame_count == 0
        assert state.stable_frame_count == 0
        assert state.measurements == []
        assert state.locked_measurements is None
        assert state.geometric_median is None
        assert state.universal_measurement_id is None
        assert state.stability_score == 0.0
        assert state.confidence == 0.0
        assert isinstance(state.timestamp, datetime)
        assert state.warnings == []
        assert state.metadata == {}


class TestMeasurementLockBasic:
    """Test basic measurement lock functionality."""

    def test_initialization(self):
        """Test measurement lock initialization."""
        lock = MeasurementLock()
        assert lock.state.is_locked is False
        assert lock.state.frame_count == 0
        assert lock.config.lock_frame_threshold == 300

    def test_add_measurement_basic(self):
        """Test adding a single measurement."""
        lock = MeasurementLock()
        measurement = np.array([1.0, 2.0, 3.0])

        state = lock.add_measurement(measurement)

        assert state.frame_count == 1
        assert len(state.measurements) == 1
        assert np.allclose(state.measurements[0], measurement)

    def test_invalid_measurement_2d(self):
        """Test that 2D measurements are rejected."""
        lock = MeasurementLock()
        measurement = np.array([[1.0, 2.0], [3.0, 4.0]])

        with pytest.raises(ValueError, match="must be 1D"):
            lock.add_measurement(measurement)

    def test_invalid_measurement_nan(self):
        """Test that NaN measurements are rejected."""
        lock = MeasurementLock()
        measurement = np.array([1.0, np.nan, 3.0])

        with pytest.raises(ValueError, match="NaN or infinite"):
            lock.add_measurement(measurement)

    def test_invalid_measurement_inf(self):
        """Test that infinite measurements are rejected."""
        lock = MeasurementLock()
        measurement = np.array([1.0, np.inf, 3.0])

        with pytest.raises(ValueError, match="NaN or infinite"):
            lock.add_measurement(measurement)


class TestStabilityDetection:
    """Test stability detection and frame counting."""

    def test_frame_count_accumulation(self):
        """Test that frame count increases with each measurement."""
        lock = MeasurementLock()
        stable_measurement = np.array([1.0, 2.0, 3.0])

        for i in range(50):
            state = lock.add_measurement(stable_measurement)
            assert state.frame_count == i + 1

    def test_stability_score_increases(self):
        """Test that stability score increases with stable measurements."""
        lock = MeasurementLock(MeasurementLockConfig(lock_frame_threshold=50))
        stable_measurement = np.array([1.0, 2.0, 3.0])

        scores = []
        for _ in range(50):
            state = lock.add_measurement(stable_measurement)
            scores.append(state.stability_score)

        # Scores should be monotonically increasing (or stay the same)
        for i in range(1, len(scores)):
            assert scores[i] >= scores[i - 1]

    def test_stability_resets_on_variance(self):
        """Test that stable frame count resets when variance is high."""
        config = MeasurementLockConfig(
            lock_frame_threshold=100,
            stability_window_size=5,
            cv_threshold=0.01,
        )
        lock = MeasurementLock(config)

        # Add stable measurements
        for _ in range(20):
            lock.add_measurement(np.array([1.0, 2.0, 3.0]))

        stable_count_before = lock.state.stable_frame_count

        # Add highly variable measurement
        lock.add_measurement(np.array([10.0, 20.0, 30.0]))

        # Stable count should reset
        assert lock.state.stable_frame_count < stable_count_before


class TestGeometricMedian:
    """Test geometric median computation."""

    def test_geometric_median_single_point(self):
        """Test geometric median of a single point."""
        lock = MeasurementLock()
        measurements = np.array([[1.0, 2.0, 3.0]])

        median = lock._compute_geometric_median(measurements)

        assert np.allclose(median, [1.0, 2.0, 3.0])

    def test_geometric_median_identical_points(self):
        """Test geometric median of identical points."""
        lock = MeasurementLock()
        measurements = np.tile([1.0, 2.0, 3.0], (10, 1))

        median = lock._compute_geometric_median(measurements)

        assert np.allclose(median, [1.0, 2.0, 3.0])

    def test_geometric_median_symmetric(self):
        """Test geometric median of symmetric distribution."""
        lock = MeasurementLock()
        measurements = np.array([
            [0.0, 0.0],
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
        ])

        median = lock._compute_geometric_median(measurements)

        # Median should be at center [0.5, 0.5]
        assert np.allclose(median, [0.5, 0.5], atol=0.1)

    def test_geometric_median_outlier_robustness(self):
        """Test that geometric median is robust to outliers."""
        lock = MeasurementLock()

        # Create measurements with one outlier
        measurements = np.array([
            [1.0, 1.0],
            [1.1, 1.0],
            [0.9, 1.0],
            [1.0, 1.1],
            [1.0, 0.9],
            [100.0, 100.0],  # Outlier
        ])

        median = lock._compute_geometric_median(measurements)

        # Median should be close to [1.0, 1.0] despite outlier
        assert np.allclose(median, [1.0, 1.0], atol=0.2)


class TestMeasurementLocking:
    """Test the 300-frame lock threshold."""

    def test_lock_after_300_stable_frames(self):
        """Test that lock occurs after 300 stable frames."""
        config = MeasurementLockConfig(lock_frame_threshold=10)  # Use smaller threshold for testing
        lock = MeasurementLock(config)
        stable_measurement = np.array([1.0, 2.0, 3.0])

        # Add measurements up to threshold
        for i in range(9):
            state = lock.add_measurement(stable_measurement)
            assert state.is_locked is False

        # One more should trigger lock
        state = lock.add_measurement(stable_measurement)
        assert state.is_locked is True

    def test_locked_measurements_captured(self):
        """Test that measurements are captured at lock time."""
        config = MeasurementLockConfig(lock_frame_threshold=5, cv_threshold=0.2)
        lock = MeasurementLock(config)

        measurements = [
            np.array([1.0, 2.0, 3.0]),
            np.array([1.01, 2.01, 3.01]),
            np.array([0.99, 1.99, 2.99]),
            np.array([1.0, 2.0, 3.0]),
            np.array([1.0, 2.0, 3.0]),
        ]

        for measurement in measurements:
            state = lock.add_measurement(measurement)

        assert state.is_locked is True
        assert state.locked_measurements is not None
        assert len(state.locked_measurements) == 5

    def test_geometric_median_at_lock(self):
        """Test that geometric median is computed at lock time."""
        config = MeasurementLockConfig(lock_frame_threshold=3)
        lock = MeasurementLock(config)

        measurements = [
            np.array([1.0, 2.0]),
            np.array([1.0, 2.0]),
            np.array([1.0, 2.0]),
        ]

        for measurement in measurements:
            state = lock.add_measurement(measurement)

        assert state.is_locked is True
        assert state.geometric_median is not None
        assert np.allclose(state.geometric_median, [1.0, 2.0])


class TestUniversalMeasurementID:
    """Test Universal Measurement ID generation."""

    def test_id_generated_at_lock(self):
        """Test that ID is generated when lock occurs."""
        config = MeasurementLockConfig(lock_frame_threshold=2)
        lock = MeasurementLock(config)

        state = lock.add_measurement(np.array([1.0, 2.0]))
        assert state.universal_measurement_id is None

        state = lock.add_measurement(np.array([1.0, 2.0]))
        assert state.universal_measurement_id is not None

    def test_id_format(self):
        """Test that ID follows expected format."""
        config = MeasurementLockConfig(lock_frame_threshold=1)
        lock = MeasurementLock(config)

        lock.add_measurement(np.array([1.0, 2.0]))
        state = lock.state

        assert state.universal_measurement_id.startswith("UMI_")
        parts = state.universal_measurement_id.split("_")
        assert len(parts) == 4  # UMI, timestamp, hash, random

    def test_id_uniqueness(self):
        """Test that different locks generate different IDs."""
        config = MeasurementLockConfig(lock_frame_threshold=1)

        lock1 = MeasurementLock(config)
        lock1.add_measurement(np.array([1.0, 2.0]))
        id1 = lock1.state.universal_measurement_id

        lock2 = MeasurementLock(config)
        lock2.add_measurement(np.array([1.0, 2.0]))
        id2 = lock2.state.universal_measurement_id

        # IDs should be different (due to random component and timestamp)
        assert id1 != id2


class TestProgressAndConfidence:
    """Test progress tracking and confidence scoring."""

    def test_progress_before_lock(self):
        """Test progress reporting before lock."""
        config = MeasurementLockConfig(lock_frame_threshold=100)
        lock = MeasurementLock(config)

        for i in range(50):
            lock.add_measurement(np.array([1.0, 2.0, 3.0]))

        progress, threshold = lock.get_progress()
        assert progress == 50
        assert threshold == 100

    def test_confidence_at_lock(self):
        """Test that confidence is set when locked."""
        config = MeasurementLockConfig(lock_frame_threshold=5)
        lock = MeasurementLock(config)

        for _ in range(5):
            lock.add_measurement(np.array([1.0, 2.0, 3.0]))

        assert lock.state.confidence > 0.0
        assert lock.state.confidence <= 1.0

    def test_confidence_increases_with_stability(self):
        """Test that confidence increases with stable measurements."""
        config = MeasurementLockConfig(lock_frame_threshold=50)
        lock = MeasurementLock(config)

        confidences = []
        for _ in range(50):
            state = lock.add_measurement(np.array([1.0, 2.0, 3.0]))
            if state.is_locked:
                confidences.append(state.confidence)

        if confidences:
            # Confidence should be reasonable after locking
            assert confidences[-1] > 0.5


class TestReset:
    """Test reset functionality."""

    def test_reset_clears_state(self):
        """Test that reset clears all state."""
        config = MeasurementLockConfig(lock_frame_threshold=3)
        lock = MeasurementLock(config)

        # Add measurements
        for _ in range(3):
            lock.add_measurement(np.array([1.0, 2.0, 3.0]))

        assert lock.state.is_locked is True

        # Reset
        lock.reset()

        assert lock.state.is_locked is False
        assert lock.state.frame_count == 0
        assert lock.state.measurements == []
        assert lock.state.locked_measurements is None

    def test_reset_allows_new_cycle(self):
        """Test that reset allows starting a new measurement cycle."""
        config = MeasurementLockConfig(lock_frame_threshold=2)
        lock = MeasurementLock(config)

        # First cycle
        lock.add_measurement(np.array([1.0, 2.0]))
        lock.add_measurement(np.array([1.0, 2.0]))
        id1 = lock.state.universal_measurement_id

        # Reset and second cycle
        lock.reset()
        lock.add_measurement(np.array([3.0, 4.0]))
        lock.add_measurement(np.array([3.0, 4.0]))
        id2 = lock.state.universal_measurement_id

        assert id1 != id2


class TestMetadata:
    """Test metadata tracking."""

    def test_metadata_at_lock(self):
        """Test that metadata is recorded at lock time."""
        config = MeasurementLockConfig(lock_frame_threshold=5)
        lock = MeasurementLock(config)

        for _ in range(5):
            lock.add_measurement(np.array([1.0, 2.0, 3.0]))

        metadata = lock.state.metadata
        assert "num_measurements" in metadata
        assert "frame_count_at_lock" in metadata
        assert "stable_frames" in metadata
        assert "measurement_dimension" in metadata

        assert metadata["num_measurements"] == 5
        assert metadata["frame_count_at_lock"] == 5
        assert metadata["stable_frames"] == 5
        assert metadata["measurement_dimension"] == 3


class TestGetters:
    """Test getter methods."""

    def test_get_locked_measurements(self):
        """Test getting locked measurements."""
        config = MeasurementLockConfig(lock_frame_threshold=2)
        lock = MeasurementLock(config)

        assert lock.get_locked_measurements() is None

        lock.add_measurement(np.array([1.0, 2.0]))
        lock.add_measurement(np.array([1.0, 2.0]))

        measurements = lock.get_locked_measurements()
        assert measurements is not None
        assert len(measurements) == 2

    def test_get_geometric_median(self):
        """Test getting geometric median."""
        config = MeasurementLockConfig(lock_frame_threshold=2)
        lock = MeasurementLock(config)

        assert lock.get_geometric_median() is None

        lock.add_measurement(np.array([1.0, 2.0]))
        lock.add_measurement(np.array([1.0, 2.0]))

        median = lock.get_geometric_median()
        assert median is not None
        assert np.allclose(median, [1.0, 2.0])

    def test_get_universal_id(self):
        """Test getting Universal Measurement ID."""
        config = MeasurementLockConfig(lock_frame_threshold=1)
        lock = MeasurementLock(config)

        assert lock.get_universal_id() is None

        lock.add_measurement(np.array([1.0, 2.0]))

        uid = lock.get_universal_id()
        assert uid is not None
        assert uid.startswith("UMI_")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
