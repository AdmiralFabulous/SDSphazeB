"""
A-Pose Normalization Module

Converts dynamic body poses to neutral A-pose while preserving shape parameters.
A-pose is the canonical rest pose with:
- Arms extended at ~45 degrees (elbows slightly bent)
- Legs straight
- Head looking forward
- All joints at neutral rotation

This enables consistent body measurements and comparisons across different poses.
"""

from dataclasses import dataclass
from typing import Optional, Tuple
import numpy as np


@dataclass
class APoseResult:
    """Result of A-Pose normalization.

    Attributes:
        apose_theta: 72-dimensional axis-angle pose vector in A-pose
        beta: 10-dimensional shape parameters (preserved from input)
        joint_rotations: 24 joint rotations as axis-angle vectors [24, 3]
        joint_positions: 3D positions of joints in rest pose [24, 3]
        confidence: Overall confidence score (0-1)
        validation_warnings: List of validation warnings if any
    """
    apose_theta: np.ndarray
    beta: np.ndarray
    joint_rotations: np.ndarray
    joint_positions: np.ndarray
    confidence: float
    validation_warnings: list


# Canonical A-pose joint rotations (axis-angle format)
# SMPL-X has 24 joints: 1 global rotation + 23 local joint rotations
# A-pose uses near-zero rotations for most joints (neutral position)
APOSE_JOINT_ROTATIONS = {
    # Global rotation (root/pelvis) - no rotation
    0: np.array([0.0, 0.0, 0.0]),

    # Spine joints (1-3) - neutral
    1: np.array([0.0, 0.0, 0.0]),  # Spine0
    2: np.array([0.0, 0.0, 0.0]),  # Spine1
    3: np.array([0.0, 0.0, 0.0]),  # Spine2

    # Neck and head (4-6) - looking forward
    4: np.array([0.0, 0.0, 0.0]),  # Neck
    5: np.array([0.0, 0.0, 0.0]),  # Head
    6: np.array([0.0, 0.0, 0.0]),  # Head Top

    # Left arm (7-11) - raised at ~45 degrees
    7: np.array([0.0, 0.0, 0.785398]),   # Left Shoulder (45° abduction)
    8: np.array([-0.261799, 0.0, 0.0]),  # Left Elbow (-15° flexion)
    9: np.array([0.0, 0.0, 0.0]),        # Left Wrist
    10: np.array([0.0, 0.0, 0.0]),       # Left Hand
    11: np.array([0.0, 0.0, 0.0]),       # Left Thumb

    # Right arm (12-16) - raised at ~45 degrees (mirrored)
    12: np.array([0.0, 0.0, -0.785398]),  # Right Shoulder (-45° abduction)
    13: np.array([-0.261799, 0.0, 0.0]),  # Right Elbow (-15° flexion)
    14: np.array([0.0, 0.0, 0.0]),        # Right Wrist
    15: np.array([0.0, 0.0, 0.0]),        # Right Hand
    16: np.array([0.0, 0.0, 0.0]),        # Right Thumb

    # Left leg (17-19) - straight down
    17: np.array([0.0, 0.0, 0.0]),  # Left Hip
    18: np.array([0.0, 0.0, 0.0]),  # Left Knee
    19: np.array([0.0, 0.0, 0.0]),  # Left Ankle

    # Right leg (20-22) - straight down
    20: np.array([0.0, 0.0, 0.0]),  # Right Hip
    21: np.array([0.0, 0.0, 0.0]),  # Right Knee
    22: np.array([0.0, 0.0, 0.0]),  # Right Ankle

    # Jaw (23) - neutral
    23: np.array([0.0, 0.0, 0.0]),
}


# Expected approximate joint positions in A-pose (relative to pelvis)
# These are rough estimates for validation purposes [x, y, z] in meters
APOSE_JOINT_POSITIONS = {
    0: np.array([0.0, 0.0, 0.0]),           # Pelvis (root)
    1: np.array([0.0, 0.05, 0.0]),          # Spine0
    2: np.array([0.0, 0.15, 0.0]),          # Spine1
    3: np.array([0.0, 0.25, 0.0]),          # Spine2
    4: np.array([0.0, 0.33, 0.0]),          # Neck
    5: np.array([0.0, 0.37, 0.0]),          # Head
    6: np.array([0.0, 0.39, 0.0]),          # Head Top
    7: np.array([-0.15, 0.30, 0.0]),        # Left Shoulder
    8: np.array([-0.35, 0.25, 0.0]),        # Left Elbow (arm raised)
    9: np.array([-0.50, 0.15, 0.0]),        # Left Wrist
    10: np.array([-0.55, 0.10, 0.0]),       # Left Hand
    11: np.array([-0.58, 0.08, 0.0]),       # Left Thumb
    12: np.array([0.15, 0.30, 0.0]),        # Right Shoulder
    13: np.array([0.35, 0.25, 0.0]),        # Right Elbow (arm raised)
    14: np.array([0.50, 0.15, 0.0]),        # Right Wrist
    15: np.array([0.55, 0.10, 0.0]),        # Right Hand
    16: np.array([0.58, 0.08, 0.0]),        # Right Thumb
    17: np.array([-0.08, -0.05, 0.0]),      # Left Hip
    18: np.array([-0.08, -0.45, 0.0]),      # Left Knee
    19: np.array([-0.08, -0.95, 0.0]),      # Left Ankle
    20: np.array([0.08, -0.05, 0.0]),       # Right Hip
    21: np.array([0.08, -0.45, 0.0]),       # Right Knee
    22: np.array([0.08, -0.95, 0.0]),       # Right Ankle
    23: np.array([0.0, 0.35, 0.0]),         # Jaw
}


