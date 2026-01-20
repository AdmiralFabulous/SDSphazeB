"""
Pose and Shape Parameter Fusion Module

Combines HMR theta (pose) parameters with SHAPY beta (shape) parameters
to generate complete SMPL-X mesh representations.

This module handles:
- Fusion of pose (theta) and shape (beta) parameters
- SMPL-X mesh generation and manipulation
- A-pose conversion for standardized measurements
- Coordinate system conversions and transformations
"""

from dataclasses import dataclass, field
from typing import Optional, Tuple, Dict, Any
from enum import Enum
import numpy as np
from datetime import datetime


# ============================================================================
# Enums and Constants
# ============================================================================

class PoseFormat(Enum):
    """Enum for different pose representations."""
    AXIS_ANGLE = "axis_angle"  # 72-dim vector
    ROTATION_MATRICES = "rotation_matrices"  # 24x3x3
    QUATERNIONS = "quaternions"  # 24x4


class CoordinateSystem(Enum):
    """Enum for coordinate system types."""
    SMPL_X = "smpl_x"  # Standard SMPL-X coordinate system
    CAMERA = "camera"  # Camera/image coordinate system
    WORLD = "world"  # World coordinate system
    CANONICAL = "canonical"  # Canonical/body-centric system


# SMPL-X Constants
SMPL_X_NUM_JOINTS = 24  # Number of joints in SMPL-X
SMPL_X_NUM_VERTICES = 10475  # Total vertices in SMPL-X mesh
SMPL_X_NUM_FACES = 20908  # Total faces in SMPL-X mesh


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class ShapeParameters:
    """Shape parameters from SHAPY or shape estimation."""
    beta: np.ndarray  # Shape: [10] - Shape parameter vector for SMPL-X
    confidence: float = 1.0  # Confidence in shape estimation (0-1)
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = "shapy"  # Data source identifier


@dataclass
class PoseParameters:
    """Pose parameters from HMR or pose estimation."""
    theta: np.ndarray  # Shape: [72] - Axis-angle pose vector (24 joints * 3)
    confidence: float = 1.0  # Overall confidence (0-1)
    joint_confidences: np.ndarray = field(default_factory=lambda: np.ones(24))  # Per-joint
    rotation_matrices: Optional[np.ndarray] = None  # Shape: [24, 3, 3] (optional)
    global_rotation: np.ndarray = field(default_factory=lambda: np.eye(3))  # Root rotation
    global_translation: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = "hmr_2.0"  # Data source identifier


@dataclass
class FusedParameters:
    """
    Complete fused pose and shape parameters ready for SMPL-X mesh generation.

    Combines HMR theta (pose) with SHAPY beta (shape) and includes all necessary
    information for mesh rendering and measurement.
    """

    # Pose parameters (from HMR)
    pose_theta: np.ndarray  # Shape: [72] - Axis-angle representation

    # Shape parameters (from SHAPY)
    shape_beta: np.ndarray  # Shape: [10] - Shape parameters

    # Global transformation
    global_rotation: np.ndarray = field(default_factory=lambda: np.eye(3))  # 3x3
    global_translation: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))

    # Confidence metrics
    pose_confidence: float = 1.0  # Confidence in pose estimation
    shape_confidence: float = 1.0  # Confidence in shape estimation
    joint_confidences: np.ndarray = field(default_factory=lambda: np.ones(24))

    # Mesh data (after generation)
    vertices: Optional[np.ndarray] = None  # Shape: [10475, 3]
    faces: Optional[np.ndarray] = None  # Shape: [20908, 3]

    # A-pose version (for standardized measurements)
    apose_vertices: Optional[np.ndarray] = None  # Vertices in A-pose
    apose_mesh_height: Optional[float] = None

    # Coordinate system information
    coordinate_system: CoordinateSystem = CoordinateSystem.SMPL_X
    scale_factor: float = 1.0  # Scale relative to canonical pose

    # Metadata
    frame_id: int = 0
    timestamp: datetime = field(default_factory=datetime.now)
    pose_source: str = "hmr_2.0"
    shape_source: str = "shapy"

    def to_dict(self) -> dict:
        """Convert fused parameters to dictionary (for serialization)."""
        return {
            "pose_theta": self.pose_theta.tolist(),
            "shape_beta": self.shape_beta.tolist(),
            "global_rotation": self.global_rotation.tolist(),
            "global_translation": self.global_translation.tolist(),
            "pose_confidence": self.pose_confidence,
            "shape_confidence": self.shape_confidence,
            "joint_confidences": self.joint_confidences.tolist(),
            "vertices": self.vertices.tolist() if self.vertices is not None else None,
            "faces": self.faces.tolist() if self.faces is not None else None,
            "apose_vertices": self.apose_vertices.tolist() if self.apose_vertices is not None else None,
            "apose_mesh_height": self.apose_mesh_height,
            "coordinate_system": self.coordinate_system.value,
            "scale_factor": self.scale_factor,
            "frame_id": self.frame_id,
            "timestamp": self.timestamp.isoformat(),
            "pose_source": self.pose_source,
            "shape_source": self.shape_source,
        }


