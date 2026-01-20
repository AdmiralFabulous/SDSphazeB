"""Comprehensive tests for Kalman filter implementation."""

import numpy as np
import pytest

from vision_service.filtering.kalman_filter import (
    KalmanFilter,
    KalmanFilterConfig,
    KalmanState,
)


class TestKalmanStateValidation:
    """Tests for KalmanState dataclass validation."""

    def test_valid_state_creation(self):
        """Test creating valid KalmanState."""
        state_vector = np.zeros(10)
        covariance = np.eye(10)
        state = KalmanState(state_vector=state_vector, covariance=covariance)
        assert state.state_vector.shape == (10,)
        assert state.covariance.shape == (10, 10)

    def test_invalid_state_vector_dimension(self):
        """Test that invalid state vector dimension raises error."""
        with pytest.raises(ValueError, match="state_vector must have exactly 10 dimensions"):
            KalmanState(state_vector=np.zeros(5), covariance=np.eye(10))

    def test_invalid_state_vector_shape(self):
        """Test that 2D state vector raises error."""
        with pytest.raises(ValueError, match="state_vector must be 1-dimensional"):
            KalmanState(state_vector=np.zeros((5, 2)), covariance=np.eye(10))

    def test_invalid_covariance_shape(self):
        """Test that wrong covariance shape raises error."""
        with pytest.raises(ValueError, match="covariance must be 10x10 matrix"):
            KalmanState(state_vector=np.zeros(10), covariance=np.eye(5))

    def test_non_symmetric_covariance(self):
        """Test that non-symmetric covariance raises error."""
        covariance = np.eye(10)
        covariance[0, 1] = 1.0  # Make it non-symmetric
        with pytest.raises(ValueError, match="covariance must be symmetric"):
            KalmanState(state_vector=np.zeros(10), covariance=covariance)


class TestKalmanFilterConfigValidation:
    """Tests for KalmanFilterConfig validation."""

    def test_valid_config(self):
        """Test creating valid configuration."""
        config = KalmanFilterConfig(
            process_noise_scale=0.01,
            measurement_noise_scale=0.1,
            initial_state_uncertainty=1.0
        )
        assert config.process_noise_scale == 0.01

    def test_invalid_process_noise_scale(self):
        """Test that non-positive process noise raises error."""
        with pytest.raises(ValueError, match="process_noise_scale must be positive"):
            KalmanFilterConfig(process_noise_scale=-0.01)

    def test_invalid_measurement_noise_scale(self):
        """Test that non-positive measurement noise raises error."""
        with pytest.raises(ValueError, match="measurement_noise_scale must be positive"):
            KalmanFilterConfig(measurement_noise_scale=0)

    def test_invalid_initial_uncertainty(self):
        """Test that non-positive initial uncertainty raises error."""
        with pytest.raises(ValueError, match="initial_state_uncertainty must be positive"):
            KalmanFilterConfig(initial_state_uncertainty=-1.0)


class TestKalmanFilterInitialization:
    """Tests for Kalman filter initialization."""

    def test_default_initialization(self):
        """Test filter initializes with default config."""
        kf = KalmanFilter()
        assert not kf.is_initialized()
        assert kf.state is None
        assert kf.covariance is None
        assert kf.update_count == 0

    def test_custom_config_initialization(self):
        """Test filter initializes with custom config."""
        config = KalmanFilterConfig(process_noise_scale=0.05)
        kf = KalmanFilter(config=config)
        assert kf.config.process_noise_scale == 0.05

    def test_motion_model_setup(self):
        """Test that motion model matrices are set up correctly."""
        kf = KalmanFilter()
        assert kf.F.shape == (10, 10)
        assert kf.H.shape == (10, 10)
        assert kf.Q.shape == (10, 10)
        assert kf.R.shape == (10, 10)
        assert np.allclose(kf.F, np.eye(10))
        assert np.allclose(kf.H, np.eye(10))


