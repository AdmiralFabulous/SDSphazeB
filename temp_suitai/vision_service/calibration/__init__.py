"""Calibration module for vision service

Provides calibration, marker detection, scale factor derivation, and mesh height measurement.
"""

from .aruco_detect import ArUcoDetector
from .pnp_solver import PnPSolver
from .aruco_scale import ArUcoScaleCalculator, ScaleFactorResult
from .mesh_height import (
    calculate_mesh_height,
    calculate_mesh_height_both_heels,
    get_mesh_bounds,
    validate_smpl_x_mesh,
)

__all__ = [
    "ArUcoDetector",
    "PnPSolver",
    "ArUcoScaleCalculator",
    "ScaleFactorResult",
    "calculate_mesh_height",
    "calculate_mesh_height_both_heels",
    "get_mesh_bounds",
    "validate_smpl_x_mesh",
]