# ============================================================================
# Core Fusion Functions
# ============================================================================

def fuse_pose_and_shape(
    pose_params: PoseParameters,
    shape_params: ShapeParameters,
    validate: bool = True,
) -> FusedParameters:
    """
    Fuse pose and shape parameters into unified representation.

    This is the main entry point for combining HMR pose and SHAPY shape
    parameters into a complete FusedParameters object.

    Args:
        pose_params: PoseParameters from HMR pose estimation
        shape_params: ShapeParameters from SHAPY shape estimation
        validate: Whether to validate input parameters

    Returns:
        FusedParameters object with combined pose and shape

    Raises:
        ValueError: If parameters are invalid or incompatible
        TypeError: If parameters are not of expected type
    """
    if not isinstance(pose_params, PoseParameters):
        raise TypeError(f"Expected PoseParameters, got {type(pose_params)}")
    if not isinstance(shape_params, ShapeParameters):
        raise TypeError(f"Expected ShapeParameters, got {type(shape_params)}")

    if validate:
        _validate_pose_parameters(pose_params)
        _validate_shape_parameters(shape_params)

    # Combine confidence scores
    combined_confidence = np.sqrt(
        pose_params.confidence * shape_params.confidence
    )

    # Create fused parameters
    fused = FusedParameters(
        pose_theta=pose_params.theta.copy(),
        shape_beta=shape_params.beta.copy(),
        global_rotation=pose_params.global_rotation.copy(),
        global_translation=pose_params.global_translation.copy(),
        pose_confidence=pose_params.confidence,
        shape_confidence=shape_params.confidence,
        joint_confidences=pose_params.joint_confidences.copy(),
        frame_id=pose_params.frame_id if hasattr(pose_params, 'frame_id') else 0,
        timestamp=datetime.now(),
        pose_source=pose_params.source,
        shape_source=shape_params.source,
    )

    return fused


def validate_fused_parameters(fused: FusedParameters) -> Tuple[bool, str]:
    """
    Validate fused parameters for completeness and consistency.

    Args:
        fused: FusedParameters object to validate

    Returns:
        Tuple of (is_valid, message) where is_valid is bool and message describes issues
    """
    issues = []

    # Check pose theta
    if fused.pose_theta.shape != (72,):
        issues.append(f"pose_theta shape {fused.pose_theta.shape} != (72,)")

    # Check shape beta
    if fused.shape_beta.shape != (10,):
        issues.append(f"shape_beta shape {fused.shape_beta.shape} != (10,)")

    # Check global rotation
    if fused.global_rotation.shape != (3, 3):
        issues.append(f"global_rotation shape {fused.global_rotation.shape} != (3, 3)")

    # Check global translation
    if fused.global_translation.shape != (3,):
        issues.append(f"global_translation shape {fused.global_translation.shape} != (3,)")

    # Check confidences
    if not (0.0 <= fused.pose_confidence <= 1.0):
        issues.append(f"pose_confidence {fused.pose_confidence} not in [0, 1]")
    if not (0.0 <= fused.shape_confidence <= 1.0):
        issues.append(f"shape_confidence {fused.shape_confidence} not in [0, 1]")

    # Check mesh if present
    if fused.vertices is not None:
        if fused.vertices.shape[1] != 3:
            issues.append(f"vertices shape {fused.vertices.shape} invalid")
        if not np.all(np.isfinite(fused.vertices)):
            issues.append("vertices contain non-finite values")

    is_valid = len(issues) == 0
    message = "; ".join(issues) if issues else "Valid"

    return is_valid, message


