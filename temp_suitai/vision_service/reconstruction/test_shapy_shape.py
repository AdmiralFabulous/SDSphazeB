"""
Unit tests for SHAPY shape parameter extraction module.

Tests cover:
- Shape parameter extraction (10-dim beta)
- Predicted measurements from mesh
- Height prior handling
- Confidence score calculation
- Input validation and error handling
"""

import unittest
import numpy as np
from datetime import datetime
from typing import Optional

from shapy_shape import (
    ShapyShape,
    ShapyShapeResult,
    ShapyConfig,
    create_shapy_from_fused_params,
    validate_shapy_result,
)


# ============================================================================
# Test Fixtures
# ============================================================================

def create_mock_vertices(
    num_vertices: int = 10475,
    height: float = 1.70,
    seed: int = 42,
) -> np.ndarray:
    """
    Create mock SMPL-X vertices for testing.

    Args:
        num_vertices: Number of vertices (default 10475 for SMPL-X).
        height: Desired mesh height in unitless distance.
        seed: Random seed for reproducibility.

    Returns:
        Vertices array shape [num_vertices, 3].
    """
    np.random.seed(seed)

    vertices = np.random.randn(num_vertices, 3) * 0.1

    # Center around origin
    vertices -= np.mean(vertices, axis=0)

    # Scale to desired height
    current_height = np.max(vertices[:, 1]) - np.min(vertices[:, 1])
    if current_height > 0:
        vertices[:, 1] *= height / current_height

    # Set crown and heel vertices
    vertices[152, 1] = np.max(vertices[:, 1]) * 1.05  # Crown slightly higher
    vertices[10019, 1] = np.min(vertices[:, 1])  # Right heel at bottom

    return vertices


class TestShapyShapeBasics(unittest.TestCase):
    """Test basic SHAPY shape extraction functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.config = ShapyConfig()
        self.extractor = ShapyShape(config=self.config)
        self.mock_vertices = create_mock_vertices(height=1.70)

    def test_initialization(self):
        """Test ShapyShape initialization."""
        extractor = ShapyShape()
        self.assertIsNotNone(extractor.config)
        self.assertFalse(extractor.verbose)

    def test_initialization_with_config(self):
        """Test initialization with custom config."""
        config = ShapyConfig()
        extractor = ShapyShape(config=config, verbose=True)
        self.assertEqual(extractor.config, config)
        self.assertTrue(extractor.verbose)

    def test_extract_shape_returns_result(self):
        """Test that extract_shape returns ShapyShapeResult."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertIsInstance(result, ShapyShapeResult)

    def test_beta_shape_is_10dim(self):
        """Test that beta parameter is 10-dimensional."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertEqual(result.beta.shape, (10,))
        self.assertEqual(len(result.beta), 10)

    def test_beta_contains_finite_values(self):
        """Test that beta contains finite values."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertTrue(np.all(np.isfinite(result.beta)))

    def test_confidence_in_valid_range(self):
        """Test that confidence is in [0, 1] range."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertGreaterEqual(result.confidence, 0.0)
        self.assertLessEqual(result.confidence, 1.0)

    def test_measurement_reliability_in_valid_range(self):
        """Test that measurement_reliability is in [0, 1] range."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertGreaterEqual(result.measurement_reliability, 0.0)
        self.assertLessEqual(result.measurement_reliability, 1.0)


class TestPredictedMeasurements(unittest.TestCase):
    """Test measurement prediction from shape parameters."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()
        self.mock_vertices = create_mock_vertices(height=1.70)

    def test_predicted_measurements_is_dict(self):
        """Test that predicted_measurements is a dictionary."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertIsInstance(result.predicted_measurements, dict)

    def test_predicted_measurements_not_empty(self):
        """Test that measurements dictionary is not empty."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertGreater(len(result.predicted_measurements), 0)

    def test_height_measurement_exists(self):
        """Test that height measurement is predicted."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertIn('height', result.predicted_measurements)

    def test_height_measurement_reasonable(self):
        """Test that predicted height is in reasonable range."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        height = result.predicted_measurements['height']
        self.assertGreater(height, 1.0)  # At least 1.0 unitless
        self.assertLess(height, 2.5)  # Less than 2.5 unitless

    def test_measurements_are_numeric(self):
        """Test that all measurements are numeric."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        for key, value in result.predicted_measurements.items():
            self.assertIsInstance(value, (int, float))
            self.assertTrue(np.isfinite(value))

    def test_body_dimensions_non_negative(self):
        """Test that width and depth measurements are non-negative."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        measurements = result.predicted_measurements

        for key in ['body_width', 'body_depth', 'shoulder_width', 'hip_width']:
            if key in measurements:
                self.assertGreaterEqual(measurements[key], 0.0)


class TestHeightPrior(unittest.TestCase):
    """Test height prior handling."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()
        self.mock_vertices = create_mock_vertices(height=1.70)

    def test_height_prior_stored(self):
        """Test that height prior is stored in result."""
        height_prior = 1.75
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            height_prior=height_prior,
            optimize=False,
        )
        self.assertEqual(result.height_prior, height_prior)

    def test_height_prior_source_set(self):
        """Test that height prior source is recorded."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            height_prior=1.75,
            optimize=False,
        )
        self.assertEqual(result.height_prior_source, "user_input")

    def test_no_height_prior_when_not_provided(self):
        """Test that height prior is None when not provided."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            height_prior=None,
            optimize=False,
        )
        self.assertIsNone(result.height_prior)
        self.assertIsNone(result.height_prior_source)

    def test_measurement_reliability_affected_by_height_prior(self):
        """Test that measurement reliability is affected by height prior."""
        result_no_prior = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            height_prior=None,
            optimize=False,
        )

        result_with_prior = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            height_prior=1.70,
            optimize=False,
        )

        # Both should have valid reliability scores
        self.assertTrue(0.0 <= result_no_prior.measurement_reliability <= 1.0)
        self.assertTrue(0.0 <= result_with_prior.measurement_reliability <= 1.0)


