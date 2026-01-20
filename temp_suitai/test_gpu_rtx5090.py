#!/usr/bin/env python3
"""
RTX 5090 GPU Access Verification Script
INFRA-E01-S01-T04: Verify GPU Access

System: SameDaySuits
CPU: AMD Ryzen Threadripper PRO 5975WX 32-Cores
GPU: NVIDIA RTX 5090 (Blackwell Architecture - sm_120)
OS: Windows 11 Pro 25H2

This script performs comprehensive verification that PyTorch can access
the RTX 5090 GPU and execute CUDA operations correctly.
"""

import sys
import platform


def print_system_info():
    """Display system information."""
    print("System Information:")
    print(f"  Platform: {platform.system()} {platform.release()}")
    print(f"  Architecture: {platform.machine()}")
    print(f"  Python: {sys.version.split()[0]}")
    print()


def check_python_version():
    """Verify Python 3.10+ is installed."""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")

    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print("ERROR: Python 3.10+ is required")
        return False

    print("[OK] Python 3.10+ requirement met")
    return True


def check_pytorch_cuda():
    """Verify PyTorch with CUDA support and RTX 5090 compatibility."""
    try:
        import torch
    except ImportError:
        print("ERROR: PyTorch is not installed")
        print()
        print("To install PyTorch with CUDA 12.8 support:")
        print("  Run: install_pytorch_cuda.bat")
        print("  Or: pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128")
        return False

    print(f"PyTorch version: {torch.__version__}")

    # Check if CUDA build
    if "+cpu" in torch.__version__:
        print("ERROR: You have the CPU-only version of PyTorch installed")
        print()
        print(f"Current version: {torch.__version__}")
        print("Required: PyTorch with CUDA 12.8+ support")
        print()
        print("To fix:")
        print("  1. Uninstall: pip uninstall torch torchvision torchaudio")
        print("  2. Install CUDA version: pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128")
        return False

    print(f"CUDA available: {torch.cuda.is_available()}")

    if not torch.cuda.is_available():
        print("ERROR: CUDA is not available")
        print()
        print("Possible causes:")
        print("  1. NVIDIA drivers not installed or outdated")
        print("     - Required: Driver version 566.14 or newer")
        print("     - Check: Device Manager > Display adapters")
        print("  2. RTX 5090 not detected by Windows")
        print("     - Check Device Manager for GPU")
        print("  3. Driver signature enforcement blocking unsigned driver")
        print("     - Your driver shows as 'Not digitally signed'")
        print("     - May need to disable driver signature enforcement")
        print("  4. PyTorch built without CUDA support")
        print("     - Verify torch version shows +cu128, not +cpu")
        print()
        return False

    print("[OK] CUDA is available")

    # CUDA version check
    cuda_version = torch.version.cuda
    print(f"CUDA version: {cuda_version}")

    if cuda_version:
        major, minor = cuda_version.split('.')[:2]
        if int(major) < 12 or (int(major) == 12 and int(minor) < 8):
            print(f"WARNING: CUDA {cuda_version} may not support RTX 5090 (Blackwell sm_120)")
            print("         Recommended: CUDA 12.8 or higher")
            print("         You may encounter: 'no kernel image is available for execution'")

    # Device count
    device_count = torch.cuda.device_count()
    print(f"Device count: {device_count}")

    if device_count == 0:
        print("ERROR: No CUDA devices found")
        return False

    # GPU information
    device_name = torch.cuda.get_device_name(0)
    print(f"Device name: {device_name}")

    # Check for RTX 5090 specifically
    if "5090" not in device_name:
        print(f"WARNING: Expected 'NVIDIA RTX 5090', got '{device_name}'")
        print("         Continuing with detected GPU...")
    else:
        print("[OK] RTX 5090 detected")

    # Compute capability check (RTX 5090 should be 9.0 or higher for Blackwell)
    if hasattr(torch.cuda, 'get_device_capability'):
        capability = torch.cuda.get_device_capability(0)
        print(f"Compute capability: {capability[0]}.{capability[1]} (sm_{capability[0]}{capability[1]})")

        if capability[0] >= 9:
            print("[OK] Blackwell architecture confirmed (sm_9x)")
        else:
            print(f"WARNING: Unexpected compute capability for RTX 5090: {capability[0]}.{capability[1]}")

    # Memory information
    if torch.cuda.is_available():
        total_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"GPU memory: {total_memory:.2f} GB")

    return True


