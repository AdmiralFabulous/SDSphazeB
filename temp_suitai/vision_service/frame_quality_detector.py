"""
Frame Quality Detector Module

This module provides frame quality analysis by integrating:
- SAM-based user detection (segmentation)
- Measurement stability detection
- Confidence scoring

It provides a unified interface for detecting whether a user is in the frame
and computing quality metrics.
"""

from dataclasses import dataclass
from typing import Optional, Tuple
import numpy as np
import logging

logger = logging.getLogger(__name__)


@dataclass
class FrameQuality:
    """Result of frame quality analysis."""
    user_in_frame: bool  # Core requirement: boolean flag
    confidence: float  # Confidence of user detection (0.0-1.0)
    stability_score: float  # Measurement stability (0.0-1.0)
    iou: Optional[float] = None  # IoU prediction from SAM
    is_valid: bool = False  # Overall validity of frame
    warnings: Optional[list] = None


class FrameQualityDetector:
    """
    Detects frame quality and user presence.

    Integrates multiple vision service components:
    - SAM segmentation for user detection
    - Stability detection for measurement quality
    """

    def __init__(
        self,
        sam_segmenter=None,
        measurement_lock=None,
        confidence_threshold: float = 0.5,
        stability_threshold: float = 0.3,
    ):
        """
        Initialize frame quality detector.

        Args:
            sam_segmenter: Optional SAMSegmenter instance for user detection
            measurement_lock: Optional MeasurementLock instance for stability
            confidence_threshold: Minimum confidence for valid detection
            stability_threshold: Minimum stability score for valid frame
        """
        self.sam_segmenter = sam_segmenter
        self.measurement_lock = measurement_lock
        self.confidence_threshold = confidence_threshold
        self.stability_threshold = stability_threshold

    def analyze_frame(
        self,
        image: np.ndarray,
        measurement_data: Optional[np.ndarray] = None,
    ) -> FrameQuality:
        """
        Analyze a single frame for quality and user presence.

        Args:
            image: Input image (H x W x 3)
            measurement_data: Optional measurement vector for stability analysis

        Returns:
            FrameQuality object with user_in_frame boolean and metrics
        """
        warnings = []
        user_in_frame = False
        confidence = 0.0
        stability_score = 0.0
        iou = None

        # Step 1: Detect user in frame using SAM
        if self.sam_segmenter:
            try:
                self.sam_segmenter.set_image(image)
                # Use automatic prompting (auto_prompt=True)
                result = self.sam_segmenter.segment_person(
                    prompt_type=None,
                    auto_prompt=True
                )

                if result and result.is_valid:
                    user_in_frame = result.is_valid
                    confidence = result.confidence
                    iou = result.iou

                    if result.stability_score is not None:
                        stability_score = result.stability_score
                else:
                    user_in_frame = False
                    confidence = 0.0
                    warnings.append("SAM segmentation detected no valid person")

            except Exception as e:
                warnings.append(f"SAM segmentation error: {str(e)}")
                logger.error(f"SAM segmentation failed: {e}")
        else:
            warnings.append("SAM segmenter not initialized")

        # Step 2: Analyze measurement stability if data provided
        if measurement_data is not None and self.measurement_lock:
            try:
                # Update measurement lock with new data
                lock_state = self.measurement_lock.update(measurement_data)
                stability_score = lock_state.stability_score

                if stability_score < self.stability_threshold:
                    warnings.append(
                        f"Low stability score: {stability_score:.3f} "
                        f"(threshold: {self.stability_threshold})"
                    )
            except Exception as e:
                warnings.append(f"Stability analysis error: {str(e)}")
                logger.error(f"Stability analysis failed: {e}")

        # Step 3: Determine overall validity
        is_valid = (
            user_in_frame and
            confidence >= self.confidence_threshold
        )

        return FrameQuality(
            user_in_frame=user_in_frame,
            confidence=confidence,
            stability_score=stability_score,
            iou=iou,
            is_valid=is_valid,
            warnings=warnings if warnings else None,
        )

    def batch_analyze(
        self,
        images: list,
        measurement_data: Optional[list] = None,
    ) -> list:
        """
        Analyze multiple frames.

        Args:
            images: List of image arrays
            measurement_data: Optional list of measurement vectors

        Returns:
            List of FrameQuality results
        """
        results = []
        for i, image in enumerate(images):
            measurement = measurement_data[i] if measurement_data else None
            result = self.analyze_frame(image, measurement)
            results.append(result)

        return results

    def get_detection_rate(self, results: list) -> float:
        """
        Compute user detection rate from results.

        Args:
            results: List of FrameQuality results

        Returns:
            Detection rate as percentage (0-100)
        """
        if not results:
            return 0.0

        detected = sum(1 for r in results if r.user_in_frame)
        return (detected / len(results)) * 100
