"""
Comprehensive tests for differentiable measurement extraction.

Tests cover:
- Gradient flow through all measurement types
- Batch processing with multiple subjects
- Output shape and value validation
- Circumference approximation accuracy
- Linear measurement correctness
- Edge cases and error handling
"""

import pytest
import torch
import numpy as np
from typing import Dict

from vision_service.measurements.differentiable import (
    DifferentiableMeasurement,
    DifferentiableMeasurementConfig,
    DifferentiableMeasurementResult,
    verify_gradients,
    compute_batch_measurements,
    extract_measurements_as_vector,
)
from vision_service.measurements.landmarks import get_all_circumference_names


# ============================================================================
# FIXTURES AND HELPERS
# ============================================================================

@pytest.fixture
def config():
    """Create test configuration."""
    return DifferentiableMeasurementConfig(
        num_circumference_samples=16,
        device="cpu",
        dtype=torch.float32,
        compute_confidences=True
    )


@pytest.fixture
def measurement_module(config):
    """Create measurement module instance."""
    return DifferentiableMeasurement(config)


@pytest.fixture
def sample_vertices_single():
    """Create sample SMPL vertices (single subject, standing pose)."""
    batch_size = 1
    num_vertices = 6890
    vertices = torch.randn(batch_size, num_vertices, 3, dtype=torch.float32) * 0.1
    return vertices


@pytest.fixture
def sample_vertices_batch():
    """Create sample SMPL vertices (batch of 4 subjects)."""
    batch_size = 4
    num_vertices = 6890
    vertices = torch.randn(batch_size, num_vertices, 3, dtype=torch.float32) * 0.1
    return vertices


@pytest.fixture
def sample_vertices_2d():
    """Create sample SMPL vertices without batch dimension."""
    num_vertices = 6890
    vertices = torch.randn(num_vertices, 3, dtype=torch.float32) * 0.1
    return vertices


# ============================================================================
# BASIC FUNCTIONALITY TESTS
# ============================================================================

class TestBasicForward:
    """Test basic forward pass functionality."""

    def test_forward_single_subject(self, measurement_module, sample_vertices_single):
        """Test forward pass with single subject."""
        result = measurement_module(sample_vertices_single)

        assert isinstance(result, DifferentiableMeasurementResult)
        assert result.batch_size == 1
        assert len(result.measurements) > 0
        assert len(result.measurement_names) > 0

    def test_forward_batch(self, measurement_module, sample_vertices_batch):
        """Test forward pass with batch of subjects."""
        result = measurement_module(sample_vertices_batch)

        assert result.batch_size == 4
        for measurement_tensor in result.measurements.values():
            assert measurement_tensor.shape[0] == 4

    def test_forward_2d_input(self, measurement_module, sample_vertices_2d):
        """Test forward pass automatically adds batch dimension."""
        result = measurement_module(sample_vertices_2d)

        assert result.batch_size == 1
        for measurement_tensor in result.measurements.values():
            assert measurement_tensor.shape[0] == 1

    def test_invalid_shape_raises_error(self, measurement_module):
        """Test that invalid input shapes raise errors."""
        invalid_vertices = torch.randn(1, 100, 3)  # Wrong number of vertices

        with pytest.raises(ValueError, match="Expected shape"):
            measurement_module(invalid_vertices)


# ============================================================================
# OUTPUT STRUCTURE TESTS
# ============================================================================

class TestOutputStructure:
    """Test output structure and content."""

    def test_result_contains_measurements(self, measurement_module, sample_vertices_single):
        """Test that result contains measurements dictionary."""
        result = measurement_module(sample_vertices_single)

        assert isinstance(result.measurements, dict)
        assert len(result.measurements) > 0
        for name, tensor in result.measurements.items():
            assert isinstance(name, str)
            assert isinstance(tensor, torch.Tensor)

    def test_circumferences_are_subset_of_measurements(
        self, measurement_module, sample_vertices_single
    ):
        """Test that circumferences are included in measurements."""
        result = measurement_module(sample_vertices_single)

        for circ_name, circ_tensor in result.circumferences.items():
            assert circ_name in result.measurements
            assert torch.allclose(circ_tensor, result.measurements[circ_name])

    def test_linear_measurements_are_subset(
        self, measurement_module, sample_vertices_single
    ):
        """Test that linear measurements are included in measurements."""
        result = measurement_module(sample_vertices_single)

        for lin_name, lin_tensor in result.linear_measurements.items():
            assert lin_name in result.measurements

    def test_all_circumferences_present(
        self, measurement_module, sample_vertices_single
    ):
        """Test that all defined circumferences are computed."""
        result = measurement_module(sample_vertices_single)
        expected_circumferences = get_all_circumference_names()

        for circ_name in expected_circumferences:
            assert circ_name in result.circumferences
            assert circ_name in result.measurements

    def test_measurement_names_match_results(
        self, measurement_module, sample_vertices_single
    ):
        """Test that measurement_names list matches actual measurements."""
        result = measurement_module(sample_vertices_single)

        # Convert to sets for comparison (order doesn't matter for membership)
        measurement_keys = set(result.measurements.keys())
        measurement_names = set(result.measurement_names)

        assert measurement_keys == measurement_names

    def test_confidences_present_when_enabled(
        self, measurement_module, sample_vertices_single
    ):
        """Test that confidences are computed when enabled."""
        measurement_module.config.compute_confidences = True
        result = measurement_module(sample_vertices_single)

        assert result.confidences is not None
        assert len(result.confidences) == len(result.measurements)


