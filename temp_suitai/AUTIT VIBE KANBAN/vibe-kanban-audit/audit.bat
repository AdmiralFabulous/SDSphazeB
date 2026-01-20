@echo off
REM Vibe Kanban Audit Tool - Quick Launch
REM Usage: audit.bat [options]
REM Options: --json, --csv, --verbose

cd /d "%~dp0"

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    powershell -ExecutionPolicy Bypass -File "%~dp0audit.ps1" %*
) else (
    REM Fallback to Node.js
    where node >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        node "%~dp0audit.js" %*
    ) else (
        echo Error: Neither PowerShell nor Node.js found.
        echo Please install Node.js from https://nodejs.org/
        pause
        exit /b 1
    )
)
