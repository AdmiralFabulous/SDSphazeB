"""Apply scale transformation to mesh vertices and joint positions.

This module handles the conversion of mesh geometry from normalized/arbitrary units
to millimeters using a scale factor. It multiplies all vertices and joint positions
by the scale factor and tracks units for downstream processing.
"""

from dataclasses import dataclass, field
from typing import Dict, Optional, Tuple
from enum import Enum

import numpy as np


class Unit(Enum):
    """Unit enumeration for tracking measurement scale."""
    PIXEL = "pixel"
    METER = "meter"
    MILLIMETER = "millimeter"
    CENTIMETER = "centimeter"


@dataclass
class ScaleFactors:
    """Scale factors for per-axis transformation.

    Attributes:
        x_scale: Scale factor for X-axis (width/left-right)
        y_scale: Scale factor for Y-axis (height/up-down)
        z_scale: Scale factor for Z-axis (depth/front-back)
        confidence: Confidence score (0-1) of the scale measurement
        method: Calibration method used ("charuco", "card", "a4", "hybrid", "default")
        source_unit: Original unit of the scale factor
        target_unit: Target unit after scaling
    """
    x_scale: float
    y_scale: float
    z_scale: float
    confidence: float = 1.0
    method: str = "default"
    source_unit: Unit = Unit.PIXEL
    target_unit: Unit = Unit.MILLIMETER


@dataclass
class JointPosition:
    """Represents a joint or keypoint position in 3D space.

    Attributes:
        name: Name/identifier of the joint
        position: 3D position [x, y, z] coordinates
        confidence: Confidence score (0-1) for the detection
    """
    name: str
    position: np.ndarray
    confidence: float = 1.0


@dataclass
class ScaledMeshResult:
    """Result of applying scale transformation to mesh data.

    Attributes:
        vertices: Scaled vertex positions [N, 3]
        faces: Face indices [F, 3] (unchanged by scaling)
        joints: Dict of scaled joint positions
        scale_factors: Applied scale factors
        original_unit: Original unit before scaling
        final_unit: Final unit after scaling
        vertex_count: Number of vertices
        face_count: Number of faces
    """
    vertices: np.ndarray
    faces: Optional[np.ndarray] = None
    joints: Dict[str, np.ndarray] = field(default_factory=dict)
    scale_factors: Optional[ScaleFactors] = None
    original_unit: Unit = Unit.METER
    final_unit: Unit = Unit.MILLIMETER
    vertex_count: int = 0
    face_count: int = 0


