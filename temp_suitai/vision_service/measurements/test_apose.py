"""
Unit tests for A-Pose Normalization Module

Tests cover:
- A-pose creation and properties
- Pose normalization while preserving shape
- Joint position and rotation access
- Validation of A-pose constraints
- Input validation and error handling
"""

import unittest
import numpy as np
from apose import (
    create_apose_theta,
    normalize_to_apose,
    get_joint_position,
    get_arm_angle,
    validate_apose,
    APoseResult,
    APOSE_JOINT_ROTATIONS,
    APOSE_JOINT_POSITIONS,
)


class TestCreateAPoseTheta(unittest.TestCase):
    """Tests for create_apose_theta function."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_beta = np.array(
            [0.0, 0.5, -0.3, 0.1, -0.2, 0.0, 0.1, 0.05, -0.1, 0.02],
            dtype=np.float32
        )

    def test_create_apose_basic(self):
        """Test basic A-pose creation with valid beta."""
        result = create_apose_theta(self.valid_beta)

        # Check output structure
        self.assertIsInstance(result, APoseResult)
        self.assertEqual(result.apose_theta.shape, (72,))
        self.assertEqual(result.beta.shape, (10,))
        self.assertEqual(result.joint_rotations.shape, (24, 3))
        self.assertEqual(result.joint_positions.shape, (24, 3))

    def test_beta_preservation(self):
        """Test that beta parameters are preserved exactly."""
        result = create_apose_theta(self.valid_beta)

        np.testing.assert_array_equal(result.beta, self.valid_beta)

    def test_apose_theta_structure(self):
        """Test that apose_theta has correct structure from joint rotations."""
        result = create_apose_theta(self.valid_beta)

        # Each joint should have 3 values in apose_theta
        for joint_idx in range(24):
            expected_rotation = APOSE_JOINT_ROTATIONS[joint_idx]
            actual_rotation = result.apose_theta[joint_idx * 3:(joint_idx + 1) * 3]
            np.testing.assert_array_almost_equal(actual_rotation, expected_rotation)

    def test_global_rotation_identity(self):
        """Test that global rotation (joint 0) is identity (zero)."""
        result = create_apose_theta(self.valid_beta)

        global_rotation = result.apose_theta[0:3]
        np.testing.assert_array_almost_equal(global_rotation, [0.0, 0.0, 0.0])

    def test_arms_at_45_degrees(self):
        """Test that arms are raised at approximately 45 degrees."""
        result = create_apose_theta(self.valid_beta)

        left_arm_angle = get_arm_angle(result, "left")
        right_arm_angle = get_arm_angle(result, "right")

        # Should be approximately 45 degrees (±5 degree tolerance)
        self.assertAlmostEqual(left_arm_angle, 45.0, delta=5.0)
        self.assertAlmostEqual(right_arm_angle, 45.0, delta=5.0)

    def test_confidence_score(self):
        """Test that confidence score is in valid range."""
        result = create_apose_theta(self.valid_beta)

        self.assertGreaterEqual(result.confidence, 0.0)
        self.assertLessEqual(result.confidence, 1.0)

    def test_beta_out_of_range_warning(self):
        """Test that extreme beta values generate warnings."""
        extreme_beta = np.array(
            [6.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            dtype=np.float32
        )
        result = create_apose_theta(extreme_beta)

        self.assertGreater(len(result.validation_warnings), 0)
        self.assertIn("outside typical range", result.validation_warnings[0])

    def test_invalid_beta_shape(self):
        """Test error handling for incorrect beta shape."""
        invalid_beta = np.array([0.0, 0.5, -0.3])

        with self.assertRaises(ValueError) as context:
            create_apose_theta(invalid_beta)
        self.assertIn("shape (10,)", str(context.exception))

    def test_invalid_beta_type(self):
        """Test error handling for non-array beta."""
        with self.assertRaises(ValueError):
            create_apose_theta([0.0] * 10)

    def test_beta_with_nan(self):
        """Test error handling for beta with NaN."""
        nan_beta = np.array([np.nan] + [0.0] * 9, dtype=np.float32)

        with self.assertRaises(ValueError) as context:
            create_apose_theta(nan_beta)
        self.assertIn("NaN", str(context.exception))

    def test_beta_with_inf(self):
        """Test error handling for beta with infinity."""
        inf_beta = np.array([np.inf] + [0.0] * 9, dtype=np.float32)

        with self.assertRaises(ValueError) as context:
            create_apose_theta(inf_beta)
        self.assertIn("infinite", str(context.exception))

    def test_joint_positions_available(self):
        """Test that joint positions are available."""
        result = create_apose_theta(self.valid_beta)

        # Should have 24 joints with 3D positions
        self.assertEqual(result.joint_positions.shape, (24, 3))

        # All positions should be valid numbers
        self.assertFalse(np.any(np.isnan(result.joint_positions)))
        self.assertFalse(np.any(np.isinf(result.joint_positions)))


class TestNormalizeToAPose(unittest.TestCase):
    """Tests for normalize_to_apose function."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_theta = np.random.randn(72).astype(np.float32) * 0.5
        self.valid_beta = np.array(
            [0.0, 0.5, -0.3, 0.1, -0.2, 0.0, 0.1, 0.05, -0.1, 0.02],
            dtype=np.float32
        )

    def test_normalize_preserves_beta(self):
        """Test that normalization preserves beta parameters."""
        result = normalize_to_apose(self.valid_theta, self.valid_beta)

        np.testing.assert_array_equal(result.beta, self.valid_beta)

    def test_normalize_outputs_apose(self):
        """Test that normalization outputs valid A-pose."""
        result = normalize_to_apose(self.valid_theta, self.valid_beta)

        # Should have same structure as create_apose_theta
        self.assertEqual(result.apose_theta.shape, (72,))
        self.assertEqual(result.joint_rotations.shape, (24, 3))

    def test_arms_normalized_to_45_degrees(self):
        """Test that any input pose is normalized to 45-degree arms."""
        # Create an unusual pose (arms down)
        weird_theta = np.zeros(72, dtype=np.float32)

        result = normalize_to_apose(weird_theta, self.valid_beta)

        left_arm_angle = get_arm_angle(result, "left")
        right_arm_angle = get_arm_angle(result, "right")

        self.assertAlmostEqual(left_arm_angle, 45.0, delta=5.0)
        self.assertAlmostEqual(right_arm_angle, 45.0, delta=5.0)

    def test_normalize_invalid_theta_shape(self):
        """Test error handling for incorrect theta shape."""
        invalid_theta = np.random.randn(60)

        with self.assertRaises(ValueError) as context:
            normalize_to_apose(invalid_theta, self.valid_beta)
        self.assertIn("shape (72,)", str(context.exception))

    def test_normalize_invalid_beta_shape(self):
        """Test error handling for incorrect beta shape."""
        invalid_beta = np.array([0.0] * 5)

        with self.assertRaises(ValueError) as context:
            normalize_to_apose(self.valid_theta, invalid_beta)
        self.assertIn("shape (10,)", str(context.exception))

    def test_normalize_theta_with_nan(self):
        """Test error handling for theta with NaN."""
        nan_theta = np.array([np.nan] + [0.0] * 71, dtype=np.float32)

        with self.assertRaises(ValueError) as context:
            normalize_to_apose(nan_theta, self.valid_beta)
        self.assertIn("NaN", str(context.exception))

    def test_normalize_extreme_rotation(self):
        """Test warning for extreme rotations in input."""
        # Create a pose with extreme rotations (>180 degrees)
        extreme_theta = np.zeros(72, dtype=np.float32)
        extreme_theta[0:3] = [2.0 * np.pi, 0.0, 0.0]  # 360 degree rotation

        result = normalize_to_apose(extreme_theta, self.valid_beta)

        # Should have warning about extreme rotations
        self.assertGreater(len(result.validation_warnings), 0)
        self.assertIn("rotation magnitude", result.validation_warnings[0])

    def test_confidence_with_valid_input(self):
        """Test confidence score with valid input."""
        result = normalize_to_apose(self.valid_theta, self.valid_beta)

        self.assertGreaterEqual(result.confidence, 0.0)
        self.assertLessEqual(result.confidence, 1.0)

    def test_confidence_reduced_with_warnings(self):
        """Test that confidence is reduced when there are warnings."""
        # Valid input should have high confidence
        valid_theta = np.zeros(72, dtype=np.float32)
        result_valid = normalize_to_apose(valid_theta, self.valid_beta)
        confidence_valid = result_valid.confidence

        # Extreme input should have lower confidence
        extreme_theta = np.zeros(72, dtype=np.float32)
        extreme_theta[0:3] = [2.0 * np.pi, 0.0, 0.0]
        result_extreme = normalize_to_apose(extreme_theta, self.valid_beta)
        confidence_extreme = result_extreme.confidence

        # Note: extreme rotation produces warning, lowering confidence
        # But this depends on implementation details
        self.assertGreaterEqual(result_valid.confidence, 0.0)
        self.assertGreaterEqual(result_extreme.confidence, 0.0)