class TestKalmanFilterUpdate:
    """Tests for Kalman filter update step."""

    def test_first_measurement_initialization(self):
        """Test that first measurement initializes the filter."""
        kf = KalmanFilter()
        measurement = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0])

        state = kf.update(measurement)

        assert kf.is_initialized()
        assert np.allclose(state.state_vector, measurement)
        assert kf.update_count == 1

    def test_second_measurement_filtering(self):
        """Test that second measurement performs Kalman update."""
        kf = KalmanFilter()
        measurement1 = np.ones(10)
        measurement2 = np.ones(10) * 2.0

        kf.update(measurement1)
        state = kf.update(measurement2)

        # Filtered state should be between measurements (not equal to measurement2)
        assert not np.allclose(state.state_vector, measurement2)
        assert np.all(state.state_vector > measurement1)
        assert np.all(state.state_vector < measurement2)
        assert kf.update_count == 2

    def test_measurement_validation(self):
        """Test that invalid measurement dimensions raise error."""
        kf = KalmanFilter()
        with pytest.raises(ValueError, match="measurement must be a 10-dimensional array"):
            kf.update(np.array([1.0, 2.0]))

    def test_covariance_reduction_on_update(self):
        """Test that uncertainty decreases with multiple measurements."""
        kf = KalmanFilter()
        measurement = np.ones(10)

        kf.update(measurement)
        initial_uncertainty = kf.get_uncertainty()

        for _ in range(5):
            kf.update(measurement)

        final_uncertainty = kf.get_uncertainty()

        assert np.all(final_uncertainty < initial_uncertainty)

    def test_returns_kalman_state(self):
        """Test that update returns valid KalmanState."""
        kf = KalmanFilter()
        measurement = np.zeros(10)
        state = kf.update(measurement)

        assert isinstance(state, KalmanState)
        assert state.state_vector.shape == (10,)
        assert state.covariance.shape == (10, 10)


class TestKalmanFilterPredict:
    """Tests for Kalman filter prediction."""

    def test_predict_before_initialization_raises_error(self):
        """Test that prediction before initialization raises error."""
        kf = KalmanFilter()
        with pytest.raises(RuntimeError, match="Filter must be initialized"):
            kf.predict()

    def test_predict_after_initialization(self):
        """Test prediction after initialization."""
        kf = KalmanFilter()
        measurement = np.ones(10)
        kf.update(measurement)

        predicted_state = kf.predict()

        assert isinstance(predicted_state, KalmanState)
        assert predicted_state.state_vector.shape == (10,)
        assert predicted_state.covariance.shape == (10, 10)

    def test_predict_increases_uncertainty(self):
        """Test that prediction increases uncertainty."""
        kf = KalmanFilter()
        measurement = np.ones(10)
        kf.update(measurement)

        initial_uncertainty = kf.get_uncertainty()
        predicted = kf.predict()
        predicted_uncertainty = np.sqrt(np.diag(predicted.covariance))

        assert np.all(predicted_uncertainty >= initial_uncertainty)

    def test_multiple_predictions(self):
        """Test multiple consecutive predictions."""
        kf = KalmanFilter()
        measurement = np.ones(10)
        kf.update(measurement)

        predictions = []
        for _ in range(3):
            pred = kf.predict()
            predictions.append(pred)

        # Uncertainty should monotonically increase
        uncertainties = [np.max(np.sqrt(np.diag(p.covariance))) for p in predictions]
        assert all(uncertainties[i] <= uncertainties[i+1] for i in range(len(uncertainties)-1))


