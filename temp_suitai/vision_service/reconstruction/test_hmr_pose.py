"""
Comprehensive tests for HMR 2.0 Pose Estimation Module.

Tests cover:
- Data structure validation
- Image preprocessing and postprocessing
- Rotation matrix conversions
- Pose estimation pipeline
- Mock implementations
"""

import pytest
import numpy as np
import cv2
from datetime import datetime

from .hmr_pose import (
    PoseParameters,
    HMRPoseResult,
    HMRPoseEstimator,
    preprocess_image,
    postprocess_coordinates,
    axis_angle_to_rotation_matrix,
    rotation_matrix_to_axis_angle,
    batch_axis_angle_to_rotation_matrices,
    create_mock_pose_parameters,
    create_mock_hmr_pose_estimator,
)


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def sample_image_rgb():
    """Create a sample RGB image for testing."""
    return np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)


@pytest.fixture
def sample_image_gray():
    """Create a sample grayscale image for testing."""
    return np.random.randint(0, 256, (480, 640), dtype=np.uint8)


@pytest.fixture
def sample_image_bgra():
    """Create a sample BGRA image for testing."""
    return np.random.randint(0, 256, (480, 640, 4), dtype=np.uint8)


@pytest.fixture
def mock_pose_params():
    """Create mock pose parameters."""
    return create_mock_pose_parameters(frame_id=0, confidence=0.9)


@pytest.fixture
def mock_estimator():
    """Create mock HMR estimator."""
    return create_mock_hmr_pose_estimator()


# ============================================================================
# Tests: PoseParameters Dataclass
# ============================================================================

class TestPoseParameters:
    """Tests for PoseParameters data structure."""

    def test_creation_with_defaults(self):
        """Test creating PoseParameters with default values."""
        pose_theta = np.random.randn(72) * 0.1
        rotation_matrices = np.tile(np.eye(3), (24, 1, 1))

        params = PoseParameters(
            pose_theta=pose_theta,
            rotation_matrices=rotation_matrices,
        )

        assert params.pose_theta.shape == (72,)
        assert params.rotation_matrices.shape == (24, 3, 3)
        assert params.confidence == 1.0
        assert params.frame_id == 0
        assert isinstance(params.timestamp, datetime)

    def test_pose_theta_dimensions(self, mock_pose_params):
        """Test pose_theta has correct 72-dim size."""
        assert mock_pose_params.pose_theta.shape == (72,)
        assert mock_pose_params.pose_theta.dtype in [np.float32, np.float64]

    def test_rotation_matrices_dimensions(self, mock_pose_params):
        """Test rotation_matrices has correct shape [24, 3, 3]."""
        assert mock_pose_params.rotation_matrices.shape == (24, 3, 3)

    def test_rotation_matrices_are_orthogonal(self, mock_pose_params):
        """Verify rotation matrices are orthogonal (R^T @ R = I)."""
        for i in range(24):
            R = mock_pose_params.rotation_matrices[i]
            product = R.T @ R
            np.testing.assert_array_almost_equal(product, np.eye(3), decimal=5)

    def test_rotation_matrices_have_unit_determinant(self, mock_pose_params):
        """Verify rotation matrices have determinant close to 1."""
        for i in range(24):
            R = mock_pose_params.rotation_matrices[i]
            det = np.linalg.det(R)
            assert np.abs(det - 1.0) < 0.01, f"Joint {i} has det={det}"

    def test_confidence_range(self, mock_pose_params):
        """Test confidence score is in valid range [0, 1]."""
        assert 0.0 <= mock_pose_params.confidence <= 1.0

    def test_joint_confidences(self, mock_pose_params):
        """Test per-joint confidences are valid."""
        assert mock_pose_params.joint_confidences.shape == (24,)
        assert np.all((mock_pose_params.joint_confidences >= 0.0) &
                      (mock_pose_params.joint_confidences <= 1.0))

    def test_to_dict_serialization(self, mock_pose_params):
        """Test conversion to dictionary for serialization."""
        d = mock_pose_params.to_dict()

        assert "pose_theta" in d
        assert "rotation_matrices" in d
        assert "global_rotation" in d
        assert "global_translation" in d
        assert "confidence" in d
        assert "joint_confidences" in d
        assert "frame_id" in d
        assert "timestamp" in d

        # Verify shapes in serialized form
        assert len(d["pose_theta"]) == 72
        assert len(d["rotation_matrices"]) == 24
        assert len(d["joint_confidences"]) == 24


# ============================================================================
# Tests: Image Preprocessing
# ============================================================================

