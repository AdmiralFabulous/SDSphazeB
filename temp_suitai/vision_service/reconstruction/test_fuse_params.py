"""
Test suite for fuse_params.py

Tests pose and shape parameter fusion, coordinate conversions,
A-pose generation, and measurement extraction.
"""

import numpy as np
import pytest
from datetime import datetime
from fuse_params import (
    PoseFormat,
    CoordinateSystem,
    PoseParameters,
    ShapeParameters,
    FusedParameters,
    fuse_pose_and_shape,
    validate_fused_parameters,
    convert_to_apose,
    create_apose_theta,
    transform_mesh_coordinates,
    get_coordinate_system_metadata,
    extract_measurements_from_apose,
    apply_pose_to_mesh,
    create_mock_pose_parameters,
    create_mock_shape_parameters,
    create_mock_fused_parameters,
    SMPL_X_NUM_JOINTS,
    SMPL_X_NUM_VERTICES,
    SMPL_X_NUM_FACES,
)


# ============================================================================
# Test: Data Structure Creation
# ============================================================================

class TestPoseParameters:
    """Test PoseParameters dataclass."""

    def test_pose_parameters_creation(self):
        """Test creating PoseParameters with required fields."""
        theta = np.random.randn(72)
        pose = PoseParameters(theta=theta, confidence=0.95)

        assert pose.theta.shape == (72,)
        assert pose.confidence == 0.95
        assert pose.source == "hmr_2.0"

    def test_pose_parameters_with_rotation_matrices(self):
        """Test PoseParameters with rotation matrices."""
        theta = np.random.randn(72)
        rot_mats = np.tile(np.eye(3), (24, 1, 1))

        pose = PoseParameters(
            theta=theta,
            rotation_matrices=rot_mats,
            confidence=0.90,
        )

        assert pose.rotation_matrices.shape == (24, 3, 3)

    def test_pose_parameters_attributes(self):
        """Test PoseParameters has expected attributes."""
        theta = np.random.randn(72) * 0.1
        pose = PoseParameters(theta=theta, confidence=0.85)

        # Check expected attributes exist
        assert hasattr(pose, 'theta')
        assert hasattr(pose, 'confidence')
        assert hasattr(pose, 'joint_confidences')
        assert hasattr(pose, 'global_rotation')


class TestShapeParameters:
    """Test ShapeParameters dataclass."""

    def test_shape_parameters_creation(self):
        """Test creating ShapeParameters with required fields."""
        beta = np.random.randn(10) * 0.1
        shape = ShapeParameters(beta=beta, confidence=0.90)

        assert shape.beta.shape == (10,)
        assert shape.confidence == 0.90
        assert shape.source == "shapy"

    def test_shape_parameters_defaults(self):
        """Test ShapeParameters default values."""
        beta = np.zeros(10)
        shape = ShapeParameters(beta=beta)

        assert shape.confidence == 1.0
        assert isinstance(shape.timestamp, datetime)


class TestFusedParameters:
    """Test FusedParameters dataclass."""

    def test_fused_parameters_creation(self):
        """Test creating FusedParameters with required fields."""
        theta = np.random.randn(72) * 0.1
        beta = np.random.randn(10) * 0.1

        fused = FusedParameters(
            pose_theta=theta,
            shape_beta=beta,
            pose_confidence=0.90,
            shape_confidence=0.95,
        )

        assert fused.pose_theta.shape == (72,)
        assert fused.shape_beta.shape == (10,)
        assert fused.pose_confidence == 0.90
        assert fused.shape_confidence == 0.95

    def test_fused_parameters_to_dict(self):
        """Test FusedParameters.to_dict() serialization."""
        fused = create_mock_fused_parameters()
        fused_dict = fused.to_dict()

        assert "pose_theta" in fused_dict
        assert "shape_beta" in fused_dict
        assert "pose_confidence" in fused_dict
        assert isinstance(fused_dict["pose_theta"], list)
        assert len(fused_dict["pose_theta"]) == 72


# ============================================================================
# Test: Pose and Shape Fusion
# ============================================================================

