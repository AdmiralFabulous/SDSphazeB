"""
Example usage of SAM 3 Segmentation module for person segmentation.

This script demonstrates:
- Initializing the segmenter
- Loading and setting images
- Point-based segmentation
- Box-based segmentation
- Combined prompts
- Confidence scoring and mask selection
"""

import numpy as np
from vision_service.segmentation import create_segmenter, PromptType


def example_point_segmentation(image_path: str):
    """
    Example: Segment person using a point click.

    Args:
        image_path: Path to input image file
    """
    print("=" * 60)
    print("Example 1: Point-Based Segmentation")
    print("=" * 60)

    # Import here to avoid hard dependency
    try:
        import cv2
    except ImportError:
        print("OpenCV not installed. Install with: pip install opencv-python")
        return

    # Initialize segmenter with GPU
    print("\n1. Initializing SAM 3 segmenter with GPU...")
    segmenter = create_segmenter(model_type="vit_b", use_cuda=True)

    device_info = segmenter.get_device_info()
    print(f"   Device: {device_info['device']}")
    print(f"   Model: {device_info['model_type']}")

    # Load image
    print(f"\n2. Loading image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print(f"   Error: Could not load image from {image_path}")
        return

    height, width = image.shape[:2]
    print(f"   Image size: {width}x{height}")

    # Convert to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Set image for segmentation
    print("\n3. Setting image for segmentation...")
    segmenter.set_image(image_rgb)

    # Click point at center of image
    point = (width // 2, height // 2)
    print(f"\n4. Segmenting with point prompt at {point}...")
    result = segmenter.segment_with_point(point, positive=True)

    # Display results
    print(f"\n5. Segmentation results:")
    print(f"   Prompt type: {result.prompt_type.value}")
    print(f"   Mask shape: {result.mask.shape}")
    print(f"   Confidence: {result.confidence:.3f}")
    print(f"   IoU prediction: {result.iou:.3f}")
    print(f"   Stability score: {result.stability_score:.3f}")
    print(f"   Valid: {result.is_valid}")

    if result.is_valid:
        # Apply mask to image
        masked_image = image.copy()
        masked_image[~result.mask] = 0
        print(f"\n6. Mask applied successfully!")
        print(f"   Foreground pixels: {result.mask.sum():,}")
        print(f"   Foreground percentage: {100 * result.mask.mean():.1f}%")


def example_box_segmentation(image_path: str):
    """
    Example: Segment person using a bounding box.

    Args:
        image_path: Path to input image file
    """
    print("\n" + "=" * 60)
    print("Example 2: Box-Based Segmentation")
    print("=" * 60)

    try:
        import cv2
    except ImportError:
        print("OpenCV not installed.")
        return

    # Initialize segmenter
    print("\n1. Initializing SAM 3 segmenter...")
    segmenter = create_segmenter(model_type="vit_b", use_cuda=True)

    # Load image
    print(f"\n2. Loading image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print(f"   Error: Could not load image")
        return

    height, width = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    segmenter.set_image(image_rgb)

    # Define bounding box (20% margins)
    margin_x = int(width * 0.2)
    margin_y = int(height * 0.2)
    box = (margin_x, margin_y, width - margin_x, height - margin_y)

    print(f"\n3. Segmenting with box prompt: {box}")
    result = segmenter.segment_with_box(box)

    # Display results
    print(f"\n4. Segmentation results:")
    print(f"   Prompt type: {result.prompt_type.value}")
    print(f"   Confidence: {result.confidence:.3f}")
    print(f"   Valid: {result.is_valid}")
    print(f"   Foreground pixels: {result.mask.sum():,}")


def example_combined_prompts(image_path: str):
    """
    Example: Segment using combined point and box prompts.

    Args:
        image_path: Path to input image file
    """
    print("\n" + "=" * 60)
    print("Example 3: Combined Point + Box Prompts")
    print("=" * 60)

    try:
        import cv2
    except ImportError:
        print("OpenCV not installed.")
        return

    # Initialize segmenter
    print("\n1. Initializing SAM 3 segmenter...")
    segmenter = create_segmenter(model_type="vit_b", use_cuda=True)

    # Load image
    print(f"\n2. Loading image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print(f"   Error: Could not load image")
        return

    height, width = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    segmenter.set_image(image_rgb)

    # Define point and box
    point = (width // 2, height // 2)
    margin_x = int(width * 0.15)
    margin_y = int(height * 0.15)
    box = (margin_x, margin_y, width - margin_x, height - margin_y)

    print(f"\n3. Segmenting with combined prompts:")
    print(f"   Point: {point}")
    print(f"   Box: {box}")

    result = segmenter.segment_with_point_and_box(point, box, positive=True)

    # Display results
    print(f"\n4. Segmentation results:")
    print(f"   Prompt type: {result.prompt_type.value}")
    print(f"   Confidence: {result.confidence:.3f}")
    print(f"   Stability score: {result.stability_score:.3f}")
    print(f"   Valid: {result.is_valid}")


def example_confidence_threshold(image_path: str):
    """
    Example: Demonstrate confidence threshold behavior.

    Args:
        image_path: Path to input image file
    """
    print("\n" + "=" * 60)
    print("Example 4: Confidence Threshold Behavior")
    print("=" * 60)

    try:
        import cv2
    except ImportError:
        print("OpenCV not installed.")
        return

    # Initialize segmenter
    print("\n1. Initializing SAM 3 segmenter...")
    segmenter = create_segmenter(model_type="vit_b", use_cuda=True)

    # Load image
    print(f"\n2. Loading image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print(f"   Error: Could not load image")
        return

    height, width = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    segmenter.set_image(image_rgb)

    # Test different thresholds
    point = (width // 2, height // 2)
    thresholds = [0.3, 0.5, 0.7, 0.9]

    print(f"\n3. Testing different confidence thresholds at point {point}:")
    for threshold in thresholds:
        result = segmenter.segment_with_point(
            point,
            positive=True,
            confidence_threshold=threshold,
        )
        print(f"\n   Threshold: {threshold}")
        print(f"   Confidence: {result.confidence:.3f}")
        print(f"   Valid: {result.is_valid}")
        if not result.is_valid:
            print(f"   Reason: {result.warning}")


def example_batch_processing(image_path: str):
    """
    Example: Batch process multiple prompts on same image.

    Args:
        image_path: Path to input image file
    """
    print("\n" + "=" * 60)
    print("Example 5: Batch Processing Multiple Prompts")
    print("=" * 60)

    try:
        import cv2
    except ImportError:
        print("OpenCV not installed.")
        return

    # Initialize segmenter
    print("\n1. Initializing SAM 3 segmenter...")
    segmenter = create_segmenter(model_type="vit_b", use_cuda=True)

    # Load image
    print(f"\n2. Loading image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print(f"   Error: Could not load image")
        return

    height, width = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Set image once
    print("\n3. Setting image (done once for efficiency)...")
    segmenter.set_image(image_rgb)

    # Generate multiple points in grid
    points = []
    for row in range(3):
        for col in range(3):
            x = int((col + 0.5) * width / 3)
            y = int((row + 0.5) * height / 3)
            points.append((x, y))

    print(f"\n4. Processing {len(points)} points on same image...")
    results = []
    for i, point in enumerate(points, 1):
        result = segmenter.segment_with_point(point, positive=True)
        results.append(result)
        print(f"   Point {i}: confidence={result.confidence:.3f}, valid={result.is_valid}")

    print(f"\n5. Summary:")
    print(f"   Total points: {len(results)}")
    print(f"   Valid segmentations: {sum(r.is_valid for r in results)}")
    avg_confidence = np.mean([r.confidence for r in results])
    print(f"   Average confidence: {avg_confidence:.3f}")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("SAM 3 Segmentation Module - Usage Examples")
    print("=" * 60)

    # Note: Replace with actual image path
    image_path = "sample_image.jpg"

    print("\nNote: Examples require an actual image file.")
    print(f"Replace '{image_path}' with your image path to run examples.\n")

    # Demonstrate API usage with mock data
    print("=" * 60)
    print("API Demo (without image file)")
    print("=" * 60)

    try:
        # Initialize
        print("\n1. Creating segmenter...")
        segmenter = create_segmenter(model_type="vit_b", use_cuda=True)
        print("   ✓ Segmenter created")

        # Get device info
        print("\n2. Device information:")
        info = segmenter.get_device_info()
        for key, value in info.items():
            print(f"   {key}: {value}")

        # Create dummy image
        print("\n3. Creating dummy image...")
        dummy_image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        segmenter.set_image(dummy_image)
        print("   ✓ Image set")

        # Demonstrate point prompt
        print("\n4. Point prompt example:")
        result = segmenter.segment_with_point((320, 240), positive=True)
        print(f"   Result type: {type(result).__name__}")
        print(f"   Prompt type: {result.prompt_type.value}")
        print(f"   Confidence: {result.confidence:.3f}")
        print(f"   Valid: {result.is_valid}")

    except Exception as e:
        print(f"\nNote: {e}")
        print("This is expected if SAM 3 is not installed.")


if __name__ == "__main__":
    main()
