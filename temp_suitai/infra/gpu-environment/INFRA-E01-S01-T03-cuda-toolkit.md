# INFRA-E01-S01-T03: Install CUDA Toolkit

## Task Metadata
- **Task ID:** INFRA-E01-S01-T03
- **Module:** INFRA - Infrastructure & Environment
- **Epic:** GPU Compute Environment
- **Story:** Provision and Configure GPU Server
- **Phase:** 1
- **Prerequisites:** INFRA-E01-S01-T02 (NVIDIA Driver Installation)
- **Status:** Ready for Execution

## Overview

Install CUDA 12.8 toolkit system-wide to enable GPU-accelerated computing for PyTorch and vision libraries.

## Prerequisites Check

Before installing CUDA toolkit, verify:

```bash
# Verify NVIDIA driver is installed and working
nvidia-smi

# Check driver version (should be >= 570.x for CUDA 12.8)
nvidia-smi --query-gpu=driver_version --format=csv,noheader
```

## Installation Procedure

### Step 1: Download CUDA 12.8 Installer

```bash
# Navigate to downloads directory
cd /tmp

# Download CUDA 12.8 runfile installer (approximately 4.5 GB)
wget https://developer.download.nvidia.com/compute/cuda/12.8.0/local_installers/cuda_12.8.0_570.86.16_linux.run

# Verify download integrity (optional but recommended)
md5sum cuda_12.8.0_570.86.16_linux.run
```

### Step 2: Install CUDA Toolkit

```bash
# Make installer executable
chmod +x cuda_12.8.0_570.86.16_linux.run

# Install toolkit only (skip driver since it's already installed)
sudo sh cuda_12.8.0_570.86.16_linux.run --toolkit --silent

# Alternative: Interactive install to select components
# sudo sh cuda_12.8.0_570.86.16_linux.run
```

**Installation Options Explained:**
- `--toolkit`: Install CUDA toolkit only (compiler, libraries, headers)
- `--silent`: Non-interactive installation
- `--driver`: Would install driver (skip if already installed)
- `--samples`: Install CUDA samples (optional)

### Step 3: Configure Environment Variables

```bash
# Add CUDA to PATH in ~/.bashrc
echo '' >> ~/.bashrc
echo '# CUDA 12.8 Configuration' >> ~/.bashrc
echo 'export PATH=/usr/local/cuda-12.8/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64:${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}' >> ~/.bashrc

# Apply changes
source ~/.bashrc
```

For system-wide configuration (all users):

```bash
# Create CUDA profile script
sudo tee /etc/profile.d/cuda.sh << 'EOF'
# CUDA 12.8 Environment
export PATH=/usr/local/cuda-12.8/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64:${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}
EOF

sudo chmod +x /etc/profile.d/cuda.sh
```

### Step 4: Create Symbolic Link (Optional)

```bash
# Create /usr/local/cuda symlink pointing to 12.8
sudo ln -sf /usr/local/cuda-12.8 /usr/local/cuda
```

## Verification

### Check nvcc Version

```bash
nvcc --version
```

**Expected Output:**
```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2024 NVIDIA Corporation
Built on [build date]
Cuda compilation tools, release 12.8, V12.8.xxx
```

### Verify CUDA Installation Path

```bash
# Check installation directory
ls -la /usr/local/cuda-12.8/

# Verify key components exist
ls /usr/local/cuda-12.8/bin/nvcc
ls /usr/local/cuda-12.8/lib64/libcudart.so
ls /usr/local/cuda-12.8/include/cuda.h
```

### Compile and Run CUDA Sample (Optional)

```bash
# Install samples if not already installed
cuda-install-samples-12.8.sh ~/cuda-samples

# Compile deviceQuery sample
cd ~/cuda-samples/NVIDIA_CUDA-12.8_Samples/1_Utilities/deviceQuery
make

# Run deviceQuery
./deviceQuery
```

**Expected Output:** Should show GPU device information and end with "Result = PASS"

## Acceptance Criteria Verification

| Criteria | Verification Command | Expected Result |
|----------|---------------------|-----------------|
| CUDA 12.8 installed at `/usr/local/cuda-12.8` | `ls /usr/local/cuda-12.8` | Directory exists with bin, lib64, include |
| `nvcc --version` returns 12.8 | `nvcc --version` | "release 12.8" in output |
| CUDA paths in system PATH | `echo $PATH \| grep cuda` | Contains `/usr/local/cuda-12.8/bin` |
| CUDA samples compile and run | `./deviceQuery` | "Result = PASS" |

## Troubleshooting

### nvcc not found
```bash
# Check if CUDA is installed
ls /usr/local/cuda*

# Manually add to PATH for current session
export PATH=/usr/local/cuda-12.8/bin:$PATH
```

### Library not found errors
```bash
# Update library cache
sudo ldconfig

# Verify LD_LIBRARY_PATH
echo $LD_LIBRARY_PATH
```

### Version mismatch with driver
```bash
# Check CUDA/driver compatibility
nvidia-smi  # Shows max supported CUDA version

# Driver 570.x supports CUDA 12.8
```

## Cleanup

```bash
# Remove installer after successful installation
rm /tmp/cuda_12.8.0_570.86.16_linux.run
```

## Definition of Done

- [x] Documentation created
- [ ] CUDA 12.8 installed at `/usr/local/cuda-12.8`
- [ ] `nvcc --version` returns 12.8
- [ ] CUDA paths configured in system PATH
- [ ] CUDA samples compile and run successfully
