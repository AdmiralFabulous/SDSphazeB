# RTX 5090 GPU Setup Guide
**Task:** INFRA-E01-S01-T04 - Verify GPU Access
**System:** SameDaySuits
**GPU:** NVIDIA RTX 5090 (Blackwell Architecture)

## System Specifications
- **CPU:** AMD Ryzen Threadripper PRO 5975WX 32-Cores (3.60 GHz)
- **RAM:** 64.0 GB
- **GPU:** NVIDIA RTX 5090
- **OS:** Windows 11 Pro Version 25H2 (Build 26200.7462)
- **Architecture:** x64-based processor

---

## Quick Start

### Step 1: Install PyTorch with CUDA 12.8
```batch
install_pytorch_cuda.bat
```

### Step 2: Verify GPU Access
```bash
python test_gpu_rtx5090.py
```

### Expected Output
```
[OK] Python 3.10+ requirement met
[OK] CUDA is available
[OK] RTX 5090 detected
[OK] Blackwell architecture confirmed
VERIFICATION PASSED - RTX 5090 GPU stack is working correctly!
```

---

## Understanding the RTX 5090 (Blackwell Architecture)

### Why CUDA 12.8 is Required

The **RTX 5090** is based on NVIDIA's **Blackwell architecture** with compute capability `sm_120` (or sm_9x range). This is cutting-edge hardware that requires:

- **CUDA Toolkit:** 12.8 or higher
- **NVIDIA Driver:** 566.14 or newer
- **PyTorch:** Nightly build with CUDA 12.8 support

**Critical Issue with CUDA 12.4:**
Standard PyTorch builds for CUDA 12.4 lack the kernel images (`sm_120`) needed for the RTX 5090. Installing CUDA 12.4 will result in:
```
RuntimeError: CUDA error: no kernel image is available for execution on the device
```

### Your Current Driver Status
Based on your screenshot, your NVIDIA driver shows as **"Not digitally signed"**. This is common with pre-release or beta drivers.

**Implications:**
- Driver may work fine for development
- Some security software may flag it
- Windows Secure Boot might block it
- Official WHQL-signed drivers (590.xx+) are recommended when available

---

## Installation Methods

### Method 1: Automated Installation (Recommended)
Run the provided batch script:
```batch
install_pytorch_cuda.bat
```

This script will:
1. Check Python version
2. Uninstall CPU-only PyTorch
3. Install PyTorch with CUDA 12.8 support
4. Provide verification instructions

### Method 2: Manual Installation

#### Step 1: Uninstall CPU-only PyTorch
```bash
pip uninstall torch torchvision torchaudio -y
```

#### Step 2: Install PyTorch with CUDA 12.8
```bash
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
```

The `--pre` flag is required to install the **Nightly (Preview)** build, which includes support for the Blackwell architecture.

#### Step 3: Verify Installation
```bash
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA: {torch.cuda.is_available()}')"
```

Expected output:
```
PyTorch: 2.x.x+cu128
CUDA: True
```

---

## Troubleshooting

### Issue 1: "CUDA Available: False"

**Symptoms:**
```python
torch.cuda.is_available()  # Returns False
```

**Possible Causes & Solutions:**

#### Cause 1: NVIDIA Drivers Not Installed
```bash
# Check Device Manager
1. Open Device Manager (Win + X > Device Manager)
2. Expand "Display adapters"
3. Look for "NVIDIA RTX 5090"
```

**Solution:**
- Download latest drivers from NVIDIA (566.14+)
- Install and restart system

#### Cause 2: CPU-only PyTorch Installed
```bash
# Check PyTorch version
python -c "import torch; print(torch.__version__)"
```

If output shows `+cpu` (e.g., `2.9.1+cpu`), you have the wrong version.

**Solution:**
```bash
pip uninstall torch torchvision torchaudio -y
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
```

#### Cause 3: GPU Not Detected by Windows
```bash
# Check if GPU is visible to system
nvidia-smi
```

If `nvidia-smi` fails:
1. Check physical GPU connection
2. Reseat GPU in PCIe slot
3. Update motherboard BIOS
4. Check power cables to GPU

#### Cause 4: Driver Signature Enforcement
If your driver is "Not digitally signed":

**Temporary Fix:**
1. Restart Windows
2. Hold Shift while clicking Restart
3. Troubleshoot > Advanced Options > Startup Settings > Restart
4. Press F7 to "Disable driver signature enforcement"

**Permanent Fix:**
- Wait for official WHQL-signed Game Ready Driver from NVIDIA

---

### Issue 2: "RuntimeError: no kernel image is available for execution on the device"

**Symptoms:**
```python
x = torch.randn(10, 10).cuda()
# RuntimeError: CUDA error: no kernel image is available for execution on the device
```

**Root Cause:**
Your CUDA version (12.4 or lower) doesn't include kernel images for the RTX 5090's compute capability (sm_120).

**Solution:**
Install PyTorch with CUDA 12.8:
```bash
pip uninstall torch torchvision torchaudio -y
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
```

---

### Issue 3: Import Errors After Installation

**Symptoms:**
```python
import torch
# ImportError: DLL load failed
```

**Solutions:**