def create_apose_theta(beta: np.ndarray) -> APoseResult:
    """Create canonical A-pose from shape parameters.

    Generates a neutral A-pose while preserving the body shape (beta parameters).
    The A-pose has:
    - Global rotation: identity
    - Spine: neutral
    - Arms: raised at ~45 degrees for clear measurement
    - Legs: straight
    - Head: looking forward

    Args:
        beta: 10-dimensional shape parameters to preserve

    Returns:
        APoseResult with A-pose theta vector and metadata

    Raises:
        ValueError: If beta has incorrect shape or invalid values
    """
    warnings = []

    # Validate beta
    if not isinstance(beta, np.ndarray):
        raise ValueError(f"beta must be numpy array, got {type(beta)}")
    if beta.shape != (10,):
        raise ValueError(f"beta must have shape (10,), got {beta.shape}")
    if np.any(np.isnan(beta)):
        raise ValueError("beta contains NaN values")
    if np.any(np.isinf(beta)):
        raise ValueError("beta contains infinite values")

    # Beta values typically range from -3 to +3 standard deviations
    # Check for extreme values
    if np.any(np.abs(beta) > 5.0):
        warnings.append("Beta parameters outside typical range [-3, 3]. "
                       f"Max absolute value: {np.max(np.abs(beta)):.2f}")

    # Construct A-pose theta vector (72 dimensions: 24 joints × 3)
    apose_theta = np.zeros(72, dtype=np.float32)

    for joint_idx in range(24):
        rotation = APOSE_JOINT_ROTATIONS[joint_idx]
        apose_theta[joint_idx * 3:(joint_idx + 1) * 3] = rotation

    # Calculate confidence based on shape parameter validity
    confidence = 1.0

    # Get joint positions for reference
    joint_positions = np.array([
        APOSE_JOINT_POSITIONS[i] for i in range(24)
    ], dtype=np.float32)

    # Get joint rotations as array
    joint_rotations = np.array([
        APOSE_JOINT_ROTATIONS[i] for i in range(24)
    ], dtype=np.float32)

    return APoseResult(
        apose_theta=apose_theta,
        beta=beta.copy(),
        joint_rotations=joint_rotations,
        joint_positions=joint_positions,
        confidence=confidence,
        validation_warnings=warnings
    )


def normalize_to_apose(theta: np.ndarray, beta: np.ndarray) -> APoseResult:
    """Normalize a dynamic pose to canonical A-pose.

    Takes an arbitrary pose (theta) and normalizes it to A-pose while
    preserving the shape parameters (beta). This enables consistent
    body measurements regardless of the input pose.

    Args:
        theta: 72-dimensional pose vector (24 joints × 3 axis-angle)
        beta: 10-dimensional shape parameters

    Returns:
        APoseResult with A-pose pose and preserved shape

    Raises:
        ValueError: If theta or beta have incorrect shape or invalid values
    """
    warnings = []

    # Validate theta
    if not isinstance(theta, np.ndarray):
        raise ValueError(f"theta must be numpy array, got {type(theta)}")
    if theta.shape != (72,):
        raise ValueError(f"theta must have shape (72,), got {theta.shape}")
    if np.any(np.isnan(theta)):
        raise ValueError("theta contains NaN values")
    if np.any(np.isinf(theta)):
        raise ValueError("theta contains infinite values")

    # Validate beta
    if not isinstance(beta, np.ndarray):
        raise ValueError(f"beta must be numpy array, got {type(beta)}")
    if beta.shape != (10,):
        raise ValueError(f"beta must have shape (10,), got {beta.shape}")
    if np.any(np.isnan(beta)):
        raise ValueError("beta contains NaN values")
    if np.any(np.isinf(beta)):
        raise ValueError("beta contains infinite values")

    # Check for extreme rotations in input (more than 180 degrees)
    axis_angles = theta.reshape(24, 3)
    rotation_magnitudes = np.linalg.norm(axis_angles, axis=1)
    extreme_rotations = np.sum(rotation_magnitudes > np.pi)
    if extreme_rotations > 0:
        warnings.append(f"Input pose has {extreme_rotations} joints with "
                       f"rotation magnitude > 180°. Pose may be unusual.")

    # Check for extreme shape parameters
    if np.any(np.abs(beta) > 5.0):
        warnings.append("Beta parameters outside typical range [-3, 3]. "
                       f"Max absolute value: {np.max(np.abs(beta)):.2f}")

    # Create A-pose with the same shape parameters
    result = create_apose_theta(beta)

    # Add any warnings from input validation
    result.validation_warnings.extend(warnings)

    # Calculate confidence based on input validity
    confidence = 1.0 - (len(warnings) * 0.05)  # Reduce confidence for each warning
    result.confidence = max(0.0, min(1.0, confidence))

    return result