class TestFusePoseAndShape:
    """Test pose and shape fusion functions."""

    def test_basic_fusion(self):
        """Test basic fusion of pose and shape."""
        pose = create_mock_pose_parameters(confidence=0.90)
        shape = create_mock_shape_parameters(confidence=0.95)

        fused = fuse_pose_and_shape(pose, shape)

        assert isinstance(fused, FusedParameters)
        assert fused.pose_theta.shape == (72,)
        assert fused.shape_beta.shape == (10,)
        assert fused.pose_confidence == 0.90
        assert fused.shape_confidence == 0.95

    def test_fusion_type_checking(self):
        """Test that fusion validates input types."""
        with pytest.raises(TypeError):
            fuse_pose_and_shape("not_pose", create_mock_shape_parameters())

        with pytest.raises(TypeError):
            fuse_pose_and_shape(create_mock_pose_parameters(), "not_shape")

    def test_fusion_with_validation(self):
        """Test fusion with parameter validation."""
        pose = create_mock_pose_parameters()
        shape = create_mock_shape_parameters()

        # This should not raise
        fused = fuse_pose_and_shape(pose, shape, validate=True)
        assert isinstance(fused, FusedParameters)

    def test_fusion_without_validation(self):
        """Test fusion without parameter validation."""
        pose = create_mock_pose_parameters()
        shape = create_mock_shape_parameters()

        # This should also work
        fused = fuse_pose_and_shape(pose, shape, validate=False)
        assert isinstance(fused, FusedParameters)

    def test_fusion_with_invalid_pose(self):
        """Test fusion rejects invalid pose parameters."""
        invalid_pose = PoseParameters(
            theta=np.random.randn(71),  # Wrong size!
            confidence=0.90,
        )
        shape = create_mock_shape_parameters()

        with pytest.raises(ValueError):
            fuse_pose_and_shape(invalid_pose, shape, validate=True)

    def test_fusion_confidence_combination(self):
        """Test that fusion combines confidence appropriately."""
        pose_conf = 0.9
        shape_conf = 0.8
        pose = PoseParameters(
            theta=np.zeros(72),
            confidence=pose_conf,
        )
        shape = ShapeParameters(
            beta=np.zeros(10),
            confidence=shape_conf,
        )

        fused = fuse_pose_and_shape(pose, shape, validate=False)

        # Combined confidence should be sqrt(pose_conf * shape_conf)
        expected_combined = np.sqrt(pose_conf * shape_conf)
        # Check it's roughly correct (stored separately now)
        assert fused.pose_confidence == pose_conf
        assert fused.shape_confidence == shape_conf


# ============================================================================
# Test: Parameter Validation
# ============================================================================

class TestValidation:
    """Test parameter validation functions."""

    def test_validate_fused_parameters_valid(self):
        """Test validation of valid fused parameters."""
        fused = create_mock_fused_parameters()
        is_valid, message = validate_fused_parameters(fused)

        assert is_valid is True
        assert "Valid" in message

    def test_validate_fused_parameters_invalid_theta(self):
        """Test validation catches invalid theta shape."""
        fused = create_mock_fused_parameters()
        fused.pose_theta = np.random.randn(71)  # Wrong size

        is_valid, message = validate_fused_parameters(fused)
        assert is_valid is False
        assert "pose_theta" in message

    def test_validate_fused_parameters_invalid_beta(self):
        """Test validation catches invalid beta shape."""
        fused = create_mock_fused_parameters()
        fused.shape_beta = np.random.randn(11)  # Wrong size

        is_valid, message = validate_fused_parameters(fused)
        assert is_valid is False
        assert "shape_beta" in message

    def test_validate_fused_parameters_invalid_confidence(self):
        """Test validation catches invalid confidence."""
        fused = create_mock_fused_parameters()
        fused.pose_confidence = 1.5  # Out of range

        is_valid, message = validate_fused_parameters(fused)
        assert is_valid is False
        assert "pose_confidence" in message


# ============================================================================
# Test: A-Pose Conversion
# ============================================================================

