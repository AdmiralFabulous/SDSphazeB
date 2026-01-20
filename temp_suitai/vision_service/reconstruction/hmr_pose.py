"""
HMR 2.0 Pose Estimation Module for Vision Service

Integrates HMR (Human Mesh Recovery) 2.0 model for robust pose estimation.
Provides utilities to extract 72-dimensional pose vectors (axis-angle representation)
from images with rotation matrices and confidence scores.

This module is designed to integrate with the Body4D reconstruction pipeline,
providing temporal pose tracking and mesh recovery.
"""

from dataclasses import dataclass, field
from typing import Optional, Tuple, Union
import numpy as np
from datetime import datetime
import cv2


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class PoseParameters:
    """
    HMR 2.0 pose parameters extracted from an image.

    Represents the 3D body pose in SMPL format using axis-angle representation.
    Includes rotation matrices and confidence metrics.
    """

    # Pose parameters (axis-angle representation)
    pose_theta: np.ndarray  # Shape: [72] - 24 joints * 3 (axis-angle)

    # Derived rotation matrices
    rotation_matrices: np.ndarray  # Shape: [24, 3, 3] - Per-joint rotation matrices

    # Root/global pose
    global_rotation: np.ndarray = field(default_factory=lambda: np.eye(3))  # 3x3 rotation matrix
    global_translation: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))  # [x, y, z]

    # Confidence and quality metrics
    confidence: float = 1.0  # Overall confidence (0-1)
    joint_confidences: np.ndarray = field(default_factory=lambda: np.ones(24))  # Per-joint confidence

    # Metadata
    frame_id: int = 0
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = "hmr_2.0"

    def to_dict(self) -> dict:
        """Convert pose parameters to dictionary (for serialization)."""
        return {
            "pose_theta": self.pose_theta.tolist(),
            "rotation_matrices": self.rotation_matrices.tolist(),
            "global_rotation": self.global_rotation.tolist(),
            "global_translation": self.global_translation.tolist(),
            "confidence": self.confidence,
            "joint_confidences": self.joint_confidences.tolist(),
            "frame_id": self.frame_id,
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
        }


@dataclass
class HMRPoseResult:
    """Result from HMR pose estimation containing all output data."""

    pose_params: PoseParameters
    image_preprocessed: np.ndarray  # Preprocessed input image
    processing_time_ms: float  # Time to process in milliseconds
    model_output: Optional[dict] = None  # Raw model outputs for debugging


# ============================================================================
# Image Preprocessing
# ============================================================================

def preprocess_image(
    image: np.ndarray,
    target_size: int = 224,
    normalize: bool = True,
) -> Tuple[np.ndarray, Tuple[float, float]]:
    """
    Preprocess image for HMR model input.

    Handles:
    - Resizing to target resolution
    - Normalization to [-1, 1] range
    - Center cropping for square aspect ratio

    Args:
        image: Input image as numpy array (RGB or BGR).
        target_size: Target resolution for model (typically 224 or 256).
        normalize: Whether to normalize to [-1, 1] range.

    Returns:
        Tuple of (preprocessed_image, scale_factors).
        scale_factors: (height_scale, width_scale) for coordinate transformation.

    Raises:
        TypeError: If image is not numpy array.
        ValueError: If image shape is invalid.
    """
    if not isinstance(image, np.ndarray):
        raise TypeError(f"Expected ndarray, got {type(image)}")

    if image.ndim not in [2, 3]:
        raise ValueError(f"Expected 2D or 3D image, got {image.ndim}D")

    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
    elif image.shape[2] == 1:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

    original_height, original_width = image.shape[:2]

    # Calculate scale factors for coordinate transformation
    scale_h = original_height / target_size
    scale_w = original_width / target_size

    # Resize to target size
    resized = cv2.resize(image, (target_size, target_size), interpolation=cv2.INTER_LINEAR)

    # Convert to float32
    resized = resized.astype(np.float32)

    # Normalize to [-1, 1] range (typical HMR preprocessing)
    if normalize:
        resized = (resized / 127.5) - 1.0
    else:
        # Alternative: normalize to [0, 1]
        resized = resized / 255.0

    # Ensure channel-first format if needed (C x H x W for PyTorch)
    # Note: This returns H x W x C format; caller should transpose if needed

    return resized, (scale_h, scale_w)


def postprocess_coordinates(
    coordinates: np.ndarray,
    scale_factors: Tuple[float, float],
) -> np.ndarray:
    """
    Transform model output coordinates back to original image space.

    Args:
        coordinates: Coordinates in model output space.
        scale_factors: Scale factors from preprocessing (height_scale, width_scale).

    Returns:
        Coordinates transformed back to original image space.
    """
    if not isinstance(coordinates, np.ndarray):
        raise TypeError(f"Expected ndarray, got {type(coordinates)}")

    scale_h, scale_w = scale_factors

    # Copy to avoid modifying original
    transformed = coordinates.copy()

    # Apply scale factors (handle 2D and 3D coordinates)
    if transformed.ndim == 1 and len(transformed) >= 2:
        transformed[0] *= scale_w
        transformed[1] *= scale_h
    elif transformed.ndim == 2 and transformed.shape[1] >= 2:
        transformed[:, 0] *= scale_w
        transformed[:, 1] *= scale_h

    return transformed


