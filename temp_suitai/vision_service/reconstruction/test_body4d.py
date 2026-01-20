"""
Tests for SAM-Body4D 4D reconstruction module.

Covers:
- Temporal buffer management
- Mesh sequence retrieval
- Shape parameter averaging
- Temporal consistency analysis
- Validation and error handling
"""

import pytest
import numpy as np
from datetime import datetime, timedelta

from body4d import (
    Body4D,
    MHRMesh,
    ShapeParameters,
    AveragedShapeParameters,
    create_mock_shape_parameters,
    create_mock_mhr_mesh,
)


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def body4d():
    """Create a fresh Body4D instance for testing."""
    return Body4D(buffer_size=30, confidence_threshold=0.5)


@pytest.fixture
def mock_mesh():
    """Create a mock MHR mesh."""
    return create_mock_mhr_mesh(height=1.70, frame_id=0, confidence=0.95)


@pytest.fixture
def mock_mesh_sequence():
    """Create a sequence of mock meshes with varying heights."""
    meshes = []
    for i in range(10):
        height = 1.70 + 0.01 * np.sin(i * 0.5)  # Slight variation
        mesh = create_mock_mhr_mesh(height=height, frame_id=i, confidence=0.90 + 0.05 * np.cos(i))
        meshes.append(mesh)
    return meshes


# ============================================================================
# Tests: Mesh Management
# ============================================================================

