"""Segmentation module for person segmentation using SAM 3."""

from .sam_segment import (
    SAMSegmenter,
    SegmentationResult,
    PromptType,
    create_segmenter,
)

__all__ = [
    "SAMSegmenter",
    "SegmentationResult",
    "PromptType",
    "create_segmenter",
]