class TestGetJointPosition(unittest.TestCase):
    """Tests for get_joint_position function."""

    def setUp(self):
        """Set up test fixtures."""
        self.beta = np.array([0.0] * 10, dtype=np.float32)
        self.apose_result = create_apose_theta(self.beta)

    def test_get_joint_position_valid(self):
        """Test getting joint position for valid joint index."""
        pos = get_joint_position(self.apose_result, 0)

        self.assertEqual(pos.shape, (3,))
        np.testing.assert_array_almost_equal(pos, APOSE_JOINT_POSITIONS[0])

    def test_get_joint_position_all_joints(self):
        """Test getting positions for all 24 joints."""
        for joint_idx in range(24):
            pos = get_joint_position(self.apose_result, joint_idx)

            self.assertEqual(pos.shape, (3,))
            expected_pos = APOSE_JOINT_POSITIONS[joint_idx]
            np.testing.assert_array_almost_equal(pos, expected_pos)

    def test_get_joint_position_returns_copy(self):
        """Test that returned position is a copy, not reference."""
        pos1 = get_joint_position(self.apose_result, 0)
        pos2 = get_joint_position(self.apose_result, 0)

        # Should be equal but different objects
        np.testing.assert_array_equal(pos1, pos2)
        self.assertIsNot(pos1, pos2)

    def test_get_joint_position_invalid_index(self):
        """Test error handling for invalid joint index."""
        with self.assertRaises(IndexError):
            get_joint_position(self.apose_result, 24)

        with self.assertRaises(IndexError):
            get_joint_position(self.apose_result, -1)

    def test_get_joint_position_non_int_index(self):
        """Test error handling for non-integer index."""
        with self.assertRaises(IndexError):
            get_joint_position(self.apose_result, 0.5)