# ============================================================================
# Rotation Matrix Utilities
# ============================================================================

def axis_angle_to_rotation_matrix(axis_angle: np.ndarray) -> np.ndarray:
    """
    Convert axis-angle representation to 3x3 rotation matrix.

    Args:
        axis_angle: Axis-angle vector of shape (3,).

    Returns:
        3x3 rotation matrix.

    Raises:
        ValueError: If input shape is invalid.
    """
    if axis_angle.shape != (3,):
        raise ValueError(f"Expected shape (3,), got {axis_angle.shape}")

    # Compute angle (norm of axis-angle)
    angle = np.linalg.norm(axis_angle)

    # Handle small angles
    if angle < 1e-6:
        return np.eye(3)

    # Normalized axis
    axis = axis_angle / angle

    # Rodrigues' rotation formula
    K = np.array([
        [0, -axis[2], axis[1]],
        [axis[2], 0, -axis[0]],
        [-axis[1], axis[0], 0]
    ])

    R = np.eye(3) + np.sin(angle) * K + (1 - np.cos(angle)) * (K @ K)

    return R


def rotation_matrix_to_axis_angle(R: np.ndarray) -> np.ndarray:
    """
    Convert 3x3 rotation matrix to axis-angle representation.

    Args:
        R: 3x3 rotation matrix.

    Returns:
        Axis-angle vector of shape (3,).

    Raises:
        ValueError: If input shape is invalid.
    """
    if R.shape != (3, 3):
        raise ValueError(f"Expected shape (3, 3), got {R.shape}")

    # Angle from trace
    trace = np.trace(R)
    angle = np.arccos(np.clip((trace - 1) / 2, -1.0, 1.0))

    # Handle small angles
    if angle < 1e-6:
        return np.zeros(3)

    # Handle angle near pi
    if np.abs(angle - np.pi) < 1e-6:
        # Find the axis from diagonal elements
        diag = np.diag(R)
        k = np.argmax(diag)
        axis = np.zeros(3)
        axis[k] = 1.0
    else:
        # Extract axis from skew-symmetric part
        axis = np.array([
            R[2, 1] - R[1, 2],
            R[0, 2] - R[2, 0],
            R[1, 0] - R[0, 1]
        ]) / (2 * np.sin(angle))

    # Normalize
    axis = axis / (np.linalg.norm(axis) + 1e-8)

    return angle * axis


def batch_axis_angle_to_rotation_matrices(batch_axis_angles: np.ndarray) -> np.ndarray:
    """
    Convert batch of axis-angle vectors to rotation matrices.

    Args:
        batch_axis_angles: Array of shape [N, 3] with axis-angle vectors.

    Returns:
        Array of shape [N, 3, 3] with rotation matrices.
    """
    if batch_axis_angles.shape[1] != 3:
        raise ValueError(f"Expected shape [N, 3], got {batch_axis_angles.shape}")

    N = batch_axis_angles.shape[0]
    rotation_matrices = np.zeros((N, 3, 3))

    for i in range(N):
        rotation_matrices[i] = axis_angle_to_rotation_matrix(batch_axis_angles[i])

    return rotation_matrices


# ============================================================================
# HMR 2.0 Pose Estimator
# ============================================================================