class TestMeshManagement:
    """Test mesh addition and retrieval."""

    def test_add_mesh_success(self, body4d, mock_mesh):
        """Test successful mesh addition."""
        result = body4d.add_mesh(mock_mesh)
        assert result is True
        assert body4d.get_buffer_size() == 1

    def test_add_mesh_below_confidence_threshold(self, body4d):
        """Test that low-confidence meshes are rejected."""
        mesh = create_mock_mhr_mesh(confidence=0.3)  # Below threshold of 0.5
        result = body4d.add_mesh(mesh)
        assert result is False
        assert body4d.get_buffer_size() == 0

    def test_add_multiple_meshes(self, body4d, mock_mesh_sequence):
        """Test adding multiple meshes."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        assert body4d.get_buffer_size() == len(mock_mesh_sequence)

    def test_buffer_fifo_behavior(self, body4d):
        """Test that buffer respects max size (FIFO)."""
        body4d_small = Body4D(buffer_size=5)

        for i in range(10):
            mesh = create_mock_mhr_mesh(frame_id=i)
            body4d_small.add_mesh(mesh)

        # Should only have last 5 meshes
        assert body4d_small.get_buffer_size() == 5

    def test_get_latest_mesh(self, body4d, mock_mesh_sequence):
        """Test retrieving the latest mesh."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        latest = body4d.get_latest_mesh()
        assert latest is not None
        assert latest.frame_id == len(mock_mesh_sequence) - 1

    def test_get_latest_mesh_empty_buffer(self, body4d):
        """Test getting latest mesh from empty buffer."""
        latest = body4d.get_latest_mesh()
        assert latest is None

    def test_clear_buffer(self, body4d, mock_mesh_sequence):
        """Test clearing the buffer."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        assert body4d.get_buffer_size() > 0
        count = body4d.clear_buffer()
        assert count == len(mock_mesh_sequence)
        assert body4d.get_buffer_size() == 0

    def test_frame_id_assignment(self, body4d):
        """Test that frame IDs are assigned sequentially."""
        for i in range(5):
            mesh = create_mock_mhr_mesh()
            body4d.add_mesh(mesh)

        meshes = body4d.get_mesh_sequence()
        for i, mesh in enumerate(meshes):
            assert mesh.frame_id == i


# ============================================================================
# Tests: Mesh Sequence Retrieval
# ============================================================================

class TestMeshSequenceRetrieval:
    """Test mesh sequence retrieval functionality."""

    def test_get_mesh_sequence_all(self, body4d, mock_mesh_sequence):
        """Test retrieving all meshes."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        sequence = body4d.get_mesh_sequence()
        assert len(sequence) == len(mock_mesh_sequence)

    def test_get_mesh_sequence_range(self, body4d, mock_mesh_sequence):
        """Test retrieving a subset of meshes."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        sequence = body4d.get_mesh_sequence(start_frame=2, end_frame=5)
        assert len(sequence) == 4
        assert sequence[0].frame_id == 2
        assert sequence[-1].frame_id == 5

    def test_get_mesh_sequence_empty_buffer(self, body4d):
        """Test sequence retrieval from empty buffer."""
        sequence = body4d.get_mesh_sequence()
        assert sequence == []

    def test_get_mesh_sequence_invalid_range(self, body4d, mock_mesh_sequence):
        """Test sequence retrieval with invalid range."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        sequence = body4d.get_mesh_sequence(start_frame=100, end_frame=200)
        assert sequence == []

    def test_get_mesh_sequence_negative_indices(self, body4d, mock_mesh_sequence):
        """Test sequence with negative start frame (should be clamped)."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        sequence = body4d.get_mesh_sequence(start_frame=-5, end_frame=3)
        assert len(sequence) == 4


# ============================================================================
# Tests: Shape Parameters and Averaging
# ============================================================================

class TestShapeParameters:
    """Test shape parameter functionality."""

    def test_shape_params_to_dict(self):
        """Test ShapeParameters serialization."""
        params = create_mock_shape_parameters(height=1.75, confidence=0.92)
        d = params.to_dict()

        assert d["height"] == 1.75
        assert d["confidence"] == 0.92
        assert "torso_ratio" in d
        assert "timestamp" in d

    def test_averaged_shape_parameters_single_mesh(self, body4d, mock_mesh):
        """Test averaging with single mesh."""
        body4d.add_mesh(mock_mesh)
        averaged = body4d.get_averaged_shape_parameters()

        assert averaged is not None
        assert averaged.num_samples == 1
        assert averaged.height_mean == mock_mesh.shape_params.height
        assert averaged.height_std == 0.0

    def test_averaged_shape_parameters_multiple_meshes(self, body4d, mock_mesh_sequence):
        """Test averaging with multiple meshes."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        averaged = body4d.get_averaged_shape_parameters()

        assert averaged is not None
        assert averaged.num_samples == len(mock_mesh_sequence)

        # Verify means are calculated
        assert averaged.height_mean > 0
        assert averaged.shoulder_width_mean > 0
        assert averaged.chest_depth_mean > 0

        # Standard deviation should be > 0 for variable data
        assert averaged.height_std > 0

    def test_averaged_shape_parameters_empty_buffer(self, body4d):
        """Test averaging with empty buffer."""
        averaged = body4d.get_averaged_shape_parameters()
        assert averaged is None

    def test_averaged_params_to_dict(self, body4d, mock_mesh_sequence):
        """Test AveragedShapeParameters serialization."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        averaged = body4d.get_averaged_shape_parameters()
        d = averaged.to_dict()

        assert "height_mean" in d
        assert "height_std" in d
        assert "num_samples" in d
        assert d["num_samples"] == len(mock_mesh_sequence)

    def test_get_shape_trajectory(self, body4d, mock_mesh_sequence):
        """Test retrieving shape parameter trajectory."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        trajectory = body4d.get_shape_trajectory("height")
        assert trajectory is not None
        assert len(trajectory) == len(mock_mesh_sequence)

    def test_get_shape_trajectory_invalid_param(self, body4d, mock_mesh):
        """Test shape trajectory with invalid parameter name."""
        body4d.add_mesh(mock_mesh)
        trajectory = body4d.get_shape_trajectory("invalid_param")
        assert trajectory is None

    def test_get_shape_trajectory_empty_buffer(self, body4d):
        """Test trajectory retrieval from empty buffer."""
        trajectory = body4d.get_shape_trajectory("height")
        assert trajectory is None


# ============================================================================
# Tests: Temporal Analysis
# ============================================================================

