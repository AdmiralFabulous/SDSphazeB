@echo off
REM ========================================================
REM PyTorch with CUDA 12.8 Installation Script
REM For: NVIDIA RTX 5090 (Blackwell Architecture)
REM Task: INFRA-E01-S01-T04
REM ========================================================

echo.
echo ========================================================
echo PyTorch CUDA 12.8 Installation for RTX 5090
echo ========================================================
echo.
echo System Specs Detected:
echo - CPU: AMD Ryzen Threadripper PRO 5975WX (32-Cores)
echo - RAM: 64 GB
echo - GPU: NVIDIA RTX 5090 (Blackwell sm_120)
echo - OS:  Windows 11 Pro 25H2
echo.
echo ========================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Python detected:
python --version
echo.

REM Uninstall existing PyTorch (CPU-only version)
echo [2/4] Uninstalling existing PyTorch (if any)...
pip uninstall -y torch torchvision torchaudio
echo.

REM Install PyTorch with CUDA 12.8 (Nightly/Preview build)
echo [3/4] Installing PyTorch with CUDA 12.8 support...
echo.
echo IMPORTANT: This installs the NIGHTLY build which includes
echo support for RTX 5090 (Compute Capability sm_120).
echo.
echo Command: pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
echo.

pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Installation failed!
    echo.
    echo Troubleshooting steps:
    echo 1. Check your internet connection
    echo 2. Try running as Administrator
    echo 3. Update pip: python -m pip install --upgrade pip
    echo 4. Check firewall/antivirus settings
    pause
    exit /b 1
)

echo.
echo [4/4] Installation complete!
echo.
echo ========================================================
echo Next Steps:
echo ========================================================
echo 1. Run: python test_gpu.py
echo 2. Verify CUDA is available and RTX 5090 is detected
echo.
echo If you see "CUDA Available: False", troubleshoot:
echo - Ensure NVIDIA drivers are installed (version 566.14+)
echo - Check Device Manager for GPU detection
echo - Restart your system after driver installation
echo ========================================================
echo.

pause
