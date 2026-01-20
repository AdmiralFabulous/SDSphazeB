"""
Comprehensive tests for SAM 3 Segmentation module.

Tests cover:
- Point-based segmentation
- Box-based segmentation
- Combined prompts
- GPU/CUDA support
- Best mask selection
- Error handling and validation
"""

import unittest
import numpy as np
import torch
from unittest.mock import Mock, MagicMock, patch

from sam_segment import (
    SAMSegmenter,
    SegmentationResult,
    PromptType,
    create_segmenter,
)


class TestSegmentationResult(unittest.TestCase):
    """Test SegmentationResult dataclass."""

    def test_segmentation_result_creation(self):
        """Test creating a SegmentationResult."""
        mask = np.array([[True, False], [False, True]], dtype=bool)
        result = SegmentationResult(
            mask=mask,
            confidence=0.95,
            prompt_type=PromptType.POINT,
            is_valid=True,
            iou=0.88,
            stability_score=0.92,
        )

        np.testing.assert_array_equal(result.mask, mask)
        self.assertEqual(result.confidence, 0.95)
        self.assertEqual(result.prompt_type, PromptType.POINT)
        self.assertTrue(result.is_valid)
        self.assertEqual(result.iou, 0.88)
        self.assertEqual(result.stability_score, 0.92)
        self.assertIsNone(result.warning)

    def test_segmentation_result_with_warning(self):
        """Test SegmentationResult with warning."""
        mask = np.zeros((10, 10), dtype=bool)
        result = SegmentationResult(
            mask=mask,
            confidence=0.3,
            prompt_type=PromptType.BOX,
            is_valid=False,
            warning="Low confidence",
        )

        self.assertFalse(result.is_valid)
        self.assertEqual(result.warning, "Low confidence")


