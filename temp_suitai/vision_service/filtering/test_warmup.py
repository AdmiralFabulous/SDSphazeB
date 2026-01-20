"""
Comprehensive tests for warm-up period module.

Tests cover:
- Basic warm-up progression
- Stability flag transitions
- Frame counting accuracy
- Reset functionality
- Progress tracking
- Input validation
- Edge cases
"""

import pytest
import numpy as np
from datetime import datetime
from warmup import Warmup, WarmupConfig, WarmupState


class TestWarmupConfig:
    """Test WarmupConfig initialization and validation."""

    def test_default_config(self):
        """Test default configuration values."""
        config = WarmupConfig()
        assert config.warmup_frame_threshold == 60

    def test_custom_config(self):
        """Test custom configuration values."""
        config = WarmupConfig(warmup_frame_threshold=30)
        assert config.warmup_frame_threshold == 30

    def test_config_with_zero_threshold(self):
        """Test that zero threshold is allowed (immediate stability)."""
        config = WarmupConfig(warmup_frame_threshold=0)
        assert config.warmup_frame_threshold == 0

    def test_config_with_large_threshold(self):
        """Test configuration with large threshold."""
        config = WarmupConfig(warmup_frame_threshold=300)
        assert config.warmup_frame_threshold == 300


class TestWarmupState:
    """Test WarmupState initialization."""

    def test_initial_state(self):
        """Test initial state values."""
        state = WarmupState()
        assert state.frame_count == 0
        assert state.beta_is_stable is False
        assert state.stability_score == 0.0
        assert isinstance(state.timestamp, datetime)
        assert isinstance(state.metadata, dict)
        assert len(state.metadata) == 0

    def test_state_dataclass_fields(self):
        """Test that state has all required fields."""
        state = WarmupState()
        assert hasattr(state, 'frame_count')
        assert hasattr(state, 'beta_is_stable')
        assert hasattr(state, 'stability_score')
        assert hasattr(state, 'timestamp')
        assert hasattr(state, 'metadata')


class TestWarmupInitialization:
    """Test Warmup class initialization."""

    def test_default_initialization(self):
        """Test initialization with default config."""
        warmup = Warmup()
        assert warmup.config.warmup_frame_threshold == 60
        assert warmup.state.frame_count == 0
        assert warmup.state.beta_is_stable is False
        assert warmup.state.stability_score == 0.0

    def test_custom_config_initialization(self):
        """Test initialization with custom config."""
        config = WarmupConfig(warmup_frame_threshold=30)
        warmup = Warmup(config)
        assert warmup.config.warmup_frame_threshold == 30
        assert warmup.state.frame_count == 0
        assert warmup.state.beta_is_stable is False

    def test_none_config_initialization(self):
        """Test that None config uses defaults."""
        warmup = Warmup(None)
        assert warmup.config.warmup_frame_threshold == 60


class TestWarmupBasicFunctionality:
    """Test basic warm-up progression."""

    def test_single_frame_update(self):
        """Test processing a single frame."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])
        state = warmup.update(measurement)

        assert state.frame_count == 1
        assert state.beta_is_stable is False
        assert state.stability_score == pytest.approx(1.0 / 60, rel=1e-6)

    def test_multiple_frames_update(self):
        """Test processing multiple frames."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for i in range(1, 31):
            state = warmup.update(measurement)
            assert state.frame_count == i
            assert state.beta_is_stable is False
            expected_score = min(i / 60, 1.0)
            assert state.stability_score == pytest.approx(expected_score, rel=1e-6)

    def test_warmup_completion(self):
        """Test transition to stable at 60 frames."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        # Process 59 frames
        for _ in range(59):
            state = warmup.update(measurement)
            assert state.beta_is_stable is False

        # Process 60th frame - should become stable
        state = warmup.update(measurement)
        assert state.frame_count == 60
        assert state.beta_is_stable is True
        assert state.stability_score == pytest.approx(1.0, rel=1e-6)

    def test_post_warmup_frames(self):
        """Test that stability persists after warm-up."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        # Process through warm-up
        for _ in range(60):
            warmup.update(measurement)

        # Process additional frames
        for i in range(61, 71):
            state = warmup.update(measurement)
            assert state.frame_count == i
            assert state.beta_is_stable is True
            assert state.stability_score == 1.0

    def test_zero_threshold_warmup(self):
        """Test warm-up with zero threshold (immediate stability)."""
        config = WarmupConfig(warmup_frame_threshold=0)
        warmup = Warmup(config)
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        state = warmup.update(measurement)
        assert state.frame_count == 1
        assert state.beta_is_stable is True
        assert state.stability_score == 1.0