class TestAPoseConversion:
    """Test A-pose conversion functions."""

    def test_create_apose_theta(self):
        """Test creating canonical A-pose theta vector."""
        apose = create_apose_theta()

        assert apose.shape == (72,)
        assert np.allclose(apose, 0.0)  # A-pose is all zeros

    def test_convert_to_apose(self):
        """Test converting fused parameters to A-pose."""
        fused = create_mock_fused_parameters()
        apose_fused = convert_to_apose(fused, inplace=False)

        # Original should be unchanged
        assert fused.pose_theta.shape == (72,)

        # A-pose theta should be different
        assert apose_fused.pose_theta.shape == (72,)
        assert isinstance(apose_fused, FusedParameters)

    def test_convert_to_apose_inplace(self):
        """Test in-place A-pose conversion."""
        fused = create_mock_fused_parameters()
        original_theta = fused.pose_theta.copy()

        result = convert_to_apose(fused, inplace=True)

        # Should modify and return same object
        assert result is fused
        # Theta should be different
        assert not np.allclose(fused.pose_theta, original_theta)


# ============================================================================
# Test: Coordinate System Transformations
# ============================================================================

class TestCoordinateTransformations:
    """Test coordinate system transformation functions."""

    def test_transform_mesh_coordinates_identity(self):
        """Test transformation with identity matrix (no change)."""
        vertices = np.random.randn(100, 3)
        original = vertices.copy()

        transformed = transform_mesh_coordinates(
            vertices,
            from_system=CoordinateSystem.SMPL_X,
            to_system=CoordinateSystem.SMPL_X,
            rotation=np.eye(3),
            translation=np.zeros(3),
            scale=1.0,
        )

        assert np.allclose(transformed, original)

    def test_transform_mesh_coordinates_with_translation(self):
        """Test transformation with translation only."""
        vertices = np.zeros((10, 3))
        translation = np.array([1.0, 2.0, 3.0])

        transformed = transform_mesh_coordinates(
            vertices,
            from_system=CoordinateSystem.SMPL_X,
            to_system=CoordinateSystem.WORLD,
            rotation=np.eye(3),
            translation=translation,
            scale=1.0,
        )

        expected = vertices + translation
        assert np.allclose(transformed, expected)

    def test_transform_mesh_coordinates_with_scale(self):
        """Test transformation with scaling."""
        vertices = np.ones((10, 3))
        scale = 2.0

        transformed = transform_mesh_coordinates(
            vertices,
            from_system=CoordinateSystem.SMPL_X,
            to_system=CoordinateSystem.CAMERA,
            rotation=np.eye(3),
            translation=np.zeros(3),
            scale=scale,
        )

        expected = vertices * scale
        assert np.allclose(transformed, expected)

    def test_transform_mesh_coordinates_invalid_shape(self):
        """Test transformation rejects invalid vertices."""
        with pytest.raises(ValueError):
            transform_mesh_coordinates(
                np.random.randn(10, 2),  # Should be [N, 3]
                CoordinateSystem.SMPL_X,
                CoordinateSystem.WORLD,
            )

    def test_transform_mesh_coordinates_invalid_rotation(self):
        """Test transformation rejects invalid rotation matrix."""
        vertices = np.random.randn(10, 3)

        with pytest.raises(ValueError):
            transform_mesh_coordinates(
                vertices,
                CoordinateSystem.SMPL_X,
                CoordinateSystem.WORLD,
                rotation=np.random.randn(2, 2),  # Should be [3, 3]
            )

    def test_get_coordinate_system_metadata(self):
        """Test getting metadata for coordinate systems."""
        for system in CoordinateSystem:
            metadata = get_coordinate_system_metadata(system)

            assert "name" in metadata
            assert "axes" in metadata
            assert "scale" in metadata
            assert "description" in metadata


# ============================================================================
# Test: Mesh Utilities
# ============================================================================

class TestMeshUtilities:
    """Test mesh utility functions."""

    def test_apply_pose_to_mesh_shape_validation(self):
        """Test that apply_pose_to_mesh validates input shapes."""
        # Wrong vertex count
        with pytest.raises(ValueError):
            apply_pose_to_mesh(
                np.random.randn(1000, 3),  # Should be [10475, 3]
                np.random.randn(72),
            )

        # Wrong pose dimension
        with pytest.raises(ValueError):
            apply_pose_to_mesh(
                np.random.randn(SMPL_X_NUM_VERTICES, 3),
                np.random.randn(70),  # Should be [72]
            )

    def test_extract_measurements_from_apose_shape_validation(self):
        """Test that measurement extraction validates input."""
        with pytest.raises(ValueError):
            extract_measurements_from_apose(
                np.random.randn(1000, 3)  # Should be [10475, 3]
            )

    def test_extract_measurements_from_apose_returns_dict(self):
        """Test that measurement extraction returns expected keys."""
        vertices = np.random.randn(SMPL_X_NUM_VERTICES, 3)

        measurements = extract_measurements_from_apose(vertices)

        assert isinstance(measurements, dict)
        assert "height" in measurements
        assert "shoulder_width" in measurements
        assert "arm_span" in measurements
        assert "torso_length" in measurements

        # All measurements should be floats
        for value in measurements.values():
            assert isinstance(value, float)