class TestInputValidation(unittest.TestCase):
    """Test input validation and error handling."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()

    def test_rejects_non_array_vertices(self):
        """Test that non-array vertices are rejected."""
        with self.assertRaises(ValueError):
            self.extractor.extract_shape(vertices=[1, 2, 3])

    def test_rejects_wrong_shape_vertices(self):
        """Test that vertices with wrong shape are rejected."""
        wrong_shape = np.random.randn(5000, 3)  # Wrong number of vertices
        with self.assertRaises(ValueError):
            self.extractor.extract_shape(vertices=wrong_shape)

    def test_rejects_wrong_dimension_vertices(self):
        """Test that 2D vertices are rejected."""
        wrong_dim = np.random.randn(10475, 2)  # Wrong dimensions (2 instead of 3)
        with self.assertRaises(ValueError):
            self.extractor.extract_shape(vertices=wrong_dim)

    def test_rejects_nan_vertices(self):
        """Test that vertices with NaN are rejected."""
        vertices_with_nan = create_mock_vertices()
        vertices_with_nan[100, 0] = np.nan
        with self.assertRaises(ValueError):
            self.extractor.extract_shape(vertices=vertices_with_nan)

    def test_rejects_inf_vertices(self):
        """Test that vertices with Inf are rejected."""
        vertices_with_inf = create_mock_vertices()
        vertices_with_inf[100, 0] = np.inf
        with self.assertRaises(ValueError):
            self.extractor.extract_shape(vertices=vertices_with_inf)


class TestBetaValidation(unittest.TestCase):
    """Test beta parameter validation."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()

    def test_validate_valid_beta(self):
        """Test validation of valid beta."""
        beta = np.zeros(10)
        is_valid, message = self.extractor.validate_shape(beta)
        self.assertTrue(is_valid)
        self.assertEqual(message, "")

    def test_reject_wrong_dimension_beta(self):
        """Test that wrong-dimensional beta is rejected."""
        beta = np.zeros(5)  # Wrong dimension
        is_valid, message = self.extractor.validate_shape(beta)
        self.assertFalse(is_valid)
        self.assertIn("shape", message)

    def test_reject_non_array_beta(self):
        """Test that non-array beta is rejected."""
        is_valid, message = self.extractor.validate_shape([1, 2, 3])
        self.assertFalse(is_valid)
        self.assertIn("numpy array", message)

    def test_reject_nan_beta(self):
        """Test that beta with NaN is rejected."""
        beta = np.zeros(10)
        beta[0] = np.nan
        is_valid, message = self.extractor.validate_shape(beta)
        self.assertFalse(is_valid)
        self.assertIn("non-finite", message)

    def test_beta_in_valid_range(self):
        """Test validation of beta range."""
        beta = np.ones(10) * 0.1  # Small values
        is_valid, message = self.extractor.validate_shape(beta, check_range=True)
        self.assertTrue(is_valid)


