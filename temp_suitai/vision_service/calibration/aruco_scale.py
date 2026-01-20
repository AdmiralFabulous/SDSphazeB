"""ArUco marker-based scale calculation

Calculates mm-per-pixel scale factor from known marker sizes.
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional, List, Tuple
from .aruco_detect import ArUcoDetector
from .pnp_solver import PnPSolver


@dataclass
class ScaleFactorResult:
    """Result of scale factor calculation.

    Attributes:
        scale_factor: Scale in mm per pixel
        confidence_score: Quality indicator (0.0-1.0)
        validation_warnings: List of validation issues
        is_valid: Whether the result is valid
        method: Calculation method used (e.g., 'pixel_size', 'pnp')
        aruco_visible: Whether ArUco markers were detected in the image
    """

    scale_factor: float
    confidence_score: float
    validation_warnings: List[str]
    is_valid: bool
    method: str
    aruco_visible: bool


class ArUcoScaleCalculator:
    """Calculates scale factor from ArUco markers.

    Supports two methods:
    1. Pixel-based: Uses marker pixel size directly
    2. PnP-based: Uses depth estimation for improved accuracy

    Formula: scale = known_marker_size / pixel_size

    Example:
        >>> calculator = ArUcoScaleCalculator(marker_size_mm=50)
        >>> result = calculator.calculate_scale(image)
        >>> print(f"Scale: {result.scale_factor:.4f} mm/px")
    """

    # Validation constants
    MIN_PIXEL_SIZE = 5.0  # Minimum marker size in pixels
    MAX_PIXEL_SIZE = 2000.0  # Maximum marker size in pixels
    MIN_REAL_HEIGHT = 100.0  # Minimum real-world height (mm)
    MAX_REAL_HEIGHT = 2500.0  # Maximum real-world height (mm)
    MIN_SCALE = 0.01  # Minimum scale (mm/px)
    MAX_SCALE = 25.0  # Maximum scale (mm/px)

    def __init__(
        self,
        marker_size_mm: float = 50.0,
        camera_matrix: Optional[np.ndarray] = None,
    ):
        """Initialize scale calculator.

        Args:
            marker_size_mm: Known marker size in millimeters
            camera_matrix: Optional camera intrinsics for PnP-based method
        """
        if marker_size_mm <= 0:
            raise ValueError(f"Marker size must be positive, got {marker_size_mm}")

        self.marker_size_mm = marker_size_mm
        self.detector = ArUcoDetector()
        self.pnp_solver = PnPSolver(camera_matrix=camera_matrix)

    def calculate_scale(
        self, image: np.ndarray, use_pnp: bool = False
    ) -> ScaleFactorResult:
        """Calculate scale factor from image.

        Args:
            image: Input image containing ArUco markers
            use_pnp: If True, use PnP-based method; otherwise use pixel-based

        Returns:
            ScaleFactorResult with scale factor and confidence score
        """
        try:
            corners, ids, _ = self.detector.detect_markers(image)

            if ids is None or len(ids) == 0:
                return ScaleFactorResult(
                    scale_factor=0.0,
                    confidence_score=0.0,
                    validation_warnings=["No markers detected"],
                    is_valid=False,
                    method="pixel_size",
                    aruco_visible=False,
                )

            # Calculate scale from first detected marker
            marker_corners = corners[0]
            marker_id = ids[0, 0]

            if use_pnp:
                return self._calculate_scale_pnp(marker_corners, marker_id)
            else:
                return self._calculate_scale_pixel(marker_corners, marker_id)

        except Exception as e:
            return ScaleFactorResult(
                scale_factor=0.0,
                confidence_score=0.0,
                validation_warnings=[str(e)],
                is_valid=False,
                method="pixel_size" if not use_pnp else "pnp",
                aruco_visible=False,
            )

    def _calculate_scale_pixel(
        self, corners: np.ndarray, marker_id: int
    ) -> ScaleFactorResult:
        """Calculate scale using pixel-based method.

        Args:
            corners: Marker corners (4, 2)
            marker_id: Marker ID

        Returns:
            ScaleFactorResult
        """
        warnings = []

        # Calculate marker size in pixels (diagonal method)
        pixel_size = self._calculate_pixel_size(corners)

        # Validate pixel size
        if pixel_size < self.MIN_PIXEL_SIZE:
            warnings.append(f"Marker too small: {pixel_size:.2f}px")
        elif pixel_size > self.MAX_PIXEL_SIZE:
            warnings.append(f"Marker too large: {pixel_size:.2f}px")

        # Calculate scale
        scale_factor = self.marker_size_mm / pixel_size

        # Validate scale
        is_valid = True
        if scale_factor < self.MIN_SCALE:
            warnings.append(f"Scale too low: {scale_factor:.4f} mm/px")
            is_valid = False
        elif scale_factor > self.MAX_SCALE:
            warnings.append(f"Scale too high: {scale_factor:.4f} mm/px")
            is_valid = False

        # Calculate confidence
        confidence = self._calculate_confidence_pixel(pixel_size, scale_factor)

        return ScaleFactorResult(
            scale_factor=scale_factor,
            confidence_score=confidence,
            validation_warnings=warnings,
            is_valid=is_valid and len(warnings) == 0,
            method="pixel_size",
            aruco_visible=True,
        )

    def _calculate_scale_pnp(
        self, corners: np.ndarray, marker_id: int
    ) -> ScaleFactorResult:
        """Calculate scale using PnP-based method with depth estimation.

        Args:
            corners: Marker corners (4, 2)
            marker_id: Marker ID

        Returns:
            ScaleFactorResult
        """
        warnings = []

        try:
            # Estimate marker depth using PnP
            rvec, tvec = self.pnp_solver.solve_marker_pose(corners)
            depth_mm = self.pnp_solver.get_marker_depth(tvec)

            # Calculate pixel size for normalization
            pixel_size = self._calculate_pixel_size(corners)

            # Calculate scale using depth information
            # Real marker width = marker_size_mm, depth = depth_mm
            # Use perspective projection to estimate scale
            scale_factor = self.marker_size_mm / pixel_size

            # Validate depth-based constraints
            if depth_mm < self.MIN_REAL_HEIGHT:
                warnings.append(f"Marker too close: {depth_mm:.2f}mm")
            elif depth_mm > self.MAX_REAL_HEIGHT:
                warnings.append(f"Marker too far: {depth_mm:.2f}mm")

            # Validate scale
            is_valid = True
            if scale_factor < self.MIN_SCALE:
                warnings.append(f"Scale too low: {scale_factor:.4f} mm/px")
                is_valid = False
            elif scale_factor > self.MAX_SCALE:
                warnings.append(f"Scale too high: {scale_factor:.4f} mm/px")
                is_valid = False

            # Calculate confidence with depth information
            confidence = self._calculate_confidence_pnp(
                pixel_size, scale_factor, depth_mm
            )

            return ScaleFactorResult(
                scale_factor=scale_factor,
                confidence_score=confidence,
                validation_warnings=warnings,
                is_valid=is_valid and len(warnings) == 0,
                method="pnp",
                aruco_visible=True,
            )

        except Exception as e:
            return ScaleFactorResult(
                scale_factor=0.0,
                confidence_score=0.0,
                validation_warnings=[f"PnP solving failed: {str(e)}"],
                is_valid=False,
                method="pnp",
                aruco_visible=False,
            )

    def _calculate_pixel_size(self, corners: np.ndarray) -> float:
        """Calculate marker size in pixels using diagonal distance.

        Args:
            corners: Marker corners (4, 2)

        Returns:
            Marker size in pixels (diagonal distance)
        """
        if corners.shape != (4, 2):
            raise ValueError(f"Expected (4, 2) corners, got {corners.shape}")

        # Calculate diagonal distance (more robust than single edge)
        p1 = corners[0]
        p3 = corners[2]
        diagonal = np.linalg.norm(p3 - p1)

        return float(diagonal)

    def _calculate_confidence_pixel(
        self, pixel_size: float, scale_factor: float
    ) -> float:
        """Calculate confidence score for pixel-based method.

        Confidence factors:
        - Marker size (larger is more reliable)
        - Scale reasonableness

        Args:
            pixel_size: Marker size in pixels
            scale_factor: Scale factor (mm/px)

        Returns:
            Confidence score (0.0-1.0)
        """
        # Size confidence: optimal around 100-500 pixels
        if pixel_size < 20:
            size_confidence = 0.3
        elif pixel_size < 50:
            size_confidence = 0.6
        elif pixel_size < 100:
            size_confidence = 0.8
        elif pixel_size < 500:
            size_confidence = 1.0
        else:
            # Very large markers may indicate close distance or zoom
            size_confidence = 0.7

        # Scale reasonableness (typical range 0.05-5.0)
        if 0.05 <= scale_factor <= 5.0:
            scale_confidence = 1.0
        elif 0.01 <= scale_factor < 0.05 or 5.0 < scale_factor <= 25.0:
            scale_confidence = 0.7
        else:
            scale_confidence = 0.0

        # Combined confidence
        confidence = (size_confidence + scale_confidence) / 2.0

        return float(np.clip(confidence, 0.0, 1.0))

    def _calculate_confidence_pnp(
        self, pixel_size: float, scale_factor: float, depth_mm: float
    ) -> float:
        """Calculate confidence score for PnP-based method.

        Confidence factors:
        - Marker size in pixels
        - Scale factor validity
        - Depth estimation quality

        Args:
            pixel_size: Marker size in pixels
            scale_factor: Scale factor (mm/px)
            depth_mm: Estimated marker depth (mm)

        Returns:
            Confidence score (0.0-1.0)
        """
        # Pixel size confidence
        if pixel_size < 20:
            size_confidence = 0.4
        elif pixel_size < 50:
            size_confidence = 0.7
        elif pixel_size < 100:
            size_confidence = 0.9
        elif pixel_size < 500:
            size_confidence = 1.0
        else:
            size_confidence = 0.8

        # Scale confidence
        if 0.05 <= scale_factor <= 5.0:
            scale_confidence = 1.0
        elif 0.01 <= scale_factor < 0.05 or 5.0 < scale_factor <= 25.0:
            scale_confidence = 0.7
        else:
            scale_confidence = 0.0

        # Depth confidence (optimal range 200-2000mm)
        if 200 <= depth_mm <= 2000:
            depth_confidence = 1.0
        elif 100 <= depth_mm < 200 or 2000 < depth_mm <= 2500:
            depth_confidence = 0.8
        else:
            depth_confidence = 0.3

        # Combined confidence: PnP typically more reliable
        confidence = (size_confidence * 0.3 + scale_confidence * 0.3 + depth_confidence * 0.4)

        return float(np.clip(confidence, 0.0, 1.0))

    def calculate_scale_multiple(
        self, image: np.ndarray, use_pnp: bool = False
    ) -> Tuple[ScaleFactorResult, List[ScaleFactorResult]]:
        """Calculate scale from all detected markers.

        Args:
            image: Input image
            use_pnp: If True, use PnP-based method

        Returns:
            Tuple of (best_result, all_results):
            - best_result: Result with highest confidence
            - all_results: Results for each marker
        """
        try:
            corners, ids, _ = self.detector.detect_markers(image)

            if ids is None or len(ids) == 0:
                empty_result = ScaleFactorResult(
                    scale_factor=0.0,
                    confidence_score=0.0,
                    validation_warnings=["No markers detected"],
                    is_valid=False,
                    method="pixel_size" if not use_pnp else "pnp",
                    aruco_visible=False,
                )
                return empty_result, []

            # Calculate scale for each marker
            all_results = []
            for marker_corners, marker_id in zip(corners, ids):
                if use_pnp:
                    result = self._calculate_scale_pnp(marker_corners, marker_id[0])
                else:
                    result = self._calculate_scale_pixel(marker_corners, marker_id[0])
                all_results.append(result)

            # Return best result
            best_result = max(all_results, key=lambda r: r.confidence_score)

            return best_result, all_results

        except Exception as e:
            error_result = ScaleFactorResult(
                scale_factor=0.0,
                confidence_score=0.0,
                validation_warnings=[str(e)],
                is_valid=False,
                method="pixel_size" if not use_pnp else "pnp",
                aruco_visible=False,
            )
            return error_result, []