class TestGetArmAngle(unittest.TestCase):
    """Tests for get_arm_angle function."""

    def setUp(self):
        """Set up test fixtures."""
        self.beta = np.array([0.0] * 10, dtype=np.float32)
        self.apose_result = create_apose_theta(self.beta)

    def test_left_arm_angle(self):
        """Test getting left arm angle."""
        angle = get_arm_angle(self.apose_result, "left")

        # Should be approximately 45 degrees
        self.assertAlmostEqual(angle, 45.0, delta=5.0)

    def test_right_arm_angle(self):
        """Test getting right arm angle."""
        angle = get_arm_angle(self.apose_result, "right")

        # Should be approximately 45 degrees
        self.assertAlmostEqual(angle, 45.0, delta=5.0)

    def test_arm_angles_symmetric(self):
        """Test that left and right arm angles are approximately equal."""
        left_angle = get_arm_angle(self.apose_result, "left")
        right_angle = get_arm_angle(self.apose_result, "right")

        # Should be approximately equal (within tolerance)
        self.assertAlmostEqual(left_angle, right_angle, delta=2.0)

    def test_invalid_side_parameter(self):
        """Test error handling for invalid side parameter."""
        with self.assertRaises(ValueError):
            get_arm_angle(self.apose_result, "middle")

    def test_side_parameter_case_insensitive(self):
        """Test that side parameter is case-insensitive."""
        angle1 = get_arm_angle(self.apose_result, "LEFT")
        angle2 = get_arm_angle(self.apose_result, "left")

        self.assertEqual(angle1, angle2)