class TestTemporalAnalysis:
    """Test temporal consistency analysis."""

    def test_buffer_size_tracking(self, body4d, mock_mesh_sequence):
        """Test buffer size tracking."""
        assert body4d.get_buffer_size() == 0

        for i, mesh in enumerate(mock_mesh_sequence):
            body4d.add_mesh(mesh)
            assert body4d.get_buffer_size() == i + 1

    def test_is_buffer_full(self):
        """Test buffer fullness check."""
        body4d_small = Body4D(buffer_size=3)

        assert not body4d_small.is_buffer_full()

        mesh1 = create_mock_mhr_mesh(frame_id=0)
        body4d_small.add_mesh(mesh1)
        assert not body4d_small.is_buffer_full()

        mesh2 = create_mock_mhr_mesh(frame_id=1)
        body4d_small.add_mesh(mesh2)
        assert not body4d_small.is_buffer_full()

        mesh3 = create_mock_mhr_mesh(frame_id=2)
        body4d_small.add_mesh(mesh3)
        assert body4d_small.is_buffer_full()

    def test_temporal_span(self, body4d, mock_mesh_sequence):
        """Test temporal span calculation."""
        start, end = body4d.get_temporal_span()
        assert start is None and end is None

        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        start, end = body4d.get_temporal_span()
        assert start is not None
        assert end is not None
        assert start <= end

    def test_temporal_variance(self, body4d, mock_mesh_sequence):
        """Test temporal variance calculation."""
        variance = body4d.calculate_temporal_variance()
        assert variance is None

        # Add single mesh
        body4d.add_mesh(mock_mesh_sequence[0])
        variance = body4d.calculate_temporal_variance()
        assert variance is None

        # Add second mesh
        body4d.add_mesh(mock_mesh_sequence[1])
        variance = body4d.calculate_temporal_variance()
        assert variance is not None
        assert variance >= 0

    def test_temporal_variance_consistent_data(self):
        """Test temporal variance with consistent (zero variance) data."""
        body4d = Body4D()

        for i in range(5):
            mesh = create_mock_mhr_mesh(height=1.70)  # Same height
            body4d.add_mesh(mesh)

        variance = body4d.calculate_temporal_variance()
        assert variance == pytest.approx(0.0, abs=1e-6)

    def test_temporal_variance_variable_data(self, body4d):
        """Test temporal variance with variable data."""
        heights = [1.60, 1.70, 1.75, 1.65, 1.68]

        for i, height in enumerate(heights):
            mesh = create_mock_mhr_mesh(height=height, frame_id=i)
            body4d.add_mesh(mesh)

        variance = body4d.calculate_temporal_variance()
        assert variance > 0


# ============================================================================
# Tests: Validation and Error Handling
# ============================================================================

class TestValidation:
    """Test mesh validation and error handling."""

    def test_validate_invalid_vertex_shape(self, body4d):
        """Test validation with invalid vertex shape."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=np.array([[1, 2], [3, 4]]),  # Wrong shape [N, 2] instead of [N, 3]
            faces=np.array([[0, 1, 0]]),
            shape_params=shape_params,
        )

        with pytest.raises(ValueError, match="Vertices must have shape"):
            body4d.add_mesh(mesh)

    def test_validate_too_few_vertices(self, body4d):
        """Test validation with too few vertices."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=np.array([[0, 0, 0], [1, 1, 1]]),  # Only 2 vertices
            faces=np.array([[0, 1, 0]]),
            shape_params=shape_params,
        )

        with pytest.raises(ValueError, match="at least 10 vertices"):
            body4d.add_mesh(mesh)

    def test_validate_invalid_face_shape(self, body4d):
        """Test validation with invalid face shape."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=np.random.randn(50, 3),
            faces=np.array([[0, 1, 2, 3]]),  # Wrong shape [M, 4] instead of [M, 3]
            shape_params=shape_params,
        )

        with pytest.raises(ValueError, match="Faces must have shape"):
            body4d.add_mesh(mesh)

    def test_validate_invalid_position_shape(self, body4d):
        """Test validation with invalid position shape."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=np.random.randn(50, 3),
            faces=np.random.randint(0, 50, (20, 3)),
            shape_params=shape_params,
            position=np.array([0, 0, 0, 0]),  # Wrong shape
        )

        with pytest.raises(ValueError, match="Position must have shape"):
            body4d.add_mesh(mesh)

    def test_validate_invalid_rotation_shape(self, body4d):
        """Test validation with invalid rotation shape."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=np.random.randn(50, 3),
            faces=np.random.randint(0, 50, (20, 3)),
            shape_params=shape_params,
            rotation=np.eye(2),  # Wrong shape
        )

        with pytest.raises(ValueError, match="Rotation must have shape"):
            body4d.add_mesh(mesh)

    def test_validate_invalid_confidence(self, body4d):
        """Test validation with invalid confidence value."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=np.random.randn(50, 3),
            faces=np.random.randint(0, 50, (20, 3)),
            shape_params=shape_params,
            confidence=1.5,  # Out of range
        )

        with pytest.raises(ValueError, match="Confidence must be in range"):
            body4d.add_mesh(mesh)

    def test_non_numpy_vertices(self, body4d):
        """Test validation with non-numpy vertices."""
        shape_params = create_mock_shape_parameters()
        mesh = MHRMesh(
            vertices=[[0, 0, 0], [1, 1, 1]],  # List instead of numpy array
            faces=np.random.randint(0, 50, (20, 3)),
            shape_params=shape_params,
        )

        with pytest.raises(ValueError, match="Vertices must be a numpy array"):
            body4d.add_mesh(mesh)