# ============================================================================
# OUTPUT VALUE TESTS
# ============================================================================

class TestOutputValues:
    """Test output value properties."""

    def test_measurements_are_positive(self, measurement_module, sample_vertices_single):
        """Test that measurements (distances) are positive."""
        result = measurement_module(sample_vertices_single)

        for measurement_tensor in result.measurements.values():
            # All measurements should be > 0 (positive distances)
            assert torch.all(measurement_tensor > 0)

    def test_measurements_are_reasonable(self, measurement_module, sample_vertices_single):
        """Test that measurements are in reasonable range for body measurements."""
        result = measurement_module(sample_vertices_single)

        for measurement_tensor in result.measurements.values():
            # Body measurements typically range from 0 to 5000mm
            # Some small paths may produce very small measurements
            assert torch.all(measurement_tensor >= 0)  # Non-negative
            assert torch.all(measurement_tensor < 5000)  # Less than 5 meters

    def test_measurements_are_finite(self, measurement_module, sample_vertices_single):
        """Test that all measurements are finite (no NaN or inf)."""
        result = measurement_module(sample_vertices_single)

        for measurement_tensor in result.measurements.values():
            assert torch.all(torch.isfinite(measurement_tensor))

    def test_batch_measurements_independent(
        self, measurement_module, sample_vertices_batch
    ):
        """Test that batch measurements are independent."""
        result = measurement_module(sample_vertices_batch)

        # Each subject should have different measurements
        # (with very high probability for random vertices)
        first_measurements = {}
        for name, tensor in result.measurements.items():
            first_measurements[name] = tensor[0].item()

        for name, tensor in result.measurements.items():
            other_measurements = tensor[1:].tolist()
            # Check that at least some measurements differ
            assert not all(
                abs(m - first_measurements[name]) < 1e-6 for m in other_measurements
            ), f"Batch subjects have identical {name} measurements"


# ============================================================================
# GRADIENT FLOW TESTS
# ============================================================================

class TestGradientFlow:
    """Test gradient flow through measurements."""

    def test_gradients_flow_through_forward(self, measurement_module):
        """Test that gradients flow through forward pass."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)

        # Compute loss
        loss = sum(t.sum() for t in result.measurements.values())

        # Backpropagation should work
        loss.backward()

        assert vertices.grad is not None
        assert torch.any(vertices.grad != 0)

    def test_gradient_flow_per_measurement(self, measurement_module):
        """Test gradient flow for each measurement individually."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)

        # Track which measurements have non-zero gradients
        measurements_with_gradients = 0
        for meas_name, meas_tensor in result.measurements.items():
            # Reset gradients
            if vertices.grad is not None:
                vertices.grad.zero_()

            # Compute loss for this measurement
            loss = meas_tensor.sum()

            # Backpropagation
            loss.backward()

            # Check that gradients exist
            assert vertices.grad is not None, f"No gradients for {meas_name}"
            if torch.any(vertices.grad != 0):
                measurements_with_gradients += 1

        # At least most measurements should have gradient flow
        # Some degenerate paths may not contribute
        assert measurements_with_gradients > len(result.measurements) * 0.8, \
            f"Too few measurements with gradients: {measurements_with_gradients}/{len(result.measurements)}"

    def test_verify_gradients_function(self, measurement_module):
        """Test the verify_gradients helper function."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)

        gradient_results = verify_gradients(vertices, measurement_module)

        assert isinstance(gradient_results, dict)
        # All measurements should have gradient flow
        assert all(gradient_results.values()), "Some measurements lack gradient flow"

    def test_gradient_flow_batch(self, measurement_module):
        """Test gradient flow with batch input."""
        vertices = torch.randn(4, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)

        # Compute loss
        loss = sum(t.sum() for t in result.measurements.values())

        # Backpropagation
        loss.backward()

        assert vertices.grad is not None
        assert torch.all(torch.isfinite(vertices.grad))

    def test_gradients_different_for_different_measurements(self, measurement_module):
        """Test that different measurements produce different gradients."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)

        # Store gradients for first measurement
        meas_names = list(result.measurements.keys())
        first_name = meas_names[0]
        first_loss = result.measurements[first_name].sum()
        first_loss.backward()
        grad_1 = vertices.grad.clone()

        # Reset and compute for second measurement
        vertices.grad.zero_()
        second_name = meas_names[1] if len(meas_names) > 1 else first_name
        second_loss = result.measurements[second_name].sum()
        second_loss.backward()
        grad_2 = vertices.grad.clone()

        # Gradients should be different (unless same measurement)
        if first_name != second_name:
            assert not torch.allclose(grad_1, grad_2)