# ============================================================================
# A-Pose Conversion Functions
# ============================================================================

def convert_to_apose(
    fused: FusedParameters,
    inplace: bool = False,
) -> FusedParameters:
    """
    Convert pose to A-pose (canonical resting pose) for standardized measurements.

    A-pose is the canonical rest pose where:
    - Arms are straight out to sides (T-pose variant)
    - Legs are straight down
    - Joints are in neutral rotation

    This is useful for consistent body measurement extraction across different
    dynamic poses.

    Args:
        fused: FusedParameters to convert
        inplace: If True, modify input; otherwise create copy

    Returns:
        FusedParameters with A-pose applied (with apose_vertices populated)

    Note:
        This requires SMPL-X mesh generation capability. For now, this is a
        placeholder that documents the interface.
    """
    if not inplace:
        fused = _copy_fused_parameters(fused)

    # A-pose theta: zero out most joints, keep some fixed angles
    apose_theta = np.zeros(72)

    # Root joint typically has some offset in SMPL-X
    # apose_theta[0:3] = root_axis_angle  # Keep root as-is or set canonical value

    # For other joints, zero rotation = A-pose-like position
    # This is simplified; actual A-pose requires specific angle offsets

    fused.pose_theta = apose_theta

    # Mark that A-pose conversion has been applied
    # Note: apose_vertices would be populated after SMPL-X mesh generation

    return fused


def create_apose_theta() -> np.ndarray:
    """
    Create canonical A-pose theta vector (72-dim axis-angle).

    The A-pose is the canonical rest position for SMPL-X where joints
    are in neutral rotation.

    Returns:
        72-dimensional axis-angle vector representing A-pose
    """
    # A-pose is all zeros in axis-angle representation (neutral rotation)
    return np.zeros(72)


# ============================================================================
# Coordinate System Conversion Functions
# ============================================================================

def transform_mesh_coordinates(
    vertices: np.ndarray,
    from_system: CoordinateSystem,
    to_system: CoordinateSystem,
    rotation: np.ndarray = None,
    translation: np.ndarray = None,
    scale: float = 1.0,
) -> np.ndarray:
    """
    Transform mesh vertices between coordinate systems.

    Handles conversion between SMPL-X canonical, camera, world, and
    body-centric coordinate frames.

    Args:
        vertices: Mesh vertices to transform, shape [N, 3]
        from_system: Source coordinate system
        to_system: Target coordinate system
        rotation: 3x3 rotation matrix (optional, identity if None)
        translation: 3D translation vector (optional, zeros if None)
        scale: Scale factor to apply (default 1.0)

    Returns:
        Transformed vertices with same shape as input

    Raises:
        ValueError: If coordinate systems or parameters are invalid
    """
    if vertices.shape[1] != 3:
        raise ValueError(f"vertices must have shape [N, 3], got {vertices.shape}")

    if rotation is None:
        rotation = np.eye(3)
    if translation is None:
        translation = np.zeros(3)

    if rotation.shape != (3, 3):
        raise ValueError(f"rotation must be [3, 3], got {rotation.shape}")
    if translation.shape != (3,):
        raise ValueError(f"translation must be [3], got {translation.shape}")

    # Copy vertices to avoid modifying original
    transformed = vertices.copy()

    # Apply scale
    if scale != 1.0:
        transformed *= scale

    # Apply rotation and translation
    # v' = R @ v + t
    transformed = (rotation @ transformed.T).T + translation

    return transformed