def get_joint_position(apose_result: APoseResult, joint_index: int) -> np.ndarray:
    """Get 3D position of a specific joint in A-pose.

    Args:
        apose_result: APoseResult from normalization
        joint_index: Joint index (0-23)

    Returns:
        3D position [x, y, z] in meters (relative to pelvis)

    Raises:
        IndexError: If joint_index is out of range
    """
    if not isinstance(joint_index, int) or joint_index < 0 or joint_index > 23:
        raise IndexError(f"joint_index must be 0-23, got {joint_index}")

    return apose_result.joint_positions[joint_index].copy()


def get_arm_angle(apose_result: APoseResult, side: str) -> float:
    """Get the arm abduction angle in A-pose.

    Returns the angle between arm and torso in the frontal plane.

    Args:
        apose_result: APoseResult from normalization
        side: "left" or "right"

    Returns:
        Angle in degrees (should be approximately 45°)

    Raises:
        ValueError: If side is not "left" or "right"
    """
    if side.lower() not in ("left", "right"):
        raise ValueError(f"side must be 'left' or 'right', got '{side}'")

    shoulder_idx = 7 if side.lower() == "left" else 12
    shoulder_rotation = apose_result.joint_rotations[shoulder_idx]

    # The abduction angle is in the z-component of the rotation
    abduction_angle_rad = shoulder_rotation[2]
    abduction_angle_deg = abs(np.degrees(abduction_angle_rad))

    return abduction_angle_deg


def validate_apose(apose_result: APoseResult) -> Tuple[bool, list]:
    """Validate A-pose normalization result.

    Checks that the A-pose has the expected properties:
    - Arms at ~45 degrees
    - Valid joint positions
    - Proper shape parameter preservation

    Args:
        apose_result: APoseResult to validate

    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    issues = []

    # Check theta shape and values
    if apose_result.apose_theta.shape != (72,):
        issues.append(f"apose_theta has shape {apose_result.apose_theta.shape}, "
                     f"expected (72,)")
    if np.any(np.isnan(apose_result.apose_theta)):
        issues.append("apose_theta contains NaN values")
    if np.any(np.isinf(apose_result.apose_theta)):
        issues.append("apose_theta contains infinite values")

    # Check beta shape and preservation
    if apose_result.beta.shape != (10,):
        issues.append(f"beta has shape {apose_result.beta.shape}, expected (10,)")
    if np.any(np.isnan(apose_result.beta)):
        issues.append("beta contains NaN values")

    # Check arm angles
    left_arm_angle = get_arm_angle(apose_result, "left")
    right_arm_angle = get_arm_angle(apose_result, "right")
    expected_angle = 45.0
    tolerance = 5.0  # degrees

    if abs(left_arm_angle - expected_angle) > tolerance:
        issues.append(f"Left arm angle {left_arm_angle:.1f}° is not ~45° "
                     f"(tolerance ±{tolerance}°)")
    if abs(right_arm_angle - expected_angle) > tolerance:
        issues.append(f"Right arm angle {right_arm_angle:.1f}° is not ~45° "
                     f"(tolerance ±{tolerance}°)")

    # Check joint positions are reasonable
    if apose_result.joint_positions.shape != (24, 3):
        issues.append(f"joint_positions has shape {apose_result.joint_positions.shape}, "
                     f"expected (24, 3)")
    if np.any(np.isnan(apose_result.joint_positions)):
        issues.append("joint_positions contains NaN values")

    # Check confidence
    if not (0.0 <= apose_result.confidence <= 1.0):
        issues.append(f"confidence {apose_result.confidence} is not in [0.0, 1.0]")

    is_valid = len(issues) == 0
    return is_valid, issues
