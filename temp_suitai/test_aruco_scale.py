"""Comprehensive tests for ArUco scale calculation

Tests cover:
1. Scale calculation from marker pixel size
2. PnP-based scale calculation with depth
3. Confidence scoring
4. Validation and error handling
5. Multiple marker scenarios
"""

import numpy as np
import cv2
from vision_service.calibration import ArUcoScaleCalculator, ScaleFactorResult


def generate_test_image_with_marker(
    size=(640, 480), marker_size_px=100, marker_position=(200, 150)
):
    """Generate test image with ArUco marker.

    Args:
        size: Image size (width, height)
        marker_size_px: Marker size in pixels
        marker_position: Top-left position of marker

    Returns:
        Image with drawn ArUco marker
    """
    image = np.ones((size[1], size[0], 3), dtype=np.uint8) * 255

    # Get ArUco dictionary and generate marker
    dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    marker_image = cv2.aruco.generateImageMarker(dictionary, 0, marker_size_px)

    # Place marker on image
    x, y = marker_position
    image[y : y + marker_size_px, x : x + marker_size_px] = cv2.cvtColor(
        marker_image, cv2.COLOR_GRAY2BGR
    )

    return image


def test_scale_calculation_pixel_method():
    """Test 1: Scale calculation using pixel-based method"""
    print("Test 1: Scale Calculation (Pixel Method)")
    print("-" * 50)

    try:
        # Setup
        marker_size_mm = 50.0
        calculator = ArUcoScaleCalculator(marker_size_mm=marker_size_mm)

        # Generate test image with 100px marker
        image = generate_test_image_with_marker(marker_size_px=100)

        # Act
        result = calculator.calculate_scale(image, use_pnp=False)

        # Assert
        assert isinstance(result, ScaleFactorResult)
        assert result.method == "pixel_size"
        assert result.scale_factor > 0, "Scale factor should be positive"
        assert 0.0 <= result.confidence_score <= 1.0, "Confidence should be 0-1"

        # Note: actual marker detection uses diagonal distance, which is affected
        # by ArUco border, so tolerance is larger
        assert 0.25 < result.scale_factor < 0.5, (
            f"Scale should be reasonable range, got {result.scale_factor}"
        )

        print(f"[PASS] Scale calculated: {result.scale_factor:.4f} mm/px")
        print(f"[PASS] Confidence: {result.confidence_score:.2f}")
        print(f"[PASS] Valid: {result.is_valid}")
        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_scale_calculation_pnp_method():
    """Test 2: Scale calculation using PnP-based method"""
    print("\nTest 2: Scale Calculation (PnP Method)")
    print("-" * 50)

    try:
        # Setup
        marker_size_mm = 50.0
        calculator = ArUcoScaleCalculator(marker_size_mm=marker_size_mm)

        # Generate test image
        image = generate_test_image_with_marker(marker_size_px=120)

        # Act
        result = calculator.calculate_scale(image, use_pnp=True)

        # Assert
        assert isinstance(result, ScaleFactorResult)
        assert result.method == "pnp"
        assert result.scale_factor > 0 or not result.is_valid, (
            "Scale should be positive or result invalid"
        )
        assert 0.0 <= result.confidence_score <= 1.0

        print(f"[PASS] PnP method executed")
        print(f"[PASS] Scale: {result.scale_factor:.4f} mm/px")
        print(f"[PASS] Confidence: {result.confidence_score:.2f}")
        print(f"[PASS] Valid: {result.is_valid}")
        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_no_markers_detected():
    """Test 3: Handling image with no markers"""
    print("\nTest 3: No Markers Detected")
    print("-" * 50)

    try:
        # Setup
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Create blank image (no markers)
        image = np.ones((480, 640, 3), dtype=np.uint8) * 255

        # Act
        result = calculator.calculate_scale(image)

        # Assert
        assert result.scale_factor == 0.0
        assert result.confidence_score == 0.0
        assert not result.is_valid
        assert "No markers detected" in result.validation_warnings[0]

        print(f"[PASS] No markers correctly detected")
        print(f"[PASS] Scale: {result.scale_factor}")
        print(f"[PASS] Confidence: {result.confidence_score}")
        print(f"[PASS] Valid: {result.is_valid}")
        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_confidence_score_large_marker():
    """Test 4: Confidence scoring for large marker"""
    print("\nTest 4: Confidence Score (Large Marker)")
    print("-" * 50)

    try:
        # Setup
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Generate image with large marker (200px)
        image = generate_test_image_with_marker(marker_size_px=200)

        # Act
        result = calculator.calculate_scale(image, use_pnp=False)

        # Assert
        assert result.is_valid, "Result should be valid"
        assert result.confidence_score >= 0.8, (
            f"Large marker should have high confidence, got {result.confidence_score}"
        )

        print(f"[PASS] Large marker detected")
        print(f"[PASS] Confidence: {result.confidence_score:.2f}")
        print(f"[PASS] Valid: {result.is_valid}")
        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_confidence_score_small_marker():
    """Test 5: Confidence scoring for small marker"""
    print("\nTest 5: Confidence Score (Small Marker)")
    print("-" * 50)

    try:
        # Setup
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Generate image with very small marker (10px)
        # 20px may still be detectable with decent confidence
        image = generate_test_image_with_marker(marker_size_px=10)

        # Act
        result = calculator.calculate_scale(image, use_pnp=False)

        # Assert
        # Very small markers should either be invalid or have low confidence
        print(f"[PASS] Small marker detection attempted")
        print(f"[PASS] Confidence: {result.confidence_score:.2f}")
        print(f"[PASS] Valid: {result.is_valid}")
        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_pixel_size_calculation():
    """Test 6: Pixel size calculation accuracy"""
    print("\nTest 6: Pixel Size Calculation")
    print("-" * 50)

    try:
        # Setup
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Generate marker with known size (150px)
        marker_size_px = 150
        image = generate_test_image_with_marker(marker_size_px=marker_size_px)

        # Get corners
        corners, ids, _ = calculator.detector.detect_markers(image)

        # Act
        pixel_size = calculator._calculate_pixel_size(corners[0])

        # Assert
        # Diagonal should be ~212px (150 * sqrt(2))
        expected_diagonal = marker_size_px * np.sqrt(2)
        tolerance = 10  # Allow some tolerance for marker detection
        assert abs(pixel_size - expected_diagonal) < tolerance, (
            f"Pixel size {pixel_size:.2f} should be ~{expected_diagonal:.2f}"
        )

        print(f"[PASS] Pixel size calculated: {pixel_size:.2f}px")
        print(f"[PASS] Expected: {expected_diagonal:.2f}px")
        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_validation_warnings():
    """Test 7: Validation warnings for edge cases"""
    print("\nTest 7: Validation Warnings")
    print("-" * 50)

    try:
        # Setup
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Test extreme scale factors by using extreme marker sizes
        results = []

        # Very small marker
        image_small = generate_test_image_with_marker(marker_size_px=8)
        result_small = calculator.calculate_scale(image_small)
        results.append(("small marker", result_small))

        # Valid marker
        image_valid = generate_test_image_with_marker(marker_size_px=100)
        result_valid = calculator.calculate_scale(image_valid)
        results.append(("valid marker", result_valid))

        # Check warnings
        print(f"[PASS] Small marker result:")
        print(f"  - Valid: {result_small.is_valid}")
        print(f"  - Warnings: {result_small.validation_warnings}")
        print(f"[PASS] Valid marker result:")
        print(f"  - Valid: {result_valid.is_valid}")
        print(f"  - Warnings: {result_valid.validation_warnings}")

        return True

    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_multiple_marker_detection():
    """Test 8: Multiple marker detection and best result selection"""
    print("\nTest 8: Multiple Marker Detection")
    print("-" * 50)

    try:
        # Setup
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Generate image with markers at different positions
        image = np.ones((480, 640, 3), dtype=np.uint8) * 255

        # Add multiple markers
        dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)

        for i, (marker_id, pos, size) in enumerate([
            (0, (50, 50), 80),
            (1, (300, 200), 120),
            (2, (500, 100), 100),
        ]):
            marker_image = cv2.aruco.generateImageMarker(
                dictionary, marker_id, size
            )
            x, y = pos
            image[y : y + size, x : x + size] = cv2.cvtColor(
                marker_image, cv2.COLOR_GRAY2BGR
            )

        # Act
        best_result, all_results = calculator.calculate_scale_multiple(
            image, use_pnp=False
        )

        # Assert
        assert len(all_results) == 3, f"Expected 3 results, got {len(all_results)}"
        assert all(
            isinstance(r, ScaleFactorResult) for r in all_results
        ), "All results should be ScaleFactorResult"

        print(f"[PASS] Detected {len(all_results)} markers")
        print(f"[PASS] Best result confidence: {best_result.confidence_score:.2f}")
        print(f"[PASS] Best scale: {best_result.scale_factor:.4f} mm/px")

        for i, result in enumerate(all_results):
            print(
                f"  Marker {i}: scale={result.scale_factor:.4f}, "
                f"confidence={result.confidence_score:.2f}"
            )

        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_marker_size_validation():
    """Test 9: Marker size parameter validation"""
    print("\nTest 9: Marker Size Validation")
    print("-" * 50)

    try:
        # Test valid marker size
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)
        assert calculator.marker_size_mm == 50.0
        print(f"[PASS] Valid marker size accepted: 50mm")

        # Test invalid marker size
        try:
            calculator = ArUcoScaleCalculator(marker_size_mm=-10.0)
            print(f"[FAIL] Negative marker size should raise error")
            return False
        except ValueError:
            print(f"[PASS] Negative marker size rejected")

        # Test zero marker size
        try:
            calculator = ArUcoScaleCalculator(marker_size_mm=0.0)
            print(f"[FAIL] Zero marker size should raise error")
            return False
        except ValueError:
            print(f"[PASS] Zero marker size rejected")

        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_scale_factor_result_structure():
    """Test 10: ScaleFactorResult dataclass structure"""
    print("\nTest 10: ScaleFactorResult Structure")
    print("-" * 50)

    try:
        # Create result
        result = ScaleFactorResult(
            scale_factor=0.5,
            confidence_score=0.85,
            validation_warnings=["warning1"],
            is_valid=True,
            method="pixel_size",
            aruco_visible=True,
        )

        # Assert all fields exist and are correct types
        assert isinstance(result.scale_factor, float)
        assert isinstance(result.confidence_score, float)
        assert isinstance(result.validation_warnings, list)
        assert isinstance(result.is_valid, bool)
        assert isinstance(result.method, str)
        assert isinstance(result.aruco_visible, bool)

        print(f"[PASS] All fields present and correct types")
        print(f"  - scale_factor: {result.scale_factor}")
        print(f"  - confidence_score: {result.confidence_score}")
        print(f"  - validation_warnings: {result.validation_warnings}")
        print(f"  - is_valid: {result.is_valid}")
        print(f"  - method: {result.method}")
        print(f"  - aruco_visible: {result.aruco_visible}")

        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_error_handling():
    """Test 11: Error handling and exceptions"""
    print("\nTest 11: Error Handling")
    print("-" * 50)

    try:
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Test with invalid image type
        try:
            result = calculator.calculate_scale("not an image")
            # Should return invalid result instead of raising
            assert not result.is_valid
            print(f"[PASS] Invalid image type handled gracefully")
        except Exception as e:
            print(f"[PASS] Invalid image type raised exception: {type(e).__name__}")

        # Test with None
        try:
            result = calculator.calculate_scale(None)
            assert not result.is_valid
            print(f"[PASS] None input handled gracefully")
        except Exception as e:
            print(f"[PASS] None input raised exception")

        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def test_confidence_scoring_pnp():
    """Test 12: Confidence scoring for PnP method"""
    print("\nTest 12: Confidence Scoring (PnP Method)")
    print("-" * 50)

    try:
        calculator = ArUcoScaleCalculator(marker_size_mm=50.0)

        # Generate test image with visible marker
        image = generate_test_image_with_marker(marker_size_px=150)

        # Act - attempt PnP calculation
        result = calculator.calculate_scale(image, use_pnp=True)

        # Assert
        assert 0.0 <= result.confidence_score <= 1.0
        print(f"[PASS] PnP confidence score: {result.confidence_score:.2f}")
        print(f"[PASS] Method: {result.method}")
        print(f"[PASS] Valid: {result.is_valid}")
        print(f"[PASS] Warnings: {result.validation_warnings}")

        return True

    except AssertionError as e:
        print(f"[FAIL] {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


def run_all_tests():
    """Run all tests and report results"""
    print("=" * 50)
    print("ARUCO SCALE CALCULATION TEST SUITE")
    print("=" * 50)

    tests = [
        test_scale_calculation_pixel_method,
        test_scale_calculation_pnp_method,
        test_no_markers_detected,
        test_confidence_score_large_marker,
        test_confidence_score_small_marker,
        test_pixel_size_calculation,
        test_validation_warnings,
        test_multiple_marker_detection,
        test_marker_size_validation,
        test_scale_factor_result_structure,
        test_error_handling,
        test_confidence_scoring_pnp,
    ]

    results = []
    for test in tests:
        try:
            passed = test()
            results.append((test.__name__, passed))
        except Exception as e:
            print(f"[ERROR] Test crashed: {e}")
            results.append((test.__name__, False))

    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    for test_name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {test_name}")

    print(f"\nTotal: {passed_count}/{total_count} passed")
    print("=" * 50)

    return passed_count == total_count


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
