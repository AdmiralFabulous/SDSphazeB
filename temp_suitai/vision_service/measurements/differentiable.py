"""
Differentiable Measurement Function for PyTorch

Enables gradient flow through body measurement computations using PyTorch tensors.
All operations are differentiable, supporting:
- Circumference approximation via sampled point paths
- Linear measurements (lengths, widths, distances)
- Batched input for multiple subjects
- Full gradient propagation for optimization and learning

The module integrates with the landmark and A-pose systems to extract
measurements that can be used in loss functions or adversarial training.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

from vision_service.measurements.landmarks import (
    LANDMARKS,
    CIRCUMFERENCE_PATHS,
    BodyRegion,
    get_circumference_paths_by_region,
    get_all_circumference_names,
)


@dataclass
class DifferentiableMeasurementConfig:
    """Configuration for differentiable measurement extraction.

    Attributes:
        num_circumference_samples: Number of points to sample per circumference path
        device: PyTorch device (cpu, cuda, etc.)
        dtype: PyTorch data type (torch.float32, torch.float64, etc.)
        normalize_circumferences: Normalize circumferences by body size
        compute_confidences: Compute per-measurement confidence scores
    """
    num_circumference_samples: int = 32
    device: str = "cpu"
    dtype: torch.dtype = torch.float32
    normalize_circumferences: bool = False
    compute_confidences: bool = True


@dataclass
class DifferentiableMeasurementResult:
    """Result of differentiable measurement extraction.

    Attributes:
        measurements: Dict mapping measurement names to tensors
        circumferences: Dict of circumference measurements
        linear_measurements: Dict of linear measurements (lengths, widths, distances)
        measurement_names: List of measurement names in results
        batch_size: Number of subjects in batch
        confidences: Optional confidence scores per measurement
    """
    measurements: Dict[str, torch.Tensor]
    circumferences: Dict[str, torch.Tensor]
    linear_measurements: Dict[str, torch.Tensor]
    measurement_names: List[str]
    batch_size: int
    confidences: Optional[Dict[str, torch.Tensor]] = None


class DifferentiableMeasurement(nn.Module):
    """PyTorch module for differentiable body measurement extraction.

    This module extracts body measurements from SMPL vertex positions using
    fully differentiable operations. It supports batched processing and
    gradient computation through all operations.

    The module uses:
    1. Circumference paths sampled at regular intervals
    2. Linear measurements between landmark pairs
    3. Anthropometric distances based on landmark definitions
    """

    def __init__(self, config: Optional[DifferentiableMeasurementConfig] = None):
        """Initialize the differentiable measurement module.

        Args:
            config: DifferentiableMeasurementConfig instance
        """
        super().__init__()
        self.config = config or DifferentiableMeasurementConfig()

        # Precompute vertex indices for all measurements
        self._setup_measurement_indices()

    def _setup_measurement_indices(self) -> None:
        """Set up and register measurement indices as buffers."""
        # Circumference paths: map from measurement name to vertex indices
        self.circumference_indices: Dict[str, torch.Tensor] = {}

        for circ_name, circ_path in CIRCUMFERENCE_PATHS.items():
            indices = torch.tensor(
                circ_path.vertex_indices,
                dtype=torch.long,
                device=self.config.device
            )
            self.register_buffer(f"circ_{circ_name}", indices)
            self.circumference_indices[circ_name] = indices

        # Create mapping of all landmark names to vertex indices
        self.landmark_vertices: Dict[str, int] = {}
        for lm_name, landmark in LANDMARKS.items():
            self.landmark_vertices[lm_name] = landmark.vertex_idx

    def forward(
        self,
        vertices: torch.Tensor,
        return_all_measurements: bool = True
    ) -> DifferentiableMeasurementResult:
        """Extract differentiable measurements from SMPL vertices.

        Args:
            vertices: Tensor of shape (batch_size, num_vertices, 3) or (num_vertices, 3)
                     containing 3D vertex positions
            return_all_measurements: If True, compute all available measurements.
                                   If False, compute only circumferences.

        Returns:
            DifferentiableMeasurementResult with extracted measurements

        Raises:
            ValueError: If vertices shape is invalid
        """
        # Handle single-subject input
        if vertices.dim() == 2:
            vertices = vertices.unsqueeze(0)

        if vertices.shape[1] != 6890 or vertices.shape[2] != 3:
            raise ValueError(
                f"Expected shape (batch_size, 6890, 3), got {vertices.shape}"
            )

        batch_size = vertices.shape[0]
        device = vertices.device
        dtype = vertices.dtype

        # Ensure vertices is on the correct device
        if device != torch.device(self.config.device):
            vertices = vertices.to(self.config.device)

        measurements = {}
        circumferences = {}
        linear_measurements = {}
        confidences = {}

        # Compute circumference measurements
        for circ_name in get_all_circumference_names():
            circ_tensor = self._compute_circumference(vertices, circ_name)
            circumferences[circ_name] = circ_tensor
            measurements[circ_name] = circ_tensor

            if self.config.compute_confidences:
                confidences[circ_name] = torch.ones(batch_size, device=device, dtype=dtype)

        # Compute linear measurements if requested
        if return_all_measurements:
            linear_results = self._compute_linear_measurements(vertices)
            linear_measurements.update(linear_results)
            measurements.update(linear_results)

            if self.config.compute_confidences:
                for measurement_name in linear_results:
                    confidences[measurement_name] = torch.ones(batch_size, device=device, dtype=dtype)

        measurement_names = sorted(measurements.keys())

        result = DifferentiableMeasurementResult(
            measurements=measurements,
            circumferences=circumferences,
            linear_measurements=linear_measurements,
            measurement_names=measurement_names,
            batch_size=batch_size,
            confidences=confidences if self.config.compute_confidences else None
        )

        return result

    def _compute_circumference(self, vertices: torch.Tensor, circ_name: str) -> torch.Tensor:
        """Compute a single circumference measurement via path sampling.

        Uses piecewise linear interpolation along the vertex path to approximate
        the true circumference through regular sampling.

        Args:
            vertices: Tensor of shape (batch_size, 6890, 3)
            circ_name: Name of circumference measurement

        Returns:
            Tensor of shape (batch_size,) with circumference values in millimeters
        """
        circ_path = CIRCUMFERENCE_PATHS[circ_name]
        vertex_indices = circ_path.vertex_indices
        batch_size = vertices.shape[0]
        device = vertices.device

        # Get vertices for this path
        path_vertices = vertices[:, vertex_indices, :]  # (batch_size, path_length, 3)
        path_length = path_vertices.shape[1]

        if path_length < 2:
            # Return zero for invalid paths
            return torch.zeros(batch_size, device=device, dtype=vertices.dtype)

        # Sample points along the path using piecewise linear interpolation
        num_samples = self.config.num_circumference_samples
        sample_indices = torch.linspace(0, path_length - 1, num_samples, device=device)

        # Interpolate vertices at sample points
        sampled_points = self._interpolate_path(path_vertices, sample_indices)

        # Compute piecewise distances between consecutive sampled points
        # Wrap around to close the loop
        diffs = sampled_points[:, 1:, :] - sampled_points[:, :-1, :]
        distances = torch.norm(diffs, dim=2)

        # Add distance from last point back to first point to close the loop
        wrap_diff = sampled_points[:, 0, :] - sampled_points[:, -1, :]
        wrap_distance = torch.norm(wrap_diff, dim=1, keepdim=True)

        # Sum distances
        total_distance = torch.sum(distances, dim=1) + wrap_distance.squeeze(1)

        # Convert meters to millimeters
        circumference = total_distance * 1000.0

        return circumference

    def _interpolate_path(
        self,
        path_vertices: torch.Tensor,
        sample_indices: torch.Tensor
    ) -> torch.Tensor:
        """Linearly interpolate points along a vertex path.

        Args:
            path_vertices: Tensor of shape (batch_size, path_length, 3)
            sample_indices: Tensor of shape (num_samples,) with indices to sample

        Returns:
            Tensor of shape (batch_size, num_samples, 3) with interpolated points
        """
        batch_size = path_vertices.shape[0]
        device = path_vertices.device

        # Clamp indices to valid range
        sample_indices_clamped = torch.clamp(
            sample_indices,
            0,
            path_vertices.shape[1] - 1.0
        )

        # Split into integer and fractional parts
        idx_floor = torch.floor(sample_indices_clamped).long()
        idx_ceil = torch.ceil(sample_indices_clamped).long()
        alpha = sample_indices_clamped - idx_floor.float()

        # Get vertices at floor and ceil indices
        v_floor = path_vertices[:, idx_floor, :]  # (batch_size, num_samples, 3)
        v_ceil = path_vertices[:, idx_ceil, :]    # (batch_size, num_samples, 3)

        # Linear interpolation
        alpha = alpha.view(1, -1, 1)  # (1, num_samples, 1)
        interpolated = v_floor * (1.0 - alpha) + v_ceil * alpha

        return interpolated

    def _compute_linear_measurements(self, vertices: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Compute linear measurements between landmark pairs.

        Args:
            vertices: Tensor of shape (batch_size, 6890, 3)

        Returns:
            Dict mapping measurement names to tensors of shape (batch_size,)
        """
        linear_measurements = {}
        batch_size = vertices.shape[0]
        device = vertices.device

        # Define common linear measurement pairs
        # Each measurement: (name, start_landmark, end_landmark)
        measurement_pairs = [
            # Head measurements
            ("head_height", "head_top", "chin"),
            ("head_width", "head_left", "head_right"),

            # Neck to shoulder
            ("neck_to_shoulder_left", "neck_back", "left_shoulder_top"),
            ("neck_to_shoulder_right", "neck_back", "right_shoulder_top"),
            ("shoulder_width", "left_shoulder_top", "right_shoulder_top"),

            # Arm lengths
            ("left_arm_length", "left_shoulder_top", "left_wrist"),
            ("right_arm_length", "right_shoulder_top", "right_wrist"),
            ("left_forearm_length", "left_elbow", "left_wrist"),
            ("right_forearm_length", "right_elbow", "right_wrist"),

            # Torso measurements
            ("torso_length", "neck_back", "hip_center_back"),
            ("chest_depth", "chest_center", "back_center"),

            # Leg measurements
            ("left_leg_length", "left_hip_joint", "left_ankle"),
            ("right_leg_length", "right_hip_joint", "right_ankle"),
            ("left_thigh_length", "left_hip_joint", "left_knee"),
            ("right_thigh_length", "right_hip_joint", "right_knee"),
            ("left_calf_length", "left_knee", "left_ankle"),
            ("right_calf_length", "right_knee", "right_ankle"),
        ]

        # Compute distances for each measurement pair
        for meas_name, start_lm, end_lm in measurement_pairs:
            start_idx = self.landmark_vertices.get(start_lm)
            end_idx = self.landmark_vertices.get(end_lm)

            if start_idx is None or end_idx is None:
                continue

            # Get landmark vertices
            start_verts = vertices[:, start_idx, :]  # (batch_size, 3)
            end_verts = vertices[:, end_idx, :]      # (batch_size, 3)

            # Compute distance
            diff = end_verts - start_verts
            distance = torch.norm(diff, dim=1)  # (batch_size,)

            # Convert to millimeters
            linear_measurements[meas_name] = distance * 1000.0

        return linear_measurements

    def get_measurement_names(self) -> List[str]:
        """Get all available measurement names.

        Returns:
            Sorted list of measurement names
        """
        names = list(get_all_circumference_names())
        names.extend([
            "head_height", "head_width",
            "neck_to_shoulder_left", "neck_to_shoulder_right", "shoulder_width",
            "left_arm_length", "right_arm_length",
            "left_forearm_length", "right_forearm_length",
            "torso_length", "chest_depth",
            "left_leg_length", "right_leg_length",
            "left_thigh_length", "right_thigh_length",
            "left_calf_length", "right_calf_length",
        ])
        return sorted(names)

    def to(self, device: str) -> "DifferentiableMeasurement":
        """Move module to device.

        Args:
            device: Device string ("cpu", "cuda", etc.)

        Returns:
            Self for method chaining
        """
        self.config.device = device
        return super().to(device)


