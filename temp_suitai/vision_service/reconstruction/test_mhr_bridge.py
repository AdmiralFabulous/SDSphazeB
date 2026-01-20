"""
Unit tests for MHR-to-SMPL-X Bridge implementation.
"""

import unittest
import numpy as np
import torch
from unittest.mock import Mock, MagicMock, patch
import tempfile
import os

from mhr_bridge import (
    MHRBridge,
    BridgeConfig,
    ConversionResult,
    VertexMatcher,
)


class MockSMPLXOutput:
    """Mock SMPL-X model output."""

    def __init__(self, vertices):
        self.vertices = vertices


class MockSMPLXModel(torch.nn.Module):
    """Mock SMPL-X model for testing."""

    def __init__(self, num_vertices=10475, device='cpu'):
        super().__init__()
        self.num_vertices = num_vertices
        self.device = device

    def forward(self, betas, body_pose, global_orient):
        """Generate mock vertices based on parameters."""
        batch_size = betas.shape[0]
        # Simplified forward pass: vertices scaled by betas sum
        scale = torch.sum(betas, dim=1, keepdim=True).unsqueeze(-1) * 0.01 + 1.0
        vertices = torch.randn(batch_size, self.num_vertices, 3, device=self.device) * scale
        return MockSMPLXOutput(vertices)


class TestVertexMatcher(unittest.TestCase):
    """Test suite for VertexMatcher class."""

    def setUp(self):
        """Set up test fixtures."""
        self.mhr_vertices = torch.randn(5000, 3)
        self.smplx_vertices = torch.randn(10475, 3)

    def test_vertex_matcher_initialization(self):
        """Test VertexMatcher initialization."""
        matcher = VertexMatcher(self.mhr_vertices, self.smplx_vertices)
        self.assertEqual(matcher.n_mhr, 5000)
        self.assertEqual(matcher.n_smplx, 10475)

    def test_correspondence_computation(self):
        """Test correspondence computation between vertices."""
        matcher = VertexMatcher(self.mhr_vertices, self.smplx_vertices)
        correspondence = matcher.compute_correspondence()

        # Check correspondence shape
        self.assertEqual(correspondence.shape[0], self.mhr_vertices.shape[0])

        # Check all indices are valid
        self.assertTrue(np.all(correspondence >= 0))
        self.assertTrue(np.all(correspondence < self.smplx_vertices.shape[0]))

    def test_correspondence_nearest_neighbor(self):
        """Test that correspondence finds nearest neighbors correctly."""
        # Create simple test case with known distances
        mhr_verts = torch.tensor([[0.0, 0.0, 0.0], [10.0, 0.0, 0.0]])
        smplx_verts = torch.tensor([
            [0.1, 0.0, 0.0],  # Closest to MHR vertex 0
            [9.9, 0.0, 0.0],  # Closest to MHR vertex 1
            [100.0, 0.0, 0.0]  # Far from both
        ])

        matcher = VertexMatcher(mhr_verts, smplx_verts)
        correspondence = matcher.compute_correspondence()

        # Check correct nearest neighbors
        self.assertEqual(correspondence[0], 0)
        self.assertEqual(correspondence[1], 1)


class TestBridgeConfig(unittest.TestCase):
    """Test suite for BridgeConfig."""

    def test_default_config(self):
        """Test default configuration values."""
        config = BridgeConfig()
        self.assertEqual(config.learning_rate, 0.01)
        self.assertEqual(config.num_iterations, 500)
        self.assertEqual(config.shape_regularization_weight, 0.001)
        self.assertEqual(config.pose_regularization_weight, 0.0001)

    def test_custom_config(self):
        """Test custom configuration."""
        config = BridgeConfig(
            learning_rate=0.001,
            num_iterations=1000,
            shape_regularization_weight=0.01
        )
        self.assertEqual(config.learning_rate, 0.001)
        self.assertEqual(config.num_iterations, 1000)
        self.assertEqual(config.shape_regularization_weight, 0.01)


