"""
Vision Service Reconstruction Module

Provides human body pose and shape estimation, combining multiple sources
into unified 3D mesh representations.
"""

from .fuse_params import (
    PoseParameters,
    ShapeParameters,
    FusedParameters,
    PoseFormat,
    CoordinateSystem,
    fuse_pose_and_shape,
    validate_fused_parameters,
    convert_to_apose,
    create_apose_theta,
    transform_mesh_coordinates,
    get_coordinate_system_metadata,
    extract_measurements_from_apose,
    create_mock_pose_parameters,
    create_mock_shape_parameters,
    create_mock_fused_parameters,
)

from .shapy_shape import (
    ShapyShape,
    ShapyShapeResult,
    ShapyConfig,
    create_shapy_from_fused_params,
    validate_shapy_result,
)

__all__ = [
    "PoseParameters",
    "ShapeParameters",
    "FusedParameters",
    "PoseFormat",
    "CoordinateSystem",
    "fuse_pose_and_shape",
    "validate_fused_parameters",
    "convert_to_apose",
    "create_apose_theta",
    "transform_mesh_coordinates",
    "get_coordinate_system_metadata",
    "extract_measurements_from_apose",
    "create_mock_pose_parameters",
    "create_mock_shape_parameters",
    "create_mock_fused_parameters",
    "ShapyShape",
    "ShapyShapeResult",
    "ShapyConfig",
    "create_shapy_from_fused_params",
    "validate_shapy_result",
]