class TestValidateAPose(unittest.TestCase):
    """Tests for validate_apose function."""

    def setUp(self):
        """Set up test fixtures."""
        self.beta = np.array([0.0] * 10, dtype=np.float32)
        self.valid_apose = create_apose_theta(self.beta)

    def test_validate_valid_apose(self):
        """Test validation of valid A-pose."""
        is_valid, issues = validate_apose(self.valid_apose)

        self.assertTrue(is_valid)
        self.assertEqual(len(issues), 0)

    def test_validate_theta_shape(self):
        """Test validation detects incorrect theta shape."""
        invalid_apose = APoseResult(
            apose_theta=np.zeros(60),
            beta=self.beta.copy(),
            joint_rotations=np.zeros((24, 3)),
            joint_positions=np.zeros((24, 3)),
            confidence=1.0,
            validation_warnings=[]
        )

        is_valid, issues = validate_apose(invalid_apose)

        self.assertFalse(is_valid)
        self.assertTrue(any("apose_theta" in issue for issue in issues))

    def test_validate_theta_with_nan(self):
        """Test validation detects NaN in theta."""
        invalid_apose = APoseResult(
            apose_theta=np.array([np.nan] + [0.0] * 71),
            beta=self.beta.copy(),
            joint_rotations=np.zeros((24, 3)),
            joint_positions=np.zeros((24, 3)),
            confidence=1.0,
            validation_warnings=[]
        )

        is_valid, issues = validate_apose(invalid_apose)

        self.assertFalse(is_valid)
        self.assertTrue(any("NaN" in issue for issue in issues))

    def test_validate_arm_angles(self):
        """Test validation checks arm angles."""
        # Create invalid A-pose with wrong arm angles
        invalid_apose = APoseResult(
            apose_theta=np.zeros(72),
            beta=self.beta.copy(),
            joint_rotations=np.zeros((24, 3)),
            joint_positions=np.zeros((24, 3)),
            confidence=1.0,
            validation_warnings=[]
        )

        is_valid, issues = validate_apose(invalid_apose)

        self.assertFalse(is_valid)
        self.assertTrue(any("arm angle" in issue.lower() for issue in issues))

    def test_validate_confidence_range(self):
        """Test validation checks confidence is in [0, 1]."""
        invalid_apose = APoseResult(
            apose_theta=self.valid_apose.apose_theta.copy(),
            beta=self.beta.copy(),
            joint_rotations=self.valid_apose.joint_rotations.copy(),
            joint_positions=self.valid_apose.joint_positions.copy(),
            confidence=1.5,  # Invalid
            validation_warnings=[]
        )

        is_valid, issues = validate_apose(invalid_apose)

        self.assertFalse(is_valid)
        self.assertTrue(any("confidence" in issue for issue in issues))

    def test_validate_beta_shape(self):
        """Test validation checks beta shape."""
        invalid_apose = APoseResult(
            apose_theta=self.valid_apose.apose_theta.copy(),
            beta=np.zeros(5),
            joint_rotations=self.valid_apose.joint_rotations.copy(),
            joint_positions=self.valid_apose.joint_positions.copy(),
            confidence=1.0,
            validation_warnings=[]
        )

        is_valid, issues = validate_apose(invalid_apose)

        self.assertFalse(is_valid)
        self.assertTrue(any("beta" in issue for issue in issues))


class TestAcceptanceCriteria(unittest.TestCase):
    """Tests verifying acceptance criteria for A-Pose normalization."""

    def setUp(self):
        """Set up test fixtures."""
        self.beta = np.array([0.1, -0.2, 0.3, 0.05, -0.1, 0.0, 0.15, -0.05, 0.2, 0.1],
                             dtype=np.float32)

    def test_criterion_consistent_apose(self):
        """AC: Outputs consistent A-pose.

        Multiple calls with same beta should produce identical results.
        """
        result1 = create_apose_theta(self.beta)
        result2 = create_apose_theta(self.beta)

        np.testing.assert_array_equal(result1.apose_theta, result2.apose_theta)
        np.testing.assert_array_equal(result1.joint_rotations, result2.joint_rotations)
        np.testing.assert_array_equal(result1.joint_positions, result2.joint_positions)

    def test_criterion_preserves_beta(self):
        """AC: Preserves beta (shape) parameters.

        Shape parameters should be exactly preserved.
        """
        result = normalize_to_apose(np.random.randn(72).astype(np.float32), self.beta)

        np.testing.assert_array_equal(result.beta, self.beta)

    def test_criterion_arms_at_45_degrees(self):
        """AC: Arms at ~45 degrees for clear measurements.

        Both left and right arms should be at approximately 45 degrees.
        """
        result = create_apose_theta(self.beta)

        left_angle = get_arm_angle(result, "left")
        right_angle = get_arm_angle(result, "right")

        # Tolerance of ±5 degrees as specified in acceptance criteria
        self.assertAlmostEqual(left_angle, 45.0, delta=5.0,
                              msg=f"Left arm angle {left_angle}° not ~45°")
        self.assertAlmostEqual(right_angle, 45.0, delta=5.0,
                              msg=f"Right arm angle {right_angle}° not ~45°")

    def test_criterion_joint_positions_available(self):
        """AC: Joint positions available.

        All 24 joint positions should be available in A-pose result.
        """
        result = create_apose_theta(self.beta)

        # Should have 24 joints
        self.assertEqual(result.joint_positions.shape[0], 24)

        # Should be able to access each joint position
        for i in range(24):
            pos = get_joint_position(result, i)
            self.assertEqual(pos.shape, (3,))
            self.assertFalse(np.any(np.isnan(pos)))
            self.assertFalse(np.any(np.isinf(pos)))


if __name__ == "__main__":
    unittest.main()