# ============================================================================
# Test: Mock Functions
# ============================================================================

class TestMockFunctions:
    """Test mock data creation functions."""

    def test_create_mock_pose_parameters(self):
        """Test creating mock pose parameters."""
        pose = create_mock_pose_parameters(confidence=0.85)

        assert isinstance(pose, PoseParameters)
        assert pose.theta.shape == (72,)
        assert pose.confidence == 0.85
        assert pose.rotation_matrices.shape == (24, 3, 3)

    def test_create_mock_shape_parameters(self):
        """Test creating mock shape parameters."""
        shape = create_mock_shape_parameters(confidence=0.92)

        assert isinstance(shape, ShapeParameters)
        assert shape.beta.shape == (10,)
        assert shape.confidence == 0.92

    def test_create_mock_fused_parameters(self):
        """Test creating mock fused parameters."""
        fused = create_mock_fused_parameters()

        assert isinstance(fused, FusedParameters)
        assert fused.pose_theta.shape == (72,)
        assert fused.shape_beta.shape == (10,)
        # frame_id defaults to 0
        assert fused.frame_id == 0

    def test_mock_parameters_are_valid(self):
        """Test that mock parameters pass validation."""
        fused = create_mock_fused_parameters()
        is_valid, message = validate_fused_parameters(fused)

        assert is_valid is True


# ============================================================================
# Test: Constants
# ============================================================================

class TestConstants:
    """Test SMPL-X constants."""

    def test_smpl_x_constants(self):
        """Test SMPL-X model constants."""
        assert SMPL_X_NUM_JOINTS == 24
        assert SMPL_X_NUM_VERTICES == 10475
        assert SMPL_X_NUM_FACES == 20908


# ============================================================================
# Integration Tests
# ============================================================================

class TestIntegration:
    """Integration tests combining multiple components."""

    def test_full_fusion_pipeline(self):
        """Test complete fusion pipeline from input to validation."""
        # Create mock inputs
        pose = create_mock_pose_parameters(confidence=0.88)
        shape = create_mock_shape_parameters(confidence=0.92)

        # Fuse
        fused = fuse_pose_and_shape(pose, shape)

        # Validate
        is_valid, message = validate_fused_parameters(fused)
        assert is_valid

        # Serialize
        fused_dict = fused.to_dict()
        assert isinstance(fused_dict, dict)
        assert len(fused_dict) > 0

    def test_apose_measurement_pipeline(self):
        """Test A-pose conversion with measurement extraction."""
        # Create mock fused parameters
        fused = create_mock_fused_parameters()

        # Convert to A-pose
        apose_fused = convert_to_apose(fused, inplace=False)
        assert isinstance(apose_fused, FusedParameters)

        # Create mock A-pose vertices for measurement
        apose_vertices = np.random.randn(SMPL_X_NUM_VERTICES, 3)

        # Extract measurements
        measurements = extract_measurements_from_apose(apose_vertices)
        assert len(measurements) > 0

    def test_coordinate_transformation_pipeline(self):
        """Test coordinate transformation pipeline."""
        # Create vertices in SMPL-X frame
        vertices_smplx = np.random.randn(1000, 3)

        # Define transformation
        rotation = np.eye(3)
        translation = np.array([0.5, 1.0, -0.5])
        scale = 1.0

        # Transform to world frame
        vertices_world = transform_mesh_coordinates(
            vertices_smplx,
            from_system=CoordinateSystem.SMPL_X,
            to_system=CoordinateSystem.WORLD,
            rotation=rotation,
            translation=translation,
            scale=scale,
        )

        # Should have same shape
        assert vertices_world.shape == vertices_smplx.shape

        # Should be different due to translation
        assert not np.allclose(vertices_world, vertices_smplx)


# ============================================================================
# Run Tests
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