class TestImagePreprocessing:
    """Tests for image preprocessing utilities."""

    def test_preprocess_rgb_image(self, sample_image_rgb):
        """Test preprocessing RGB image."""
        preprocessed, scales = preprocess_image(sample_image_rgb, target_size=224)

        assert preprocessed.shape == (224, 224, 3)
        assert preprocessed.dtype == np.float32
        assert np.min(preprocessed) >= -1.0
        assert np.max(preprocessed) <= 1.0
        assert len(scales) == 2
        assert scales[0] == pytest.approx(480 / 224, rel=1e-5)
        assert scales[1] == pytest.approx(640 / 224, rel=1e-5)

    def test_preprocess_grayscale_image(self, sample_image_gray):
        """Test preprocessing grayscale image (converts to RGB)."""
        preprocessed, scales = preprocess_image(sample_image_gray, target_size=224)

        assert preprocessed.shape == (224, 224, 3)
        assert preprocessed.dtype == np.float32

    def test_preprocess_bgra_image(self, sample_image_bgra):
        """Test preprocessing BGRA image (converts to RGB)."""
        preprocessed, scales = preprocess_image(sample_image_bgra, target_size=224)

        assert preprocessed.shape == (224, 224, 3)
        assert preprocessed.dtype == np.float32

    def test_preprocess_without_normalization(self, sample_image_rgb):
        """Test preprocessing without normalization."""
        preprocessed, _ = preprocess_image(
            sample_image_rgb,
            target_size=224,
            normalize=False,
        )

        assert np.min(preprocessed) >= 0.0
        assert np.max(preprocessed) <= 1.0

    def test_preprocess_invalid_input_type(self):
        """Test preprocessing raises error on non-array input."""
        with pytest.raises(TypeError):
            preprocess_image([1, 2, 3])

    def test_preprocess_invalid_image_dimensions(self):
        """Test preprocessing raises error on invalid dimensions."""
        invalid_image = np.random.rand(2, 3, 2, 5)  # 4D array
        with pytest.raises(ValueError):
            preprocess_image(invalid_image)

    def test_preprocess_different_sizes(self):
        """Test preprocessing with different target sizes."""
        image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)

        for target_size in [224, 256, 512]:
            preprocessed, scales = preprocess_image(image, target_size=target_size)
            assert preprocessed.shape == (target_size, target_size, 3)


# ============================================================================
# Tests: Postprocessing Coordinates
# ============================================================================

class TestPostprocessCoordinates:
    """Tests for coordinate postprocessing."""

    def test_postprocess_2d_point(self):
        """Test postprocessing single 2D point."""
        point = np.array([0.5, 0.5])
        scales = (2.0, 2.0)
        result = postprocess_coordinates(point, scales)

        assert result[0] == pytest.approx(1.0)
        assert result[1] == pytest.approx(1.0)

    def test_postprocess_2d_points_batch(self):
        """Test postprocessing batch of 2D points."""
        points = np.array([[0.5, 0.5], [0.2, 0.3], [0.8, 0.9]])
        scales = (2.0, 3.0)
        result = postprocess_coordinates(points, scales)

        assert result.shape == (3, 2)
        np.testing.assert_array_almost_equal(result[0], [1.5, 1.0])
        np.testing.assert_array_almost_equal(result[1], [0.6, 0.6])

    def test_postprocess_3d_points(self):
        """Test postprocessing 3D points (only x, y scaled)."""
        points = np.array([[0.5, 0.5, 0.0], [0.2, 0.3, 1.0]])
        scales = (2.0, 2.0)
        result = postprocess_coordinates(points, scales)

        assert result.shape == (2, 3)
        # Only x, y should be scaled
        np.testing.assert_array_almost_equal(result[0, :2], [1.0, 1.0])
        assert result[0, 2] == 0.0
        assert result[1, 2] == 1.0

    def test_postprocess_invalid_input(self):
        """Test postprocessing raises error on invalid input."""
        with pytest.raises(TypeError):
            postprocess_coordinates([1, 2], (2.0, 2.0))


# ============================================================================
# Tests: Rotation Matrix Conversions
# ============================================================================