def get_coordinate_system_metadata(
    system: CoordinateSystem,
) -> Dict[str, Any]:
    """
    Get metadata about a coordinate system.

    Args:
        system: CoordinateSystem enum value

    Returns:
        Dictionary with coordinate system properties
    """
    metadata = {
        CoordinateSystem.SMPL_X: {
            "name": "SMPL-X Canonical",
            "origin": "Model center",
            "axes": "X-right, Y-up, Z-back",
            "scale": "Meters",
            "description": "Standard SMPL-X canonical coordinate frame",
        },
        CoordinateSystem.CAMERA: {
            "name": "Camera",
            "origin": "Camera center",
            "axes": "X-right, Y-down, Z-forward",
            "scale": "Pixels or meters",
            "description": "Camera image coordinate frame",
        },
        CoordinateSystem.WORLD: {
            "name": "World",
            "origin": "Ground plane center",
            "axes": "X-right, Y-up, Z-forward",
            "scale": "Meters",
            "description": "World coordinate frame with ground reference",
        },
        CoordinateSystem.CANONICAL: {
            "name": "Canonical/Body-centric",
            "origin": "Body center (pelvis)",
            "axes": "X-forward, Y-up, Z-right",
            "scale": "Meters",
            "description": "Body-relative canonical frame",
        },
    }

    return metadata.get(system, {"error": f"Unknown coordinate system: {system}"})


# ============================================================================
# SMPL-X Mesh Interface Functions
# ============================================================================

def apply_pose_to_mesh(
    vertices: np.ndarray,
    pose_theta: np.ndarray,
    inplace: bool = False,
) -> np.ndarray:
    """
    Apply pose parameters to mesh (forward kinematics simulation).

    This is a placeholder for actual SMPL-X forward kinematics.
    In practice, this requires the SMPL-X model with its weight matrices.

    Args:
        vertices: Mesh vertices in canonical pose, shape [10475, 3]
        pose_theta: Pose parameters, shape [72]
        inplace: If True, modify input; otherwise create copy

    Returns:
        Vertices with pose applied

    Raises:
        ValueError: If input shapes are invalid

    Note:
        Full implementation requires SMPL-X library (PyTorch/PyTensor tensors).
        This interface documents the expected behavior.
    """
    if vertices.shape != (SMPL_X_NUM_VERTICES, 3):
        raise ValueError(f"vertices shape {vertices.shape} != ({SMPL_X_NUM_VERTICES}, 3)")
    if pose_theta.shape != (72,):
        raise ValueError(f"pose_theta shape {pose_theta.shape} != (72,)")

    if not inplace:
        vertices = vertices.copy()

    # TODO: Implement forward kinematics with SMPL-X model
    # This would involve:
    # 1. Convert axis-angle to rotation matrices
    # 2. Apply joint transformations through kinematic chain
    # 3. Apply linear blend skinning (LBS) with weight matrices
    # 4. Update vertex positions

    return vertices


def extract_measurements_from_apose(
    apose_vertices: np.ndarray,
) -> Dict[str, float]:
    """
    Extract body measurements from A-pose mesh.

    Computes common anthropometric measurements from vertices in canonical pose.

    Args:
        apose_vertices: Mesh vertices in A-pose, shape [10475, 3]

    Returns:
        Dictionary of measurements in meters

    Raises:
        ValueError: If vertices array is invalid
    """
    if apose_vertices.shape != (SMPL_X_NUM_VERTICES, 3):
        raise ValueError(
            f"apose_vertices shape {apose_vertices.shape} != ({SMPL_X_NUM_VERTICES}, 3)"
        )

    # SMPL-X anatomical landmark indices
    # These are approximate and may need adjustment based on actual SMPL-X model
    CROWN_VERTEX = 152  # Top of head
    LEFT_HEEL = 7475
    RIGHT_HEEL = 10019
    LEFT_SHOULDER = 1588
    RIGHT_SHOULDER = 4714
    LEFT_ELBOW = 1610
    RIGHT_ELBOW = 4736
    LEFT_WRIST = 1644
    RIGHT_WRIST = 4770

    measurements = {}

    # Height: crown to heel
    crown_y = apose_vertices[CROWN_VERTEX, 1]
    heel_y = np.min(apose_vertices[:, 1])  # Lowest point
    measurements["height"] = float(crown_y - heel_y)

    # Shoulder width
    left_shoulder = apose_vertices[LEFT_SHOULDER]
    right_shoulder = apose_vertices[RIGHT_SHOULDER]
    measurements["shoulder_width"] = float(
        np.linalg.norm(right_shoulder - left_shoulder)
    )

    # Arm span (shoulder to shoulder through wrists)
    left_wrist = apose_vertices[LEFT_WRIST]
    right_wrist = apose_vertices[RIGHT_WRIST]
    measurements["arm_span"] = float(np.linalg.norm(right_wrist - left_wrist))

    # Torso length (shoulder to hip) - simplified
    measurements["torso_length"] = measurements["height"] * 0.45  # Approximate ratio

    return measurements


