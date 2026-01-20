# INFRA-E01-S01-T02: Install NVIDIA Driver

## Metadata
| Field | Value |
|-------|-------|
| Task ID | INFRA-E01-S01-T02 |
| Module | INFRA - Infrastructure & Environment |
| Epic | GPU Compute Environment |
| Story | Provision and Configure GPU Server |
| Phase | 1 |
| Prerequisites | INFRA-E01-S01-T01 |

## Description
Install NVIDIA driver version 570.86.16 or higher to support RTX 5090 (Blackwell architecture) and CUDA 12.8.

## Acceptance Criteria
- [ ] NVIDIA driver 570.86.16+ is installed
- [ ] `nvidia-smi` command works and shows RTX 5090
- [ ] Driver persists after reboot
- [ ] No nouveau driver conflicts

## Implementation Steps

### Step 1: Blacklist Nouveau Driver
The open-source nouveau driver conflicts with NVIDIA's proprietary driver. Blacklist it first:

```bash
# Create blacklist file
sudo bash -c 'cat > /etc/modprobe.d/blacklist-nouveau.conf << EOF
blacklist nouveau
options nouveau modeset=0
EOF'

# Regenerate initramfs
sudo update-initramfs -u
```

### Step 2: Remove Existing NVIDIA Drivers
```bash
# Purge any existing NVIDIA packages
sudo apt-get purge nvidia* -y
sudo apt-get purge libnvidia* -y
sudo apt-get autoremove -y
sudo apt-get autoclean
```

### Step 3: Add NVIDIA Repository
```bash
# Add graphics drivers PPA
sudo add-apt-repository ppa:graphics-drivers/ppa -y
sudo apt-get update
```

### Step 4: Install NVIDIA Driver 570
```bash
# Install the driver
sudo apt-get install nvidia-driver-570 -y

# Install additional utilities
sudo apt-get install nvidia-utils-570 -y
```

### Step 5: Configure Persistence Mode (Optional but Recommended)
```bash
# Enable persistence daemon for faster GPU initialization
sudo systemctl enable nvidia-persistenced
sudo systemctl start nvidia-persistenced
```

### Step 6: Reboot System
```bash
sudo reboot
```

### Step 7: Verify Installation
```bash
# Check driver version and GPU status
nvidia-smi

# Verify kernel module is loaded
lsmod | grep nvidia

# Check for nouveau (should return nothing)
lsmod | grep nouveau
```

## Expected Output
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 570.86.16    Driver Version: 570.86.16    CUDA Version: 12.8     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA RTX 5090     Off  | 00000000:00:1E.0 Off |                    0 |
| N/A   35C    P0    25W / 450W |      0MiB / 32768MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

## Troubleshooting

### Issue: nvidia-smi command not found
```bash
# Reinstall nvidia-utils
sudo apt-get install --reinstall nvidia-utils-570
# Add to PATH if needed
export PATH=$PATH:/usr/bin
```

### Issue: Nouveau driver still loaded
```bash
# Verify blacklist is in place
cat /etc/modprobe.d/blacklist-nouveau.conf

# Force regenerate initramfs
sudo update-initramfs -u -k all
sudo reboot
```

### Issue: Driver not loading after reboot
```bash
# Check for secure boot issues
mokutil --sb-state

# If secure boot is enabled, either disable it or sign the module
# Disable secure boot in BIOS/UEFI is the simpler option
```

### Issue: Version mismatch
```bash
# Check available versions
apt-cache search nvidia-driver

# Install specific version if 570 not available
sudo apt-get install nvidia-driver-570 -y
```

## Verification Checklist
- [ ] `nvidia-smi` returns successfully
- [ ] Driver version shows 570.86.16 or higher
- [ ] GPU shows as "NVIDIA RTX 5090"
- [ ] CUDA version shows 12.8
- [ ] `lsmod | grep nouveau` returns empty
- [ ] `lsmod | grep nvidia` shows nvidia modules loaded
- [ ] After additional reboot, nvidia-smi still works

## Definition of Done
`nvidia-smi` shows RTX 5090 with driver 570.86.16+

## Notes
- RTX 5090 (Blackwell architecture) requires driver 570+ for proper support
- CUDA 12.8 compatibility is included with this driver version
- Persistence mode improves GPU initialization time for applications
- This task must be completed before CUDA toolkit installation (next task)
