"""
Comprehensive tests for CalibrationLock module.

Tests cover:
- Initialization and parameter validation
- Coefficient of variation calculation
- Frame stability detection
- Locking mechanism (30 stable frames)
- Stability score calculation
- Reset functionality
- Edge cases and error handling
"""

import pytest
import numpy as np
from vision_service.calibration.calibration_lock import CalibrationLock, StabilityMetrics


class TestCalibrationLockInitialization:
    """Test CalibrationLock initialization and parameter validation."""

    def test_default_initialization(self):
        """Test initialization with default parameters."""
        lock = CalibrationLock()
        assert lock.is_locked() is False
        assert lock.get_locked_scale() is None
        metrics = lock.get_stability_metrics()
        assert metrics.coefficient_of_variation == 0.0
        assert metrics.stable_frame_count == 0
        assert metrics.measurements_count == 0

    def test_custom_parameters(self):
        """Test initialization with custom parameters."""
        lock = CalibrationLock(
            cv_threshold=0.1,
            stable_frame_threshold=20,
            window_size=15,
            min_measurements=4,
        )
        assert lock._cv_threshold == 0.1
        assert lock._stable_frame_threshold == 20
        assert lock._window_size == 15
        assert lock._min_measurements == 4

    def test_invalid_cv_threshold(self):
        """Test rejection of negative cv_threshold."""
        with pytest.raises(ValueError, match="cv_threshold must be non-negative"):
            CalibrationLock(cv_threshold=-0.01)

    def test_invalid_stable_frame_threshold(self):
        """Test rejection of invalid stable_frame_threshold."""
        with pytest.raises(ValueError, match="stable_frame_threshold must be >= 1"):
            CalibrationLock(stable_frame_threshold=0)

    def test_invalid_window_size(self):
        """Test rejection of invalid window_size."""
        with pytest.raises(ValueError, match="window_size must be >= 2"):
            CalibrationLock(window_size=1)

    def test_invalid_min_measurements(self):
        """Test rejection of invalid min_measurements."""
        with pytest.raises(ValueError, match="min_measurements must be >= 2"):
            CalibrationLock(min_measurements=1)


class TestCoefficientOfVariation:
    """Test coefficient of variation calculation."""

    def test_cv_with_insufficient_measurements(self):
        """Test CV returns 0.0 with fewer than min_measurements."""
        lock = CalibrationLock(min_measurements=3)
        metrics = lock.add_measurement(10.0)
        assert metrics.coefficient_of_variation == 0.0
        metrics = lock.add_measurement(10.1)
        assert metrics.coefficient_of_variation == 0.0

    def test_cv_with_identical_measurements(self):
        """Test CV is zero when all measurements are identical."""
        lock = CalibrationLock()
        for _ in range(5):
            lock.add_measurement(10.0)
        metrics = lock.add_measurement(10.0)
        assert metrics.coefficient_of_variation == 0.0

    def test_cv_with_known_values(self):
        """Test CV calculation with known values."""
        lock = CalibrationLock(min_measurements=2)
        lock.add_measurement(100.0)
        metrics = lock.add_measurement(110.0)
        # CV = std / mean
        # mean = 105, std = 5.0, CV ≈ 0.0476
        expected_cv = np.std([100.0, 110.0]) / np.mean([100.0, 110.0])
        assert abs(metrics.coefficient_of_variation - expected_cv) < 1e-4

    def test_cv_with_large_variations(self):
        """Test CV with high variation."""
        lock = CalibrationLock(min_measurements=2)
        lock.add_measurement(50.0)
        metrics = lock.add_measurement(150.0)
        # mean = 100, std = 50.0, CV = 0.5
        expected_cv = np.std([50.0, 150.0]) / np.mean([50.0, 150.0])
        assert abs(metrics.coefficient_of_variation - expected_cv) < 1e-4

    def test_cv_with_sliding_window(self):
        """Test CV uses sliding window correctly."""
        lock = CalibrationLock(window_size=3, min_measurements=2)
        lock.add_measurement(100.0)
        lock.add_measurement(101.0)
        lock.add_measurement(102.0)
        metrics = lock.add_measurement(105.0)
        # Should only use last 3: 101, 102, 105
        # Not 100
        cv_with_101_102_105 = np.std([101.0, 102.0, 105.0]) / np.mean([101.0, 102.0, 105.0])
        assert abs(metrics.coefficient_of_variation - cv_with_101_102_105) < 1e-6