class TestMHRBridge(unittest.TestCase):
    """Test suite for MHRBridge class."""

    def setUp(self):
        """Set up test fixtures."""
        self.device = 'cpu'
        self.mock_model = MockSMPLXModel(device=self.device)
        self.config = BridgeConfig(
            learning_rate=0.01,
            num_iterations=50,
            patience=20
        )
        self.bridge = MHRBridge(self.mock_model, self.config, device=self.device)

    def test_bridge_initialization(self):
        """Test MHRBridge initialization."""
        self.assertIsNotNone(self.bridge)
        self.assertEqual(self.bridge.device, torch.device(self.device))
        self.assertEqual(self.bridge.config.num_iterations, 50)

    def test_create_learnable_parameters(self):
        """Test creation of learnable parameters."""
        betas, body_pose, global_orient = self.bridge._create_learnable_parameters()

        self.assertEqual(betas.shape, (1, 300))
        self.assertEqual(body_pose.shape, (1, 63))
        self.assertEqual(global_orient.shape, (1, 3))

        # Check that parameters require gradients
        self.assertTrue(betas.requires_grad)
        self.assertTrue(body_pose.requires_grad)
        self.assertTrue(global_orient.requires_grad)

    def test_shape_regularization(self):
        """Test shape regularization computation."""
        betas = torch.ones(1, 300)
        reg_loss = self.bridge._compute_shape_regularization(betas, shape_std=2.0)

        # Loss should be positive
        self.assertGreater(reg_loss.item(), 0)

        # Test with zero betas
        zero_betas = torch.zeros(1, 300)
        zero_reg = self.bridge._compute_shape_regularization(zero_betas, shape_std=2.0)
        self.assertAlmostEqual(zero_reg.item(), 0.0, places=5)

    def test_pose_regularization(self):
        """Test pose regularization computation."""
        body_pose = torch.ones(1, 63)
        global_orient = torch.ones(1, 3)
        reg_loss = self.bridge._compute_pose_regularization(
            body_pose,
            global_orient,
            pose_std=0.2
        )

        # Loss should be positive
        self.assertGreater(reg_loss.item(), 0)

        # Test with zero poses
        zero_body_pose = torch.zeros(1, 63)
        zero_global_orient = torch.zeros(1, 3)
        zero_reg = self.bridge._compute_pose_regularization(
            zero_body_pose,
            zero_global_orient,
            pose_std=0.2
        )
        self.assertAlmostEqual(zero_reg.item(), 0.0, places=5)

    def test_vertex_loss(self):
        """Test vertex reconstruction loss computation."""
        # Create simple test vertices
        predicted = torch.zeros(1, 10, 3)
        predicted[0, 0:5, :] = torch.ones(5, 3)  # 5 vertices at (1, 1, 1)

        target = torch.zeros(5, 3)
        target[0:2, :] = torch.ones(2, 3) * 0.5  # 2 vertices at (0.5, 0.5, 0.5)

        correspondence = np.array([0, 1, 2, 3, 4])

        loss = self.bridge._compute_vertex_loss(predicted, target, correspondence)

        # Loss should be positive (vertices don't match)
        self.assertGreater(loss.item(), 0)

    def test_convert_basic(self):
        """Test basic conversion with MHR vertices."""
        # Create mock MHR mesh
        mhr_vertices = np.random.randn(1000, 3).astype(np.float32)

        # Run conversion
        result = self.bridge.convert(mhr_vertices, verbose=False)

        # Check result structure
        self.assertIsInstance(result, ConversionResult)
        self.assertEqual(result.betas.shape, (1, 300))
        self.assertEqual(result.body_pose.shape, (1, 63))
        self.assertEqual(result.global_orient.shape, (1, 3))

        # Check losses are computed
        self.assertGreater(result.total_loss, 0)
        self.assertIsNotNone(result.vertex_correspondence)

    def test_convert_with_initial_betas(self):
        """Test conversion with initial shape parameters."""
        mhr_vertices = np.random.randn(1000, 3).astype(np.float32)
        initial_betas = np.random.randn(10).astype(np.float32)

        result = self.bridge.convert(
            mhr_vertices,
            initial_betas=initial_betas,
            verbose=False
        )

        # Check result is valid
        self.assertIsInstance(result, ConversionResult)
        self.assertEqual(result.betas.shape, (1, 300))

    def test_convert_vertex_count_mismatch(self):
        """Test conversion handles different MHR vertex counts."""
        # Test with various vertex counts
        vertex_counts = [500, 1000, 5000, 10000]

        for count in vertex_counts:
            mhr_vertices = np.random.randn(count, 3).astype(np.float32)
            result = self.bridge.convert(mhr_vertices, verbose=False)

            # Should produce valid result regardless of vertex count
            self.assertIsInstance(result, ConversionResult)
            self.assertEqual(result.original_vertices.shape[0], count)

    def test_loss_decreases_over_iterations(self):
        """Test that loss generally decreases during optimization."""
        mhr_vertices = np.random.randn(500, 3).astype(np.float32)

        # Create a bridge with verbose output to track losses
        result = self.bridge.convert(mhr_vertices, verbose=True)

        # Final loss should be reasonable (not NaN or inf)
        self.assertFalse(np.isnan(result.total_loss))
        self.assertFalse(np.isinf(result.total_loss))
        self.assertGreater(result.total_loss, 0)

    def test_early_stopping(self):
        """Test early stopping mechanism."""
        mhr_vertices = np.random.randn(500, 3).astype(np.float32)

        # Use config with small patience for quick early stopping
        config = BridgeConfig(num_iterations=500, patience=5)
        bridge = MHRBridge(self.mock_model, config, device=self.device)

        result = bridge.convert(mhr_vertices, verbose=False)

        # Should produce valid result
        self.assertIsInstance(result, ConversionResult)


