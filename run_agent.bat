@echo off
REM Helper script to run Antigravity Kit commands easily
REM Bypasses PowerShell execution policies by using standard CMD

REM Ensure we run from the script's directory
cd /d "%~dp0"

echo ==========================================
echo   Antigravity Kit Helper
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ to use this kit.
    pause
    exit /b 1
)

echo.
echo [1] Run Validation Checklist (Core)
echo [2] Verify All (Pre-deployment)
echo [3] Run Specific Skill Script...
echo [4] Exit
echo.

set /p choice="Select an option (1-4): "

if "%choice%"=="1" (
    echo.
    echo Running Core Checklist...
    python .agent/scripts/checklist.py .
    pause
    goto :EOF
)

if "%choice%"=="2" (
    echo.
    set /p url="Enter local URL (e.g., http://localhost:3000): "
    echo Running Full Verification...
    python .agent/scripts/verify_all.py . --url %url%
    pause
    goto :EOF
)

if "%choice%"=="3" (
    echo.
    echo Available scripts in .agent/scripts/ and .agent/skills/*/scripts/
    dir /b /s .agent\scripts\*.py
    echo.
    set /p script="Enter full path to script: "
    python "%script%" .
    pause
    goto :EOF
)

if "%choice%"=="4" (
    exit /b 0
)

echo.
echo Invalid choice.
pause