class MeshScaler:
    """Apply scale transformations to 3D mesh data.

    This class handles scaling of mesh vertices and joint positions from one
    coordinate system to another, with tracking of units for downstream processing.
    """

    def __init__(self):
        """Initialize the mesh scaler."""
        pass

    def apply_scale_to_vertices(
        self,
        vertices: np.ndarray,
        scale_factors: ScaleFactors,
    ) -> np.ndarray:
        """Apply per-axis scale factors to mesh vertices.

        Multiplies each vertex coordinate by the corresponding scale factor:
        - X coordinates by x_scale
        - Y coordinates by y_scale
        - Z coordinates by z_scale

        Args:
            vertices: Input vertices array of shape [N, 3] where N is vertex count
                     Each row is [x, y, z] coordinate
            scale_factors: ScaleFactors dataclass with x_scale, y_scale, z_scale

        Returns:
            Scaled vertices array of shape [N, 3] in target units

        Raises:
            ValueError: If vertices shape is invalid or scale factors are invalid

        Example:
            >>> vertices = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
            >>> scales = ScaleFactors(x_scale=10, y_scale=10, z_scale=10)
            >>> scaler = MeshScaler()
            >>> scaled = scaler.apply_scale_to_vertices(vertices, scales)
            >>> scaled
            array([[10., 20., 30.],
                   [40., 50., 60.]])
        """
        if vertices.ndim != 2 or vertices.shape[1] != 3:
            raise ValueError(
                f"Vertices must have shape [N, 3], got {vertices.shape}"
            )

        if scale_factors.x_scale <= 0 or scale_factors.y_scale <= 0 or scale_factors.z_scale <= 0:
            raise ValueError(
                f"Scale factors must be positive, got x={scale_factors.x_scale}, "
                f"y={scale_factors.y_scale}, z={scale_factors.z_scale}"
            )

        # Create a copy to avoid modifying the original
        scaled_vertices = vertices.copy()

        # Apply per-axis scaling
        scaled_vertices[:, 0] *= scale_factors.x_scale
        scaled_vertices[:, 1] *= scale_factors.y_scale
        scaled_vertices[:, 2] *= scale_factors.z_scale

        return scaled_vertices

    def apply_scale_to_joints(
        self,
        joints: Dict[str, np.ndarray],
        scale_factors: ScaleFactors,
    ) -> Dict[str, np.ndarray]:
        """Apply per-axis scale factors to joint positions.

        Scales joint positions using the same per-axis scaling as vertices.
        Joint positions are typically sparse keypoints in the mesh.

        Args:
            joints: Dictionary mapping joint names to 3D positions [x, y, z]
            scale_factors: ScaleFactors dataclass with x_scale, y_scale, z_scale

        Returns:
            Dictionary of scaled joint positions with same keys as input

        Raises:
            ValueError: If joint position is not 3D or scale factors are invalid

        Example:
            >>> joints = {
            ...     "neck": np.array([0.1, 1.5, 0.0]),
            ...     "shoulder": np.array([0.3, 1.3, 0.0])
            ... }
            >>> scales = ScaleFactors(x_scale=1000, y_scale=1000, z_scale=1000)
            >>> scaler = MeshScaler()
            >>> scaled = scaler.apply_scale_to_joints(joints, scales)
            >>> scaled["neck"]
            array([100., 1500., 0.])
        """
        if scale_factors.x_scale <= 0 or scale_factors.y_scale <= 0 or scale_factors.z_scale <= 0:
            raise ValueError(
                f"Scale factors must be positive, got x={scale_factors.x_scale}, "
                f"y={scale_factors.y_scale}, z={scale_factors.z_scale}"
            )

        scaled_joints = {}

        for joint_name, position in joints.items():
            if not isinstance(position, np.ndarray) or position.ndim != 1 or len(position) != 3:
                raise ValueError(
                    f"Joint '{joint_name}' position must be 1D array of length 3, "
                    f"got shape {position.shape}"
                )

            # Scale each coordinate independently
            scaled_position = position.copy()
            scaled_position[0] *= scale_factors.x_scale
            scaled_position[1] *= scale_factors.y_scale
            scaled_position[2] *= scale_factors.z_scale

            scaled_joints[joint_name] = scaled_position

        return scaled_joints

    def scale_mesh(
        self,
        vertices: np.ndarray,
        scale_factors: ScaleFactors,
        faces: Optional[np.ndarray] = None,
        joints: Optional[Dict[str, np.ndarray]] = None,
        original_unit: Unit = Unit.METER,
        final_unit: Unit = Unit.MILLIMETER,
    ) -> ScaledMeshResult:
        """Apply complete mesh scaling transformation.

        This is a convenience method that scales vertices, joints, and returns
        a structured result with unit tracking.

        Args:
            vertices: Mesh vertices array [N, 3]
            scale_factors: ScaleFactors dataclass for transformation
            faces: Optional face indices array [F, 3] (not modified by scaling)
            joints: Optional dictionary of joint positions
            original_unit: Unit of input coordinates (default: meter)
            final_unit: Target unit after scaling (default: millimeter)

        Returns:
            ScaledMeshResult containing scaled vertices, faces, joints, and metadata

        Example:
            >>> vertices = np.array([[1.0, 1.0, 1.0]])
            >>> faces = np.array([[0, 1, 2]])
            >>> scales = ScaleFactors(x_scale=1000, y_scale=1000, z_scale=1000)
            >>> scaler = MeshScaler()
            >>> result = scaler.scale_mesh(vertices, scales, faces=faces)
            >>> result.vertices
            array([[1000., 1000., 1000.]])
            >>> result.final_unit
            <Unit.MILLIMETER: 'millimeter'>
        """
        # Scale vertices
        scaled_vertices = self.apply_scale_to_vertices(vertices, scale_factors)

        # Scale joints if provided
        scaled_joints = {}
        if joints:
            scaled_joints = self.apply_scale_to_joints(joints, scale_factors)

        # Create result with unit tracking
        result = ScaledMeshResult(
            vertices=scaled_vertices,
            faces=faces,
            joints=scaled_joints,
            scale_factors=scale_factors,
            original_unit=original_unit,
            final_unit=final_unit,
            vertex_count=len(scaled_vertices),
            face_count=len(faces) if faces is not None else 0,
        )

        return result

    def scale_mesh_uniform(
        self,
        vertices: np.ndarray,
        scale_factor: float,
        faces: Optional[np.ndarray] = None,
        joints: Optional[Dict[str, np.ndarray]] = None,
    ) -> ScaledMeshResult:
        """Apply uniform scaling across all axes.

        Convenience method for uniform scaling where all axes use the same scale factor.

        Args:
            vertices: Mesh vertices array [N, 3]
            scale_factor: Uniform scale factor applied to all axes
            faces: Optional face indices array [F, 3]
            joints: Optional dictionary of joint positions

        Returns:
            ScaledMeshResult with uniform scaling applied

        Example:
            >>> vertices = np.array([[1.0, 2.0, 3.0]])
            >>> scaler = MeshScaler()
            >>> result = scaler.scale_mesh_uniform(vertices, 10.0)
            >>> result.vertices
            array([[10., 20., 30.]])
        """
        uniform_scales = ScaleFactors(
            x_scale=scale_factor,
            y_scale=scale_factor,
            z_scale=scale_factor,
        )

        return self.scale_mesh(
            vertices=vertices,
            scale_factors=uniform_scales,
            faces=faces,
            joints=joints,
        )

    @staticmethod
    def create_scale_factors(
        x_scale: float,
        y_scale: float,
        z_scale: float,
        confidence: float = 1.0,
        method: str = "default",
        source_unit: Unit = Unit.PIXEL,
        target_unit: Unit = Unit.MILLIMETER,
    ) -> ScaleFactors:
        """Factory method to create scale factors.

        Args:
            x_scale: X-axis scale factor
            y_scale: Y-axis scale factor
            z_scale: Z-axis scale factor
            confidence: Confidence score (0-1)
            method: Calibration method name
            source_unit: Source unit of measurement
            target_unit: Target unit after scaling

        Returns:
            ScaleFactors dataclass instance
        """
        return ScaleFactors(
            x_scale=x_scale,
            y_scale=y_scale,
            z_scale=z_scale,
            confidence=confidence,
            method=method,
            source_unit=source_unit,
            target_unit=target_unit,
        )

    @staticmethod
    def create_uniform_scale_factors(
        scale_factor: float,
        confidence: float = 1.0,
        method: str = "default",
        source_unit: Unit = Unit.PIXEL,
        target_unit: Unit = Unit.MILLIMETER,
    ) -> ScaleFactors:
        """Factory method to create uniform scale factors.

        Args:
            scale_factor: Uniform scale applied to all axes
            confidence: Confidence score (0-1)
            method: Calibration method name
            source_unit: Source unit of measurement
            target_unit: Target unit after scaling

        Returns:
            ScaleFactors dataclass with uniform x, y, z scales
        """
        return ScaleFactors(
            x_scale=scale_factor,
            y_scale=scale_factor,
            z_scale=scale_factor,
            confidence=confidence,
            method=method,
            source_unit=source_unit,
            target_unit=target_unit,
        )
