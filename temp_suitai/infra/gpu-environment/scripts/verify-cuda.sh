#!/bin/bash
# INFRA-E01-S01-T03: Verify CUDA 12.8 Installation
# Run this script to check all acceptance criteria

set -e

CUDA_INSTALL_PATH="/usr/local/cuda-12.8"
EXPECTED_VERSION="12.8"

echo "=============================================="
echo "CUDA Installation Verification"
echo "=============================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# Test 1: CUDA directory exists
echo "[Test 1] CUDA 12.8 installed at ${CUDA_INSTALL_PATH}"
if [ -d "${CUDA_INSTALL_PATH}" ]; then
    echo "  ✓ PASS: Directory exists"
    ((PASS_COUNT++))
else
    echo "  ✗ FAIL: Directory not found"
    ((FAIL_COUNT++))
fi

# Test 2: nvcc exists and returns correct version
echo ""
echo "[Test 2] nvcc --version returns ${EXPECTED_VERSION}"
if command -v nvcc &> /dev/null; then
    NVCC_OUTPUT=$(nvcc --version 2>&1)
    if echo "${NVCC_OUTPUT}" | grep -q "release ${EXPECTED_VERSION}"; then
        echo "  ✓ PASS: nvcc version ${EXPECTED_VERSION} confirmed"
        ((PASS_COUNT++))
    else
        echo "  ✗ FAIL: nvcc found but version mismatch"
        echo "  Output: ${NVCC_OUTPUT}"
        ((FAIL_COUNT++))
    fi
else
    echo "  ✗ FAIL: nvcc not found in PATH"
    ((FAIL_COUNT++))
fi

# Test 3: CUDA paths in system PATH
echo ""
echo "[Test 3] CUDA paths in system PATH"
if echo "$PATH" | grep -q "cuda-12.8/bin"; then
    echo "  ✓ PASS: CUDA bin directory in PATH"
    ((PASS_COUNT++))
else
    echo "  ✗ FAIL: CUDA bin directory not in PATH"
    echo "  Current PATH: $PATH"
    ((FAIL_COUNT++))
fi

# Test 4: LD_LIBRARY_PATH configured
echo ""
echo "[Test 4] CUDA library path configured"
if echo "$LD_LIBRARY_PATH" | grep -q "cuda-12.8/lib64"; then
    echo "  ✓ PASS: CUDA lib64 in LD_LIBRARY_PATH"
    ((PASS_COUNT++))
else
    echo "  ✗ FAIL: CUDA lib64 not in LD_LIBRARY_PATH"
    echo "  Current LD_LIBRARY_PATH: $LD_LIBRARY_PATH"
    ((FAIL_COUNT++))
fi

# Test 5: Key CUDA components exist
echo ""
echo "[Test 5] Key CUDA components exist"
COMPONENTS_OK=true
for component in "bin/nvcc" "lib64/libcudart.so" "include/cuda.h"; do
    if [ -e "${CUDA_INSTALL_PATH}/${component}" ]; then
        echo "  ✓ ${component}"
    else
        echo "  ✗ ${component} missing"
        COMPONENTS_OK=false
    fi
done

if [ "$COMPONENTS_OK" = true ]; then
    echo "  ✓ PASS: All key components found"
    ((PASS_COUNT++))
else
    echo "  ✗ FAIL: Some components missing"
    ((FAIL_COUNT++))
fi

# Test 6: Simple CUDA compilation test
echo ""
echo "[Test 6] CUDA compilation test"
if command -v nvcc &> /dev/null; then
    # Create a simple test program
    TEST_DIR=$(mktemp -d)
    cat > "${TEST_DIR}/test.cu" << 'EOF'
#include <stdio.h>
__global__ void hello() {
    printf("Hello from GPU!\n");
}
int main() {
    hello<<<1,1>>>();
    cudaDeviceSynchronize();
    printf("CUDA compilation test: SUCCESS\n");
    return 0;
}
EOF

    if nvcc "${TEST_DIR}/test.cu" -o "${TEST_DIR}/test" 2>/dev/null; then
        echo "  ✓ PASS: CUDA program compiled successfully"
        ((PASS_COUNT++))

        # Try to run if GPU is available
        if [ -e "${TEST_DIR}/test" ]; then
            if "${TEST_DIR}/test" 2>/dev/null; then
                echo "  ✓ BONUS: CUDA program executed successfully"
            else
                echo "  (Note: Compilation succeeded but execution requires GPU)"
            fi
        fi
    else
        echo "  ✗ FAIL: CUDA compilation failed"
        ((FAIL_COUNT++))
    fi

    rm -rf "${TEST_DIR}"
else
    echo "  ✗ FAIL: nvcc not available for compilation test"
    ((FAIL_COUNT++))
fi

# Summary
echo ""
echo "=============================================="
echo "Verification Summary"
echo "=============================================="
echo "Passed: ${PASS_COUNT}"
echo "Failed: ${FAIL_COUNT}"
echo ""

if [ ${FAIL_COUNT} -eq 0 ]; then
    echo "✓ ALL TESTS PASSED - CUDA ${EXPECTED_VERSION} is properly installed"
    echo ""
    echo "Definition of Done: COMPLETE"
    exit 0
else
    echo "✗ SOME TESTS FAILED - Please check the installation"
    exit 1
fi
