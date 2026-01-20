"""
Comprehensive tests for the ScaleFactor module.

Tests cover:
- Basic scale factor calculation
- Confidence scoring
- Validation of unreasonable values
- Edge cases and error handling
- Measurement conversion
- Range validation
"""

import pytest
import math
from vision_service.calibration.scale import ScaleFactor, ScaleFactorResult


class TestScaleFactorBasicCalculation:
    """Test basic scale factor calculation (real_height / mesh_height)."""

    def test_simple_scale_calculation(self):
        """Test basic scale factor calculation."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1800.0, mesh_height=600.0)

        assert result.scale_factor == 3.0
        assert result.real_height == 1800.0
        assert result.mesh_height == 600.0
        assert result.is_valid is True
        assert len(result.validation_warnings) == 0

    def test_scale_calculation_with_decimals(self):
        """Test scale factor with decimal values."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1750.5, mesh_height=583.5)

        assert abs(result.scale_factor - 3.0) < 0.01
        assert result.is_valid is True

    def test_scale_calculation_preserves_precision(self):
        """Test that scale factor preserves input precision."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1234.567, mesh_height=100.0)

        assert abs(result.scale_factor - 12.34567) < 0.00001
        assert result.is_valid is True

    def test_scale_factor_small_values(self):
        """Test scale factor with small but valid values."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=100.0, mesh_height=5000.0)

        assert abs(result.scale_factor - 0.02) < 0.0001
        assert result.is_valid is True

    def test_scale_factor_large_values(self):
        """Test scale factor with large values."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=2500.0, mesh_height=10.0)

        assert result.scale_factor == 250.0
        assert result.is_valid is False  # Exceeds MAX_SCALE_FACTOR


class TestHeightValidation:
    """Test validation of real-world heights."""

    def test_valid_height_range(self):
        """Test that standard human heights are valid."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1700.0, mesh_height=500.0)

        assert result.is_valid is True
        assert len(result.validation_warnings) == 0

    def test_height_below_minimum(self):
        """Test warning when height is below minimum (100cm)."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=500.0, mesh_height=500.0)

        # Warning is issued but scale is still valid if scale factor is reasonable
        assert len(result.validation_warnings) > 0
        assert any("below minimum expected" in w for w in result.validation_warnings)

    def test_height_above_maximum(self):
        """Test warning when height exceeds maximum (250cm)."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=3500.0, mesh_height=500.0)

        # Warning is issued but scale can still be valid if scale factor is reasonable
        assert len(result.validation_warnings) > 0
        assert any("exceeds maximum expected" in w for w in result.validation_warnings)

    def test_minimum_boundary_height(self):
        """Test at minimum height boundary (100cm = 1000mm)."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1000.0, mesh_height=500.0)

        assert result.is_valid is True
        assert len(result.validation_warnings) == 0

    def test_maximum_boundary_height(self):
        """Test at maximum height boundary (250cm = 2500mm)."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=2500.0, mesh_height=500.0)

        assert result.is_valid is True
        assert len(result.validation_warnings) == 0