class TestWarmupStabilityScore:
    """Test stability score computation."""

    def test_stability_score_progression(self):
        """Test that stability score increases linearly."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        expected_scores = [1.0 / 60 * i for i in range(1, 61)]

        for i, expected_score in enumerate(expected_scores):
            state = warmup.update(measurement)
            assert state.stability_score == pytest.approx(expected_score, rel=1e-6)

    def test_stability_score_capped_at_one(self):
        """Test that stability score doesn't exceed 1.0."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        # Process through warm-up and beyond
        for _ in range(100):
            state = warmup.update(measurement)

        assert state.stability_score <= 1.0
        assert state.stability_score == pytest.approx(1.0, rel=1e-6)

    def test_stability_score_custom_threshold(self):
        """Test stability score with custom threshold."""
        config = WarmupConfig(warmup_frame_threshold=30)
        warmup = Warmup(config)
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for i in range(1, 31):
            state = warmup.update(measurement)
            expected_score = i / 30
            assert state.stability_score == pytest.approx(expected_score, rel=1e-6)


class TestWarmupReset:
    """Test reset functionality."""

    def test_reset_after_warmup(self):
        """Test reset returns to initial state after warm-up."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        # Process through warm-up
        for _ in range(60):
            warmup.update(measurement)

        assert warmup.state.beta_is_stable is True
        assert warmup.state.frame_count == 60

        # Reset
        warmup.reset()

        assert warmup.state.frame_count == 0
        assert warmup.state.beta_is_stable is False
        assert warmup.state.stability_score == 0.0
        assert isinstance(warmup.state.timestamp, datetime)
        assert warmup.state.metadata == {}

    def test_reset_in_middle_of_warmup(self):
        """Test reset during warm-up period."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        # Process 30 frames
        for _ in range(30):
            warmup.update(measurement)

        assert warmup.state.frame_count == 30
        assert warmup.state.beta_is_stable is False

        # Reset
        warmup.reset()

        assert warmup.state.frame_count == 0
        assert warmup.state.beta_is_stable is False
        assert warmup.state.stability_score == 0.0

    def test_reset_and_restart(self):
        """Test that reset allows starting a new warm-up cycle."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        # First warm-up cycle
        for _ in range(60):
            warmup.update(measurement)

        assert warmup.state.beta_is_stable is True

        # Reset and start new cycle
        warmup.reset()

        for i in range(1, 11):
            state = warmup.update(measurement)
            assert state.frame_count == i
            assert state.beta_is_stable is False

    def test_multiple_reset_cycles(self):
        """Test multiple reset cycles."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for cycle in range(3):
            # Process warm-up
            for _ in range(60):
                warmup.update(measurement)

            assert warmup.state.beta_is_stable is True

            # Reset for next cycle
            warmup.reset()
            assert warmup.state.frame_count == 0