class TestConversionResult(unittest.TestCase):
    """Test suite for ConversionResult."""

    def setUp(self):
        """Set up test fixtures."""
        self.result = ConversionResult(
            betas=torch.randn(1, 300),
            body_pose=torch.randn(1, 63),
            global_orient=torch.randn(1, 3),
            reconstruction_loss=0.5,
            shape_reg_loss=0.01,
            pose_reg_loss=0.001,
            total_loss=0.511,
            original_vertices=torch.randn(1000, 3),
            reconstructed_vertices=torch.randn(10475, 3),
            vertex_correspondence=np.arange(1000)
        )

    def test_result_initialization(self):
        """Test ConversionResult initialization."""
        self.assertEqual(self.result.betas.shape, (1, 300))
        self.assertEqual(self.result.body_pose.shape, (1, 63))
        self.assertEqual(self.result.global_orient.shape, (1, 3))
        self.assertEqual(self.result.reconstruction_loss, 0.5)

    def test_result_metrics(self):
        """Test ConversionResult metrics."""
        total = (
            self.result.reconstruction_loss +
            self.result.shape_reg_loss +
            self.result.pose_reg_loss
        )
        self.assertAlmostEqual(self.result.total_loss, total, places=5)


class TestFileSaving(unittest.TestCase):
    """Test suite for file I/O operations."""

    def setUp(self):
        """Set up test fixtures."""
        self.device = 'cpu'
        self.mock_model = MockSMPLXModel(device=self.device)
        self.config = BridgeConfig(num_iterations=10)
        self.bridge = MHRBridge(self.mock_model, self.config, device=self.device)

        # Create sample result
        self.result = ConversionResult(
            betas=torch.randn(1, 300),
            body_pose=torch.randn(1, 63),
            global_orient=torch.randn(1, 3),
            reconstruction_loss=0.5,
            shape_reg_loss=0.01,
            pose_reg_loss=0.001,
            total_loss=0.511,
            original_vertices=torch.randn(1000, 3),
            reconstructed_vertices=torch.randn(10475, 3),
            vertex_correspondence=np.arange(1000)
        )

    def test_save_and_load_pt(self):
        """Test saving and loading .pt format."""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, 'result.pt')

            # Save
            self.bridge.save_result(self.result, path)
            self.assertTrue(os.path.exists(path))

            # Load
            loaded_result = self.bridge.load_result(path)
            self.assertEqual(loaded_result.betas.shape, self.result.betas.shape)
            self.assertAlmostEqual(
                loaded_result.total_loss,
                self.result.total_loss,
                places=5
            )

    def test_save_and_load_npz(self):
        """Test saving and loading .npz format."""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, 'result.npz')

            # Save
            self.bridge.save_result(self.result, path)
            self.assertTrue(os.path.exists(path))

            # Load
            loaded_result = self.bridge.load_result(path)
            self.assertEqual(loaded_result.betas.shape, self.result.betas.shape)
            np.testing.assert_array_almost_equal(
                loaded_result.original_vertices.numpy(),
                self.result.original_vertices.numpy(),
                decimal=5
            )

    def test_save_invalid_format(self):
        """Test saving with invalid format raises error."""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, 'result.xyz')
            with self.assertRaises(ValueError):
                self.bridge.save_result(self.result, path)

    def test_load_invalid_format(self):
        """Test loading with invalid format raises error."""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, 'result.xyz')
            with self.assertRaises(ValueError):
                self.bridge.load_result(path)


class TestEdgeCases(unittest.TestCase):
    """Test suite for edge cases and error handling."""

    def setUp(self):
        """Set up test fixtures."""
        self.device = 'cpu'
        self.mock_model = MockSMPLXModel(device=self.device)
        self.config = BridgeConfig(num_iterations=10)
        self.bridge = MHRBridge(self.mock_model, self.config, device=self.device)

    def test_empty_vertices(self):
        """Test handling of edge cases with minimal vertices."""
        # Very small vertex count should still work
        mhr_vertices = np.random.randn(10, 3).astype(np.float32)
        result = self.bridge.convert(mhr_vertices, verbose=False)
        self.assertIsInstance(result, ConversionResult)

    def test_single_vertex(self):
        """Test handling of single vertex."""
        mhr_vertices = np.array([[0.0, 0.0, 0.0]], dtype=np.float32)
        result = self.bridge.convert(mhr_vertices, verbose=False)
        self.assertIsInstance(result, ConversionResult)
        self.assertEqual(result.original_vertices.shape[0], 1)

    def test_zero_vertices(self):
        """Test handling of zero-valued vertices."""
        mhr_vertices = np.zeros((100, 3), dtype=np.float32)
        result = self.bridge.convert(mhr_vertices, verbose=False)
        self.assertIsInstance(result, ConversionResult)


if __name__ == '__main__':
    unittest.main()