class TestKalmanFilterUncertainty:
    """Tests for uncertainty estimation."""

    def test_get_uncertainty_before_initialization_raises_error(self):
        """Test that getting uncertainty before initialization raises error."""
        kf = KalmanFilter()
        with pytest.raises(RuntimeError, match="Filter must be initialized"):
            kf.get_uncertainty()

    def test_get_uncertainty_returns_correct_shape(self):
        """Test that uncertainty has correct shape."""
        kf = KalmanFilter()
        kf.update(np.ones(10))
        uncertainty = kf.get_uncertainty()

        assert uncertainty.shape == (10,)
        assert np.all(uncertainty > 0)

    def test_uncertainty_decreases_with_consistent_measurements(self):
        """Test that uncertainty decreases with consistent measurements."""
        kf = KalmanFilter()
        measurement = np.ones(10)

        uncertainties = []
        for _ in range(10):
            kf.update(measurement)
            uncertainties.append(kf.mean_uncertainty)

        assert all(uncertainties[i] >= uncertainties[i+1] for i in range(len(uncertainties)-1))

    def test_mean_uncertainty_property(self):
        """Test mean uncertainty property."""
        kf = KalmanFilter()
        kf.update(np.ones(10))

        mean_unc = kf.mean_uncertainty
        assert isinstance(mean_unc, float)
        assert mean_unc > 0

    def test_max_uncertainty_property(self):
        """Test max uncertainty property."""
        kf = KalmanFilter()
        kf.update(np.ones(10))

        max_unc = kf.max_uncertainty
        assert isinstance(max_unc, float)
        assert max_unc > 0
        assert max_unc >= kf.mean_uncertainty


class TestKalmanFilterReset:
    """Tests for filter reset functionality."""

    def test_reset_clears_state(self):
        """Test that reset clears all state."""
        kf = KalmanFilter()
        kf.update(np.ones(10))
        assert kf.is_initialized()

        kf.reset()

        assert not kf.is_initialized()
        assert kf.state is None
        assert kf.covariance is None
        assert kf.update_count == 0

    def test_reset_allows_reuse(self):
        """Test that filter can be reused after reset."""
        kf = KalmanFilter()

        # First sequence
        kf.update(np.ones(10))
        kf.reset()

        # Second sequence
        measurement = np.ones(10) * 5.0
        state = kf.update(measurement)

        assert kf.is_initialized()
        assert np.allclose(state.state_vector, measurement)


class TestKalmanFilterStateAccess:
    """Tests for state access methods."""

    def test_get_state_returns_copy(self):
        """Test that get_state returns a copy."""
        kf = KalmanFilter()
        measurement = np.ones(10)
        kf.update(measurement)

        state = kf.get_state()
        state[0] = 999.0

        # Original should be unchanged
        assert kf.state[0] != 999.0

    def test_get_state_before_initialization_returns_none(self):
        """Test that get_state returns None before initialization."""
        kf = KalmanFilter()
        assert kf.get_state() is None

    def test_get_covariance_returns_copy(self):
        """Test that get_covariance returns a copy."""
        kf = KalmanFilter()
        kf.update(np.ones(10))

        cov = kf.get_covariance()
        cov[0, 0] = 999.0

        # Original should be unchanged
        assert kf.covariance[0, 0] != 999.0

    def test_get_covariance_before_initialization_returns_none(self):
        """Test that get_covariance returns None before initialization."""
        kf = KalmanFilter()
        assert kf.get_covariance() is None


class TestKalmanFilterNoisyMeasurements:
    """Tests with noisy measurement sequences."""

    def test_filtering_noisy_sequence(self):
        """Test that filter smooths noisy measurements."""
        np.random.seed(42)
        kf = KalmanFilter(config=KalmanFilterConfig(measurement_noise_scale=0.1))

        # Generate noisy measurements around true value of 1.0
        true_value = np.ones(10)
        noise_std = 0.5

        filtered_values = []
        for _ in range(20):
            noisy_measurement = true_value + np.random.normal(0, noise_std, 10)
            state = kf.update(noisy_measurement)
            filtered_values.append(state.state_vector.copy())

        # Check that filtered values are closer to true value than raw measurements
        noisy_measurements = [true_value + np.random.normal(0, noise_std, 10) for _ in range(20)]

        # Filtered should have lower variance
        filtered_variance = np.var(filtered_values, axis=0)
        noisy_variance = np.var(noisy_measurements, axis=0)

        assert np.mean(filtered_variance) < np.mean(noisy_variance)

    def test_response_to_step_change(self):
        """Test filter response to step change in measurements."""
        kf = KalmanFilter()

        # First, establish baseline with value 0
        for _ in range(5):
            kf.update(np.zeros(10))

        baseline_state = kf.get_state().copy()

        # Step change to value 10
        for _ in range(5):
            kf.update(np.ones(10) * 10.0)

        new_state = kf.get_state()

        # Should have moved toward new value but not instantaneously
        assert np.all(new_state > baseline_state)
        assert np.all(new_state < 10.0)