class TestSAMSegmenterInitialization(unittest.TestCase):
    """Test SAMSegmenter initialization."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def test_initialization_with_cuda(self, mock_predictor_class, mock_build_sam3):
        """Test initialization with CUDA support."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=True):
            segmenter = SAMSegmenter(use_cuda=True)

        self.assertIsNotNone(segmenter.model)
        self.assertIsNotNone(segmenter.predictor)
        mock_build_sam3.assert_called_once()
        mock_model.to.assert_called_once()

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def test_initialization_with_cpu(self, mock_predictor_class, mock_build_sam3):
        """Test initialization with CPU only."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            segmenter = SAMSegmenter(use_cuda=True)

        self.assertEqual(segmenter.device, "cpu")

    @patch("sam_segment.build_sam3_vit")
    def test_initialization_model_not_found(self, mock_build_sam3):
        """Test initialization fails when sam3 import fails."""
        mock_build_sam3.side_effect = ImportError("sam3 not found")

        with self.assertRaises(RuntimeError) as context:
            SAMSegmenter()

        self.assertIn("Failed to import SAM3", str(context.exception))


class TestSetImage(unittest.TestCase):
    """Test image setting functionality."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def setUp(self, mock_predictor_class, mock_build_sam3):
        """Set up test fixtures."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            self.segmenter = SAMSegmenter()

    def test_set_valid_image(self):
        """Test setting a valid RGB image."""
        image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        self.segmenter.set_image(image)

        self.segmenter.predictor.set_image.assert_called_once_with(image)
        self.assertEqual(self.segmenter.current_image_shape, (480, 640))

    def test_set_image_wrong_channels(self):
        """Test setting image with wrong number of channels."""
        image = np.random.randint(0, 256, (480, 640), dtype=np.uint8)

        with self.assertRaises(ValueError) as context:
            self.segmenter.set_image(image)

        self.assertIn("Expected RGB image", str(context.exception))

    def test_set_image_wrong_dtype(self):
        """Test setting image with wrong data type."""
        image = np.random.random((480, 640, 3)).astype(np.float32)

        with self.assertRaises(ValueError) as context:
            self.segmenter.set_image(image)

        self.assertIn("Expected uint8 image", str(context.exception))


class TestPointSegmentation(unittest.TestCase):
    """Test point-based segmentation."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def setUp(self, mock_predictor_class, mock_build_sam3):
        """Set up test fixtures."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            self.segmenter = SAMSegmenter()

        # Set a test image
        test_image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        self.segmenter.set_image(test_image)

        # Mock the predictor's predict method
        mock_masks = np.random.rand(3, 480, 640) > 0.5
        mock_scores = np.array([0.7, 0.95, 0.8])
        self.segmenter.predictor.predict.return_value = (mock_masks, mock_scores, None)

    def test_segment_with_valid_point(self):
        """Test segmentation with a valid point."""
        result = self.segmenter.segment_with_point((320, 240), positive=True)

        self.assertIsInstance(result, SegmentationResult)
        self.assertEqual(result.prompt_type, PromptType.POINT)
        self.assertTrue(result.is_valid)
        self.assertGreater(result.confidence, 0.5)

    def test_segment_with_point_out_of_bounds(self):
        """Test segmentation with point outside image."""
        with self.assertRaises(ValueError) as context:
            self.segmenter.segment_with_point((1000, 1000))

        self.assertIn("out of image bounds", str(context.exception))

    def test_segment_with_negative_point(self):
        """Test segmentation with negative point (background)."""
        result = self.segmenter.segment_with_point((320, 240), positive=False)

        self.assertEqual(result.prompt_type, PromptType.POINT)
        self.assertTrue(result.is_valid)

    def test_segment_without_image(self):
        """Test segmentation fails when no image is set."""
        new_segmenter = SAMSegmenter.__new__(SAMSegmenter)
        new_segmenter.predictor = MagicMock()

        with self.assertRaises(RuntimeError) as context:
            new_segmenter.segment_with_point((100, 100))

        self.assertIn("No image set", str(context.exception))

    def test_segment_with_low_confidence(self):
        """Test segmentation result with low confidence."""
        self.segmenter.predictor.predict.return_value = (
            np.random.rand(3, 480, 640) > 0.5,
            np.array([0.3, 0.35, 0.25]),  # All scores below threshold
            None,
        )

        result = self.segmenter.segment_with_point((320, 240), confidence_threshold=0.5)

        self.assertFalse(result.is_valid)
        self.assertEqual(result.warning, "Low confidence")


class TestBoxSegmentation(unittest.TestCase):
    """Test box-based segmentation."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def setUp(self, mock_predictor_class, mock_build_sam3):
        """Set up test fixtures."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            self.segmenter = SAMSegmenter()

        test_image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        self.segmenter.set_image(test_image)

        mock_masks = np.random.rand(3, 480, 640) > 0.5
        mock_scores = np.array([0.7, 0.92, 0.8])
        self.segmenter.predictor.predict.return_value = (mock_masks, mock_scores, None)

    def test_segment_with_valid_box(self):
        """Test segmentation with a valid bounding box."""
        result = self.segmenter.segment_with_box((100, 100, 400, 400))

        self.assertIsInstance(result, SegmentationResult)
        self.assertEqual(result.prompt_type, PromptType.BOX)
        self.assertTrue(result.is_valid)

    def test_segment_with_invalid_box(self):
        """Test segmentation with invalid box (min > max)."""
        with self.assertRaises(ValueError) as context:
            self.segmenter.segment_with_box((400, 400, 100, 100))

        self.assertIn("Invalid box", str(context.exception))

    def test_segment_with_box_out_of_bounds(self):
        """Test segmentation with box outside image."""
        with self.assertRaises(ValueError) as context:
            self.segmenter.segment_with_box((0, 0, 1000, 1000))

        self.assertIn("out of image bounds", str(context.exception))


class TestCombinedPrompts(unittest.TestCase):
    """Test combined point and box segmentation."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def setUp(self, mock_predictor_class, mock_build_sam3):
        """Set up test fixtures."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            self.segmenter = SAMSegmenter()

        test_image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        self.segmenter.set_image(test_image)

        mock_masks = np.random.rand(3, 480, 640) > 0.5
        mock_scores = np.array([0.75, 0.93, 0.82])
        self.segmenter.predictor.predict.return_value = (mock_masks, mock_scores, None)

    def test_segment_with_point_and_box(self):
        """Test segmentation with combined point and box prompts."""
        result = self.segmenter.segment_with_point_and_box(
            point=(200, 200),
            box=(100, 100, 400, 400),
        )

        self.assertEqual(result.prompt_type, PromptType.COMBINED)
        self.assertTrue(result.is_valid)

    def test_combined_with_invalid_point(self):
        """Test combined segmentation with invalid point."""
        with self.assertRaises(ValueError):
            self.segmenter.segment_with_point_and_box(
                point=(1000, 1000),
                box=(100, 100, 400, 400),
            )

    def test_combined_with_invalid_box(self):
        """Test combined segmentation with invalid box."""
        with self.assertRaises(ValueError):
            self.segmenter.segment_with_point_and_box(
                point=(200, 200),
                box=(400, 400, 100, 100),
            )


class TestBestMaskSelection(unittest.TestCase):
    """Test best mask selection logic."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def setUp(self, mock_predictor_class, mock_build_sam3):
        """Set up test fixtures."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            self.segmenter = SAMSegmenter()

    def test_select_best_mask_highest_score(self):
        """Test that best mask is selected by highest score."""
        masks = np.array([
            np.zeros((10, 10), dtype=bool),
            np.ones((10, 10), dtype=bool),
            np.zeros((10, 10), dtype=bool),
        ])
        scores = np.array([0.7, 0.95, 0.8])

        best_mask, best_score, iou, stability = self.segmenter._select_best_mask(
            masks, scores
        )

        np.testing.assert_array_equal(best_mask, masks[1])
        self.assertEqual(best_score, 0.95)
        self.assertEqual(iou, 0.95)

    def test_select_best_mask_stability_score(self):
        """Test stability score calculation."""
        masks = np.array([
            np.ones((10, 10), dtype=bool),
            np.ones((10, 10), dtype=bool),
            np.ones((10, 10), dtype=bool),
        ])
        scores = np.array([0.9, 0.9, 0.9])

        _, _, _, stability = self.segmenter._select_best_mask(masks, scores)

        self.assertGreater(stability, 0.9)  # High stability when masks are similar

    def test_select_best_mask_wrong_shape(self):
        """Test error handling for wrong mask shape."""
        masks = np.random.rand(2, 10, 10) > 0.5
        scores = np.array([0.8, 0.9])

        with self.assertRaises(ValueError) as context:
            self.segmenter._select_best_mask(masks, scores)

        self.assertIn("Expected 3 masks", str(context.exception))


class TestFactoryFunction(unittest.TestCase):
    """Test factory function."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def test_create_segmenter(self, mock_predictor_class, mock_build_sam3):
        """Test create_segmenter factory function."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            segmenter = create_segmenter(model_type="vit_l", use_cuda=False)

        self.assertIsInstance(segmenter, SAMSegmenter)
        self.assertEqual(segmenter.model_type, "vit_l")
        self.assertEqual(segmenter.device, "cpu")


class TestDeviceInfo(unittest.TestCase):
    """Test device information retrieval."""

    @patch("sam_segment.build_sam3_vit")
    @patch("sam_segment.SamPredictor3")
    def test_get_device_info(self, mock_predictor_class, mock_build_sam3):
        """Test device information method."""
        mock_model = MagicMock()
        mock_build_sam3.return_value = mock_model
        mock_predictor = MagicMock()
        mock_predictor_class.return_value = mock_predictor

        with patch("torch.cuda.is_available", return_value=False):
            segmenter = SAMSegmenter(model_type="vit_b")

        device_info = segmenter.get_device_info()

        self.assertEqual(device_info["model_type"], "vit_b")
        self.assertEqual(device_info["device"], "cpu")
        self.assertFalse(device_info["cuda_available"])
        self.assertEqual(device_info["cuda_device_count"], 0)


if __name__ == "__main__":
    unittest.main()