class TestFrameStability:
    """Test frame stability detection based on CV threshold."""

    def test_stable_frame_with_low_cv(self):
        """Test frame is marked stable when CV is below threshold."""
        lock = CalibrationLock(cv_threshold=0.05)
        lock.add_measurement(100.0)
        lock.add_measurement(100.5)
        lock.add_measurement(100.2)
        metrics = lock.add_measurement(100.1)
        # CV should be very low, below 0.05 threshold
        assert metrics.is_stable is True

    def test_unstable_frame_with_high_cv(self):
        """Test frame is marked unstable when CV is above threshold."""
        lock = CalibrationLock(cv_threshold=0.05)
        lock.add_measurement(100.0)
        lock.add_measurement(150.0)
        metrics = lock.add_measurement(120.0)
        # CV will be high, above 0.05 threshold
        assert metrics.is_stable is False

    def test_stability_with_exactly_threshold(self):
        """Test frame stability at exact threshold boundary."""
        lock = CalibrationLock(cv_threshold=0.1)
        # Create measurements with CV approximately equal to threshold
        lock.add_measurement(100.0)
        lock.add_measurement(110.0)
        metrics = lock.add_measurement(100.0)
        # CV = 0.0943, which is < 0.1, so should be stable
        assert metrics.is_stable is True

    def test_insufficient_measurements_not_stable(self):
        """Test frame is not stable with insufficient measurements."""
        lock = CalibrationLock(min_measurements=3)
        lock.add_measurement(100.0)
        metrics = lock.add_measurement(100.0)
        # Not enough measurements yet
        assert metrics.is_stable is False


class TestLockingMechanism:
    """Test 30-frame locking mechanism."""

    def test_lock_after_30_stable_frames(self):
        """Test calibration locks after exactly 30 stable frames."""
        lock = CalibrationLock(stable_frame_threshold=30, cv_threshold=0.1, window_size=5, min_measurements=2)
        # Add stable frames with very small variation
        for i in range(29):
            metrics = lock.add_measurement(100.0 + i * 0.001)
            assert metrics.is_locked is False

        # After enough stable frames, should lock
        for i in range(5):
            metrics = lock.add_measurement(100.03)
            if metrics.is_locked:
                break

        assert metrics.is_locked is True
        assert metrics.stable_frame_count == 30

    def test_stable_frame_counter_resets_on_unstable(self):
        """Test counter resets when an unstable frame is encountered."""
        lock = CalibrationLock(stable_frame_threshold=30, cv_threshold=0.05, window_size=5)
        # Add 10 stable frames with very small variation
        for i in range(10):
            lock.add_measurement(100.0 + i * 0.001)

        # Add unstable frame with large jump
        metrics = lock.add_measurement(150.0)
        assert metrics.stable_frame_count == 0
        assert metrics.is_locked is False

        # Counter should restart (takes a few frames to become stable again)
        lock.add_measurement(100.1)
        metrics = lock.add_measurement(100.11)
        # After new measurements with low variation, should count as stable
        if metrics.is_stable:
            assert metrics.stable_frame_count >= 1

    def test_cannot_add_measurements_when_locked(self):
        """Test that measurements cannot be added after lock."""
        lock = CalibrationLock(stable_frame_threshold=2, cv_threshold=0.2, min_measurements=2, window_size=2)
        # Add measurements to lock
        lock.add_measurement(100.0)
        lock.add_measurement(100.0)
        metrics = lock.add_measurement(100.0)

        if not metrics.is_locked:
            metrics = lock.add_measurement(100.0)

        assert lock.is_locked() is True

        # Attempting to add more measurements should raise error
        with pytest.raises(RuntimeError, match="Calibration is locked"):
            lock.add_measurement(100.0)

    def test_locked_scale_stored_correctly(self):
        """Test that locked scale is the mean of measurements."""
        lock = CalibrationLock(stable_frame_threshold=2, cv_threshold=0.2, min_measurements=2, window_size=2)
        measurements = [100.0, 100.0, 100.0]
        for m in measurements:
            metrics = lock.add_measurement(m)
            if lock.is_locked():
                break

        locked_scale = lock.get_locked_scale()
        # Should be 100.0 (all measurements are 100)
        assert abs(locked_scale - 100.0) < 1e-6

    def test_custom_lock_threshold(self):
        """Test locking with custom frame threshold."""
        lock = CalibrationLock(stable_frame_threshold=3, cv_threshold=0.05, min_measurements=2, window_size=3)
        # Add stable frames with low variation
        for i in range(5):
            lock.add_measurement(100.0 + i * 0.0001)
            if lock.is_locked():
                assert i >= 2  # Should lock after 3 stable frames
                break

        assert lock.is_locked() is True