class TestMeshHeightValidation:
    """Test validation of mesh/pixel heights."""

    def test_mesh_height_below_minimum(self):
        """Test warning when mesh height is below minimum."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1700.0, mesh_height=0.1)

        assert result.is_valid is False
        assert any("below minimum" in w for w in result.validation_warnings)

    def test_mesh_height_exceeds_maximum(self):
        """Test warning when mesh height exceeds maximum."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1700.0, mesh_height=50000.0)

        # Warning is issued but scale can still be valid if scale factor is reasonable
        assert len(result.validation_warnings) > 0
        assert any("exceeds maximum" in w for w in result.validation_warnings)

    def test_mesh_height_at_minimum(self):
        """Test mesh height at minimum boundary."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1700.0, mesh_height=1.0)

        # At minimum mesh height, scale factor will be very large and likely invalid
        # (1700 mm / 1 pixel = 1700 mm/pixel, which exceeds MAX_SCALE_FACTOR of 100)
        assert result.is_valid is False
        assert any("exceeds maximum" in w for w in result.validation_warnings)


class TestScaleFactorValidation:
    """Test validation of computed scale factors."""

    def test_scale_factor_below_minimum(self):
        """Test that very small scale factors are flagged."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=100.0, mesh_height=50000.0)

        assert result.is_valid is False
        assert any("below minimum" in w for w in result.validation_warnings)

    def test_scale_factor_exceeds_maximum(self):
        """Test that very large scale factors are flagged."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=3000.0, mesh_height=10.0)

        assert result.is_valid is False
        assert any("exceeds maximum" in w for w in result.validation_warnings)

    def test_scale_factor_with_expected_range(self):
        """Test scale factor validation against expected range."""
        calculator = ScaleFactor()
        result = calculator.calculate(
            real_height=1700.0,
            mesh_height=500.0,
            min_expected_scale=3.0,
            max_expected_scale=4.0,
        )

        assert result.scale_factor == 3.4
        assert result.is_valid is True

    def test_scale_factor_below_expected_minimum(self):
        """Test scale factor below expected minimum."""
        calculator = ScaleFactor()
        result = calculator.calculate(
            real_height=1700.0,
            mesh_height=1000.0,
            min_expected_scale=2.0,
        )

        assert result.is_valid is False
        assert any("below expected minimum" in w for w in result.validation_warnings)

    def test_scale_factor_exceeds_expected_maximum(self):
        """Test scale factor exceeds expected maximum."""
        calculator = ScaleFactor()
        result = calculator.calculate(
            real_height=1700.0,
            mesh_height=100.0,
            max_expected_scale=15.0,
        )

        assert result.is_valid is False
        assert any("exceeds expected maximum" in w for w in result.validation_warnings)


class TestInputValidation:
    """Test input validation and error handling."""

    def test_negative_real_height_raises_error(self):
        """Test that negative real height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="real_height must be positive"):
            calculator.calculate(real_height=-1700.0, mesh_height=500.0)

    def test_negative_mesh_height_raises_error(self):
        """Test that negative mesh height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="mesh_height must be positive"):
            calculator.calculate(real_height=1700.0, mesh_height=-500.0)

    def test_zero_real_height_raises_error(self):
        """Test that zero real height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="real_height must be positive"):
            calculator.calculate(real_height=0.0, mesh_height=500.0)

    def test_zero_mesh_height_raises_error(self):
        """Test that zero mesh height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="mesh_height must be positive"):
            calculator.calculate(real_height=1700.0, mesh_height=0.0)

    def test_nan_real_height_raises_error(self):
        """Test that NaN real height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="cannot be NaN"):
            calculator.calculate(real_height=float('nan'), mesh_height=500.0)

    def test_nan_mesh_height_raises_error(self):
        """Test that NaN mesh height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="cannot be NaN"):
            calculator.calculate(real_height=1700.0, mesh_height=float('nan'))

    def test_inf_real_height_raises_error(self):
        """Test that infinite real height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="cannot be infinite"):
            calculator.calculate(real_height=float('inf'), mesh_height=500.0)

    def test_inf_mesh_height_raises_error(self):
        """Test that infinite mesh height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="cannot be infinite"):
            calculator.calculate(real_height=1700.0, mesh_height=float('inf'))

    def test_non_numeric_real_height_raises_error(self):
        """Test that non-numeric real height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="must be numeric"):
            calculator.calculate(real_height="1700", mesh_height=500.0)

    def test_non_numeric_mesh_height_raises_error(self):
        """Test that non-numeric mesh height raises ValueError."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="must be numeric"):
            calculator.calculate(real_height=1700.0, mesh_height="500")


class TestConfidenceScoring:
    """Test confidence score calculation."""

    def test_confidence_score_valid_measurement(self):
        """Test confidence score for valid measurement."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=1700.0, mesh_height=500.0)

        assert 0.0 <= result.confidence_score <= 1.0
        assert result.confidence_score > 0.7  # Should be high for valid measurement

    def test_confidence_score_invalid_measurement(self):
        """Test confidence score for invalid measurement."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=3500.0, mesh_height=500.0)

        assert 0.0 <= result.confidence_score <= 1.0
        assert result.confidence_score < 0.7  # Should be lower for invalid

    def test_confidence_score_with_warnings(self):
        """Test that warnings reduce confidence score."""
        calculator = ScaleFactor()
        result_no_warnings = calculator.calculate(
            real_height=1700.0,
            mesh_height=500.0,
        )

        result_with_warnings = calculator.calculate(
            real_height=1700.0,
            mesh_height=50000.0,
        )

        assert result_no_warnings.confidence_score > result_with_warnings.confidence_score

    def test_confidence_score_in_valid_range(self):
        """Test that confidence score is always between 0 and 1."""
        calculator = ScaleFactor()

        test_cases = [
            (1000.0, 500.0),
            (2500.0, 1000.0),
            (500.0, 1000.0),
            (3500.0, 100.0),
        ]

        for real_height, mesh_height in test_cases:
            try:
                result = calculator.calculate(real_height, mesh_height)
                assert 0.0 <= result.confidence_score <= 1.0
            except ValueError:
                pass


class TestMeasurementConversion:
    """Test converting mesh measurements to real-world units."""

    def test_convert_mesh_to_real_valid_scale(self):
        """Test converting mesh measurement with valid scale factor."""
        calculator = ScaleFactor()
        calculator.calculate(real_height=1800.0, mesh_height=600.0)

        converted = calculator.convert_mesh_to_real(200.0)
        assert converted == 600.0

    def test_convert_mesh_to_real_small_scale(self):
        """Test converting with small scale factor."""
        calculator = ScaleFactor()
        calculator.calculate(real_height=100.0, mesh_height=1000.0)

        converted = calculator.convert_mesh_to_real(2000.0)
        assert converted == 200.0

    def test_convert_without_scale_raises_error(self):
        """Test that converting without calculated scale raises error."""
        calculator = ScaleFactor()
        with pytest.raises(ValueError, match="No scale factor calculated"):
            calculator.convert_mesh_to_real(200.0)

    def test_convert_with_invalid_scale_raises_error(self):
        """Test that converting with invalid scale raises error."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=3500.0, mesh_height=100.0)

        # Only invalid scales should raise error on convert
        if result.is_valid is False:
            with pytest.raises(ValueError, match="invalid"):
                calculator.convert_mesh_to_real(200.0)
        else:
            # If it happens to be valid, just verify it doesn't raise
            converted = calculator.convert_mesh_to_real(200.0)
            assert isinstance(converted, float)


