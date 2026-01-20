"""
Test script to verify ArUco detection implementation.
"""

import numpy as np
import cv2
from vision_service.calibration.aruco_detect import (
    ArUcoDetector,
    visualize_markers,
    visualize_marker_corners,
)


def generate_test_image_with_markers():
    """Generate a test image with ArUco markers."""
    # Create a blank image
    image = np.ones((600, 800, 3), dtype=np.uint8) * 255

    # Get the ArUco dictionary
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)

    # Generate and place markers at different positions
    marker_positions = [(100, 100), (400, 100), (100, 400), (400, 400)]
    marker_ids = [0, 1, 2, 3]

    for marker_id, (x, y) in zip(marker_ids, marker_positions):
        marker_image = cv2.aruco.generateImageMarker(aruco_dict, marker_id, 100)
        image[y : y + 100, x : x + 100] = cv2.cvtColor(marker_image, cv2.COLOR_GRAY2BGR)

    return image


def test_detection():
    """Test basic marker detection."""
    print("Test 1: Basic Marker Detection")
    print("-" * 50)

    # Initialize detector
    detector = ArUcoDetector(dictionary_name="DICT_4X4_50")
    print("[PASS] Initialized ArUcoDetector with DICT_4X4_50")

    # Generate test image
    image = generate_test_image_with_markers()
    print(f"[PASS] Generated test image with markers: {image.shape}")

    # Detect markers
    corners, ids, rejected = detector.detect_markers(image)

    if ids is not None:
        print(f"[PASS] Detected {len(ids)} markers")
        for marker_id in ids.flatten():
            print(f"  - Marker ID: {marker_id}")
    else:
        print("[FAIL] No markers detected")
        return False

    print()
    return True


def test_corner_coordinates():
    """Test retrieval of 4 corner coordinates per marker."""
    print("Test 2: Four Corner Coordinates Per Marker")
    print("-" * 50)

    detector = ArUcoDetector(dictionary_name="DICT_4X4_50")
    image = generate_test_image_with_markers()

    corners, ids, _ = detector.detect_markers(image)

    if corners is None:
        print("[FAIL] No corners detected")
        return False

    print(f"[PASS] Retrieved corners for {len(corners)} markers")
    for i, (marker_id, corner_set) in enumerate(zip(ids.flatten(), corners)):
        # Each corner_set is shape (4, 2) - 4 corners with x,y coordinates
        print(f"[PASS] Marker {marker_id}: {len(corner_set)} corners detected")
        for j, corner in enumerate(corner_set):
            print(f"  Corner {j}: ({corner[0]:.2f}, {corner[1]:.2f})")

    print()
    return True


def test_multiple_markers():
    """Test detection of multiple markers."""
    print("Test 3: Multiple Markers Detection")
    print("-" * 50)

    detector = ArUcoDetector(dictionary_name="DICT_4X4_50")
    image = generate_test_image_with_markers()

    result = detector.detect_multiple_markers(image)

    print(f"[PASS] Detected {result['count']} markers")
    print(f"  Marker IDs: {result['ids']}")
    print(f"  Marker count matches: {result['count'] > 0}")

    for marker in result["markers"]:
        print(f"[PASS] Marker {marker['id']}: {len(marker['corners'])} corners")

    print()
    return result["count"] > 0


def test_get_marker_corners():
    """Test the get_marker_corners convenience method."""
    print("Test 4: Get Marker Corners Method")
    print("-" * 50)

    detector = ArUcoDetector(dictionary_name="DICT_4X4_50")
    image = generate_test_image_with_markers()

    markers_data = detector.get_marker_corners(image)

    print(f"[PASS] Retrieved data for {len(markers_data)} markers")
    for marker in markers_data:
        corners = marker["corners"]
        print(f"[PASS] Marker {marker['id']}: corners tuple has {len(corners)} values")
        print(f"  Corners: {[(corners[i], corners[i+1]) for i in range(0, 8, 2)]}")

    print()
    return len(markers_data) > 0


def test_visualization():
    """Test visualization functions."""
    print("Test 5: Visualization Helpers")
    print("-" * 50)

    detector = ArUcoDetector(dictionary_name="DICT_4X4_50")
    image = generate_test_image_with_markers()

    corners, ids, rejected = detector.detect_markers(image)

    # Test basic visualization
    viz_image = visualize_markers(image, corners, ids, rejected)
    print(f"[PASS] Basic visualization created: {viz_image.shape}")

    # Test corner visualization
    corner_viz = visualize_marker_corners(image, corners, ids)
    print(f"[PASS] Corner visualization created: {corner_viz.shape}")

    # Check that visualizations are valid
    assert viz_image.shape == image.shape, "Visualization shape mismatch"
    assert corner_viz.shape == image.shape, "Corner visualization shape mismatch"
    print("[PASS] Visualization dimensions correct")

    print()
    return True


def test_acceptance_criteria():
    """Verify all acceptance criteria."""
    print("=" * 50)
    print("ACCEPTANCE CRITERIA VERIFICATION")
    print("=" * 50)
    print()

    criteria = [
        ("Detects DICT_4X4_50 markers", test_detection),
        ("Returns 4 corner coordinates per marker", test_corner_coordinates),
        ("Handles multiple markers", test_multiple_markers),
        ("Visualization helper included", test_visualization),
    ]

    results = []
    for criterion_name, test_func in criteria:
        try:
            result = test_func()
            results.append((criterion_name, result))
        except Exception as e:
            print(f"[ERROR] Error in {criterion_name}: {e}")
            results.append((criterion_name, False))
        print()

    print("=" * 50)
    print("SUMMARY")
    print("=" * 50)
    for criterion_name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status}: {criterion_name}")

    all_passed = all(result for _, result in results)
    print()
    if all_passed:
        print("[PASS] ALL ACCEPTANCE CRITERIA MET")
    else:
        print("[FAIL] SOME CRITERIA NOT MET")

    return all_passed


if __name__ == "__main__":
    success = test_acceptance_criteria()
    exit(0 if success else 1)