class TestRotationConversions:
    """Tests for rotation matrix and axis-angle conversions."""

    def test_axis_angle_to_rotation_identity(self):
        """Test zero axis-angle converts to identity matrix."""
        axis_angle = np.zeros(3)
        R = axis_angle_to_rotation_matrix(axis_angle)

        np.testing.assert_array_almost_equal(R, np.eye(3), decimal=6)

    def test_axis_angle_to_rotation_small_angle(self):
        """Test small angle conversion."""
        axis_angle = np.array([0.1, 0.0, 0.0])  # Small rotation around x-axis
        R = axis_angle_to_rotation_matrix(axis_angle)

        # Should be close to identity
        assert np.allclose(R, np.eye(3), atol=0.1)
        # Should be orthogonal
        np.testing.assert_array_almost_equal(R @ R.T, np.eye(3), decimal=5)

    def test_axis_angle_to_rotation_90_degrees(self):
        """Test 90-degree rotation."""
        axis_angle = np.array([np.pi / 2, 0, 0])  # 90° around x-axis
        R = axis_angle_to_rotation_matrix(axis_angle)

        # Check orthogonality
        np.testing.assert_array_almost_equal(R @ R.T, np.eye(3), decimal=5)

        # Check determinant
        det = np.linalg.det(R)
        assert np.abs(det - 1.0) < 1e-5

    def test_rotation_matrix_to_axis_angle_identity(self):
        """Test identity matrix converts to zero axis-angle."""
        R = np.eye(3)
        axis_angle = rotation_matrix_to_axis_angle(R)

        np.testing.assert_array_almost_equal(axis_angle, np.zeros(3), decimal=6)

    def test_rotation_roundtrip_conversion(self):
        """Test roundtrip conversion axis-angle -> R -> axis-angle."""
        original_axis_angle = np.array([0.5, 0.3, 0.2])
        R = axis_angle_to_rotation_matrix(original_axis_angle)
        recovered_axis_angle = rotation_matrix_to_axis_angle(R)

        # Should recover original (up to numerical precision)
        np.testing.assert_array_almost_equal(original_axis_angle, recovered_axis_angle, decimal=5)

    def test_batch_axis_angle_conversion(self):
        """Test batch conversion of axis-angle to rotation matrices."""
        batch_axis_angles = np.random.randn(24, 3) * 0.1
        rotation_matrices = batch_axis_angle_to_rotation_matrices(batch_axis_angles)

        assert rotation_matrices.shape == (24, 3, 3)

        # Check all matrices are orthogonal
        for i in range(24):
            R = rotation_matrices[i]
            np.testing.assert_array_almost_equal(R @ R.T, np.eye(3), decimal=5)
            det = np.linalg.det(R)
            assert np.abs(det - 1.0) < 0.01

    def test_rotation_invalid_input_shape(self):
        """Test rotation conversion raises error on invalid shape."""
        with pytest.raises(ValueError):
            axis_angle_to_rotation_matrix(np.array([0.1, 0.2]))

        with pytest.raises(ValueError):
            rotation_matrix_to_axis_angle(np.eye(4))


# ============================================================================
# Tests: HMR Pose Estimator
# ============================================================================

class TestHMRPoseEstimator:
    """Tests for HMRPoseEstimator class."""

    def test_create_mock_estimator(self):
        """Test creating mock estimator."""
        estimator = create_mock_hmr_pose_estimator()

        assert estimator is not None
        assert estimator.use_mock is True
        assert estimator.device == "cpu"
        assert estimator.input_size == 224

    def test_estimate_pose_rgb_image(self, mock_estimator, sample_image_rgb):
        """Test pose estimation on RGB image."""
        result = mock_estimator.estimate_pose(sample_image_rgb)

        assert isinstance(result, HMRPoseResult)
        assert isinstance(result.pose_params, PoseParameters)
        assert result.image_preprocessed.shape == (224, 224, 3)
        assert result.processing_time_ms > 0

    def test_estimate_pose_grayscale_image(self, mock_estimator, sample_image_gray):
        """Test pose estimation on grayscale image."""
        result = mock_estimator.estimate_pose(sample_image_gray)

        assert isinstance(result, HMRPoseResult)
        assert result.pose_params.pose_theta.shape == (72,)

    def test_pose_result_pose_theta_valid(self, mock_estimator, sample_image_rgb):
        """Test pose_theta output is valid."""
        result = mock_estimator.estimate_pose(sample_image_rgb)
        pose_theta = result.pose_params.pose_theta

        assert pose_theta.shape == (72,)
        assert np.all(np.isfinite(pose_theta))

    def test_pose_result_rotation_matrices_valid(self, mock_estimator, sample_image_rgb):
        """Test rotation matrices output is valid."""
        result = mock_estimator.estimate_pose(sample_image_rgb)
        rot_mats = result.pose_params.rotation_matrices

        assert rot_mats.shape == (24, 3, 3)
        # Check orthogonality
        for i in range(24):
            R = rot_mats[i]
            product = R @ R.T
            np.testing.assert_array_almost_equal(product, np.eye(3), decimal=5)

    def test_estimate_pose_multiple_frames(self, mock_estimator, sample_image_rgb):
        """Test pose estimation on multiple frames tracks frame_id."""
        result1 = mock_estimator.estimate_pose(sample_image_rgb)
        result2 = mock_estimator.estimate_pose(sample_image_rgb)
        result3 = mock_estimator.estimate_pose(sample_image_rgb)

        assert result1.pose_params.frame_id == 0
        assert result2.pose_params.frame_id == 1
        assert result3.pose_params.frame_id == 2

    def test_confidence_scores(self, mock_estimator, sample_image_rgb):
        """Test confidence scores are valid."""
        result = mock_estimator.estimate_pose(sample_image_rgb)

        assert 0.0 <= result.pose_params.confidence <= 1.0
        assert result.pose_params.joint_confidences.shape == (24,)
        assert np.all((result.pose_params.joint_confidences >= 0.0) &
                      (result.pose_params.joint_confidences <= 1.0))

    def test_average_processing_time(self, mock_estimator, sample_image_rgb):
        """Test processing time tracking."""
        mock_estimator.estimate_pose(sample_image_rgb)
        mock_estimator.estimate_pose(sample_image_rgb)

        avg_time = mock_estimator.get_average_processing_time()
        assert avg_time > 0

    def test_reset_statistics(self, mock_estimator, sample_image_rgb):
        """Test resetting statistics."""
        mock_estimator.estimate_pose(sample_image_rgb)
        mock_estimator.estimate_pose(sample_image_rgb)
        mock_estimator.reset_statistics()

        assert mock_estimator.get_average_processing_time() == 0.0

    def test_estimate_pose_invalid_input(self, mock_estimator):
        """Test pose estimation raises error on invalid input."""
        with pytest.raises(TypeError):
            mock_estimator.estimate_pose([1, 2, 3])