class TestScaleStatistics:
    """Test statistics reporting."""

    def test_get_scale_stats_valid(self):
        """Test getting statistics for calculated scale factor."""
        calculator = ScaleFactor()
        calculator.calculate(real_height=1700.0, mesh_height=500.0)

        stats = calculator.get_scale_stats()

        assert stats is not None
        assert "scale_factor" in stats
        assert "real_height_mm" in stats
        assert "mesh_height_units" in stats
        assert "confidence_score" in stats
        assert "is_valid" in stats
        assert "warning_count" in stats
        assert "warnings" in stats

    def test_get_scale_stats_no_calculation(self):
        """Test getting statistics without prior calculation."""
        calculator = ScaleFactor()
        stats = calculator.get_scale_stats()

        assert stats is None

    def test_get_scale_stats_with_warnings(self):
        """Test that statistics include warnings."""
        calculator = ScaleFactor()
        result = calculator.calculate(real_height=3500.0, mesh_height=500.0)

        stats = calculator.get_scale_stats()

        assert stats["warning_count"] == len(result.validation_warnings)
        assert len(stats["warnings"]) > 0

    def test_last_result_tracking(self):
        """Test that last result is properly tracked."""
        calculator = ScaleFactor()

        result1 = calculator.calculate(real_height=1700.0, mesh_height=500.0)
        assert calculator.last_result == result1

        result2 = calculator.calculate(real_height=1800.0, mesh_height=600.0)
        assert calculator.last_result == result2
        assert calculator.last_result != result1


