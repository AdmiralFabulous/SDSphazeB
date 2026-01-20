# -*- coding: utf-8 -*-
"""
OneEuro Filter - Adaptive low-lag filter for real-time pose tracking.

The OneEuro filter is a state-space filter designed for smooth animation in
real-time systems. It uses exponential smoothing with adaptive cutoff frequency
that responds to movement speed, providing low latency while maintaining smoothness.

Reference: Casiez et al., "1 Euro Filter: A Simple Speed-dependent Low-pass Filter for
Noisy Input in Interactive Systems", CHI 2012.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, List
import numpy as np


@dataclass
class OneEuroFilterConfig:
    """Configuration for OneEuro filter parameters."""
    freq: float = 30.0
    mincutoff: float = 1.0
    beta: float = 0.005
    dcutoff: float = 1.0


@dataclass
class OneEuroFilterState:
    """Internal state of a single OneEuro filter channel."""
    x: float = 0.0
    dx: float = 0.0
    last_time: Optional[datetime] = None


class OneEuroFilter:
    """One Euro filter for adaptive low-lag filtering of scalar values."""

    def __init__(self, config: OneEuroFilterConfig):
        self.config = config
        self._state: Dict[int, OneEuroFilterState] = {}
        self._start_time: Optional[datetime] = None

    def filter(self, value: np.ndarray, timestamp: Optional[datetime] = None) -> np.ndarray:
        if not isinstance(value, np.ndarray):
            value = np.array([value])
        if value.ndim > 1:
            raise ValueError(f"Expected 1D array, got shape {value.shape}")
        if timestamp is None:
            timestamp = datetime.now()
        if self._start_time is None:
            self._start_time = timestamp
        filtered = np.zeros_like(value, dtype=float)
        for i, v in enumerate(value):
            filtered[i] = self._filter_channel(i, float(v), timestamp)
        return filtered

    def _filter_channel(self, channel: int, value: float, timestamp: datetime) -> float:
        if channel not in self._state:
            self._state[channel] = OneEuroFilterState(x=value, dx=0.0, last_time=timestamp)
            return value
        state = self._state[channel]
        dt = (timestamp - state.last_time).total_seconds()
        if dt <= 0:
            return state.x
        cutoff_d = self.config.dcutoff
        alpha_d = self._alpha(cutoff_d, dt)
        dx = (value - state.x) / dt
        state.dx = self._exponential_smooth(alpha_d, dx, state.dx)
        cutoff = self.config.mincutoff + self.config.beta * abs(state.dx)
        alpha = self._alpha(cutoff, dt)
        state.x = self._exponential_smooth(alpha, value, state.x)
        state.last_time = timestamp
        return state.x

    @staticmethod
    def _alpha(cutoff: float, dt: float) -> float:
        r = 2.0 * np.pi * cutoff * dt
        return r / (1.0 + r)

    @staticmethod
    def _exponential_smooth(alpha: float, value: float, estimate: float) -> float:
        return alpha * value + (1.0 - alpha) * estimate

    def reset(self) -> None:
        self._state.clear()
        self._start_time = None

    def is_initialized(self) -> bool:
        return len(self._state) > 0

    def get_state(self) -> Dict[int, Dict]:
        result = {}
        for channel, state in self._state.items():
            result[channel] = {
                'x': state.x,
                'dx': state.dx,
                'last_time': state.last_time.isoformat() if state.last_time else None
            }
        return result


class OneEuroFilterJoint:
    """OneEuro filter for a single joint with 3D rotation."""

    def __init__(self, config: OneEuroFilterConfig, joint_index: int):
        self.joint_index = joint_index
        self.config = config
        self._filters = [OneEuroFilter(config) for _ in range(3)]

    def filter(self, joint_params: np.ndarray, timestamp: Optional[datetime] = None) -> np.ndarray:
        if joint_params.shape != (3,):
            raise ValueError(f"Expected shape (3,), got {joint_params.shape}")
        filtered = np.zeros(3)
        for i in range(3):
            filtered[i] = self._filters[i].filter(np.array([joint_params[i]]), timestamp)[0]
        return filtered

    def reset(self) -> None:
        for f in self._filters:
            f.reset()

    def is_initialized(self) -> bool:
        return any(f.is_initialized() for f in self._filters)


class OneEuroFilterPose:
    """OneEuro filter for complete pose (all joints)."""

    def __init__(self, config: OneEuroFilterConfig, num_joints: int = 24):
        self.num_joints = num_joints
        self.config = config
        self._joint_filters = [OneEuroFilterJoint(config, i) for i in range(num_joints)]

    def filter(self, pose: np.ndarray, timestamp: Optional[datetime] = None) -> np.ndarray:
        expected_size = self.num_joints * 3
        if pose.size != expected_size:
            raise ValueError(f"Expected pose size {expected_size}, got {pose.size}")
        pose = pose.reshape(self.num_joints, 3)
        filtered = np.zeros_like(pose)
        for i, joint_filter in enumerate(self._joint_filters):
            filtered[i] = joint_filter.filter(pose[i], timestamp)
        return filtered.flatten()

    def reset(self) -> None:
        for joint_filter in self._joint_filters:
            joint_filter.reset()

    def is_initialized(self) -> bool:
        return any(f.is_initialized() for f in self._joint_filters)

    def get_state(self) -> List[Dict]:
        return [f.get_state() for f in self._joint_filters]
