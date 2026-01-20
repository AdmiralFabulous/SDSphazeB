"""
Tests for mesh height calculation functionality.
"""

import pytest
import numpy as np
from vision_service.calibration import (
    calculate_mesh_height,
    calculate_mesh_height_both_heels,
    get_mesh_bounds,
    validate_smpl_x_mesh,
)


class TestCalculateMeshHeight:
    """Test suite for calculate_mesh_height function."""

    def create_dummy_smpl_x_mesh(self):
        """Create a dummy SMPL-X-like mesh for testing."""
        # Create a mesh with 10475 vertices (SMPL-X standard)
        vertices = np.random.randn(10475, 3)

        # Set specific vertices for testing
        # Crown vertex (top of head)
        vertices[152, :] = [0, 1.8, 0]

        # Heel vertices
        vertices[7475, :] = [0.1, 0.0, 0]   # Left heel
        vertices[10019, :] = [-0.1, 0.0, 0] # Right heel

        return vertices

    def test_basic_height_calculation(self):
        """Test basic height calculation with known values."""
        vertices = self.create_dummy_smpl_x_mesh()
        height = calculate_mesh_height(vertices, heel='right', use_extremes=False)

        # Crown is at y=1.8, heel at y=0, so height should be 1.8
        assert abs(height - 1.8) < 0.01

    def test_height_with_left_heel(self):
        """Test height calculation using left heel."""
        vertices = self.create_dummy_smpl_x_mesh()
        height = calculate_mesh_height(vertices, heel='left', use_extremes=False)

        # Should also be around 1.8
        assert abs(height - 1.8) < 0.01

    def test_height_with_extremes(self):
        """Test height calculation using extreme values."""
        vertices = np.zeros((10475, 3))
        vertices[152, :] = [0, 1.8, 0]    # Crown
        vertices[0, :] = [0, -0.5, 0]     # Some other vertex below heel

        height = calculate_mesh_height(vertices, heel='right', use_extremes=True)

        # Height should be from -0.5 to 1.8 = 2.3
        assert abs(height - 2.3) < 0.01

    def test_invalid_vertices_type(self):
        """Test that non-numpy array raises error."""
        with pytest.raises(ValueError, match="vertices must be a numpy array"):
            calculate_mesh_height([[0, 0, 0]])

    def test_invalid_vertices_shape(self):
        """Test that incorrect shape raises error."""
        vertices = np.array([[0, 0], [1, 1]])
        with pytest.raises(ValueError, match="vertices must have shape"):
            calculate_mesh_height(vertices)

    def test_empty_vertices(self):
        """Test that empty vertices array raises error."""
        vertices = np.empty((0, 3))
        with pytest.raises(ValueError, match="vertices array cannot be empty"):
            calculate_mesh_height(vertices)

    def test_invalid_heel_parameter(self):
        """Test that invalid heel parameter raises error."""
        vertices = self.create_dummy_smpl_x_mesh()
        with pytest.raises(ValueError, match="heel must be 'left' or 'right'"):
            calculate_mesh_height(vertices, heel='center')

    def test_heel_index_out_of_bounds(self):
        """Test that out-of-bounds heel index raises error."""
        vertices = np.random.randn(100, 3)
        with pytest.raises(IndexError, match="heel vertex index"):
            calculate_mesh_height(vertices)

    def test_crown_index_out_of_bounds(self):
        """Test that out-of-bounds crown index raises error."""
        vertices = np.random.randn(100, 3)
        # This should fail on heel index first, so test with use_extremes=False
        # to skip the heel index check
        with pytest.raises(IndexError):
            calculate_mesh_height(vertices, use_extremes=False)

    def test_return_type(self):
        """Test that return value is a float."""
        vertices = self.create_dummy_smpl_x_mesh()
        height = calculate_mesh_height(vertices)
        assert isinstance(height, float)

    def test_non_finite_values(self):
        """Test with non-finite vertex values."""
        vertices = self.create_dummy_smpl_x_mesh()
        vertices[152, 1] = np.nan  # NaN in crown y-coordinate

        height = calculate_mesh_height(vertices, use_extremes=False)
        # Should still work, but result will be NaN
        assert not np.isfinite(height)


class TestCalculateMeshHeightBothHeels:
    """Test suite for calculate_mesh_height_both_heels function."""

    def create_dummy_smpl_x_mesh(self):
        """Create a dummy SMPL-X-like mesh."""
        vertices = np.random.randn(10475, 3)
        vertices[152, :] = [0, 1.8, 0]    # Crown
        vertices[7475, :] = [0.1, 0.0, 0]   # Left heel
        vertices[10019, :] = [-0.1, 0.0, 0] # Right heel
        return vertices

    def test_returns_three_values(self):
        """Test that function returns tuple of three values."""
        vertices = self.create_dummy_smpl_x_mesh()
        result = calculate_mesh_height_both_heels(vertices)

        assert isinstance(result, tuple)
        assert len(result) == 3

    def test_average_is_mean_of_heels(self):
        """Test that average is the mean of left and right heights."""
        vertices = self.create_dummy_smpl_x_mesh()
        left_height, right_height, average_height = (
            calculate_mesh_height_both_heels(vertices)
        )

        expected_average = (left_height + right_height) / 2.0
        assert abs(average_height - expected_average) < 0.001

    def test_all_values_positive(self):
        """Test that all height values are positive."""
        vertices = self.create_dummy_smpl_x_mesh()
        left_height, right_height, average_height = (
            calculate_mesh_height_both_heels(vertices)
        )

        assert left_height > 0
        assert right_height > 0
        assert average_height > 0