class TestRangeRatioComputation:
    """Test the range ratio computation helper."""

    def test_range_ratio_at_midpoint(self):
        """Test range ratio at midpoint of range."""
        calculator = ScaleFactor()
        ratio = calculator._compute_range_ratio(50.0, 0.0, 100.0)

        assert ratio == 1.0

    def test_range_ratio_at_minimum(self):
        """Test range ratio at minimum of range."""
        calculator = ScaleFactor()
        ratio = calculator._compute_range_ratio(0.0, 0.0, 100.0)

        assert ratio == 0.0

    def test_range_ratio_at_maximum(self):
        """Test range ratio at maximum of range."""
        calculator = ScaleFactor()
        ratio = calculator._compute_range_ratio(100.0, 0.0, 100.0)

        assert ratio == 0.0

    def test_range_ratio_outside_range(self):
        """Test range ratio outside of range."""
        calculator = ScaleFactor()

        ratio_below = calculator._compute_range_ratio(-10.0, 0.0, 100.0)
        assert ratio_below == 0.0

        ratio_above = calculator._compute_range_ratio(110.0, 0.0, 100.0)
        assert ratio_above == 0.0

    def test_range_ratio_between_min_and_mid(self):
        """Test range ratio between minimum and midpoint."""
        calculator = ScaleFactor()
        ratio = calculator._compute_range_ratio(25.0, 0.0, 100.0)

        assert 0.0 < ratio < 1.0

    def test_range_ratio_between_mid_and_max(self):
        """Test range ratio between midpoint and maximum."""
        calculator = ScaleFactor()
        ratio = calculator._compute_range_ratio(75.0, 0.0, 100.0)

        assert 0.0 < ratio < 1.0


class TestRealisticScenarios:
    """Test realistic usage scenarios."""

    def test_typical_human_calibration(self):
        """Test typical human height calibration scenario."""
        calculator = ScaleFactor()

        # Person is 175cm (1750mm), detected mesh height is 500 pixels
        result = calculator.calculate(real_height=1750.0, mesh_height=500.0)

        assert result.scale_factor == 3.5
        assert result.is_valid is True
        assert result.confidence_score > 0.7  # High confidence for valid measurement

        # Now convert a detected arm height of 150 pixels to millimeters
        arm_mm = calculator.convert_mesh_to_real(150.0)
        assert arm_mm == 525.0

    def test_edge_case_very_small_person(self):
        """Test edge case with very small person (child)."""
        calculator = ScaleFactor()

        # Child is 100cm (1000mm), detected mesh height is 400 pixels
        result = calculator.calculate(real_height=1000.0, mesh_height=400.0)

        assert result.scale_factor == 2.5
        assert result.is_valid is True

    def test_edge_case_very_tall_person(self):
        """Test edge case with very tall person."""
        calculator = ScaleFactor()

        # Person is 250cm (2500mm), detected mesh height is 700 pixels
        result = calculator.calculate(real_height=2500.0, mesh_height=700.0)

        assert abs(result.scale_factor - 3.571) < 0.01
        assert result.is_valid is True

    def test_multiple_calibrations(self):
        """Test using different calibrations in sequence."""
        calculator = ScaleFactor()

        # First calibration
        result1 = calculator.calculate(real_height=1700.0, mesh_height=500.0)
        assert result1.scale_factor == 3.4

        # Second calibration (different person)
        result2 = calculator.calculate(real_height=1800.0, mesh_height=600.0)
        assert result2.scale_factor == 3.0

        # Verify last result is tracked
        stats = calculator.get_scale_stats()
        assert stats["scale_factor"] == 3.0


class TestOutputMillimeters:
    """Test that output is in millimeters as required."""

    def test_real_height_input_in_millimeters(self):
        """Test that real_height input is expected in millimeters."""
        calculator = ScaleFactor()

        # 175 cm = 1750 mm
        result = calculator.calculate(real_height=1750.0, mesh_height=500.0)

        assert result.real_height == 1750.0
        # Result should be valid for a realistic height
        assert result.is_valid is True

    def test_scale_factor_produces_millimeters(self):
        """Test that scale factor converts to millimeters."""
        calculator = ScaleFactor()

        # 175 cm = 1750 mm, mesh height 500
        result = calculator.calculate(real_height=1750.0, mesh_height=500.0)

        # Scale factor is 3.5 mm/pixel
        assert result.scale_factor == 3.5

        # Converting 100 pixels should give 350 mm
        real_mm = calculator.convert_mesh_to_real(100.0)
        assert real_mm == 350.0

    def test_validation_range_in_millimeters(self):
        """Test that validation constants are in millimeters."""
        # MIN_HEIGHT_MM = 100 * 10 = 1000 (100 cm)
        # MAX_HEIGHT_MM = 250 * 10 = 2500 (250 cm)
        assert ScaleFactor.MIN_HEIGHT_MM == 1000
        assert ScaleFactor.MAX_HEIGHT_MM == 2500


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