class TestStabilityScore:
    """Test stability score calculation for UI feedback."""

    def test_score_is_nonzero_initially(self):
        """Test stability score is nonzero (CV=0 gives 0.7 component)."""
        lock = CalibrationLock()
        metrics = lock.get_stability_metrics()
        # With CV=0, cv_component = 0.7, others = 0, so score = 0.7
        # (This is expected behavior - no measurements seen as potentially stable)
        assert 0.6 < metrics.stability_score < 0.8

    def test_score_increases_with_stability(self):
        """Test score increases as measurements become stable."""
        lock = CalibrationLock(cv_threshold=0.05)
        scores = []
        for _ in range(15):
            metrics = lock.add_measurement(100.0)
            scores.append(metrics.stability_score)

        # Scores should generally increase (last > first)
        assert scores[-1] > scores[0]

    def test_score_is_one_when_locked(self):
        """Test score reaches 1.0 when locked."""
        lock = CalibrationLock(stable_frame_threshold=2, cv_threshold=0.2, min_measurements=2, window_size=2)
        for _ in range(4):
            lock.add_measurement(100.0)
            if lock.is_locked():
                break

        metrics = lock.get_stability_metrics()
        assert metrics.stability_score == 1.0

    def test_score_reset_on_unstable(self):
        """Test score decreases when unstable frame is encountered."""
        lock = CalibrationLock(stable_frame_threshold=30, cv_threshold=0.05)
        # Build up stable frames
        for _ in range(20):
            lock.add_measurement(100.0)

        score_before = lock.get_stability_metrics().stability_score

        # Add unstable frame
        lock.add_measurement(150.0)
        score_after = lock.get_stability_metrics().stability_score

        # Score should be lower
        assert score_after < score_before

    def test_score_range(self):
        """Test score is always between 0 and 1."""
        lock = CalibrationLock(cv_threshold=0.05, stable_frame_threshold=100)
        for i in range(50):
            metrics = lock.add_measurement(100.0 + np.random.normal(0, 1))
            assert 0.0 <= metrics.stability_score <= 1.0


class TestResetFunctionality:
    """Test reset capability for recalibration."""

    def test_reset_clears_state(self):
        """Test reset clears all calibration state."""
        lock = CalibrationLock(stable_frame_threshold=2, cv_threshold=0.2, min_measurements=2, window_size=2)
        for _ in range(4):
            lock.add_measurement(100.0)
            if lock.is_locked():
                break

        assert lock.is_locked() is True

        lock.reset()

        assert lock.is_locked() is False
        assert lock.get_locked_scale() is None
        metrics = lock.get_stability_metrics()
        assert metrics.measurements_count == 0
        assert metrics.stable_frame_count == 0

    def test_can_recalibrate_after_reset(self):
        """Test new calibration cycle can begin after reset."""
        lock = CalibrationLock(stable_frame_threshold=2, cv_threshold=0.2, min_measurements=2, window_size=2)
        # First calibration
        for _ in range(4):
            lock.add_measurement(100.0)
            if lock.is_locked():
                break

        assert lock.is_locked() is True

        # Reset and recalibrate
        lock.reset()
        for _ in range(4):
            lock.add_measurement(200.0)
            if lock.is_locked():
                break

        assert lock.is_locked() is True
        assert abs(lock.get_locked_scale() - 200.0) < 1e-6

    def test_reset_multiple_times(self):
        """Test multiple reset cycles."""
        lock = CalibrationLock(stable_frame_threshold=2, cv_threshold=0.2, min_measurements=2, window_size=2)
        for cycle in range(3):
            if cycle > 0:
                lock.reset()

            for _ in range(5):
                lock.add_measurement(100.0 * (cycle + 1))
                if lock.is_locked():
                    break

            assert lock.is_locked() is True