class HMRPoseEstimator:
    """
    HMR 2.0 Pose Estimator for robust human mesh recovery.

    This is a placeholder implementation designed for integration with the
    actual HMR 2.0 model. It demonstrates the expected interface and data flow.

    In production, this would:
    1. Load pre-trained HMR 2.0 model weights
    2. Run inference on preprocessed images
    3. Extract 72-dim pose vectors and other SMPL parameters
    4. Provide confidence scores and rotation matrices
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        device: str = "cpu",
        input_size: int = 224,
    ):
        """
        Initialize HMR pose estimator.

        Args:
            model_path: Path to pre-trained HMR 2.0 model weights.
                       If None, uses mock mode for testing.
            device: Compute device ('cpu' or 'cuda').
            input_size: Input image resolution for model (typically 224).
        """
        self.model_path = model_path
        self.device = device
        self.input_size = input_size
        self.use_mock = model_path is None

        # In production, load model here
        self.model = None
        if not self.use_mock:
            self._load_model()

        # Statistics tracking
        self._frame_counter = 0
        self._processing_times = []

    def _load_model(self) -> None:
        """Load HMR 2.0 model weights. (Placeholder for actual implementation)"""
        # In production:
        # import torch
        # from hmr2 import HMR2  # or appropriate import
        # self.model = HMR2.load_from_checkpoint(self.model_path)
        # self.model.to(self.device)
        # self.model.eval()
        pass

    def estimate_pose(
        self,
        image: np.ndarray,
    ) -> HMRPoseResult:
        """
        Estimate pose from image.

        Args:
            image: Input image as numpy array (RGB, BGR, or grayscale).

        Returns:
            HMRPoseResult with pose parameters and metadata.

        Raises:
            ValueError: If image is invalid.
            RuntimeError: If model is not loaded (non-mock mode).
        """
        import time

        if not isinstance(image, np.ndarray):
            raise TypeError(f"Expected ndarray, got {type(image)}")

        start_time = time.time()

        # Preprocess image
        preprocessed, scale_factors = preprocess_image(
            image,
            target_size=self.input_size,
            normalize=True,
        )

        # Run inference
        if self.use_mock:
            pose_theta, rotation_matrices, confidence = self._mock_inference()
        else:
            pose_theta, rotation_matrices, confidence = self._run_inference(preprocessed)

        # Extract per-joint confidences
        joint_confidences = self._extract_joint_confidences(confidence)

        # Create result
        pose_params = PoseParameters(
            pose_theta=pose_theta,
            rotation_matrices=rotation_matrices,
            global_rotation=rotation_matrices[0],  # Root rotation
            global_translation=np.array([0.0, 0.0, 0.0]),  # Estimated from image
            confidence=float(confidence),
            joint_confidences=joint_confidences,
            frame_id=self._frame_counter,
            timestamp=datetime.now(),
        )

        processing_time = (time.time() - start_time) * 1000  # ms
        self._processing_times.append(processing_time)
        self._frame_counter += 1

        return HMRPoseResult(
            pose_params=pose_params,
            image_preprocessed=preprocessed,
            processing_time_ms=processing_time,
        )

    def _run_inference(
        self,
        preprocessed_image: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray, float]:
        """
        Run HMR 2.0 model inference. (Placeholder for actual implementation)

        In production, would:
        1. Convert image to torch tensor
        2. Run model forward pass
        3. Extract pose, shape, and camera parameters
        4. Convert to our output format
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Use mock mode by passing model_path=None")

        # Production implementation would be here
        # import torch
        # with torch.no_grad():
        #     pred = self.model(torch.tensor(preprocessed_image).to(self.device))
        # pose_theta = pred['pred_pose'].cpu().numpy()
        # etc.

        raise NotImplementedError("Real HMR 2.0 inference not yet implemented")

    def _mock_inference(self) -> Tuple[np.ndarray, np.ndarray, float]:
        """Generate mock pose for testing and development."""
        # Generate realistic-looking random pose with small random values
        pose_theta = np.random.randn(72) * 0.1  # Small random angles

        # Convert to rotation matrices
        axis_angles = pose_theta.reshape(24, 3)
        rotation_matrices = batch_axis_angle_to_rotation_matrices(axis_angles)

        # Vary confidence slightly
        confidence = 0.85 + np.random.rand() * 0.1

        return pose_theta, rotation_matrices, confidence

    def _extract_joint_confidences(self, overall_confidence: float) -> np.ndarray:
        """
        Extract per-joint confidence scores.

        In production, model would output per-joint confidences.
        For now, derive from overall confidence with small variation.
        """
        joint_confidences = np.ones(24) * overall_confidence
        # Add small random variation
        joint_confidences *= (1.0 + np.random.randn(24) * 0.05)
        joint_confidences = np.clip(joint_confidences, 0.0, 1.0)
        return joint_confidences

    def get_average_processing_time(self) -> float:
        """Get average processing time in milliseconds."""
        if not self._processing_times:
            return 0.0
        return float(np.mean(self._processing_times))

    def reset_statistics(self) -> None:
        """Reset processing statistics."""
        self._frame_counter = 0
        self._processing_times.clear()


# ============================================================================
# Convenience Functions
# ============================================================================

def create_mock_pose_parameters(
    frame_id: int = 0,
    confidence: float = 0.90,
) -> PoseParameters:
    """
    Create mock pose parameters for testing.

    Args:
        frame_id: Frame number.
        confidence: Confidence score (0-1).

    Returns:
        PoseParameters with realistic mock data.
    """
    # Generate realistic random pose
    pose_theta = np.random.randn(72) * 0.1

    # Convert to rotation matrices
    axis_angles = pose_theta.reshape(24, 3)
    rotation_matrices = batch_axis_angle_to_rotation_matrices(axis_angles)

    # Per-joint confidences
    joint_confidences = np.ones(24) * confidence
    joint_confidences *= (1.0 + np.random.randn(24) * 0.05)
    joint_confidences = np.clip(joint_confidences, 0.0, 1.0)

    return PoseParameters(
        pose_theta=pose_theta,
        rotation_matrices=rotation_matrices,
        global_rotation=rotation_matrices[0],
        global_translation=np.array([0.0, 0.0, 0.0]),
        confidence=confidence,
        joint_confidences=joint_confidences,
        frame_id=frame_id,
        timestamp=datetime.now(),
    )


def create_mock_hmr_pose_estimator() -> HMRPoseEstimator:
    """
    Create mock HMR pose estimator for testing (no model loading).

    Returns:
        HMRPoseEstimator in mock mode.
    """
    return HMRPoseEstimator(model_path=None, device="cpu")