#### Solution 1: Install Visual C++ Redistributables
Download and install:
- [Microsoft Visual C++ 2019 Redistributable](https://aka.ms/vs/16/release/vc_redist.x64.exe)

#### Solution 2: Update pip
```bash
python -m pip install --upgrade pip
```

#### Solution 3: Clean Reinstall
```bash
pip cache purge
pip uninstall torch torchvision torchaudio -y
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
```

---

### Issue 4: Slow Performance or GPU Not Being Used

**Check GPU Utilization:**
```bash
# In separate terminal, monitor GPU usage
nvidia-smi -l 1
```

While running PyTorch code, you should see:
- GPU utilization % increasing
- Memory usage increasing
- Temperature rising

**Common Causes:**
1. Tensors not moved to GPU (missing `.cuda()`)
2. Small workload (GPU overhead exceeds benefit)
3. CPU bottleneck in data loading

**Solution:**
```python
# Always move tensors to GPU
x = torch.randn(1000, 1000).cuda()
y = torch.randn(1000, 1000).cuda()

# Or use device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
x = torch.randn(1000, 1000).to(device)
```

---

## Verification Checklist

Run through this checklist to ensure everything is working:

### 1. Python Version
```bash
python --version
```
- [ ] Python 3.10 or higher

### 2. GPU Detection
```bash
nvidia-smi
```
- [ ] Shows NVIDIA RTX 5090
- [ ] Driver version 566.14 or higher
- [ ] CUDA version 12.8 or higher

### 3. PyTorch Installation
```bash
python -c "import torch; print(torch.__version__)"
```
- [ ] Version shows `+cu128` (not `+cpu`)
- [ ] Example: `2.6.0+cu128`

### 4. CUDA Availability
```bash
python -c "import torch; print(torch.cuda.is_available())"
```
- [ ] Returns `True`

### 5. GPU Name
```bash
python -c "import torch; print(torch.cuda.get_device_name(0))"
```
- [ ] Returns device name containing "5090"

### 6. Tensor Operation
```bash
python -c "import torch; x = torch.randn(100, 100).cuda(); print('Success')"
```
- [ ] Prints "Success" without errors

### 7. Full Verification
```bash
python test_gpu_rtx5090.py
```
- [ ] All tests pass
- [ ] Shows "VERIFICATION PASSED"

---

## Alternative: If You Must Use CUDA 12.4

**Warning:** Not recommended for RTX 5090. High risk of kernel image errors.

If you have legacy code requiring CUDA 12.4:

### Option A: Install CUDA 12.4 Build (Risky)
```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

This will likely fail with "no kernel image available" on RTX 5090.

### Option B: Compile PyTorch from Source
This is advanced and time-consuming:
1. Install CUDA Toolkit 12.4
2. Clone PyTorch repository
3. Modify build configuration to include `sm_120`
4. Compile from source (takes 1-2 hours)

**Recommendation:** Use CUDA 12.8 instead. It's backward compatible with most CUDA 12.x code.

---

## Performance Optimization Tips

### 1. Enable TF32 (Tensor Float 32)
```python
import torch
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True
```

### 2. Use Mixed Precision Training
```python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for data, target in dataloader:
    with autocast():
        output = model(data)
        loss = criterion(output, target)

    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

### 3. Monitor GPU Memory
```python
import torch

print(f"Allocated: {torch.cuda.memory_allocated(0) / 1e9:.2f} GB")
print(f"Cached: {torch.cuda.memory_reserved(0) / 1e9:.2f} GB")

# Clear cache if needed
torch.cuda.empty_cache()
```

### 4. Set CUDA Device (if multiple GPUs)
```python
torch.cuda.set_device(0)  # Use first GPU
```

---

## Environment Management (Optional)

For cleaner dependency management, consider using virtual environments:

### Using venv
```bash
# Create virtual environment
python -m venv rtx5090_env

# Activate (Windows)
rtx5090_env\Scripts\activate

# Install PyTorch
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
```

### Using Conda
```bash
# Create conda environment
conda create -n rtx5090 python=3.11 -y
conda activate rtx5090

# Install PyTorch
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
```

---

## Additional Resources

- **NVIDIA Driver Downloads:** https://www.nvidia.com/Download/index.aspx
- **PyTorch Installation Guide:** https://pytorch.org/get-started/locally/
- **CUDA Toolkit:** https://developer.nvidia.com/cuda-downloads
- **RTX 5090 Specifications:** https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/

---

## Support

If you encounter issues not covered in this guide:

1. Check PyTorch forums: https://discuss.pytorch.org/
2. Review NVIDIA developer forums: https://forums.developer.nvidia.com/
3. Check GPU detection: `nvidia-smi`
4. Verify driver version matches CUDA requirements
5. Ensure Windows is up to date

---

## Summary

**For RTX 5090 (Blackwell sm_120):**
- **Required:** CUDA 12.8+, Driver 566.14+, PyTorch Nightly
- **Installation:** `pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128`
- **Verification:** `python test_gpu_rtx5090.py`
- **Common Issue:** Using CUDA 12.4 → "no kernel image available" error
- **Solution:** Always use CUDA 12.8+ for RTX 5090

Your system is ready for high-performance deep learning once PyTorch with CUDA 12.8 is installed!