# ============================================================================
# Tests: Mock Functions
# ============================================================================

class TestMockFunctions:
    """Tests for mock/convenience functions."""

    def test_create_mock_pose_parameters(self):
        """Test creating mock pose parameters."""
        params = create_mock_pose_parameters(frame_id=5, confidence=0.85)

        assert params.frame_id == 5
        assert params.confidence == 0.85
        assert params.pose_theta.shape == (72,)
        assert params.rotation_matrices.shape == (24, 3, 3)

    def test_mock_pose_parameters_reproducible(self):
        """Test mock parameters can be created multiple times."""
        p1 = create_mock_pose_parameters()
        p2 = create_mock_pose_parameters()

        # Should have same shapes
        assert p1.pose_theta.shape == p2.pose_theta.shape
        assert p1.rotation_matrices.shape == p2.rotation_matrices.shape


# ============================================================================
# Integration Tests
# ============================================================================

class TestIntegration:
    """Integration tests for full pipeline."""

    def test_preprocess_estimate_workflow(self, mock_estimator, sample_image_rgb):
        """Test complete preprocessing and estimation workflow."""
        # Direct preprocessing
        preprocessed, scales = preprocess_image(sample_image_rgb, target_size=224)

        # Estimation
        result = mock_estimator.estimate_pose(sample_image_rgb)

        # Verify preprocessing matches
        np.testing.assert_array_almost_equal(
            preprocessed,
            result.image_preprocessed,
            decimal=5
        )

    def test_pose_confidence_consistency(self, mock_estimator, sample_image_rgb):
        """Test overall confidence relates to joint confidences."""
        result = mock_estimator.estimate_pose(sample_image_rgb)

        overall = result.pose_params.confidence
        joint = result.pose_params.joint_confidences

        # Overall confidence should be in similar range as joints
        assert overall >= np.min(joint) - 0.1
        assert overall <= np.max(joint) + 0.1

    def test_serialization_roundtrip(self, mock_pose_params):
        """Test pose parameters can be serialized and reconstructed."""
        d = mock_pose_params.to_dict()

        # Verify all required fields are serialized
        required_keys = {
            "pose_theta", "rotation_matrices", "global_rotation",
            "global_translation", "confidence", "joint_confidences",
            "frame_id", "timestamp"
        }

        assert required_keys.issubset(d.keys())


# ============================================================================
# Performance Tests
# ============================================================================

class TestPerformance:
    """Tests for performance characteristics."""

    def test_preprocessing_speed(self, sample_image_rgb):
        """Test preprocessing speed is reasonable."""
        import time

        start = time.time()
        for _ in range(100):
            preprocess_image(sample_image_rgb, target_size=224)
        elapsed = time.time() - start

        # 100 preprocesses should complete quickly (< 5 seconds)
        assert elapsed < 5.0

    def test_rotation_conversion_batch_speed(self):
        """Test batch rotation conversion speed."""
        import time

        batch = np.random.randn(100, 24, 3) * 0.1

        start = time.time()
        for axis_angles in batch:
            batch_axis_angle_to_rotation_matrices(axis_angles)
        elapsed = time.time() - start

        # Should complete reasonably fast
        assert elapsed < 2.0