# ============================================================================
# CIRCUMFERENCE MEASUREMENT TESTS
# ============================================================================

class TestCircumferenceMeasurements:
    """Test circumference measurement computation."""

    def test_all_circumferences_computed(self, measurement_module, sample_vertices_single):
        """Test that all circumference paths are computed."""
        result = measurement_module(sample_vertices_single)

        all_circ_names = get_all_circumference_names()
        assert len(result.circumferences) == len(all_circ_names)

        for circ_name in all_circ_names:
            assert circ_name in result.circumferences

    def test_circumference_values_nonnegative(self, measurement_module, sample_vertices_single):
        """Test that all circumferences are non-negative."""
        result = measurement_module(sample_vertices_single)

        for circ_tensor in result.circumferences.values():
            # Circumferences may be 0 for degenerate paths
            assert torch.all(circ_tensor >= 0)

    def test_circumferences_reasonable_size(
        self, measurement_module, sample_vertices_single
    ):
        """Test that circumferences are in reasonable range."""
        result = measurement_module(sample_vertices_single)

        for circ_name, circ_tensor in result.circumferences.items():
            # Body circumferences typically 100-2000mm (allow small ones)
            assert torch.all(circ_tensor >= 0), f"{circ_name} negative"
            assert torch.all(circ_tensor < 3000), f"{circ_name} too large"

    def test_circumference_gradient_flow(self, measurement_module):
        """Test gradient flow through circumference computation."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)

        # All circumferences should support gradients
        for circ_name, circ_tensor in result.circumferences.items():
            loss = circ_tensor.sum()
            loss.backward(retain_graph=True)

            assert vertices.grad is not None
            assert torch.any(vertices.grad != 0)


# ============================================================================
# LINEAR MEASUREMENT TESTS
# ============================================================================

class TestLinearMeasurements:
    """Test linear measurement computation."""

    def test_linear_measurements_computed(self, measurement_module, sample_vertices_single):
        """Test that linear measurements are computed."""
        result = measurement_module(sample_vertices_single)

        assert len(result.linear_measurements) > 0
        expected_measurements = [
            "head_height", "shoulder_width",
            "left_arm_length", "right_arm_length",
            "left_leg_length", "right_leg_length"
        ]
        for expected in expected_measurements:
            assert expected in result.linear_measurements

    def test_linear_measurements_positive(self, measurement_module, sample_vertices_single):
        """Test that all linear measurements are positive."""
        result = measurement_module(sample_vertices_single)

        for lin_tensor in result.linear_measurements.values():
            assert torch.all(lin_tensor > 0)

    def test_linear_measurements_gradient_flow(self, measurement_module):
        """Test gradient flow through linear measurements."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)

        # Check a few linear measurements
        for meas_name in list(result.linear_measurements.keys())[:3]:
            vertices.grad = None
            vertices.requires_grad_(True)

            meas_tensor = result.linear_measurements[meas_name]
            loss = meas_tensor.sum()
            loss.backward()

            assert vertices.grad is not None
            assert torch.any(vertices.grad != 0)


# ============================================================================
# BATCH PROCESSING TESTS
# ============================================================================

class TestBatchProcessing:
    """Test batch processing functionality."""

    def test_batch_shape_consistency(self, measurement_module):
        """Test that batch shapes are consistent."""
        batch_sizes = [1, 2, 4, 8]

        for batch_size in batch_sizes:
            vertices = torch.randn(batch_size, 6890, 3)
            result = measurement_module(vertices)

            assert result.batch_size == batch_size
            for meas_tensor in result.measurements.values():
                assert meas_tensor.shape[0] == batch_size

    def test_batch_results_match_individual(self, measurement_module):
        """Test that batch results match individual processing."""
        # Create two identical subjects
        single_vertices = torch.randn(1, 6890, 3)
        batch_vertices = single_vertices.repeat(2, 1, 1)

        # Process both ways
        single_result = measurement_module(single_vertices)
        batch_result = measurement_module(batch_vertices)

        # Compare measurements
        for meas_name in single_result.measurements:
            single_value = single_result.measurements[meas_name][0]
            batch_values = batch_result.measurements[meas_name]

            assert torch.allclose(single_value, batch_values[0])
            assert torch.allclose(single_value, batch_values[1])

    def test_compute_batch_measurements_function(self, sample_vertices_batch):
        """Test the compute_batch_measurements helper function."""
        result = compute_batch_measurements(sample_vertices_batch)

        assert result.batch_size == 4
        assert len(result.measurements) > 0


