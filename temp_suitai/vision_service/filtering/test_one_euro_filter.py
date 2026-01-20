# -*- coding: utf-8 -*-
"""
Comprehensive test suite for OneEuro Filter implementation.
"""

import unittest
from datetime import datetime, timedelta
import numpy as np
from one_euro_filter import (
    OneEuroFilter,
    OneEuroFilterConfig,
    OneEuroFilterJoint,
    OneEuroFilterPose,
)


class TestOneEuroFilterConfig(unittest.TestCase):
    """Test OneEuroFilterConfig defaults and initialization."""

    def test_default_config(self):
        config = OneEuroFilterConfig()
        self.assertEqual(config.freq, 30.0)
        self.assertEqual(config.mincutoff, 1.0)
        self.assertEqual(config.beta, 0.005)
        self.assertEqual(config.dcutoff, 1.0)


class TestOneEuroFilterBasic(unittest.TestCase):
    """Test basic OneEuro filter functionality."""

    def setUp(self):
        self.config = OneEuroFilterConfig()
        self.filter = OneEuroFilter(self.config)

    def test_initialization(self):
        self.assertFalse(self.filter.is_initialized())

    def test_first_measurement(self):
        value = np.array([5.0])
        filtered = self.filter.filter(value)
        self.assertAlmostEqual(filtered[0], 5.0)
        self.assertTrue(self.filter.is_initialized())

    def test_scalar_input(self):
        value = 3.14
        filtered = self.filter.filter(value)
        self.assertEqual(filtered.shape, (1,))

    def test_array_input(self):
        value = np.array([1.0, 2.0, 3.0])
        filtered = self.filter.filter(value)
        self.assertEqual(filtered.shape, (3,))

    def test_invalid_multidimensional_input(self):
        value = np.array([[1.0, 2.0], [3.0, 4.0]])
        with self.assertRaises(ValueError):
            self.filter.filter(value)

    def test_reset_clears_state(self):
        self.filter.filter(np.array([1.0]))
        self.assertTrue(self.filter.is_initialized())
        self.filter.reset()
        self.assertFalse(self.filter.is_initialized())


class TestOneEuroFilterSmoothing(unittest.TestCase):
    """Test smoothing and noise reduction."""

    def setUp(self):
        self.config = OneEuroFilterConfig()
        self.filter = OneEuroFilter(self.config)

    def test_constant_signal(self):
        constant_value = 7.5
        timestamp = datetime.now()
        dt = 1.0 / self.config.freq

        for _ in range(10):
            filtered = self.filter.filter(np.array([constant_value]), timestamp)
            timestamp += timedelta(seconds=dt)

        self.assertAlmostEqual(filtered[0], constant_value, places=2)


class TestOneEuroFilterJoint(unittest.TestCase):
    """Test per-joint filtering."""

    def setUp(self):
        self.config = OneEuroFilterConfig()
        self.joint_filter = OneEuroFilterJoint(self.config, joint_index=0)

    def test_joint_initialization(self):
        self.assertFalse(self.joint_filter.is_initialized())

    def test_3d_joint_filtering(self):
        joint_params = np.array([1.0, 2.0, 3.0])
        filtered = self.joint_filter.filter(joint_params)
        self.assertEqual(filtered.shape, (3,))


class TestOneEuroFilterPose(unittest.TestCase):
    """Test pose-level filtering with multiple joints."""

    def setUp(self):
        self.config = OneEuroFilterConfig()
        self.pose_filter = OneEuroFilterPose(self.config, num_joints=24)

    def test_pose_initialization(self):
        self.assertFalse(self.pose_filter.is_initialized())

    def test_full_pose_filtering(self):
        pose = np.arange(72, dtype=float)
        filtered = self.pose_filter.filter(pose)
        self.assertEqual(filtered.shape, (72,))

    def test_wrong_pose_size(self):
        pose = np.arange(71, dtype=float)
        with self.assertRaises(ValueError):
            self.pose_filter.filter(pose)

    def test_pose_reset(self):
        pose = np.arange(72, dtype=float)
        self.pose_filter.filter(pose)
        self.assertTrue(self.pose_filter.is_initialized())
        self.pose_filter.reset()
        self.assertFalse(self.pose_filter.is_initialized())


class TestOneEuroFilterPerformance(unittest.TestCase):
    """Test performance and latency characteristics."""

    def test_low_latency_single_update(self):
        config = OneEuroFilterConfig()
        filter_obj = OneEuroFilter(config)
        import time
        start = time.perf_counter()
        filter_obj.filter(np.array([1.0]))
        elapsed = time.perf_counter() - start
        self.assertLess(elapsed, 0.01)

    def test_latency_batch_updates(self):
        config = OneEuroFilterConfig()
        pose_filter = OneEuroFilterPose(config, num_joints=24)
        pose = np.random.randn(72)
        import time
        start = time.perf_counter()
        for _ in range(100):
            pose_filter.filter(pose)
        elapsed = time.perf_counter() - start
        self.assertLess(elapsed, 0.1)


if __name__ == '__main__':
    unittest.main()
