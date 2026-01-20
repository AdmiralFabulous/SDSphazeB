"""
Mesh height calculation module for SMPL-X models.

Measures the vertical distance from heel to crown in an SMPL-X mesh.
This provides a unitless height measurement used for scaling and calibration.
"""

from typing import Optional, Tuple
import numpy as np


# SMPL-X Vertex Indices
# These indices correspond to specific anatomical landmarks in the SMPL-X model
# Reference: SMPL-X model documentation and body part vertex indices

# Heel vertices (bottom of foot)
# SMPL-X feet vertices are in the range of [7000-8000] for additional joints
# Standard heel point indices for both feet
HEEL_VERTICES = {
    'left': 7475,   # Left foot heel
    'right': 10019, # Right foot heel
}

# Crown vertex (top of head)
# The head in SMPL-X is typically represented by vertices in the 300-600 range
# The crown (topmost point of head) is usually at:
CROWN_VERTEX = 152  # Top of head / crown


def calculate_mesh_height(
    vertices: np.ndarray,
    heel: str = 'right',
    use_extremes: bool = True
) -> float:
    """
    Calculate the height of a mesh from heel to crown.

    Args:
        vertices: numpy array of shape (N, 3) containing vertex positions
                 where N is the number of vertices and 3 represents (x, y, z)
        heel: which heel to use ('left' or 'right'). Default is 'right'.
        use_extremes: if True, uses the minimum y-value across all vertices
                     for more robust heel detection. Default is True.

    Returns:
        float: unitless height value (distance from heel to crown along y-axis)

    Raises:
        ValueError: if vertices array is invalid or has incorrect shape
        ValueError: if heel parameter is not 'left' or 'right'
        IndexError: if vertex indices are out of bounds
    """
    # Input validation
    if not isinstance(vertices, np.ndarray):
        raise ValueError("vertices must be a numpy array")

    if vertices.shape[1] != 3:
        raise ValueError(
            f"vertices must have shape (N, 3), got {vertices.shape}"
        )

    if len(vertices) == 0:
        raise ValueError("vertices array cannot be empty")

    if heel not in ['left', 'right']:
        raise ValueError(f"heel must be 'left' or 'right', got '{heel}'")

    # Get heel position
    heel_idx = HEEL_VERTICES[heel]

    if heel_idx >= len(vertices):
        raise IndexError(
            f"heel vertex index {heel_idx} out of bounds for "
            f"vertices array with {len(vertices)} vertices"
        )

    # Get crown position
    if CROWN_VERTEX >= len(vertices):
        raise IndexError(
            f"crown vertex index {CROWN_VERTEX} out of bounds for "
            f"vertices array with {len(vertices)} vertices"
        )

    # Extract y-coordinates (height axis)
    crown_y = vertices[CROWN_VERTEX, 1]

    if use_extremes:
        # Use minimum y-value as heel for robustness
        # This handles cases where the heel vertex might be slightly offset
        heel_y = np.min(vertices[:, 1])
    else:
        heel_y = vertices[heel_idx, 1]

    # Calculate height as vertical distance
    height = crown_y - heel_y

    return float(height)


def calculate_mesh_height_both_heels(
    vertices: np.ndarray,
    use_extremes: bool = True
) -> Tuple[float, float, float]:
    """
    Calculate mesh height using both heels and return average.

    Args:
        vertices: numpy array of shape (N, 3) containing vertex positions
        use_extremes: if True, uses the minimum y-value for heel detection

    Returns:
        Tuple of (left_height, right_height, average_height)
    """
    left_height = calculate_mesh_height(
        vertices, heel='left', use_extremes=use_extremes
    )
    right_height = calculate_mesh_height(
        vertices, heel='right', use_extremes=use_extremes
    )
    average_height = (left_height + right_height) / 2.0

    return (left_height, right_height, average_height)


def get_mesh_bounds(
    vertices: np.ndarray
) -> dict:
    """
    Get the bounding box information for a mesh.

    Useful for debugging and understanding mesh orientation.

    Args:
        vertices: numpy array of shape (N, 3)

    Returns:
        dict with keys: x_min, x_max, y_min, y_max, z_min, z_max,
                       x_range, y_range, z_range, height (y_range)
    """
    if not isinstance(vertices, np.ndarray):
        raise ValueError("vertices must be a numpy array")

    if vertices.shape[1] != 3:
        raise ValueError(f"vertices must have shape (N, 3), got {vertices.shape}")

    return {
        'x_min': float(np.min(vertices[:, 0])),
        'x_max': float(np.max(vertices[:, 0])),
        'y_min': float(np.min(vertices[:, 1])),
        'y_max': float(np.max(vertices[:, 1])),
        'z_min': float(np.min(vertices[:, 2])),
        'z_max': float(np.max(vertices[:, 2])),
        'x_range': float(np.max(vertices[:, 0]) - np.min(vertices[:, 0])),
        'y_range': float(np.max(vertices[:, 1]) - np.min(vertices[:, 1])),
        'z_range': float(np.max(vertices[:, 2]) - np.min(vertices[:, 2])),
        'height': float(np.max(vertices[:, 1]) - np.min(vertices[:, 1])),
    }


def validate_smpl_x_mesh(vertices: np.ndarray) -> bool:
    """
    Validate that the mesh appears to be a valid SMPL-X mesh.

    Args:
        vertices: numpy array of vertex positions

    Returns:
        bool: True if mesh appears valid, False otherwise
    """
    if not isinstance(vertices, np.ndarray):
        return False

    if vertices.ndim != 2 or vertices.shape[1] != 3:
        return False

    if len(vertices) < 10000:  # SMPL-X has ~10475 vertices
        return False

    if not np.all(np.isfinite(vertices)):
        return False

    return True
