#!/usr/bin/env python3
"""
GPU Access Verification Script
INFRA-E01-S01-T04: Verify GPU Access

This script verifies that PyTorch can access the GPU by running CUDA tests.
It confirms the entire GPU stack is working correctly.

Prerequisites:
- Python 3.10+
- PyTorch with CUDA support installed
- NVIDIA GPU with proper drivers

Installation (if needed):
    pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
"""

import sys


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
    """Verify PyTorch with CUDA support is installed and working."""
    try:
        import torch
    except ImportError:
        print("ERROR: PyTorch is not installed")
        print("Install with: pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128")
        return False

    print(f"\nPyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")

    if not torch.cuda.is_available():
        print("ERROR: CUDA is not available")
        print("Possible causes:")
        print("  - NVIDIA drivers not installed")
        print("  - PyTorch installed without CUDA support")
        print("  - No compatible GPU detected")
        return False

    print("[OK] CUDA is available")

    # Print CUDA version
    print(f"CUDA version: {torch.version.cuda}")

    # Check device count
    device_count = torch.cuda.device_count()
    print(f"Device count: {device_count}")

    if device_count == 0:
        print("ERROR: No CUDA devices found")
        return False

    # Get device name
    device_name = torch.cuda.get_device_name(0)
    print(f"Device name: {device_name}")

    # Verify expected GPU (NVIDIA RTX 5090)
    expected_gpu = "NVIDIA RTX 5090"
    if expected_gpu.lower() not in device_name.lower():
        print(f"WARNING: Expected '{expected_gpu}', got '{device_name}'")
        # Not a failure, just a warning - different GPU may be acceptable
    else:
        print(f"[OK] GPU matches expected: {expected_gpu}")

    return True


def test_tensor_operation():
    """Run a simple tensor operation on GPU to verify functionality."""
    import torch

    print("\nRunning tensor operation test...")

    try:
        # Create tensors on GPU
        x = torch.randn(1000, 1000).cuda()
        y = torch.randn(1000, 1000).cuda()

        # Perform matrix multiplication
        z = torch.matmul(x, y)

        # Verify result shape
        expected_shape = torch.Size([1000, 1000])
        if z.shape != expected_shape:
            print(f"ERROR: Unexpected result shape: {z.shape}")
            return False

        print(f"Matrix multiplication on GPU successful: {z.shape}")
        print("[OK] Tensor operation test passed")

        # Additional verification - ensure tensor is on GPU
        if not z.is_cuda:
            print("ERROR: Result tensor is not on GPU")
            return False

        print("[OK] Result tensor verified on GPU")
        return True

    except Exception as e:
        print(f"ERROR: Tensor operation failed: {e}")
        return False


def main():
    """Run all GPU verification tests."""
    print("=" * 60)
    print("GPU Access Verification - INFRA-E01-S01-T04")
    print("=" * 60)

    all_passed = True

    # Check Python version
    print("\n[1/3] Checking Python version...")
    if not check_python_version():
        all_passed = False

    # Check PyTorch and CUDA
    print("\n[2/3] Checking PyTorch and CUDA...")
    if not check_pytorch_cuda():
        all_passed = False
        print("\n" + "=" * 60)
        print("VERIFICATION FAILED")
        print("=" * 60)
        return 1

    # Test tensor operation
    print("\n[3/3] Testing tensor operations...")
    if not test_tensor_operation():
        all_passed = False

    # Final summary
    print("\n" + "=" * 60)
    if all_passed:
        print("VERIFICATION PASSED - GPU stack is working correctly")
        print("=" * 60)
        return 0
    else:
        print("VERIFICATION FAILED - See errors above")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