def verify_gradients(
    vertices: torch.Tensor,
    measurement_module: DifferentiableMeasurement
) -> Dict[str, bool]:
    """Verify gradient flow through measurements.

    Tests that gradients properly flow through the measurement computation
    and can be backpropagated.

    Args:
        vertices: Tensor of shape (batch_size, 6890, 3) with requires_grad=True
        measurement_module: DifferentiableMeasurement instance

    Returns:
        Dict mapping measurement names to gradient flow status
    """
    results = {}

    # Ensure gradients are enabled
    vertices.requires_grad_(True)

    # Forward pass
    measurement_result = measurement_module(vertices)

    # Check gradient flow for each measurement
    for meas_name, meas_tensor in measurement_result.measurements.items():
        try:
            # Compute loss
            loss = meas_tensor.sum()

            # Backpropagation
            loss.backward(retain_graph=True)

            # Check if gradients exist and are non-zero
            has_grad = vertices.grad is not None and torch.any(vertices.grad != 0)
            results[meas_name] = has_grad

            # Clear gradients for next measurement
            if vertices.grad is not None:
                vertices.grad.zero_()
        except Exception as e:
            results[meas_name] = False

    return results


def compute_batch_measurements(
    vertices_batch: torch.Tensor,
    measurement_module: Optional[DifferentiableMeasurement] = None,
    config: Optional[DifferentiableMeasurementConfig] = None
) -> DifferentiableMeasurementResult:
    """Convenience function to compute measurements for a batch of subjects.

    Args:
        vertices_batch: Tensor of shape (batch_size, 6890, 3)
        measurement_module: Optional pre-initialized module (creates one if not provided)
        config: Optional configuration (uses default if not provided)

    Returns:
        DifferentiableMeasurementResult with all measurements
    """
    if measurement_module is None:
        measurement_module = DifferentiableMeasurement(config)

    return measurement_module(vertices_batch)


def extract_measurements_as_vector(
    result: DifferentiableMeasurementResult,
    measurement_order: Optional[List[str]] = None
) -> torch.Tensor:
    """Extract measurements as a single tensor vector.

    Useful for creating measurement vectors for loss functions.

    Args:
        result: DifferentiableMeasurementResult from measurement extraction
        measurement_order: Optional list specifying measurement order.
                          If None, uses alphabetical order.

    Returns:
        Tensor of shape (batch_size, num_measurements)
    """
    if measurement_order is None:
        measurement_order = sorted(result.measurements.keys())

    # Stack measurements in specified order
    measurement_list = [
        result.measurements[name].unsqueeze(1)
        for name in measurement_order
    ]

    measurements_vector = torch.cat(measurement_list, dim=1)
    return measurements_vector