class TestWarmupProgress:
    """Test progress tracking."""

    def test_get_progress_initial(self):
        """Test progress tracking at start."""
        warmup = Warmup()
        current, required = warmup.get_progress()

        assert current == 0
        assert required == 60

    def test_get_progress_midway(self):
        """Test progress tracking during warm-up."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for i in range(1, 31):
            warmup.update(measurement)
            current, required = warmup.get_progress()
            assert current == i
            assert required == 60

    def test_get_progress_after_completion(self):
        """Test progress tracking after warm-up completion."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(65):
            warmup.update(measurement)

        current, required = warmup.get_progress()
        assert current == 65
        assert required == 60

    def test_get_progress_custom_threshold(self):
        """Test progress with custom threshold."""
        config = WarmupConfig(warmup_frame_threshold=30)
        warmup = Warmup(config)
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(15):
            warmup.update(measurement)

        current, required = warmup.get_progress()
        assert current == 15
        assert required == 30


class TestWarmupIsStable:
    """Test is_stable() convenience method."""

    def test_is_stable_before_warmup(self):
        """Test is_stable returns False before completion."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(59):
            warmup.update(measurement)
            assert warmup.is_stable() is False

    def test_is_stable_at_threshold(self):
        """Test is_stable returns True at threshold."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(60):
            warmup.update(measurement)

        assert warmup.is_stable() is True

    def test_is_stable_after_reset(self):
        """Test is_stable returns False after reset."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(60):
            warmup.update(measurement)

        assert warmup.is_stable() is True

        warmup.reset()

        assert warmup.is_stable() is False


class TestWarmupInputValidation:
    """Test input validation."""

    def test_invalid_measurement_shape_2d(self):
        """Test rejection of 2D measurements."""
        warmup = Warmup()
        measurement = np.array([[0.1, -0.2], [0.3, 0.0]])

        with pytest.raises(ValueError, match="Measurement must be 1D"):
            warmup.update(measurement)

    def test_invalid_measurement_shape_scalar(self):
        """Test rejection of scalar measurements."""
        warmup = Warmup()
        measurement = np.array(0.5)

        with pytest.raises(ValueError, match="Measurement must be 1D"):
            warmup.update(measurement)

    def test_nan_in_measurement(self):
        """Test rejection of NaN values."""
        warmup = Warmup()
        measurement = np.array([0.1, np.nan, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        with pytest.raises(ValueError, match="NaN or infinite"):
            warmup.update(measurement)

    def test_inf_in_measurement(self):
        """Test rejection of infinite values."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, np.inf, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        with pytest.raises(ValueError, match="NaN or infinite"):
            warmup.update(measurement)

    def test_negative_inf_in_measurement(self):
        """Test rejection of negative infinite values."""
        warmup = Warmup()
        measurement = np.array([0.1, -np.inf, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        with pytest.raises(ValueError, match="NaN or infinite"):
            warmup.update(measurement)

    def test_list_measurement_conversion(self):
        """Test that list measurements are converted to numpy arrays."""
        warmup = Warmup()
        measurement = [0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05]

        state = warmup.update(measurement)
        assert state.frame_count == 1

    def test_empty_array_measurement(self):
        """Test handling of empty array."""
        warmup = Warmup()
        measurement = np.array([])

        # Empty array is still 1D, so it's technically valid but has dimension mismatch
        state = warmup.update(measurement)
        assert state.frame_count == 1


class TestWarmupMetadata:
    """Test metadata tracking."""

    def test_metadata_frames_remaining_initial(self):
        """Test frames_remaining in metadata at start."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        warmup.update(measurement)
        assert warmup.state.metadata['frames_remaining'] == 59
        assert warmup.state.metadata['progress_percent'] == 1

    def test_metadata_frames_remaining_midway(self):
        """Test frames_remaining during warm-up."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(30):
            warmup.update(measurement)

        assert warmup.state.metadata['frames_remaining'] == 30
        assert warmup.state.metadata['progress_percent'] == 50

    def test_metadata_frames_remaining_completion(self):
        """Test frames_remaining at completion."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(60):
            warmup.update(measurement)

        assert warmup.state.metadata['frames_remaining'] == 0
        assert warmup.state.metadata['progress_percent'] == 100

    def test_metadata_after_warmup(self):
        """Test metadata persists after warm-up."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(70):
            warmup.update(measurement)

        # After 60 frames, additional frames don't change frames_remaining
        assert warmup.state.metadata['frames_remaining'] == 0
        assert warmup.state.metadata['progress_percent'] == 100


class TestWarmupTimestamp:
    """Test timestamp tracking."""

    def test_timestamp_updated_on_update(self):
        """Test that timestamp is updated on each update."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        initial_timestamp = warmup.state.timestamp
        warmup.update(measurement)
        updated_timestamp = warmup.state.timestamp

        # Updated timestamp should be >= initial timestamp
        assert updated_timestamp >= initial_timestamp

    def test_timestamp_format(self):
        """Test that timestamp is a datetime object."""
        warmup = Warmup()
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        warmup.update(measurement)
        assert isinstance(warmup.state.timestamp, datetime)


class TestWarmupEdgeCases:
    """Test edge cases and special scenarios."""

    def test_very_large_threshold(self):
        """Test warm-up with very large threshold."""
        config = WarmupConfig(warmup_frame_threshold=10000)
        warmup = Warmup(config)
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for _ in range(100):
            state = warmup.update(measurement)

        assert state.frame_count == 100
        assert state.beta_is_stable is False
        assert state.stability_score == pytest.approx(100.0 / 10000, rel=1e-6)

    def test_different_measurement_dimensions(self):
        """Test warm-up works with different measurement dimensions."""
        warmup = Warmup()

        # Test with 3D measurement
        measurement_3d = np.array([0.1, -0.2, 0.3])
        state = warmup.update(measurement_3d)
        assert state.frame_count == 1

        # Reset and test with 10D measurement
        warmup.reset()
        measurement_10d = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])
        state = warmup.update(measurement_10d)
        assert state.frame_count == 1

    def test_all_zeros_measurement(self):
        """Test warm-up with all-zeros measurement."""
        warmup = Warmup()
        measurement = np.zeros(10)

        for _ in range(60):
            state = warmup.update(measurement)

        assert state.beta_is_stable is True

    def test_large_values_measurement(self):
        """Test warm-up with large measurement values."""
        warmup = Warmup()
        measurement = np.array([100.0, -200.5, 300.3, 0.0, 100.1, -100.1, 200.2, 0.0, 50.05, -50.05])

        for _ in range(60):
            state = warmup.update(measurement)

        assert state.beta_is_stable is True

    def test_small_values_measurement(self):
        """Test warm-up with very small measurement values."""
        warmup = Warmup()
        measurement = np.array([0.001, -0.002, 0.003, 0.0, 0.001, -0.001, 0.002, 0.0, 0.0005, -0.0005])

        for _ in range(60):
            state = warmup.update(measurement)

        assert state.beta_is_stable is True


class TestWarmupConsistency:
    """Test consistency across multiple warm-up cycles."""

    def test_consistent_progression(self):
        """Test that warm-up progression is consistent across cycles."""
        config = WarmupConfig(warmup_frame_threshold=30)
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        for cycle in range(3):
            warmup = Warmup(config)
            for i in range(1, 31):
                state = warmup.update(measurement)
                expected_score = i / 30
                assert state.stability_score == pytest.approx(expected_score, rel=1e-6)
                assert state.frame_count == i

    def test_independent_instances(self):
        """Test that multiple Warmup instances are independent."""
        measurement = np.array([0.1, -0.2, 0.3, 0.0, 0.1, -0.1, 0.2, 0.0, 0.05, -0.05])

        warmup1 = Warmup()
        warmup2 = Warmup()

        # Process warmup1
        for _ in range(30):
            warmup1.update(measurement)

        # warmup2 should still be at frame 0
        assert warmup2.state.frame_count == 0
        assert warmup2.state.beta_is_stable is False

        # Process warmup2
        for _ in range(60):
            warmup2.update(measurement)

        # warmup1 should still be at frame 30
        assert warmup1.state.frame_count == 30
        assert warmup1.state.beta_is_stable is False
