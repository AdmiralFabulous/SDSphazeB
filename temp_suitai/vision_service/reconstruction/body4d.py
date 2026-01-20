"""
SAM-Body4D: 4D Human Body Reconstruction with Temporal Consistency

This module implements 4D human body reconstruction by tracking and maintaining
temporal consistency across mesh sequences. It manages MHR (Mesh Height Reconstruction)
meshes in a temporal buffer and provides averaged shape parameters across frames.

Ready for integration with real SAM (Segment Anything Model) for body segmentation
and Body4D models for actual 4D reconstruction.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Tuple
from collections import deque
import numpy as np
from datetime import datetime


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class ShapeParameters:
    """
    Shape parameters extracted from a mesh.

    These represent the morphological characteristics of a human body mesh.
    Values are normalized and ready for temporal averaging.
    """

    # Body dimensions
    height: float  # Overall mesh height in meters
    shoulder_width: float  # Distance between shoulders in meters
    chest_depth: float  # Front-to-back chest measurement in meters

    # Body proportions (normalized ratios)
    torso_ratio: float  # Torso length / total height
    arm_span_ratio: float  # Arm span / total height
    leg_ratio: float  # Leg length / total height

    # Mesh quality metrics
    vertex_count: int  # Number of vertices in the mesh
    confidence: float  # Confidence score (0-1)

    # Metadata
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = "mhr"  # Data source identifier

    def to_dict(self) -> dict:
        """Convert shape parameters to dictionary."""
        return {
            "height": self.height,
            "shoulder_width": self.shoulder_width,
            "chest_depth": self.chest_depth,
            "torso_ratio": self.torso_ratio,
            "arm_span_ratio": self.arm_span_ratio,
            "leg_ratio": self.leg_ratio,
            "vertex_count": self.vertex_count,
            "confidence": self.confidence,
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
        }


@dataclass
class MHRMesh:
    """
    MHR (Mesh Height Reconstruction) mesh representation.

    Represents a single 3D human body mesh with associated metadata.
    """

    # Core mesh data
    vertices: np.ndarray  # Shape: [N, 3] - 3D vertex positions in meters
    faces: np.ndarray  # Shape: [M, 3] - Triangle face indices

    # Shape information
    shape_params: ShapeParameters

    # Pose and transformation
    position: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))  # [x, y, z]
    rotation: np.ndarray = field(default_factory=lambda: np.eye(3))  # 3x3 rotation matrix

    # Metadata
    frame_id: int = 0  # Frame number in sequence
    timestamp: datetime = field(default_factory=datetime.now)
    confidence: float = 1.0  # Mesh confidence (0-1)

    def to_dict(self) -> dict:
        """Convert mesh to dictionary (for serialization)."""
        return {
            "vertices": self.vertices.tolist(),
            "faces": self.faces.tolist(),
            "shape_params": self.shape_params.to_dict(),
            "position": self.position.tolist(),
            "rotation": self.rotation.tolist(),
            "frame_id": self.frame_id,
            "timestamp": self.timestamp.isoformat(),
            "confidence": self.confidence,
        }


@dataclass
class AveragedShapeParameters:
    """
    Averaged shape parameters across multiple frames.

    Provides temporal stability and noise reduction through averaging
    across a temporal buffer of meshes.
    """

    # Averaged parameters
    height_mean: float
    height_std: float
    shoulder_width_mean: float
    shoulder_width_std: float
    chest_depth_mean: float
    chest_depth_std: float

    # Proportion averages
    torso_ratio_mean: float
    arm_span_ratio_mean: float
    leg_ratio_mean: float

    # Metadata
    num_samples: int  # Number of frames used in averaging
    confidence_mean: float  # Average confidence across frames
    timestamp_start: datetime  # Start time of averaging window
    timestamp_end: datetime  # End time of averaging window

    def to_dict(self) -> dict:
        """Convert averaged parameters to dictionary."""
        return {
            "height_mean": self.height_mean,
            "height_std": self.height_std,
            "shoulder_width_mean": self.shoulder_width_mean,
            "shoulder_width_std": self.shoulder_width_std,
            "chest_depth_mean": self.chest_depth_mean,
            "chest_depth_std": self.chest_depth_std,
            "torso_ratio_mean": self.torso_ratio_mean,
            "arm_span_ratio_mean": self.arm_span_ratio_mean,
            "leg_ratio_mean": self.leg_ratio_mean,
            "num_samples": self.num_samples,
            "confidence_mean": self.confidence_mean,
            "timestamp_start": self.timestamp_start.isoformat(),
            "timestamp_end": self.timestamp_end.isoformat(),
        }


# ============================================================================
# SAM-Body4D Implementation
# ============================================================================

class Body4D:
    """
    4D Human Body Reconstruction with Temporal Consistency.

    Manages a temporal buffer of MHR meshes and provides:
    - Mesh sequence retrieval for 4D reconstruction
    - Temporal consistency analysis
    - Averaged shape parameters for stable body metric estimation

    This is a placeholder implementation ready for integration with real
    SAM (Segment Anything Model) and Body4D deep learning models.
    """

    def __init__(
        self,
        buffer_size: int = 30,
        confidence_threshold: float = 0.5,
    ):
        """
        Initialize Body4D reconstruction module.

        Args:
            buffer_size: Maximum number of frames to maintain in temporal buffer.
                        Default 30 frames (~1 second at 30fps).
            confidence_threshold: Minimum confidence score (0-1) for mesh inclusion.
        """
        self.buffer_size = buffer_size
        self.confidence_threshold = confidence_threshold

        # Temporal buffer (FIFO queue of MHRMesh objects)
        self.temporal_buffer: deque = deque(maxlen=buffer_size)

        # Statistics tracking
        self._frame_counter = 0
        self._last_averaged_params: Optional[AveragedShapeParameters] = None

    # ========================================================================
    # Core API: Mesh Management
    # ========================================================================

    def add_mesh(self, mesh: MHRMesh) -> bool:
        """
        Add a mesh to the temporal buffer.

        Args:
            mesh: MHRMesh object to add to the buffer.

        Returns:
            True if mesh was added, False if confidence was below threshold.

        Raises:
            ValueError: If mesh data is invalid or malformed.
        """
        if mesh.confidence < self.confidence_threshold:
            return False

        # Validate mesh structure
        self._validate_mesh(mesh)

        # Assign frame ID
        mesh.frame_id = self._frame_counter
        self._frame_counter += 1

        # Add to buffer (oldest frame removed if buffer full)
        self.temporal_buffer.append(mesh)

        return True

    def get_mesh_sequence(self, start_frame: int = 0, end_frame: Optional[int] = None) -> List[MHRMesh]:
        """
        Retrieve a sequence of meshes from the temporal buffer.

        Args:
            start_frame: Starting frame index (relative to buffer start).
            end_frame: Ending frame index (inclusive). If None, returns to end of buffer.

        Returns:
            List of MHRMesh objects in the requested range.
        """
        sequence = list(self.temporal_buffer)

        if not sequence:
            return []

        # Handle negative indices
        if end_frame is None:
            end_frame = len(sequence) - 1

        start_frame = max(0, start_frame)
        end_frame = min(len(sequence) - 1, end_frame)

        if start_frame > end_frame:
            return []

        return sequence[start_frame:end_frame + 1]

    def get_latest_mesh(self) -> Optional[MHRMesh]:
        """
        Get the most recently added mesh.

        Returns:
            Most recent MHRMesh, or None if buffer is empty.
        """
        if not self.temporal_buffer:
            return None
        return self.temporal_buffer[-1]

    def clear_buffer(self) -> int:
        """
        Clear all meshes from the temporal buffer.

        Returns:
            Number of meshes that were in the buffer.
        """
        count = len(self.temporal_buffer)
        self.temporal_buffer.clear()
        return count

    # ========================================================================
    # Temporal Analysis
    # ========================================================================

    def get_buffer_size(self) -> int:
        """Get current number of meshes in the temporal buffer."""
        return len(self.temporal_buffer)

    def is_buffer_full(self) -> bool:
        """Check if temporal buffer has reached capacity."""
        return len(self.temporal_buffer) == self.buffer_size

    def get_temporal_span(self) -> Tuple[datetime, datetime]:
        """
        Get the temporal span of buffered meshes.

        Returns:
            Tuple of (earliest_timestamp, latest_timestamp).
            Returns (None, None) if buffer is empty.
        """
        if not self.temporal_buffer:
            return (None, None)

        first_mesh = list(self.temporal_buffer)[0]
        last_mesh = list(self.temporal_buffer)[-1]

        return (first_mesh.timestamp, last_mesh.timestamp)

    def calculate_temporal_variance(self) -> Optional[float]:
        """
        Calculate shape parameter variance across temporal buffer.

        Measures the temporal stability of shape parameters.
        Lower values indicate more stable/consistent frames.

        Returns:
            Variance value, or None if buffer has fewer than 2 frames.
        """
        if len(self.temporal_buffer) < 2:
            return None

        heights = np.array([mesh.shape_params.height for mesh in self.temporal_buffer])
        variance = np.var(heights)

        return float(variance)

    # ========================================================================
    # Shape Parameters: Averaging and Analysis
    # ========================================================================

    def get_averaged_shape_parameters(self) -> Optional[AveragedShapeParameters]:
        """
        Calculate averaged shape parameters across the temporal buffer.

        Provides temporally stable shape measurements by averaging across all
        buffered frames. Results are cached and returned until buffer changes.

        Returns:
            AveragedShapeParameters object, or None if buffer is empty.
        """
        if not self.temporal_buffer:
            return None

        meshes = list(self.temporal_buffer)
        params = [mesh.shape_params for mesh in meshes]
        confidences = [mesh.confidence for mesh in meshes]

        # Calculate means and standard deviations
        heights = np.array([p.height for p in params])
        shoulders = np.array([p.shoulder_width for p in params])
        chest_depths = np.array([p.chest_depth for p in params])
        torso_ratios = np.array([p.torso_ratio for p in params])
        arm_ratios = np.array([p.arm_span_ratio for p in params])
        leg_ratios = np.array([p.leg_ratio for p in params])

        averaged = AveragedShapeParameters(
            height_mean=float(np.mean(heights)),
            height_std=float(np.std(heights)),
            shoulder_width_mean=float(np.mean(shoulders)),
            shoulder_width_std=float(np.std(shoulders)),
            chest_depth_mean=float(np.mean(chest_depths)),
            chest_depth_std=float(np.std(chest_depths)),
            torso_ratio_mean=float(np.mean(torso_ratios)),
            arm_span_ratio_mean=float(np.mean(arm_ratios)),
            leg_ratio_mean=float(np.mean(leg_ratios)),
            num_samples=len(meshes),
            confidence_mean=float(np.mean(confidences)),
            timestamp_start=meshes[0].timestamp,
            timestamp_end=meshes[-1].timestamp,
        )

        self._last_averaged_params = averaged
        return averaged

    def get_shape_trajectory(self, param_name: str) -> Optional[np.ndarray]:
        """
        Get the trajectory of a specific shape parameter over time.

        Args:
            param_name: Name of the shape parameter ('height', 'shoulder_width', etc.)

        Returns:
            1D numpy array of parameter values over time, or None if invalid.
        """
        if not self.temporal_buffer:
            return None

        valid_params = {
            "height", "shoulder_width", "chest_depth",
            "torso_ratio", "arm_span_ratio", "leg_ratio"
        }

        if param_name not in valid_params:
            return None

        meshes = list(self.temporal_buffer)
        values = np.array([
            getattr(mesh.shape_params, param_name)
            for mesh in meshes
        ])

        return values

    # ========================================================================
    # Validation and Utilities
    # ========================================================================

    def _validate_mesh(self, mesh: MHRMesh) -> None:
        """
        Validate mesh structure and data integrity.

        Args:
            mesh: MHRMesh to validate.

        Raises:
            ValueError: If mesh is invalid.
        """
        # Validate vertices
        if not isinstance(mesh.vertices, np.ndarray):
            raise ValueError("Vertices must be a numpy array")

        if mesh.vertices.ndim != 2 or mesh.vertices.shape[1] != 3:
            raise ValueError(f"Vertices must have shape [N, 3], got {mesh.vertices.shape}")

        if len(mesh.vertices) < 10:
            raise ValueError(f"Mesh must have at least 10 vertices, got {len(mesh.vertices)}")

        # Validate faces
        if not isinstance(mesh.faces, np.ndarray):
            raise ValueError("Faces must be a numpy array")

        if mesh.faces.ndim != 2 or mesh.faces.shape[1] != 3:
            raise ValueError(f"Faces must have shape [M, 3], got {mesh.faces.shape}")

        # Validate position and rotation
        if mesh.position.shape != (3,):
            raise ValueError(f"Position must have shape (3,), got {mesh.position.shape}")

        if mesh.rotation.shape != (3, 3):
            raise ValueError(f"Rotation must have shape (3, 3), got {mesh.rotation.shape}")

        # Validate shape parameters
        if not isinstance(mesh.shape_params, ShapeParameters):
            raise ValueError("shape_params must be a ShapeParameters instance")

        if mesh.confidence < 0.0 or mesh.confidence > 1.0:
            raise ValueError(f"Confidence must be in range [0, 1], got {mesh.confidence}")

    def get_statistics(self) -> dict:
        """
        Get statistics about the current buffer state.

        Returns:
            Dictionary containing buffer statistics.
        """
        if not self.temporal_buffer:
            return {
                "buffer_size": 0,
                "is_full": False,
                "temporal_span": None,
                "temporal_variance": None,
                "frames_processed": self._frame_counter,
            }

        return {
            "buffer_size": len(self.temporal_buffer),
            "buffer_capacity": self.buffer_size,
            "is_full": self.is_buffer_full(),
            "temporal_span": {
                "start": list(self.temporal_buffer)[0].timestamp.isoformat(),
                "end": list(self.temporal_buffer)[-1].timestamp.isoformat(),
            },
            "temporal_variance": self.calculate_temporal_variance(),
            "average_confidence": float(np.mean([m.confidence for m in self.temporal_buffer])),
            "frames_processed": self._frame_counter,
        }

    def to_dict(self) -> dict:
        """
        Serialize the entire Body4D state to dictionary.

        Returns:
            Dictionary representation of the Body4D module state.
        """
        # Compute averaged parameters if not already cached
        averaged_params = self._last_averaged_params or self.get_averaged_shape_parameters()

        return {
            "config": {
                "buffer_size": self.buffer_size,
                "confidence_threshold": self.confidence_threshold,
            },
            "statistics": self.get_statistics(),
            "mesh_sequence": [mesh.to_dict() for mesh in self.temporal_buffer],
            "averaged_shape_parameters": (
                averaged_params.to_dict() if averaged_params else None
            ),
        }


# ============================================================================
# Convenience Functions for Integration
# ============================================================================

def create_mock_shape_parameters(
    height: float = 1.70,
    confidence: float = 0.95,
) -> ShapeParameters:
    """
    Create mock shape parameters for testing and placeholder use.

    This is useful for development before real Body4D model integration.

    Args:
        height: Body height in meters.
        confidence: Confidence score (0-1).

    Returns:
        ShapeParameters with realistic placeholder values.
    """
    return ShapeParameters(
        height=height,
        shoulder_width=height * 0.38,
        chest_depth=height * 0.25,
        torso_ratio=0.52,
        arm_span_ratio=1.02,
        leg_ratio=0.48,
        vertex_count=10475,  # SMPL-X mesh size
        confidence=confidence,
    )


def create_mock_mhr_mesh(
    height: float = 1.70,
    frame_id: int = 0,
    confidence: float = 0.95,
) -> MHRMesh:
    """
    Create a mock MHR mesh for testing and placeholder use.

    Generates a simple mesh with random vertices and faces.

    Args:
        height: Body height in meters.
        frame_id: Frame number.
        confidence: Confidence score (0-1).

    Returns:
        MHRMesh with mock data.
    """
    num_vertices = 100  # Simplified for testing

    # Create simple vertices (vertical cylinder)
    np.random.seed(frame_id)
    vertices = np.random.randn(num_vertices, 3) * 0.2
    vertices[:, 2] = np.linspace(0, height, num_vertices)  # Height along Z

    # Create simple triangular faces
    num_faces = num_vertices - 2
    faces = np.array([[i, i + 1, i + 2] for i in range(num_faces)])
    faces = np.clip(faces, 0, num_vertices - 1)

    shape_params = create_mock_shape_parameters(height=height, confidence=confidence)

    return MHRMesh(
        vertices=vertices,
        faces=faces,
        shape_params=shape_params,
        position=np.array([0.0, 0.0, 0.0]),
        rotation=np.eye(3),
        frame_id=frame_id,
        confidence=confidence,
    )
