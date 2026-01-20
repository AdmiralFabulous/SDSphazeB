"""
Scale Factor Derivation Module for Vision & Measurement Service

This module derives the scale factor needed to convert mesh/pixel measurements
to real-world dimensions (in millimeters) using calibrated reference heights.

Formula: scale = real_height / mesh_height
"""

from dataclasses import dataclass
from typing import Optional, Tuple
import math


@dataclass
class ScaleFactorResult:
    """Result of scale factor calculation with validation metadata."""

    scale_factor: float
    """Scale factor in mm/pixel (or mm/mesh_unit)"""

    real_height: float
    """Real-world height in millimeters"""

    mesh_height: float
    """Mesh/detected height in pixels or mesh units"""

    confidence_score: float
    """Confidence score (0.0-1.0) indicating reliability of the scale factor"""

    is_valid: bool
    """Whether the scale factor passes validation checks"""

    validation_warnings: list[str]
    """List of warnings from validation checks"""


class ScaleFactor:
    """
    Derives and manages scale factors for converting mesh measurements to real-world units.

    The scale factor is the ratio of real-world dimensions to mesh dimensions,
    enabling conversion from pixel/mesh coordinates to millimeters.
    """

    # Validation constants
    MIN_SCALE_FACTOR = 0.01  # mm per unit (very small measurements)
    MAX_SCALE_FACTOR = 100.0  # mm per unit (very large measurements)
    MIN_HEIGHT_MM = 100 * 10  # 100 cm in millimeters
    MAX_HEIGHT_MM = 250 * 10  # 250 cm in millimeters
    MIN_MESH_HEIGHT = 1.0  # Minimum mesh height to avoid division issues
    MAX_MESH_HEIGHT = 10000.0  # Maximum reasonable mesh height (pixels)

    def __init__(self):
        """Initialize the ScaleFactor calculator."""
        self.last_result: Optional[ScaleFactorResult] = None

    def calculate(
        self,
        real_height: float,
        mesh_height: float,
        min_expected_scale: Optional[float] = None,
        max_expected_scale: Optional[float] = None,
    ) -> ScaleFactorResult:
        """
        Calculate the scale factor from real-world and mesh measurements.

        Args:
            real_height: Real-world height in millimeters
            mesh_height: Mesh/detected height in pixels or mesh units
            min_expected_scale: Optional minimum expected scale (for additional validation)
            max_expected_scale: Optional maximum expected scale (for additional validation)

        Returns:
            ScaleFactorResult containing the scale factor and validation metadata

        Raises:
            ValueError: If inputs are invalid (NaN, infinite, etc.)
        """
        warnings = []

        # Input validation
        self._validate_inputs(real_height, mesh_height, warnings)

        # Check for invalid numbers
        if math.isnan(real_height) or math.isnan(mesh_height):
            raise ValueError("Input values cannot be NaN")
        if math.isinf(real_height) or math.isinf(mesh_height):
            raise ValueError("Input values cannot be infinite")

        # Calculate scale factor
        scale_factor = real_height / mesh_height

        # Validate scale factor
        is_valid = self._validate_scale_factor(
            scale_factor,
            real_height,
            mesh_height,
            min_expected_scale,
            max_expected_scale,
            warnings,
        )

        # Calculate confidence score
        confidence_score = self._calculate_confidence(
            scale_factor,
            real_height,
            mesh_height,
            is_valid,
            len(warnings),
        )

        result = ScaleFactorResult(
            scale_factor=scale_factor,
            real_height=real_height,
            mesh_height=mesh_height,
            confidence_score=confidence_score,
            is_valid=is_valid,
            validation_warnings=warnings,
        )

        self.last_result = result
        return result

    def _validate_inputs(
        self,
        real_height: float,
        mesh_height: float,
        warnings: list[str],
    ) -> None:
        """
        Validate input parameters.

        Args:
            real_height: Real-world height in millimeters
            mesh_height: Mesh/detected height in pixels
            warnings: List to accumulate warning messages

        Raises:
            ValueError: If inputs are fundamentally invalid
        """
        if not isinstance(real_height, (int, float)):
            raise ValueError(f"real_height must be numeric, got {type(real_height)}")
        if not isinstance(mesh_height, (int, float)):
            raise ValueError(f"mesh_height must be numeric, got {type(mesh_height)}")

        if real_height <= 0:
            raise ValueError(f"real_height must be positive, got {real_height}")
        if mesh_height <= 0:
            raise ValueError(f"mesh_height must be positive, got {mesh_height}")

        # Check for unreasonable values (warnings only, not hard failures)
        if real_height < self.MIN_HEIGHT_MM:
            warnings.append(
                f"real_height ({real_height}mm) is below minimum expected "
                f"({self.MIN_HEIGHT_MM}mm, 100cm)"
            )
        if real_height > self.MAX_HEIGHT_MM:
            warnings.append(
                f"real_height ({real_height}mm) exceeds maximum expected "
                f"({self.MAX_HEIGHT_MM}mm, 250cm)"
            )

        if mesh_height < self.MIN_MESH_HEIGHT:
            warnings.append(
                f"mesh_height ({mesh_height}) is below minimum "
                f"({self.MIN_MESH_HEIGHT})"
            )
        if mesh_height > self.MAX_MESH_HEIGHT:
            warnings.append(
                f"mesh_height ({mesh_height}) exceeds maximum "
                f"({self.MAX_MESH_HEIGHT})"
            )

    def _validate_scale_factor(
        self,
        scale_factor: float,
        real_height: float,
        mesh_height: float,
        min_expected_scale: Optional[float],
        max_expected_scale: Optional[float],
        warnings: list[str],
    ) -> bool:
        """
        Validate the computed scale factor.

        Args:
            scale_factor: Computed scale factor
            real_height: Real-world height in millimeters
            mesh_height: Mesh/detected height
            min_expected_scale: Optional minimum expected scale
            max_expected_scale: Optional maximum expected scale
            warnings: List to accumulate warning messages

        Returns:
            True if scale factor is valid, False otherwise
        """
        is_valid = True

        # Check for unreasonable scale factors
        if scale_factor < self.MIN_SCALE_FACTOR:
            warnings.append(
                f"Scale factor ({scale_factor:.6f}) is below minimum "
                f"({self.MIN_SCALE_FACTOR})"
            )
            is_valid = False

        if scale_factor > self.MAX_SCALE_FACTOR:
            warnings.append(
                f"Scale factor ({scale_factor:.2f}) exceeds maximum "
                f"({self.MAX_SCALE_FACTOR})"
            )
            is_valid = False

        # Check against expected range if provided
        if min_expected_scale is not None and scale_factor < min_expected_scale:
            warnings.append(
                f"Scale factor ({scale_factor:.6f}) below expected minimum "
                f"({min_expected_scale:.6f})"
            )
            is_valid = False

        if max_expected_scale is not None and scale_factor > max_expected_scale:
            warnings.append(
                f"Scale factor ({scale_factor:.2f}) exceeds expected maximum "
                f"({max_expected_scale:.2f})"
            )
            is_valid = False

        return is_valid

    def _calculate_confidence(
        self,
        scale_factor: float,
        real_height: float,
        mesh_height: float,
        is_valid: bool,
        warning_count: int,
    ) -> float:
        """
        Calculate confidence score for the scale factor.

        Confidence considers:
        - Whether scale factor passes validation (40% weight)
        - Proximity to expected measurement ranges (40% weight)
        - Absence of warnings (20% weight)

        Args:
            scale_factor: Computed scale factor
            real_height: Real-world height in millimeters
            mesh_height: Mesh/detected height
            is_valid: Whether scale factor is valid
            warning_count: Number of validation warnings

        Returns:
            Confidence score between 0.0 and 1.0
        """
        confidence = 1.0

        # Validation score (40% weight)
        validation_score = 1.0 if is_valid else 0.5

        # Range score (40% weight) - how close to ideal ranges
        real_height_ratio = self._compute_range_ratio(
            real_height,
            self.MIN_HEIGHT_MM,
            self.MAX_HEIGHT_MM,
        )
        mesh_height_ratio = self._compute_range_ratio(
            mesh_height,
            self.MIN_MESH_HEIGHT,
            self.MAX_MESH_HEIGHT,
        )
        range_score = (real_height_ratio + mesh_height_ratio) / 2.0

        # Scale factor range score
        scale_ratio = self._compute_range_ratio(
            scale_factor,
            self.MIN_SCALE_FACTOR,
            self.MAX_SCALE_FACTOR,
        )

        # Warning penalty (20% weight)
        warning_score = max(0.0, 1.0 - (warning_count * 0.15))

        # Combine scores
        confidence = (
            validation_score * 0.4 +
            range_score * 0.2 +
            scale_ratio * 0.2 +
            warning_score * 0.2
        )

        return max(0.0, min(1.0, confidence))

    @staticmethod
    def _compute_range_ratio(
        value: float,
        min_val: float,
        max_val: float,
    ) -> float:
        """
        Compute how well a value fits within a range (0.0 to 1.0).

        Args:
            value: Value to evaluate
            min_val: Minimum of acceptable range
            max_val: Maximum of acceptable range

        Returns:
            Ratio from 0.0 (outside range) to 1.0 (at midpoint of range)
        """
        if value < min_val or value > max_val:
            return 0.0

        mid = (min_val + max_val) / 2.0
        if value >= mid:
            return (max_val - value) / (max_val - mid)
        else:
            return (value - min_val) / (mid - min_val)

    def convert_mesh_to_real(
        self,
        mesh_measurement: float,
    ) -> float:
        """
        Convert a mesh/pixel measurement to real-world millimeters.

        Args:
            mesh_measurement: Measurement in mesh units (pixels)

        Returns:
            Measurement in millimeters

        Raises:
            ValueError: If no scale factor has been calculated
        """
        if self.last_result is None:
            raise ValueError("No scale factor calculated. Call calculate() first.")

        if not self.last_result.is_valid:
            raise ValueError("Last calculated scale factor is invalid")

        return mesh_measurement * self.last_result.scale_factor

    def get_scale_stats(self) -> Optional[dict]:
        """
        Get statistics about the last calculated scale factor.

        Returns:
            Dictionary with scale factor statistics, or None if not calculated
        """
        if self.last_result is None:
            return None

        return {
            "scale_factor": self.last_result.scale_factor,
            "real_height_mm": self.last_result.real_height,
            "mesh_height_units": self.last_result.mesh_height,
            "confidence_score": self.last_result.confidence_score,
            "is_valid": self.last_result.is_valid,
            "warning_count": len(self.last_result.validation_warnings),
            "warnings": self.last_result.validation_warnings,
        }