class TestGetMeshBounds:
    """Test suite for get_mesh_bounds function."""

    def test_returns_dict(self):
        """Test that function returns a dictionary."""
        vertices = np.random.randn(100, 3)
        bounds = get_mesh_bounds(vertices)
        assert isinstance(bounds, dict)

    def test_contains_all_keys(self):
        """Test that returned dict has all required keys."""
        vertices = np.random.randn(100, 3)
        bounds = get_mesh_bounds(vertices)

        required_keys = [
            'x_min', 'x_max', 'y_min', 'y_max', 'z_min', 'z_max',
            'x_range', 'y_range', 'z_range', 'height'
        ]
        for key in required_keys:
            assert key in bounds

    def test_bounds_are_correct(self):
        """Test that bounds calculations are correct."""
        vertices = np.array([
            [1, 2, 3],
            [5, 8, 1],
            [3, 4, 5],
        ])
        bounds = get_mesh_bounds(vertices)

        assert bounds['x_min'] == 1
        assert bounds['x_max'] == 5
        assert bounds['y_min'] == 2
        assert bounds['y_max'] == 8
        assert bounds['z_min'] == 1
        assert bounds['z_max'] == 5
        assert bounds['x_range'] == 4
        assert bounds['y_range'] == 6
        assert bounds['z_range'] == 4
        assert bounds['height'] == 6

    def test_invalid_input_type(self):
        """Test that non-numpy array raises error."""
        with pytest.raises(ValueError, match="vertices must be a numpy array"):
            get_mesh_bounds([[1, 2, 3]])

    def test_invalid_shape(self):
        """Test that incorrect shape raises error."""
        vertices = np.array([[1, 2]])
        with pytest.raises(ValueError, match="vertices must have shape"):
            get_mesh_bounds(vertices)


class TestValidateSMPLXMesh:
    """Test suite for validate_smpl_x_mesh function."""

    def test_valid_mesh(self):
        """Test that valid SMPL-X mesh passes validation."""
        vertices = np.random.randn(10475, 3)
        assert validate_smpl_x_mesh(vertices) is True

    def test_invalid_type(self):
        """Test that non-array input returns False."""
        assert validate_smpl_x_mesh([[1, 2, 3]]) is False

    def test_invalid_shape_wrong_dimension(self):
        """Test that wrong number of dimensions returns False."""
        vertices = np.random.randn(10475, 3, 2)
        assert validate_smpl_x_mesh(vertices) is False

    def test_invalid_shape_wrong_cols(self):
        """Test that wrong number of columns returns False."""
        vertices = np.random.randn(10475, 2)
        assert validate_smpl_x_mesh(vertices) is False

    def test_too_few_vertices(self):
        """Test that too few vertices returns False."""
        vertices = np.random.randn(1000, 3)
        assert validate_smpl_x_mesh(vertices) is False

    def test_non_finite_values(self):
        """Test that non-finite values return False."""
        vertices = np.random.randn(10475, 3)
        vertices[0, 0] = np.nan
        assert validate_smpl_x_mesh(vertices) is False

    def test_inf_values(self):
        """Test that infinite values return False."""
        vertices = np.random.randn(10475, 3)
        vertices[0, 0] = np.inf
        assert validate_smpl_x_mesh(vertices) is False


class TestEdgeCases:
    """Test edge cases and robustness."""

    def test_zero_height_mesh(self):
        """Test mesh where crown and heel are at same height."""
        vertices = np.ones((10475, 3))  # All vertices at y=1
        vertices[152, :] = [0, 1.0, 0]    # Crown
        vertices[7475, :] = [0, 1.0, 0]   # Left heel
        vertices[10019, :] = [0, 1.0, 0]  # Right heel

        # With use_extremes=False to use specific heel vertex
        height = calculate_mesh_height(vertices, heel='right', use_extremes=False)
        assert height == 0.0

    def test_negative_height_mesh(self):
        """Test mesh where heel is above crown."""
        vertices = np.ones((10475, 3))  # All vertices at y=1
        vertices[152, :] = [0, 0.0, 0]    # Crown below
        vertices[7475, :] = [0, 1.0, 0]   # Left heel above
        vertices[10019, :] = [0, 1.0, 0]  # Right heel above

        # With use_extremes=False to use specific heel vertex
        height = calculate_mesh_height(vertices, heel='right', use_extremes=False)
        assert height < 0

    def test_very_small_mesh(self):
        """Test mesh with very small coordinates."""
        vertices = np.random.randn(10475, 3) * 0.001
        vertices[152, :] = [0, 0.001, 0]
        vertices[7475, :] = [0, 0.0, 0]
        vertices[10019, :] = [0, 0.0, 0]

        height = calculate_mesh_height(vertices)
        assert isinstance(height, float)
        assert height > 0

    def test_very_large_mesh(self):
        """Test mesh with very large coordinates."""
        vertices = np.random.randn(10475, 3) * 1000
        vertices[152, :] = [0, 1800, 0]
        vertices[7475, :] = [0, 0, 0]
        vertices[10019, :] = [0, 0, 0]

        height = calculate_mesh_height(vertices)
        assert isinstance(height, float)
        assert height > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
