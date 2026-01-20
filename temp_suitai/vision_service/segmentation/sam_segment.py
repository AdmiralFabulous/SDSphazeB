"""
SAM 3 Segmentation Module

Implements Segment Anything Model v3 for person segmentation with support for:
- Point-based prompts (clicks)
- Box-based prompts (bounding boxes)
- GPU acceleration (CUDA)
- Multi-mask output with automatic best mask selection
"""

import numpy as np
import torch
from typing import Optional, Tuple, List, Union, Dict
from dataclasses import dataclass
from enum import Enum


class PromptType(Enum):
    """Enum for different prompt types."""
    POINT = "point"
    BOX = "box"
    COMBINED = "combined"


@dataclass
class SegmentationResult:
    """Result of segmentation operation."""
    mask: np.ndarray  # Binary mask (H x W), dtype=bool
    confidence: float  # Confidence score (0.0-1.0)
    prompt_type: PromptType
    is_valid: bool
    iou: Optional[float] = None  # IoU prediction from SAM
    stability_score: Optional[float] = None
    warning: Optional[str] = None


class SAMSegmenter:
    """
    Segment Anything Model v3 for person segmentation.

    Supports point and box prompts for interactive segmentation on GPU.
    """

    def __init__(
        self,
        model_type: str = "vit_b",
        checkpoint_path: Optional[str] = None,
        device: Optional[str] = None,
        use_cuda: bool = True,
    ):
        """
        Initialize SAM 3 segmenter.

        Args:
            model_type: Model size - "vit_t", "vit_b", "vit_l", "vit_h"
            checkpoint_path: Path to pretrained weights. If None, downloads automatically.
            device: Device to run model on. If None, auto-detects.
            use_cuda: Whether to use CUDA GPU if available.

        Raises:
            RuntimeError: If model initialization fails.
        """
        self.model_type = model_type
        self.use_cuda = use_cuda
        self.device = device or self._select_device()
        self.predictor = None
        self.model = None

        try:
            from sam3 import build_sam3_vit, SamPredictor3

            # Build model
            self.model = build_sam3_vit(model_type=model_type, checkpoint=checkpoint_path)
            self.model.to(self.device)
            self.model.eval()

            # Create predictor
            self.predictor = SamPredictor3(self.model)

        except ImportError as e:
            raise RuntimeError(
                f"Failed to import SAM3. Ensure 'sam3' package is installed: {e}"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize SAM3 model: {e}")

    def _select_device(self) -> str:
        """Select appropriate device (CUDA GPU or CPU)."""
        if self.use_cuda and torch.cuda.is_available():
            device = f"cuda:{torch.cuda.current_device()}"
            print(f"Using GPU device: {device}")
            return device
        else:
            print("Using CPU device")
            return "cpu"

    def set_image(self, image: np.ndarray) -> None:
        """
        Set the image for segmentation.

        Args:
            image: Input image (H x W x 3) in RGB format, dtype=uint8.

        Raises:
            ValueError: If image format is invalid.
        """
        if image.ndim != 3 or image.shape[2] != 3:
            raise ValueError(f"Expected RGB image (H x W x 3), got shape {image.shape}")
        if image.dtype != np.uint8:
            raise ValueError(f"Expected uint8 image, got {image.dtype}")

        self.predictor.set_image(image)
        self.current_image_shape = image.shape[:2]

    def segment_with_point(
        self,
        point: Tuple[float, float],
        positive: bool = True,
        confidence_threshold: float = 0.5,
    ) -> SegmentationResult:
        """
        Segment using a single point prompt.

        Args:
            point: (x, y) coordinate of the point in image space.
            positive: If True, point indicates foreground; if False, background.
            confidence_threshold: Minimum confidence to accept mask.

        Returns:
            SegmentationResult with binary mask and confidence.

        Raises:
            ValueError: If point is out of bounds.
        """
        if not hasattr(self, "current_image_shape"):
            raise RuntimeError("No image set. Call set_image() first.")

        h, w = self.current_image_shape
        x, y = point

        if not (0 <= x < w and 0 <= y < h):
            raise ValueError(
                f"Point ({x}, {y}) out of image bounds ({w}x{h})"
            )

        # Prepare point prompt
        points = np.array([[x, y]])
        labels = np.array([1 if positive else 0])  # 1=foreground, 0=background

        try:
            with torch.no_grad():
                masks, scores, logits = self.predictor.predict(
                    point_coords=points,
                    point_labels=labels,
                    multimask_output=True,
                )

            # Select best mask
            best_mask, best_score, iou, stability = self._select_best_mask(
                masks, scores
            )

            confidence = float(best_score)
            is_valid = confidence >= confidence_threshold

            return SegmentationResult(
                mask=best_mask.astype(bool),
                confidence=confidence,
                prompt_type=PromptType.POINT,
                is_valid=is_valid,
                iou=float(iou),
                stability_score=float(stability),
                warning="Low confidence" if not is_valid else None,
            )

        except Exception as e:
            return SegmentationResult(
                mask=np.zeros(self.current_image_shape, dtype=bool),
                confidence=0.0,
                prompt_type=PromptType.POINT,
                is_valid=False,
                warning=f"Segmentation failed: {str(e)}",
            )

    def segment_with_box(
        self,
        box: Tuple[float, float, float, float],
        confidence_threshold: float = 0.5,
    ) -> SegmentationResult:
        """
        Segment using a box prompt.

        Args:
            box: (x_min, y_min, x_max, y_max) bounding box in image space.
            confidence_threshold: Minimum confidence to accept mask.

        Returns:
            SegmentationResult with binary mask and confidence.

        Raises:
            ValueError: If box is invalid or out of bounds.
        """
        if not hasattr(self, "current_image_shape"):
            raise RuntimeError("No image set. Call set_image() first.")

        h, w = self.current_image_shape
        x_min, y_min, x_max, y_max = box

        # Validate box
        if not (x_min < x_max and y_min < y_max):
            raise ValueError(f"Invalid box: {box}")
        if not (0 <= x_min < w and 0 <= x_max <= w and 0 <= y_min < h and 0 <= y_max <= h):
            raise ValueError(f"Box {box} out of image bounds ({w}x{h})")

        try:
            with torch.no_grad():
                masks, scores, logits = self.predictor.predict(
                    box=np.array([x_min, y_min, x_max, y_max]),
                    multimask_output=True,
                )

            # Select best mask
            best_mask, best_score, iou, stability = self._select_best_mask(
                masks, scores
            )

            confidence = float(best_score)
            is_valid = confidence >= confidence_threshold

            return SegmentationResult(
                mask=best_mask.astype(bool),
                confidence=confidence,
                prompt_type=PromptType.BOX,
                is_valid=is_valid,
                iou=float(iou),
                stability_score=float(stability),
                warning="Low confidence" if not is_valid else None,
            )

        except Exception as e:
            return SegmentationResult(
                mask=np.zeros(self.current_image_shape, dtype=bool),
                confidence=0.0,
                prompt_type=PromptType.BOX,
                is_valid=False,
                warning=f"Segmentation failed: {str(e)}",
            )

    def segment_with_point_and_box(
        self,
        point: Tuple[float, float],
        box: Tuple[float, float, float, float],
        positive: bool = True,
        confidence_threshold: float = 0.5,
    ) -> SegmentationResult:
        """
        Segment using combined point and box prompts.

        Args:
            point: (x, y) coordinate of the point.
            box: (x_min, y_min, x_max, y_max) bounding box.
            positive: If True, point indicates foreground.
            confidence_threshold: Minimum confidence to accept mask.

        Returns:
            SegmentationResult with binary mask and confidence.
        """
        if not hasattr(self, "current_image_shape"):
            raise RuntimeError("No image set. Call set_image() first.")

        h, w = self.current_image_shape
        x, y = point
        x_min, y_min, x_max, y_max = box

        # Validate inputs
        if not (0 <= x < w and 0 <= y < h):
            raise ValueError(f"Point ({x}, {y}) out of image bounds ({w}x{h})")
        if not (x_min < x_max and y_min < y_max):
            raise ValueError(f"Invalid box: {box}")

        try:
            points = np.array([[x, y]])
            labels = np.array([1 if positive else 0])

            with torch.no_grad():
                masks, scores, logits = self.predictor.predict(
                    point_coords=points,
                    point_labels=labels,
                    box=np.array([x_min, y_min, x_max, y_max]),
                    multimask_output=True,
                )

            # Select best mask
            best_mask, best_score, iou, stability = self._select_best_mask(
                masks, scores
            )

            confidence = float(best_score)
            is_valid = confidence >= confidence_threshold

            return SegmentationResult(
                mask=best_mask.astype(bool),
                confidence=confidence,
                prompt_type=PromptType.COMBINED,
                is_valid=is_valid,
                iou=float(iou),
                stability_score=float(stability),
                warning="Low confidence" if not is_valid else None,
            )

        except Exception as e:
            return SegmentationResult(
                mask=np.zeros(self.current_image_shape, dtype=bool),
                confidence=0.0,
                prompt_type=PromptType.COMBINED,
                is_valid=False,
                warning=f"Segmentation failed: {str(e)}",
            )

    def _select_best_mask(
        self, masks: np.ndarray, scores: np.ndarray
    ) -> Tuple[np.ndarray, float, float, float]:
        """
        Select the best mask from multi-mask output.

        SAM produces 3 masks with different IoU predictions. This method selects
        the mask with the highest confidence score.

        Args:
            masks: Shape (3, H, W) - three candidate masks
            scores: Shape (3,) - IoU predictions for each mask

        Returns:
            Tuple of (best_mask, best_score, iou_prediction, stability_score)
        """
        if masks.shape[0] != 3 or len(scores) != 3:
            raise ValueError(
                f"Expected 3 masks and 3 scores, got {masks.shape[0]} and {len(scores)}"
            )

        # Select mask with highest IoU prediction
        best_idx = np.argmax(scores)
        best_mask = masks[best_idx]
        best_score = float(scores[best_idx])
        iou_prediction = float(scores[best_idx])

        # Calculate stability score (variance across masks)
        # Low variance = more stable prediction
        mask_variance = np.var([m.astype(float).mean() for m in masks])
        stability_score = 1.0 / (1.0 + float(mask_variance))

        return best_mask, best_score, iou_prediction, stability_score

    def get_device_info(self) -> Dict[str, str]:
        """Get information about the device being used."""
        return {
            "device": self.device,
            "model_type": self.model_type,
            "cuda_available": torch.cuda.is_available(),
            "cuda_device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        }


def create_segmenter(
    model_type: str = "vit_b",
    use_cuda: bool = True,
) -> SAMSegmenter:
    """
    Factory function to create a SAM3 segmenter.

    Args:
        model_type: Model size - "vit_t", "vit_b", "vit_l", "vit_h"
        use_cuda: Whether to use CUDA if available.

    Returns:
        SAMSegmenter instance ready for segmentation.
    """
    return SAMSegmenter(model_type=model_type, use_cuda=use_cuda)
