#!/bin/bash
# INFRA-E01-S01-T03: Install CUDA 12.8 Toolkit
# Prerequisites: NVIDIA driver >= 570.x installed (INFRA-E01-S01-T02)

set -e

CUDA_VERSION="12.8.0"
CUDA_RUNFILE="cuda_12.8.0_570.86.16_linux.run"
CUDA_URL="https://developer.download.nvidia.com/compute/cuda/${CUDA_VERSION}/local_installers/${CUDA_RUNFILE}"
CUDA_INSTALL_PATH="/usr/local/cuda-12.8"

echo "=============================================="
echo "CUDA ${CUDA_VERSION} Toolkit Installation"
echo "=============================================="

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run with sudo privileges"
    exit 1
fi

# Check prerequisites - NVIDIA driver
echo ""
echo "[1/6] Checking prerequisites..."
if ! command -v nvidia-smi &> /dev/null; then
    echo "ERROR: nvidia-smi not found. Please install NVIDIA driver first (INFRA-E01-S01-T02)"
    exit 1
fi

DRIVER_VERSION=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader | head -1)
echo "NVIDIA driver version: ${DRIVER_VERSION}"

# Check if CUDA 12.8 is already installed
if [ -d "${CUDA_INSTALL_PATH}" ] && [ -f "${CUDA_INSTALL_PATH}/bin/nvcc" ]; then
    INSTALLED_VERSION=$("${CUDA_INSTALL_PATH}/bin/nvcc" --version | grep "release" | awk '{print $5}' | tr -d ',')
    echo "CUDA ${INSTALLED_VERSION} already installed at ${CUDA_INSTALL_PATH}"
    echo "To reinstall, remove the directory first: sudo rm -rf ${CUDA_INSTALL_PATH}"
    exit 0
fi

# Download CUDA installer
echo ""
echo "[2/6] Downloading CUDA ${CUDA_VERSION} installer..."
cd /tmp

if [ -f "${CUDA_RUNFILE}" ]; then
    echo "Installer already exists, skipping download"
else
    wget -q --show-progress "${CUDA_URL}" -O "${CUDA_RUNFILE}"
fi

chmod +x "${CUDA_RUNFILE}"

# Install CUDA toolkit
echo ""
echo "[3/6] Installing CUDA toolkit (this may take several minutes)..."
sh "${CUDA_RUNFILE}" --toolkit --silent --override

# Verify installation
echo ""
echo "[4/6] Verifying installation..."
if [ ! -f "${CUDA_INSTALL_PATH}/bin/nvcc" ]; then
    echo "ERROR: nvcc not found after installation"
    exit 1
fi

# Configure environment variables (system-wide)
echo ""
echo "[5/6] Configuring environment variables..."

# Create system-wide profile
cat > /etc/profile.d/cuda-12.8.sh << 'EOF'
# CUDA 12.8 Environment Configuration
export PATH=/usr/local/cuda-12.8/bin${PATH:+:$PATH}
export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}
EOF

chmod +x /etc/profile.d/cuda-12.8.sh

# Create symbolic link
ln -sf "${CUDA_INSTALL_PATH}" /usr/local/cuda

# Update library cache
ldconfig

# Source the profile for current session
export PATH=/usr/local/cuda-12.8/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64:$LD_LIBRARY_PATH

# Final verification
echo ""
echo "[6/6] Final verification..."
echo ""
echo "nvcc --version output:"
echo "----------------------"
${CUDA_INSTALL_PATH}/bin/nvcc --version

# Cleanup
echo ""
echo "Cleaning up installer..."
rm -f /tmp/${CUDA_RUNFILE}

echo ""
echo "=============================================="
echo "CUDA ${CUDA_VERSION} Installation Complete!"
echo "=============================================="
echo ""
echo "Installation path: ${CUDA_INSTALL_PATH}"
echo ""
echo "NOTE: Log out and back in (or run 'source /etc/profile.d/cuda-12.8.sh')"
echo "      for environment variables to take effect."
echo ""
echo "Verification commands:"
echo "  nvcc --version"
echo "  which nvcc"
echo "  echo \$LD_LIBRARY_PATH"
