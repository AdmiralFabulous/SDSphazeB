"""Kalman Filter implementation for 10-dimensional beta vector stability.

This module provides a Kalman filter for smoothing and uncertainty estimation
of 10-dimensional beta vectors used in SMPL/SMPL-X body model parameter estimation.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Tuple

import numpy as np


@dataclass
class KalmanState:
    """State of the Kalman filter at a given time step."""

    state_vector: np.ndarray
    covariance: np.ndarray
    timestamp: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        """Validate state vector and covariance dimensions."""
        if self.state_vector.ndim != 1:
            raise ValueError("state_vector must be 1-dimensional")
        if self.state_vector.shape[0] != 10:
            raise ValueError("state_vector must have exactly 10 dimensions")
        if self.covariance.shape != (10, 10):
            raise ValueError("covariance must be 10x10 matrix")
        if not np.allclose(self.covariance, self.covariance.T):
            raise ValueError("covariance must be symmetric")


@dataclass
class KalmanFilterConfig:
    """Configuration parameters for Kalman filter.

    Attributes:
        process_noise_scale: Scalar multiplier for process noise (Q matrix).
            Higher values allow state to drift more. Default: 0.01
        measurement_noise_scale: Scalar multiplier for measurement noise (R matrix).
            Higher values trust measurements less. Default: 0.1
        initial_state_uncertainty: Initial diagonal value for state covariance.
            Higher values represent more initial uncertainty. Default: 1.0
    """

    process_noise_scale: float = 0.01
    measurement_noise_scale: float = 0.1
    initial_state_uncertainty: float = 1.0

    def __post_init__(self):
        """Validate configuration parameters."""
        if self.process_noise_scale <= 0:
            raise ValueError("process_noise_scale must be positive")
        if self.measurement_noise_scale <= 0:
            raise ValueError("measurement_noise_scale must be positive")
        if self.initial_state_uncertainty <= 0:
            raise ValueError("initial_state_uncertainty must be positive")


class KalmanFilter:
    """Kalman filter for smoothing 10-dimensional beta vectors.

    The Kalman filter maintains a running estimate of a 10-dimensional state vector
    (beta vector) and its uncertainty. It uses a simple constant-velocity motion model
    and provides both filtered state estimates and uncertainty estimates.

    Attributes:
        state: Current filtered state estimate
        covariance: Current state covariance (uncertainty)
    """

    def __init__(self, config: Optional[KalmanFilterConfig] = None):
        """Initialize Kalman filter.

        Args:
            config: Filter configuration. If None, uses default KalmanFilterConfig.
        """
        self.config = config or KalmanFilterConfig()
        self.state = None
        self.covariance = None
        self._initialized = False
        self.update_count = 0

        # Set up constant-velocity motion model matrices
        self._setup_motion_model()

    def _setup_motion_model(self) -> None:
        """Set up state transition and measurement matrices.

        Uses a simple constant-velocity model where the state includes both
        position and velocity components (not explicitly, but implicitly through
        the state transition matrix allowing smooth transitions).
        """
        # State transition matrix (identity for constant position assumption)
        self.F = np.eye(10)

        # Measurement matrix (direct measurement of all state components)
        self.H = np.eye(10)

        # Process noise covariance
        self.Q = (
            self.config.process_noise_scale * np.eye(10)
        )

        # Measurement noise covariance
        self.R = (
            self.config.measurement_noise_scale * np.eye(10)
        )

    def update(self, measurement: np.ndarray) -> KalmanState:
        """Update filter with a new measurement.

        Performs the measurement update step of the Kalman filter, incorporating
        the new measurement to refine the state estimate and reduce uncertainty.

        Args:
            measurement: 10-dimensional measurement vector.

        Returns:
            Updated KalmanState with filtered estimate and uncertainty.

        Raises:
            ValueError: If measurement is not 10-dimensional.
        """
        if measurement.shape != (10,):
            raise ValueError("measurement must be a 10-dimensional array")

        if not self._initialized:
            # First measurement - initialize state
            self.state = measurement.copy()
            self.covariance = (
                self.config.initial_state_uncertainty * np.eye(10)
            )
            self._initialized = True
            self.update_count = 1
            return KalmanState(
                state_vector=self.state.copy(),
                covariance=self.covariance.copy()
            )

        # Prediction step (without explicit velocity, just use previous state)
        predicted_state = self.F @ self.state
        predicted_covariance = self.F @ self.covariance @ self.F.T + self.Q

        # Update step
        # Calculate innovation (measurement residual)
        innovation = measurement - self.H @ predicted_state

        # Calculate innovation covariance
        innovation_cov = self.H @ predicted_covariance @ self.H.T + self.R

        # Calculate Kalman gain
        kalman_gain = predicted_covariance @ self.H.T @ np.linalg.inv(innovation_cov)

        # Update state estimate
        self.state = predicted_state + kalman_gain @ innovation

        # Update covariance estimate (Joseph form for numerical stability)
        I_minus_KH = np.eye(10) - kalman_gain @ self.H
        self.covariance = (
            I_minus_KH @ predicted_covariance @ I_minus_KH.T +
            kalman_gain @ self.R @ kalman_gain.T
        )

        self.update_count += 1

        return KalmanState(
            state_vector=self.state.copy(),
            covariance=self.covariance.copy()
        )

    def predict(self) -> KalmanState:
        """Predict next state without measurement update.

        Performs the prediction step of the Kalman filter to estimate the next
        state based on the motion model.

        Returns:
            Predicted KalmanState with estimated state and uncertainty.

        Raises:
            RuntimeError: If filter has not been initialized with a measurement.
        """
        if not self._initialized:
            raise RuntimeError("Filter must be initialized with measurement before prediction")

        # Prediction step
        predicted_state = self.F @ self.state
        predicted_covariance = self.F @ self.covariance @ self.F.T + self.Q

        return KalmanState(
            state_vector=predicted_state.copy(),
            covariance=predicted_covariance.copy()
        )

    def get_uncertainty(self) -> np.ndarray:
        """Get uncertainty estimate for current state.

        Returns standard deviation (square root of diagonal of covariance).

        Returns:
            10-dimensional array of standard deviations for each state component.

        Raises:
            RuntimeError: If filter has not been initialized.
        """
        if not self._initialized:
            raise RuntimeError("Filter must be initialized with measurement before getting uncertainty")

        return np.sqrt(np.diag(self.covariance))

    def get_state(self) -> Optional[np.ndarray]:
        """Get current filtered state vector.

        Returns:
            Current 10-dimensional state estimate, or None if not initialized.
        """
        return self.state.copy() if self._initialized else None

    def reset(self) -> None:
        """Reset filter for a new session.

        Clears all internal state, allowing the filter to be reused for
        a new sequence of measurements.
        """
        self.state = None
        self.covariance = None
        self._initialized = False
        self.update_count = 0

    def is_initialized(self) -> bool:
        """Check if filter has been initialized with at least one measurement.

        Returns:
            True if filter has received at least one measurement update.
        """
        return self._initialized

    def get_covariance(self) -> Optional[np.ndarray]:
        """Get current covariance matrix.

        Returns:
            Current 10x10 covariance matrix, or None if not initialized.
        """
        return self.covariance.copy() if self._initialized else None

    @property
    def mean_uncertainty(self) -> float:
        """Get mean uncertainty across all dimensions.

        Returns:
            Mean of standard deviations across all 10 dimensions.

        Raises:
            RuntimeError: If filter has not been initialized.
        """
        return float(np.mean(self.get_uncertainty()))

    @property
    def max_uncertainty(self) -> float:
        """Get maximum uncertainty across all dimensions.

        Returns:
            Maximum standard deviation across all 10 dimensions.

        Raises:
            RuntimeError: If filter has not been initialized.
        """
        return float(np.max(self.get_uncertainty()))
