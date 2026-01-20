"""
Measurements module for anthropometric body measurements.

This package provides tools for:
- Loading SMPL body landmarks with vertex indices
- Circumference measurements (girths)
- A-Pose normalization for consistent measurements
- Body dimension calculations
- Differentiable measurement extraction for PyTorch optimization
"""

from .landmarks import (
    Landmark,
    CircumferencePath,
    BodyRegion,
    MeasurementType,
    LANDMARKS,
    CIRCUMFERENCE_PATHS,
    get_landmark,
    get_landmark_vertex,
    get_landmarks_by_region,
    get_all_landmark_names,
    get_all_landmark_vertices,
    get_circumference_path,
    get_circumference_paths_by_region,
    get_all_circumference_names,
    get_landmarks_stats,
    validate_landmarks,
)

from .differentiable import (
    DifferentiableMeasurement,
    DifferentiableMeasurementConfig,
    DifferentiableMeasurementResult,
    verify_gradients,
    compute_batch_measurements,
    extract_measurements_as_vector,
)

__all__ = [
    # Landmarks
    "Landmark",
    "CircumferencePath",
    "BodyRegion",
    "MeasurementType",
    "LANDMARKS",
    "CIRCUMFERENCE_PATHS",
    "get_landmark",
    "get_landmark_vertex",
    "get_landmarks_by_region",
    "get_all_landmark_names",
    "get_all_landmark_vertices",
    "get_circumference_path",
    "get_circumference_paths_by_region",
    "get_all_circumference_names",
    "get_landmarks_stats",
    "validate_landmarks",
    # Differentiable measurements
    "DifferentiableMeasurement",
    "DifferentiableMeasurementConfig",
    "DifferentiableMeasurementResult",
    "verify_gradients",
    "compute_batch_measurements",
    "extract_measurements_as_vector",
]