class TestKalmanFilterLatency:
    """Tests for low-latency update performance."""

    def test_single_update_completes_quickly(self):
        """Test that single update is fast."""
        kf = KalmanFilter()
        measurement = np.ones(10)

        import time
        start = time.time()
        kf.update(measurement)
        elapsed = time.time() - start

        # Should complete in well under 1ms
        assert elapsed < 0.001

    def test_many_updates_are_fast(self):
        """Test that 1000 updates complete quickly."""
        kf = KalmanFilter()
        measurement = np.ones(10)

        import time
        start = time.time()
        for _ in range(1000):
            kf.update(measurement)
        elapsed = time.time() - start

        # Should complete in well under 1 second
        assert elapsed < 1.0
        # Average should be well under 1ms per update
        assert elapsed / 1000 < 0.001


class TestKalmanFilterEdgeCases:
    """Tests for edge cases and robustness."""

    def test_zero_measurement(self):
        """Test handling of zero measurements."""
        kf = KalmanFilter()
        state = kf.update(np.zeros(10))

        assert state.state_vector.shape == (10,)
        assert np.allclose(state.state_vector, np.zeros(10))

    def test_large_values(self):
        """Test handling of large measurement values."""
        kf = KalmanFilter()
        large_measurement = np.ones(10) * 1e6
        state = kf.update(large_measurement)

        assert np.allclose(state.state_vector, large_measurement)

    def test_negative_values(self):
        """Test handling of negative measurement values."""
        kf = KalmanFilter()
        negative_measurement = np.ones(10) * -100.0
        state = kf.update(negative_measurement)

        assert np.allclose(state.state_vector, negative_measurement)

    def test_very_small_values(self):
        """Test handling of very small measurement values."""
        kf = KalmanFilter()
        small_measurement = np.ones(10) * 1e-10
        state = kf.update(small_measurement)

        assert np.allclose(state.state_vector, small_measurement, atol=1e-12)

    def test_mixed_scale_measurements(self):
        """Test handling of measurements with mixed scales."""
        kf = KalmanFilter()
        mixed_measurement = np.array([1e-6, 1e-3, 1.0, 1e3, 1e6, 1.0, 1e3, 1e-3, 1e-6, 1e0])
        state = kf.update(mixed_measurement)

        assert state.state_vector.shape == (10,)
        assert np.isfinite(state.covariance).all()

    def test_nan_propagation(self):
        """Test that NaN in measurement doesn't crash (though result is invalid)."""
        kf = KalmanFilter()
        measurement = np.ones(10)
        kf.update(measurement)

        nan_measurement = np.ones(10)
        nan_measurement[0] = np.nan
        state = kf.update(nan_measurement)

        # Result will contain NaN, but shouldn't crash
        assert state.state_vector.shape == (10,)


class TestKalmanFilterNumericalStability:
    """Tests for numerical stability."""

    def test_covariance_positive_definite(self):
        """Test that covariance remains positive definite."""
        kf = KalmanFilter()

        for _ in range(100):
            kf.update(np.random.randn(10))

        # Check eigenvalues are all positive
        eigenvalues = np.linalg.eigvals(kf.covariance)
        assert np.all(eigenvalues > 0)

    def test_covariance_symmetry_maintained(self):
        """Test that covariance remains symmetric through updates."""
        kf = KalmanFilter()

        for _ in range(50):
            kf.update(np.random.randn(10))

        assert np.allclose(kf.covariance, kf.covariance.T)

    def test_state_boundedness(self):
        """Test that filtered state stays reasonable."""
        kf = KalmanFilter()

        # Apply very large outlier
        kf.update(np.ones(10) * 1e10)

        # Recovery with normal measurements
        for _ in range(10):
            kf.update(np.ones(10))

        # State should be finite and reasonable
        assert np.all(np.isfinite(kf.state))
        assert np.all(np.abs(kf.state) < 1e10)
