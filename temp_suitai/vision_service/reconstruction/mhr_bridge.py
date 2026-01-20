"""
MHR-to-SMPL-X Bridge for converting MHR mesh output to SMPL-X parameters.

This module provides gradient descent optimization to convert a Multi-Human
Reconstruction (MHR) mesh to SMPL-X parametric model parameters, including
shape parameters and pose information.
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Tuple, Dict, Optional, Union
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class BridgeConfig:
    """Configuration for MHR-to-SMPL-X conversion."""

    # Optimization parameters
    learning_rate: float = 0.01
    num_iterations: int = 500
    batch_size: int = 1

    # Loss weights
    vertex_loss_weight: float = 1.0
    shape_regularization_weight: float = 0.001
    pose_regularization_weight: float = 0.0001

    # Shape regularization
    max_shape_params: int = 300  # SMPL-X shape parameters
    shape_std: float = 2.0  # Standard deviation for shape prior

    # Pose regularization
    pose_std: float = 0.2  # Standard deviation for pose prior

    # Convergence
    convergence_threshold: float = 1e-6
    patience: int = 50


@dataclass
class ConversionResult:
    """Result of MHR-to-SMPL-X conversion."""

    # SMPL-X parameters
    betas: torch.Tensor  # Shape parameters [1, 300]
    body_pose: torch.Tensor  # Body pose [1, 63]
    global_orient: torch.Tensor  # Global orientation [1, 3]

    # Conversion metrics
    reconstruction_loss: float  # Final vertex reconstruction loss
    shape_reg_loss: float  # Shape regularization loss
    pose_reg_loss: float  # Pose regularization loss
    total_loss: float  # Total optimization loss

    # Vertex mapping
    original_vertices: torch.Tensor  # Original MHR vertices [N, 3]
    reconstructed_vertices: torch.Tensor  # SMPL-X reconstructed vertices [M, 3]
    vertex_correspondence: Optional[np.ndarray] = None  # Mapping between meshes


class VertexMatcher(nn.Module):
    """Handles vertex correspondence between MHR and SMPL-X meshes."""

    def __init__(self, mhr_vertices: torch.Tensor, smplx_vertices: torch.Tensor):
        """
        Initialize vertex matcher.

        Args:
            mhr_vertices: MHR mesh vertices [N_mhr, 3]
            smplx_vertices: SMPL-X mesh vertices [N_smplx, 3]
        """
        super().__init__()
        self.register_buffer('mhr_vertices', mhr_vertices)
        self.register_buffer('smplx_vertices', smplx_vertices)
        self.n_mhr = mhr_vertices.shape[0]
        self.n_smplx = smplx_vertices.shape[0]

    def compute_correspondence(self) -> np.ndarray:
        """
        Compute vertex correspondence using nearest neighbor matching.

        Returns:
            Correspondence array where correspondence[i] = j means
            MHR vertex i corresponds to SMPL-X vertex j
        """
        # Use nearest neighbor matching
        # For each MHR vertex, find closest SMPL-X vertex
        mhr_expanded = self.mhr_vertices.unsqueeze(1)  # [N_mhr, 1, 3]
        smplx_expanded = self.smplx_vertices.unsqueeze(0)  # [1, N_smplx, 3]

        # Compute distances
        distances = torch.norm(mhr_expanded - smplx_expanded, dim=2)  # [N_mhr, N_smplx]

        # Find closest SMPL-X vertex for each MHR vertex
        correspondence = torch.argmin(distances, dim=1).cpu().numpy()

        return correspondence


class MHRBridge(nn.Module):
    """
    MHR-to-SMPL-X Bridge for gradient descent optimization.

    Converts MHR mesh output to SMPL-X parametric model parameters
    using gradient descent with regularization.
    """

    def __init__(
        self,
        smplx_model,
        config: Optional[BridgeConfig] = None,
        device: Union[str, torch.device] = 'cpu'
    ):
        """
        Initialize MHR bridge.

        Args:
            smplx_model: SMPL-X model instance (e.g., from smplx library)
            config: BridgeConfig for optimization parameters
            device: Device to run optimization on (cpu or cuda)
        """
        super().__init__()
        self.smplx_model = smplx_model
        self.config = config or BridgeConfig()
        self.device = torch.device(device)

        logger.info(f"Initialized MHR Bridge on device: {self.device}")

    def _create_learnable_parameters(
        self,
        batch_size: int = 1
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Create learnable SMPL-X parameters.

        Args:
            batch_size: Batch size for parameters

        Returns:
            Tuple of (betas, body_pose, global_orient)
        """
        betas = nn.Parameter(torch.zeros(batch_size, self.config.max_shape_params, device=self.device))
        body_pose = nn.Parameter(torch.zeros(batch_size, 63, device=self.device))
        global_orient = nn.Parameter(torch.zeros(batch_size, 3, device=self.device))

        return betas, body_pose, global_orient

    def _compute_shape_regularization(
        self,
        betas: torch.Tensor,
        shape_std: float
    ) -> torch.Tensor:
        """
        Compute shape regularization loss (L2 penalty on shape parameters).

        Encourages shape parameters to stay close to zero (mean body shape).

        Args:
            betas: Shape parameters [batch_size, num_shape_params]
            shape_std: Standard deviation for prior

        Returns:
            Regularization loss (scalar)
        """
        # L2 regularization on shape parameters
        shape_reg = torch.sum(betas ** 2) / (2 * shape_std ** 2)
        return shape_reg

    def _compute_pose_regularization(
        self,
        body_pose: torch.Tensor,
        global_orient: torch.Tensor,
        pose_std: float
    ) -> torch.Tensor:
        """
        Compute pose regularization loss.

        Encourages poses to stay close to T-pose (zero rotation).

        Args:
            body_pose: Body pose parameters [batch_size, 63]
            global_orient: Global orientation [batch_size, 3]
            pose_std: Standard deviation for prior

        Returns:
            Regularization loss (scalar)
        """
        # L2 regularization on pose parameters
        pose_reg = (torch.sum(body_pose ** 2) + torch.sum(global_orient ** 2)) / (2 * pose_std ** 2)
        return pose_reg

    def _compute_vertex_loss(
        self,
        predicted_vertices: torch.Tensor,
        target_vertices: torch.Tensor,
        correspondence: np.ndarray
    ) -> torch.Tensor:
        """
        Compute vertex reconstruction loss.

        Measures distance between predicted SMPL-X vertices and target
        MHR vertices based on correspondence.

        Args:
            predicted_vertices: SMPL-X vertices [1, N_smplx, 3]
            target_vertices: MHR vertices [N_mhr, 3]
            correspondence: Vertex correspondence mapping

        Returns:
            Vertex loss (scalar)
        """
        # Map MHR vertices to SMPL-X using correspondence
        device = predicted_vertices.device
        correspondence_tensor = torch.from_numpy(correspondence).to(device)

        # Get predicted vertices at corresponding indices
        # correspondence[i] = j means MHR vertex i should match SMPL-X vertex j
        predicted_selected = predicted_vertices[0, correspondence_tensor, :]  # [N_mhr, 3]
        target_selected = target_vertices.to(device)  # [N_mhr, 3]

        # Compute L2 distance
        vertex_loss = torch.mean(torch.norm(predicted_selected - target_selected, dim=1))

        return vertex_loss

    def convert(
        self,
        mhr_vertices: np.ndarray,
        mhr_faces: Optional[np.ndarray] = None,
        initial_betas: Optional[np.ndarray] = None,
        verbose: bool = False
    ) -> ConversionResult:
        """
        Convert MHR mesh to SMPL-X parameters using gradient descent.

        Args:
            mhr_vertices: MHR mesh vertices [N_mhr, 3] in numpy array
            mhr_faces: MHR mesh faces (optional, for reference)
            initial_betas: Initial shape parameters (optional)
            verbose: Print optimization progress

        Returns:
            ConversionResult containing optimized SMPL-X parameters

        Raises:
            RuntimeError: If SMPL-X model forward pass fails
        """
        # Convert to tensors
        mhr_vertices_tensor = torch.from_numpy(mhr_vertices).float().to(self.device)

        logger.info(f"Starting MHR-to-SMPL-X conversion with {mhr_vertices.shape[0]} vertices")

        # Get initial SMPL-X vertices for correspondence
        with torch.no_grad():
            try:
                smplx_output = self.smplx_model(
                    betas=torch.zeros(1, self.config.max_shape_params, device=self.device),
                    body_pose=torch.zeros(1, 63, device=self.device),
                    global_orient=torch.zeros(1, 3, device=self.device)
                )
                initial_smplx_vertices = smplx_output.vertices
            except Exception as e:
                raise RuntimeError(f"Failed to get initial SMPL-X vertices: {e}")

        # Compute vertex correspondence
        vertex_matcher = VertexMatcher(mhr_vertices_tensor, initial_smplx_vertices[0])
        correspondence = vertex_matcher.compute_correspondence()

        logger.info(f"SMPL-X model has {initial_smplx_vertices.shape[1]} vertices")
        logger.info(f"Computed vertex correspondence between meshes")

        # Create learnable parameters
        betas, body_pose, global_orient = self._create_learnable_parameters()

        # Initialize with provided betas if available
        if initial_betas is not None:
            with torch.no_grad():
                initial_betas_tensor = torch.from_numpy(initial_betas).float().to(self.device)
                n_init = min(initial_betas_tensor.shape[0], betas.shape[1])
                betas[:, :n_init] = initial_betas_tensor[:n_init]

        # Create optimizer
        optimizer = optim.Adam(
            [betas, body_pose, global_orient],
            lr=self.config.learning_rate
        )

        # Optimization loop
        best_loss = float('inf')
        patience_counter = 0
        losses = []

        for iteration in range(self.config.num_iterations):
            optimizer.zero_grad()

            try:
                # Forward pass through SMPL-X
                smplx_output = self.smplx_model(
                    betas=betas,
                    body_pose=body_pose,
                    global_orient=global_orient
                )
                predicted_vertices = smplx_output.vertices
            except Exception as e:
                logger.error(f"SMPL-X forward pass failed at iteration {iteration}: {e}")
                raise RuntimeError(f"SMPL-X model forward pass failed: {e}")

            # Compute losses
            vertex_loss = self._compute_vertex_loss(
                predicted_vertices,
                mhr_vertices_tensor,
                correspondence
            )

            shape_reg = self._compute_shape_regularization(
                betas,
                self.config.shape_std
            )

            pose_reg = self._compute_pose_regularization(
                body_pose,
                global_orient,
                self.config.pose_std
            )

            # Total loss with weights
            total_loss = (
                self.config.vertex_loss_weight * vertex_loss +
                self.config.shape_regularization_weight * shape_reg +
                self.config.pose_regularization_weight * pose_reg
            )

            # Backward pass
            total_loss.backward()
            optimizer.step()

            # Track loss
            current_loss = total_loss.item()
            losses.append(current_loss)

            # Check for convergence
            if current_loss < best_loss - self.config.convergence_threshold:
                best_loss = current_loss
                patience_counter = 0
            else:
                patience_counter += 1

            # Early stopping
            if patience_counter >= self.config.patience:
                logger.info(f"Early stopping at iteration {iteration}")
                break

            if verbose and (iteration + 1) % 50 == 0:
                logger.info(
                    f"Iteration {iteration + 1}: "
                    f"Total Loss={current_loss:.6f}, "
                    f"Vertex Loss={vertex_loss.item():.6f}, "
                    f"Shape Reg={shape_reg.item():.6f}, "
                    f"Pose Reg={pose_reg.item():.6f}"
                )

        # Final forward pass with optimized parameters
        with torch.no_grad():
            final_output = self.smplx_model(
                betas=betas,
                body_pose=body_pose,
                global_orient=global_orient
            )
            reconstructed_vertices = final_output.vertices[0]

        logger.info(f"Optimization complete. Final loss: {best_loss:.6f}")

        # Prepare result
        result = ConversionResult(
            betas=betas.detach(),
            body_pose=body_pose.detach(),
            global_orient=global_orient.detach(),
            reconstruction_loss=float(vertex_loss.item()),
            shape_reg_loss=float(shape_reg.item()),
            pose_reg_loss=float(pose_reg.item()),
            total_loss=float(best_loss),
            original_vertices=mhr_vertices_tensor,
            reconstructed_vertices=reconstructed_vertices,
            vertex_correspondence=correspondence
        )

        return result

    def save_result(self, result: ConversionResult, path: str) -> None:
        """
        Save conversion result to file.

        Args:
            result: ConversionResult to save
            path: Output file path (supports .pt, .npz, .json)
        """
        if path.endswith('.pt'):
            torch.save({
                'betas': result.betas.cpu(),
                'body_pose': result.body_pose.cpu(),
                'global_orient': result.global_orient.cpu(),
                'metrics': {
                    'reconstruction_loss': result.reconstruction_loss,
                    'shape_reg_loss': result.shape_reg_loss,
                    'pose_reg_loss': result.pose_reg_loss,
                    'total_loss': result.total_loss,
                }
            }, path)
            logger.info(f"Saved result to {path}")

        elif path.endswith('.npz'):
            np.savez(
                path,
                betas=result.betas.cpu().numpy(),
                body_pose=result.body_pose.cpu().numpy(),
                global_orient=result.global_orient.cpu().numpy(),
                original_vertices=result.original_vertices.cpu().numpy(),
                reconstructed_vertices=result.reconstructed_vertices.cpu().numpy(),
                correspondence=result.vertex_correspondence
            )
            logger.info(f"Saved result to {path}")

        else:
            raise ValueError(f"Unsupported file format: {path}")

    def load_result(self, path: str) -> ConversionResult:
        """
        Load conversion result from file.

        Args:
            path: Input file path

        Returns:
            ConversionResult loaded from file
        """
        if path.endswith('.pt'):
            data = torch.load(path, map_location=self.device)
            return ConversionResult(
                betas=data['betas'].to(self.device),
                body_pose=data['body_pose'].to(self.device),
                global_orient=data['global_orient'].to(self.device),
                reconstruction_loss=data['metrics']['reconstruction_loss'],
                shape_reg_loss=data['metrics']['shape_reg_loss'],
                pose_reg_loss=data['metrics']['pose_reg_loss'],
                total_loss=data['metrics']['total_loss'],
                original_vertices=torch.zeros(1, 3),  # Placeholder
                reconstructed_vertices=torch.zeros(1, 3),  # Placeholder
            )

        elif path.endswith('.npz'):
            data = np.load(path)
            return ConversionResult(
                betas=torch.from_numpy(data['betas']).to(self.device),
                body_pose=torch.from_numpy(data['body_pose']).to(self.device),
                global_orient=torch.from_numpy(data['global_orient']).to(self.device),
                reconstruction_loss=float(data.get('reconstruction_loss', 0.0)),
                shape_reg_loss=float(data.get('shape_reg_loss', 0.0)),
                pose_reg_loss=float(data.get('pose_reg_loss', 0.0)),
                total_loss=float(data.get('total_loss', 0.0)),
                original_vertices=torch.from_numpy(data['original_vertices']).to(self.device),
                reconstructed_vertices=torch.from_numpy(data['reconstructed_vertices']).to(self.device),
                vertex_correspondence=data.get('correspondence')
            )

        else:
            raise ValueError(f"Unsupported file format: {path}")