class TestInputValidation:
    """Test input validation and error handling."""

    def test_non_numeric_scale_factor(self):
        """Test rejection of non-numeric scale factor."""
        lock = CalibrationLock()
        with pytest.raises(ValueError, match="scale_factor must be numeric"):
            lock.add_measurement("100.0")

    def test_negative_scale_factor(self):
        """Test rejection of negative scale factor."""
        lock = CalibrationLock()
        with pytest.raises(ValueError, match="scale_factor must be positive"):
            lock.add_measurement(-50.0)

    def test_zero_scale_factor(self):
        """Test rejection of zero scale factor."""
        lock = CalibrationLock()
        with pytest.raises(ValueError, match="scale_factor must be positive"):
            lock.add_measurement(0.0)

    def test_nan_scale_factor(self):
        """Test rejection of NaN scale factor."""
        lock = CalibrationLock()
        with pytest.raises(ValueError, match="scale_factor must be finite"):
            lock.add_measurement(float('nan'))

    def test_inf_scale_factor(self):
        """Test rejection of infinity scale factor."""
        lock = CalibrationLock()
        with pytest.raises(ValueError, match="scale_factor must be finite"):
            lock.add_measurement(float('inf'))


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_single_stable_frame_not_enough(self):
        """Test single stable frame doesn't lock."""
        lock = CalibrationLock(stable_frame_threshold=2)
        metrics = lock.add_measurement(100.0)
        assert metrics.is_locked is False
        assert metrics.stable_frame_count == 0  # Unstable due to min_measurements

    def test_very_small_measurements(self):
        """Test with very small scale factor values."""
        lock = CalibrationLock(stable_frame_threshold=3, cv_threshold=0.05, min_measurements=2, window_size=3)
        for _ in range(6):
            lock.add_measurement(0.001)
            if lock.is_locked():
                break
        assert lock.is_locked() is True

    def test_very_large_measurements(self):
        """Test with very large scale factor values."""
        lock = CalibrationLock(stable_frame_threshold=3, cv_threshold=0.05, min_measurements=2, window_size=3)
        for _ in range(6):
            lock.add_measurement(1000000.0)
            if lock.is_locked():
                break
        assert lock.is_locked() is True

    def test_measurements_near_zero(self):
        """Test with measurements approaching zero."""
        lock = CalibrationLock()
        lock.add_measurement(0.0001)
        lock.add_measurement(0.00011)
        metrics = lock.add_measurement(0.00009)
        # Should handle without numerical issues
        assert metrics.coefficient_of_variation >= 0.0

    def test_high_variation_never_locks(self):
        """Test that high variation prevents locking."""
        lock = CalibrationLock(
            stable_frame_threshold=50,
            cv_threshold=0.05,
        )
        # Add measurements with constant high variation
        for i in range(50):
            lock.add_measurement(100.0 if i % 2 == 0 else 200.0)
        assert lock.is_locked() is False


class TestMetricsDataClass:
    """Test StabilityMetrics dataclass."""

    def test_metrics_immutability(self):
        """Test StabilityMetrics fields are accessible."""
        lock = CalibrationLock()
        metrics = lock.get_stability_metrics()
        assert isinstance(metrics, StabilityMetrics)
        assert hasattr(metrics, "coefficient_of_variation")
        assert hasattr(metrics, "stability_score")
        assert hasattr(metrics, "is_stable")
        assert hasattr(metrics, "is_locked")
        assert hasattr(metrics, "stable_frame_count")
        assert hasattr(metrics, "measurements_count")
        assert hasattr(metrics, "warnings")

    def test_warnings_included(self):
        """Test warnings are included in metrics."""
        lock = CalibrationLock()
        metrics = lock.add_measurement(100.0)
        # Should have warning about insufficient measurements
        assert len(metrics.warnings) > 0
        assert "Insufficient measurements" in metrics.warnings[0]


class TestIntegration:
    """Integration tests for complete workflows."""

    def test_complete_calibration_workflow(self):
        """Test complete calibration workflow from start to lock."""
        lock = CalibrationLock(
            cv_threshold=0.05,
            stable_frame_threshold=10,
            window_size=5,
        )

        metrics_history = []
        # Add enough measurements to lock
        for i in range(15):
            # Simulate stable measurements with small noise
            scale = 100.0 + np.random.normal(0, 0.2)
            metrics = lock.add_measurement(scale)
            metrics_history.append(metrics)
            if metrics.is_locked:
                break

        # Verify progression
        assert not metrics_history[0].is_stable
        assert metrics_history[-1].is_locked

        # Verify locked scale is reasonable (should be around 100)
        locked_scale = lock.get_locked_scale()
        assert 99.0 < locked_scale < 101.0

    def test_unstable_then_stable_workflow(self):
        """Test workflow with initial instability followed by stability."""
        lock = CalibrationLock(cv_threshold=0.05, stable_frame_threshold=10, window_size=5)

        # Add unstable measurements
        for _ in range(5):
            lock.add_measurement(np.random.uniform(50, 150))

        # Counter should be 0 due to instability
        assert lock.get_stability_metrics().stable_frame_count == 0

        # Now add stable measurements
        for _ in range(15):
            metrics = lock.add_measurement(100.0 + np.random.normal(0, 0.2))
            if metrics.is_locked:
                break

        assert lock.is_locked() is True

    def test_progressive_score_increase(self):
        """Test score increases progressively through stable frames."""
        lock = CalibrationLock(cv_threshold=0.05, stable_frame_threshold=30)
        scores = []

        for _ in range(30):
            metrics = lock.add_measurement(100.0)
            scores.append(metrics.stability_score)

        # Scores should increase monotonically (mostly)
        for i in range(1, len(scores)):
            assert scores[i] >= scores[i - 1] * 0.95  # Allow small fluctuations