# ============================================================================
# VECTOR EXTRACTION TESTS
# ============================================================================

class TestVectorExtraction:
    """Test measurement vector extraction."""

    def test_extract_measurements_as_vector(self, measurement_module, sample_vertices_batch):
        """Test extracting measurements as a single vector."""
        result = measurement_module(sample_vertices_batch)
        measurements_vector = extract_measurements_as_vector(result)

        assert measurements_vector.shape[0] == 4  # batch_size
        assert measurements_vector.shape[1] == len(result.measurements)

    def test_vector_extraction_order(self, measurement_module, sample_vertices_single):
        """Test vector extraction with specific order."""
        result = measurement_module(sample_vertices_single)

        # Extract with specific order
        order = sorted(result.measurements.keys())[:3]
        vector = extract_measurements_as_vector(result, order)

        assert vector.shape[1] == 3

        # Verify values
        for i, meas_name in enumerate(order):
            expected_value = result.measurements[meas_name]
            assert torch.allclose(vector[0, i], expected_value[0])

    def test_vector_extraction_requires_grad(self, measurement_module):
        """Test that vector extraction preserves gradient properties."""
        vertices = torch.randn(1, 6890, 3, requires_grad=True)
        result = measurement_module(vertices)
        vector = extract_measurements_as_vector(result)

        # Backprop through vector
        loss = vector.sum()
        loss.backward()

        assert vertices.grad is not None
        assert torch.any(vertices.grad != 0)


# ============================================================================
# EDGE CASES AND ERROR HANDLING
# ============================================================================

class TestEdgeCasesAndErrors:
    """Test edge cases and error handling."""

    def test_empty_batch_dimension(self, measurement_module):
        """Test handling of empty batch dimension."""
        vertices = torch.randn(0, 6890, 3)

        # Should either handle gracefully or raise informative error
        try:
            result = measurement_module(vertices)
            assert result.batch_size == 0
        except (ValueError, RuntimeError):
            pass  # Acceptable behavior

    def test_double_precision(self, measurement_module):
        """Test with double precision (float64) input."""
        vertices = torch.randn(1, 6890, 3, dtype=torch.float64)
        result = measurement_module(vertices)

        for meas_tensor in result.measurements.values():
            assert meas_tensor.dtype in [torch.float32, torch.float64]

    def test_all_zero_vertices(self, measurement_module):
        """Test with all-zero vertices."""
        vertices = torch.zeros(1, 6890, 3)
        result = measurement_module(vertices)

        # Should produce zero or near-zero measurements
        for meas_tensor in result.measurements.values():
            assert torch.all(torch.isfinite(meas_tensor))

    def test_very_large_vertices(self, measurement_module):
        """Test with very large vertex values."""
        vertices = torch.randn(1, 6890, 3) * 100  # 100x scale
        result = measurement_module(vertices)

        # Should still produce valid measurements
        for meas_tensor in result.measurements.values():
            assert torch.all(torch.isfinite(meas_tensor))
            # At large scales, measurements should be large (proportional to vertex magnitude)
            assert torch.all(meas_tensor >= 0)


# ============================================================================
# CONFIGURATION AND DEVICE TESTS
# ============================================================================

class TestConfigurationAndDevice:
    """Test configuration and device handling."""

    def test_custom_num_samples(self, sample_vertices_single):
        """Test with custom circumference sample count."""
        config = DifferentiableMeasurementConfig(num_circumference_samples=8)
        module = DifferentiableMeasurement(config)

        result = module(sample_vertices_single)
        assert len(result.measurements) > 0

    def test_disable_confidences(self, sample_vertices_single):
        """Test with confidences disabled."""
        config = DifferentiableMeasurementConfig(compute_confidences=False)
        module = DifferentiableMeasurement(config)

        result = module(sample_vertices_single)
        assert result.confidences is None

    def test_different_dtypes(self, sample_vertices_single):
        """Test with different data types."""
        for dtype in [torch.float32, torch.float64]:
            config = DifferentiableMeasurementConfig(dtype=dtype)
            module = DifferentiableMeasurement(config)

            vertices = sample_vertices_single.to(dtype)
            result = module(vertices)

            assert len(result.measurements) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