# ============================================================================
# Validation Helper Functions
# ============================================================================

def _validate_pose_parameters(pose: PoseParameters) -> None:
    """Validate pose parameters structure."""
    if pose.theta.shape != (72,):
        raise ValueError(f"pose.theta shape {pose.theta.shape} != (72,)")
    if not np.all(np.isfinite(pose.theta)):
        raise ValueError("pose.theta contains non-finite values")
    if not (0.0 <= pose.confidence <= 1.0):
        raise ValueError(f"pose.confidence {pose.confidence} not in [0, 1]")


def _validate_shape_parameters(shape: ShapeParameters) -> None:
    """Validate shape parameters structure."""
    if shape.beta.shape != (10,):
        raise ValueError(f"shape.beta shape {shape.beta.shape} != (10,)")
    if not np.all(np.isfinite(shape.beta)):
        raise ValueError("shape.beta contains non-finite values")
    if not (0.0 <= shape.confidence <= 1.0):
        raise ValueError(f"shape.confidence {shape.confidence} not in [0, 1]")


def _copy_fused_parameters(fused: FusedParameters) -> FusedParameters:
    """Create a deep copy of FusedParameters."""
    return FusedParameters(
        pose_theta=fused.pose_theta.copy(),
        shape_beta=fused.shape_beta.copy(),
        global_rotation=fused.global_rotation.copy(),
        global_translation=fused.global_translation.copy(),
        pose_confidence=fused.pose_confidence,
        shape_confidence=fused.shape_confidence,
        joint_confidences=fused.joint_confidences.copy(),
        vertices=fused.vertices.copy() if fused.vertices is not None else None,
        faces=fused.faces.copy() if fused.faces is not None else None,
        apose_vertices=fused.apose_vertices.copy() if fused.apose_vertices is not None else None,
        apose_mesh_height=fused.apose_mesh_height,
        coordinate_system=fused.coordinate_system,
        scale_factor=fused.scale_factor,
        frame_id=fused.frame_id,
        timestamp=fused.timestamp,
        pose_source=fused.pose_source,
        shape_source=fused.shape_source,
    )


# ============================================================================
# Convenience Functions for Testing/Mock
# ============================================================================

def create_mock_pose_parameters(
    frame_id: int = 0,
    confidence: float = 0.90,
) -> PoseParameters:
    """Create mock pose parameters for testing."""
    pose_theta = np.random.randn(72) * 0.1
    rotation_matrices = np.tile(np.eye(3), (24, 1, 1))  # Identity rotations
    joint_confidences = np.ones(24) * confidence

    pose = PoseParameters(
        theta=pose_theta,
        confidence=confidence,
        joint_confidences=joint_confidences,
        rotation_matrices=rotation_matrices,
    )
    # Note: frame_id is not a field in PoseParameters defined in this module
    return pose


def create_mock_shape_parameters(
    confidence: float = 0.90,
) -> ShapeParameters:
    """Create mock shape parameters for testing."""
    # Beta typically has small values (normalized)
    beta = np.random.randn(10) * 0.1

    return ShapeParameters(
        beta=beta,
        confidence=confidence,
    )


def create_mock_fused_parameters(
    frame_id: int = 0,
) -> FusedParameters:
    """Create mock fused parameters for testing."""
    pose = create_mock_pose_parameters(frame_id=frame_id)
    shape = create_mock_shape_parameters()
    return fuse_pose_and_shape(pose, shape, validate=False)
