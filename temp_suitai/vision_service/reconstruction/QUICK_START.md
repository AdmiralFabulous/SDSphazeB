# MHR-to-SMPL-X Bridge - Quick Start Guide

## Installation

```bash
# Install dependencies
pip install torch numpy
pip install smplx  # SMPL-X model
```

## 5-Minute Tutorial

### Step 1: Import and Setup
```python
from vision_service.reconstruction import MHRBridge, BridgeConfig
from smplx import SMPLX
import numpy as np

# Load SMPL-X model
smplx_model = SMPLX(
    model_path='path/to/smplx/models',
    batch_size=1
)

# Create configuration
config = BridgeConfig()  # Uses defaults

# Create bridge
bridge = MHRBridge(smplx_model, config, device='cuda')
```

### Step 2: Prepare Your Mesh
```python
# Load MHR mesh vertices (N x 3 array)
mhr_vertices = np.load('your_scan.npy')
print(f"Input shape: {mhr_vertices.shape}")  # e.g., (5000, 3)
```

### Step 3: Convert to SMPL-X
```python
result = bridge.convert(mhr_vertices, verbose=True)
```

### Step 4: Access Results
```python
# SMPL-X parameters
shape_params = result.betas                    # Shape [1, 300]
pose_params = result.body_pose                 # Shape [1, 63]
global_rot = result.global_orient              # Shape [1, 3]

# Metrics
print(f"Reconstruction loss: {result.reconstruction_loss:.6f}")
print(f"Total loss: {result.total_loss:.6f}")

# Reconstructed mesh
smplx_vertices = result.reconstructed_vertices # Shape [10475, 3]
```

## Common Tasks

### Task 1: Convert Multiple Scans
```python
import os
from pathlib import Path

scan_dir = 'path/to/scans'
output_dir = 'path/to/results'

for scan_file in Path(scan_dir).glob('*.npy'):
    vertices = np.load(scan_file)
    result = bridge.convert(vertices)

    output_path = Path(output_dir) / f'{scan_file.stem}_result.pt'
    bridge.save_result(result, str(output_path))

    print(f"Processed {scan_file.name}")
```

### Task 2: Tune for Better Results
```python
# If shapes look too extreme, increase shape regularization
config = BridgeConfig(
    shape_regularization_weight=0.01  # Increased from 0.001
)
bridge = MHRBridge(smplx_model, config, device='cuda')
result = bridge.convert(mhr_vertices, verbose=True)

# If optimization is too slow, increase learning rate
config = BridgeConfig(
    learning_rate=0.05  # Increased from 0.01
)
```

### Task 3: Save and Load Results
```python
# Save as PyTorch format
bridge.save_result(result, 'result.pt')

# Load later
loaded_result = bridge.load_result('result.pt')
print(loaded_result.betas.shape)  # [1, 300]
```

### Task 4: Use Optimization Results with SMPL-X
```python
# After conversion, you can regenerate the mesh anytime
output = smplx_model(
    betas=result.betas,
    body_pose=result.body_pose,
    global_orient=result.global_orient
)
vertices = output.vertices  # [1, 10475, 3]
```

## Configuration Presets

### Preset 1: Fast (Default)
```python
config = BridgeConfig()
# - Quick convergence
# - Good for most cases
```

### Preset 2: High Quality
```python
config = BridgeConfig(
    learning_rate=0.005,
    num_iterations=1000,
    shape_regularization_weight=0.001,
    patience=100
)
# - Slower but more accurate
# - Better shape fidelity
```

### Preset 3: Conservative (Realistic Shapes)
```python
config = BridgeConfig(
    shape_regularization_weight=0.01,
    pose_regularization_weight=0.001,
    learning_rate=0.01,
    num_iterations=300
)
# - Strong regularization
# - Very realistic body shapes
# - May sacrifice some vertex matching
```

### Preset 4: Aggressive (Vertex Matching)
```python
config = BridgeConfig(
    vertex_loss_weight=2.0,
    shape_regularization_weight=0.0001,
    pose_regularization_weight=0.00001,
    learning_rate=0.05
)
# - Focuses on matching input vertices
# - May produce less natural shapes
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Optimization diverges | Reduce `learning_rate` to 0.001 |
| Convergence too slow | Increase `learning_rate` to 0.05 |
| Unrealistic shapes | Increase `shape_regularization_weight` to 0.01 |
| Poor vertex matching | Decrease `shape_regularization_weight` to 0.0001 |
| Out of memory | Use `device='cpu'` instead of `'cuda'` |

## Performance Tips

1. **GPU**: Use CUDA for 10-20x speedup
   ```python
   bridge = MHRBridge(smplx_model, config, device='cuda')
   ```

2. **Batch Processing**: Process multiple scans without reloading model
   ```python
   for vertices in [scan1, scan2, scan3]:
       result = bridge.convert(vertices)
   ```

3. **Early Stopping**: Adjust patience for faster convergence
   ```python
   config = BridgeConfig(patience=20)  # Default: 50
   ```

## Understanding Output Metrics

```python
print(f"Reconstruction Loss: {result.reconstruction_loss:.6f}")
# L2 distance between vertices (meters)
# Lower is better, typical: 0.01-0.1m

print(f"Shape Regularization: {result.shape_reg_loss:.6f}")
# L2 penalty on shape parameters
# Higher = further from mean body shape

print(f"Pose Regularization: {result.pose_reg_loss:.6f}")
# L2 penalty on pose parameters
# Higher = further from T-pose

print(f"Total Loss: {result.total_loss:.6f}")
# Weighted sum of all losses
# Metric for optimization quality
```

## API Quick Reference

```python
# Configuration
config = BridgeConfig(
    learning_rate=0.01,                # Adam LR
    num_iterations=500,                # Max iterations
    shape_regularization_weight=0.001, # Shape penalty weight
    pose_regularization_weight=0.0001  # Pose penalty weight
)

# Convert mesh
result = bridge.convert(
    mhr_vertices,              # numpy array [N, 3]
    initial_betas=None,        # Optional initial params
    verbose=True               # Print progress
)

# Result properties
result.betas                   # Shape parameters [1, 300]
result.body_pose               # Body pose [1, 63]
result.global_orient           # Global rotation [1, 3]
result.reconstruction_loss     # Vertex matching error
result.reconstructed_vertices  # SMPL-X mesh [10475, 3]

# File operations
bridge.save_result(result, 'file.pt')   # Save as PyTorch
bridge.save_result(result, 'file.npz')  # Save as NumPy
loaded = bridge.load_result('file.pt')  # Load result
```

## Next Steps

1. **Read Full Docs**: See `README.md` for detailed documentation
2. **Run Tests**: Execute `test_mhr_bridge.py` to verify setup
3. **Explore Parameters**: Experiment with `BridgeConfig` settings
4. **Integrate**: Use results in your downstream applications

## Support

For issues or questions:
1. Check `README.md` troubleshooting section
2. Review `test_mhr_bridge.py` for usage examples
3. Check logs with `verbose=True`