# ============================================================================
# Tests: Statistics and Serialization
# ============================================================================

class TestStatisticsAndSerialization:
    """Test statistics and serialization functionality."""

    def test_get_statistics_empty(self, body4d):
        """Test statistics with empty buffer."""
        stats = body4d.get_statistics()

        assert stats["buffer_size"] == 0
        assert stats["is_full"] is False
        assert stats["temporal_span"] is None
        assert stats["frames_processed"] == 0

    def test_get_statistics_with_meshes(self, body4d, mock_mesh_sequence):
        """Test statistics with meshes in buffer."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        stats = body4d.get_statistics()

        assert stats["buffer_size"] == len(mock_mesh_sequence)
        assert stats["buffer_capacity"] == 30
        assert stats["is_full"] is False
        assert stats["temporal_span"] is not None
        assert "start" in stats["temporal_span"]
        assert "end" in stats["temporal_span"]
        assert stats["average_confidence"] > 0

    def test_to_dict_empty(self, body4d):
        """Test serialization with empty buffer."""
        d = body4d.to_dict()

        assert "config" in d
        assert "statistics" in d
        assert "mesh_sequence" in d
        assert len(d["mesh_sequence"]) == 0
        assert d["averaged_shape_parameters"] is None

    def test_to_dict_with_meshes(self, body4d, mock_mesh_sequence):
        """Test serialization with meshes."""
        for mesh in mock_mesh_sequence:
            body4d.add_mesh(mesh)

        d = body4d.to_dict()

        assert "config" in d
        assert "statistics" in d
        assert len(d["mesh_sequence"]) == len(mock_mesh_sequence)
        assert d["averaged_shape_parameters"] is not None

    def test_mesh_serialization(self, mock_mesh):
        """Test individual mesh serialization."""
        mesh_dict = mock_mesh.to_dict()

        assert "vertices" in mesh_dict
        assert "faces" in mesh_dict
        assert "shape_params" in mesh_dict
        assert isinstance(mesh_dict["vertices"], list)
        assert isinstance(mesh_dict["faces"], list)


# ============================================================================
# Tests: Integration Scenarios
# ============================================================================

class TestIntegrationScenarios:
    """Test realistic usage scenarios."""

    def test_30fps_video_stream_simulation(self):
        """Simulate 30fps video stream (1 second)."""
        body4d = Body4D(buffer_size=30)

        for frame_num in range(30):
            mesh = create_mock_mhr_mesh(frame_id=frame_num)
            body4d.add_mesh(mesh)

        assert body4d.get_buffer_size() == 30
        assert body4d.is_buffer_full()

        # Add one more frame - oldest should be dropped
        mesh_31 = create_mock_mhr_mesh(frame_id=30)
        body4d.add_mesh(mesh_31)

        sequence = body4d.get_mesh_sequence()
        assert sequence[0].frame_id == 1  # Frame 0 was dropped
        assert sequence[-1].frame_id == 30

    def test_varying_confidence_filtering(self):
        """Test filtering meshes by confidence threshold."""
        body4d = Body4D(buffer_size=30, confidence_threshold=0.75)

        heights = [0.5, 0.8, 0.9, 0.6, 0.95]
        added_count = 0

        for conf in heights:
            mesh = create_mock_mhr_mesh(confidence=conf)
            if body4d.add_mesh(mesh):
                added_count += 1

        # Only 3 meshes should be above threshold
        assert body4d.get_buffer_size() == 3
        assert added_count == 3

    def test_averaging_stability_over_time(self):
        """Test that averages stabilize as more frames are added."""
        body4d = Body4D()

        # Add meshes with known heights
        heights = [1.70 + 0.02 * np.sin(i * 0.2) for i in range(20)]

        for height in heights:
            mesh = create_mock_mhr_mesh(height=height)
            body4d.add_mesh(mesh)

        # Get progressive averages
        averages = []
        for num_frames in range(5, 21, 5):
            body4d_temp = Body4D()
            for i in range(num_frames):
                mesh = create_mock_mhr_mesh(height=heights[i])
                body4d_temp.add_mesh(mesh)

            avg = body4d_temp.get_averaged_shape_parameters()
            averages.append(avg.height_mean)

        # Averages should stabilize (last two should be close)
        assert abs(averages[-1] - averages[-2]) < abs(averages[0] - averages[1])


# ============================================================================
# Main Test Execution
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