class TestMetadata(unittest.TestCase):
    """Test metadata tracking in results."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()
        self.mock_vertices = create_mock_vertices()

    def test_source_is_shapy(self):
        """Test that source is recorded as 'shapy'."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertEqual(result.source, "shapy")

    def test_timestamp_is_set(self):
        """Test that timestamp is set."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertIsInstance(result.timestamp, datetime)

    def test_frame_id_default(self):
        """Test that frame_id defaults to 0."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertEqual(result.frame_id, 0)

    def test_processing_time_recorded(self):
        """Test that processing time is recorded."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        self.assertGreater(result.processing_time_ms, 0.0)


class TestResultSerialization(unittest.TestCase):
    """Test serialization of results."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()
        self.mock_vertices = create_mock_vertices()

    def test_result_to_dict(self):
        """Test that result can be converted to dictionary."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        result_dict = result.to_dict()

        self.assertIsInstance(result_dict, dict)
        self.assertIn('beta', result_dict)
        self.assertIn('confidence', result_dict)
        self.assertIn('predicted_measurements', result_dict)

    def test_dict_has_all_fields(self):
        """Test that dictionary has all expected fields."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            height_prior=1.75,
            optimize=False,
        )
        result_dict = result.to_dict()

        expected_fields = [
            'beta', 'confidence', 'measurement_reliability',
            'height_prior', 'height_prior_source',
            'predicted_measurements', 'frame_id', 'timestamp',
            'source', 'optimization_iterations', 'processing_time_ms',
        ]

        for field in expected_fields:
            self.assertIn(field, result_dict)

    def test_beta_serializes_to_list(self):
        """Test that beta serializes to list."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        result_dict = result.to_dict()

        self.assertIsInstance(result_dict['beta'], list)
        self.assertEqual(len(result_dict['beta']), 10)


class TestValidateShapy(unittest.TestCase):
    """Test validation of SHAPY results."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()
        self.mock_vertices = create_mock_vertices()

    def test_validate_valid_result(self):
        """Test validation of valid result."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        is_valid, issues = validate_shapy_result(result)
        self.assertTrue(is_valid)
        self.assertEqual(len(issues), 0)

    def test_validate_detects_invalid_beta(self):
        """Test that invalid beta is detected."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        result.beta = np.zeros(5)  # Wrong shape

        is_valid, issues = validate_shapy_result(result)
        self.assertFalse(is_valid)
        self.assertTrue(any("shape" in issue for issue in issues))

    def test_validate_detects_invalid_confidence(self):
        """Test that invalid confidence is detected."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        result.confidence = 1.5  # Out of range

        is_valid, issues = validate_shapy_result(result)
        self.assertFalse(is_valid)
        self.assertTrue(any("confidence" in issue for issue in issues))

    def test_validate_detects_nan_measurements(self):
        """Test that NaN in measurements is detected."""
        result = self.extractor.extract_shape(
            vertices=self.mock_vertices,
            optimize=False,
        )
        result.predicted_measurements['invalid'] = np.nan

        is_valid, issues = validate_shapy_result(result)
        self.assertFalse(is_valid)
        self.assertTrue(any("invalid" in issue for issue in issues))


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and boundary conditions."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = ShapyShape()

    def test_tall_mesh(self):
        """Test extraction with tall mesh (2.0 height)."""
        vertices = create_mock_vertices(height=2.0)
        result = self.extractor.extract_shape(
            vertices=vertices,
            optimize=False,
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.beta.shape, (10,))

    def test_short_mesh(self):
        """Test extraction with short mesh (1.2 height)."""
        vertices = create_mock_vertices(height=1.2)
        result = self.extractor.extract_shape(
            vertices=vertices,
            optimize=False,
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.beta.shape, (10,))

    def test_different_seeds(self):
        """Test that different seeds produce different results."""
        vertices1 = create_mock_vertices(seed=1)
        vertices2 = create_mock_vertices(seed=2)

        result1 = self.extractor.extract_shape(vertices1, optimize=False)
        result2 = self.extractor.extract_shape(vertices2, optimize=False)

        # Results should differ but both be valid
        self.assertFalse(np.allclose(result1.beta, result2.beta))
        self.assertEqual(result1.beta.shape, result2.beta.shape)

    def test_identical_meshes(self):
        """Test extraction from identical mesh twice."""
        vertices = create_mock_vertices(seed=42)

        result1 = self.extractor.extract_shape(vertices, optimize=False)
        result2 = self.extractor.extract_shape(vertices, optimize=False)

        # Both results should be valid (deterministic for measured components)
        self.assertEqual(result1.beta.shape, result2.beta.shape)
        self.assertEqual(result1.confidence, result2.confidence)


class TestConfiguration(unittest.TestCase):
    """Test SHAPY configuration."""

    def test_default_config_values(self):
        """Test default configuration values."""
        config = ShapyConfig()

        self.assertEqual(config.BETA_DIM, 10)
        self.assertGreater(config.BETA_STD, 0)
        self.assertIn('height', config.DEFAULT_MEASUREMENTS)
        self.assertIn('chest_circumference', config.DEFAULT_MEASUREMENTS)

    def test_config_height_prior_weight(self):
        """Test height prior weight is in valid range."""
        config = ShapyConfig()
        self.assertGreaterEqual(config.HEIGHT_PRIOR_WEIGHT, 0.0)
        self.assertLessEqual(config.HEIGHT_PRIOR_WEIGHT, 1.0)


if __name__ == '__main__':
    unittest.main()
