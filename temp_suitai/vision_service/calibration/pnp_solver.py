"""
PnP (Perspective-n-Point) solver for marker depth estimation.
=======
"""PnP (Perspective-n-Point) solver for marker depth estimation.
>>>>>>> vk/bd3c-vis-e01-s02-t01

Uses cv2.solvePnP with IPPE_SQUARE method to estimate marker pose and depth
from detected ArUco marker corners.
"""

import numpy as np
import cv2
from typing import Tuple, Optional, Dict


# Default camera matrix for uncalibrated cameras
# Assumes standard pinhole camera model with focal length = image width
# and principal point at image center
DEFAULT_CAMERA_MATRIX = np.array(
    [
        [800.0, 0.0, 320.0],
        [0.0, 800.0, 240.0],
        [0.0, 0.0, 1.0],
    ],
    dtype=np.float32,
)

# Default distortion coefficients (no distortion assumed)
DEFAULT_DISTORTION_COEFFS = np.zeros(5, dtype=np.float32)

# 3D world coordinates of marker corners
# ArUco markers are square with size normalized to 1.0 unit
# Corners ordered: top-left, top-right, bottom-right, bottom-left (CCW from top-left)
MARKER_3D_CORNERS = np.array(
    [
        [-0.5, -0.5, 0.0],
        [0.5, -0.5, 0.0],
        [0.5, 0.5, 0.0],
        [-0.5, 0.5, 0.0],
    ],
    dtype=np.float32,
)


class PnPSolver:
    """Solves PnP problem for ArUco markers to estimate depth."""

    def __init__(
        self,
        camera_matrix: Optional[np.ndarray] = None,
        distortion_coeffs: Optional[np.ndarray] = None,
        marker_size_mm: float = 100.0,
    ):
        """Initialize PnP solver.

        Args:
            camera_matrix: Camera intrinsic matrix (3x3). Uses default if None.
            distortion_coeffs: Distortion coefficients (5,). Uses default if None.
            marker_size_mm: Physical size of marker in millimeters.
                           Defaults to 100mm for normalized marker coordinates.
        """
        self.camera_matrix = (
            camera_matrix if camera_matrix is not None else DEFAULT_CAMERA_MATRIX
        )
        self.distortion_coeffs = (
            distortion_coeffs
            if distortion_coeffs is not None
            else DEFAULT_DISTORTION_COEFFS
        )
        self.marker_size_mm = marker_size_mm

    def solve_marker_pose(
        self,
        image_points: np.ndarray,
        use_extrinsic_guess: bool = False,
        rvec_guess: Optional[np.ndarray] = None,
        tvec_guess: Optional[np.ndarray] = None,
    ) -> Tuple[bool, Optional[np.ndarray], Optional[np.ndarray]]:
        """Solve PnP problem for marker pose estimation using IPPE_SQUARE.

        Args:
            image_points: 2D image coordinates of marker corners (4x2 or 4x1x2).
                         Must be in order: top-left, top-right, bottom-right, bottom-left.
            use_extrinsic_guess: Whether to use provided initial guess for rotation/translation.
            rvec_guess: Initial guess for rotation vector (3,).
            tvec_guess: Initial guess for translation vector (3,).

        Returns:
            Tuple of (success, rvec, tvec):
            - success: Boolean indicating if PnP solve succeeded
            - rvec: Rotation vector (3,) in Rodrigues format, or None if failed
            - tvec: Translation vector (3,) with Z-depth in mm, or None if failed
        """
        try:
            # Validate and reshape image points
            image_pts = np.asarray(image_points, dtype=np.float32)
            if image_pts.shape == (4, 1, 2):
                image_pts = image_pts.reshape(4, 2)
            elif image_pts.shape != (4, 2):
                raise ValueError(
                    f"Image points must be shape (4, 2) or (4, 1, 2), got {image_pts.shape}"
                )

            # Scale marker corners by marker size
            marker_3d_points = MARKER_3D_CORNERS * (self.marker_size_mm / 2.0)

            # Prepare initial guesses if provided
            use_guess = use_extrinsic_guess and rvec_guess is not None and tvec_guess is not None

            if use_guess:
                rvec = np.asarray(rvec_guess, dtype=np.float32)
                tvec = np.asarray(tvec_guess, dtype=np.float32)
            else:
                rvec = np.zeros(3, dtype=np.float32)
                tvec = np.zeros(3, dtype=np.float32)

            # Solve PnP using IPPE_SQUARE for planar markers
            # IPPE_SQUARE is optimized for square planar markers
            # If IPPE_SQUARE is not available, fall back to EPNP
            pnp_method = getattr(cv2, 'SOLVEPNP_IPPE_SQUARE', cv2.SOLVEPNP_EPNP)
            success, rvec, tvec = cv2.solvePnP(
                objectPoints=marker_3d_points,
                imagePoints=image_pts,
                cameraMatrix=self.camera_matrix,
                distCoeffs=self.distortion_coeffs,
                rvec=rvec,
                tvec=tvec,
                useExtrinsicGuess=use_guess,
                flags=pnp_method,
            )

            if not success:
                return False, None, None

            # Ensure tvec is in mm (Z-depth)
            tvec = tvec.astype(np.float32)

            return True, rvec, tvec

        except Exception as e:
            print(f"Error in solve_marker_pose: {e}")
            return False, None, None

    def get_marker_depth(
        self, image_points: np.ndarray
    ) -> Tuple[bool, Optional[float]]:
        """Get Z-depth (distance from camera) for a marker.

        Args:
            image_points: 2D image coordinates of marker corners (4x2 or 4x1x2).

        Returns:
            Tuple of (success, depth_mm):
            - success: Boolean indicating if depth calculation succeeded
            - depth_mm: Marker Z-depth in millimeters, or None if failed
        """
        success, rvec, tvec = self.solve_marker_pose(image_points)

        if not success or tvec is None:
            return False, None

        # Extract Z-depth (third component of translation vector)
        z_depth_mm = float(tvec[2])

        # Validate depth is positive (marker in front of camera)
        if z_depth_mm <= 0:
            return False, None

        return True, z_depth_mm

    def get_marker_info(
        self, image_points: np.ndarray, marker_id: Optional[int] = None
    ) -> Dict[str, any]:
        """Get complete pose and depth information for a marker.

        Args:
            image_points: 2D image coordinates of marker corners (4x2 or 4x1x2).
            marker_id: Optional marker ID for reference.

        Returns:
            Dictionary containing:
            - 'success': Boolean indicating if calculation succeeded
            - 'marker_id': Marker ID (if provided)
            - 'depth_mm': Z-depth in mm
            - 'rvec': Rotation vector (3,)
            - 'tvec': Translation vector (3,)
            - 'rotation_matrix': 3x3 rotation matrix (computed from rvec)
        """
        success, rvec, tvec = self.solve_marker_pose(image_points)

        result = {
            "success": success,
            "marker_id": marker_id,
            "depth_mm": None,
            "rvec": None,
            "tvec": None,
            "rotation_matrix": None,
        }

        if success and rvec is not None and tvec is not None:
            result["depth_mm"] = float(tvec[2])
            result["rvec"] = rvec
            result["tvec"] = tvec
            result["rotation_matrix"], _ = cv2.Rodrigues(rvec)

        return result