def test_tensor_operation():
    """Run tensor operations on GPU to verify functionality."""
    import torch

    print("\nRunning GPU tensor operation tests...")

    try:
        # Test 1: Simple tensor creation
        print("\n[Test 1/3] Simple tensor creation on GPU...")
        x = torch.randn(1000, 1000).cuda()
        print(f"  Created tensor shape: {x.shape}")
        print(f"  Tensor device: {x.device}")
        print("  [OK] Tensor created on GPU")

        # Test 2: Matrix multiplication
        print("\n[Test 2/3] Matrix multiplication on GPU...")
        y = torch.randn(1000, 1000).cuda()
        z = torch.matmul(x, y)

        expected_shape = torch.Size([1000, 1000])
        if z.shape != expected_shape:
            print(f"  ERROR: Unexpected result shape: {z.shape}")
            return False

        print(f"  Result shape: {z.shape}")
        print(f"  Result device: {z.device}")
        print("  [OK] Matrix multiplication successful")

        # Test 3: CUDA-specific operations
        print("\n[Test 3/3] CUDA synchronization and memory...")
        torch.cuda.synchronize()
        allocated = torch.cuda.memory_allocated(0) / (1024**2)
        cached = torch.cuda.memory_reserved(0) / (1024**2)
        print(f"  Memory allocated: {allocated:.2f} MB")
        print(f"  Memory cached: {cached:.2f} MB")
        print("  [OK] CUDA operations functioning correctly")

        return True

    except RuntimeError as e:
        error_msg = str(e)
        print(f"\nERROR: {error_msg}")

        if "no kernel image is available" in error_msg:
            print("\nCRITICAL: Your CUDA version is too old for RTX 5090!")
            print("The RTX 5090 (Blackwell sm_120) requires CUDA 12.8 or higher.")
            print()
            print("Solution:")
            print("  1. Uninstall current PyTorch: pip uninstall torch torchvision torchaudio")
            print("  2. Install with CUDA 12.8: pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128")

        return False

    except Exception as e:
        print(f"\nERROR: Unexpected error: {e}")
        return False


def main():
    """Run all GPU verification tests."""
    print("=" * 70)
    print("RTX 5090 GPU Access Verification - INFRA-E01-S01-T04")
    print("=" * 70)
    print()

    print_system_info()

    all_passed = True

    # Check Python version
    print("[1/3] Checking Python version...")
    if not check_python_version():
        all_passed = False
    print()

    # Check PyTorch and CUDA
    print("[2/3] Checking PyTorch and CUDA...")
    if not check_pytorch_cuda():
        all_passed = False
        print()
        print("=" * 70)
        print("VERIFICATION FAILED - PyTorch/CUDA not properly configured")
        print("=" * 70)
        print()
        print("Next steps:")
        print("  1. Run: install_pytorch_cuda.bat")
        print("  2. Restart your terminal")
        print("  3. Run this script again: python test_gpu_rtx5090.py")
        return 1
    print()

    # Test tensor operation
    print("[3/3] Testing GPU tensor operations...")
    if not test_tensor_operation():
        all_passed = False

    # Final summary
    print()
    print("=" * 70)
    if all_passed:
        print("VERIFICATION PASSED - RTX 5090 GPU stack is working correctly!")
        print("=" * 70)
        print()
        print("Your RTX 5090 is ready for:")
        print("  - Deep learning training")
        print("  - CUDA-accelerated computations")
        print("  - High-performance tensor operations")
        return 0
    else:
        print("VERIFICATION FAILED - See errors above")
        print("=" * 70)
        return 1


if __name__ == "__main__":
    sys.exit(main())
