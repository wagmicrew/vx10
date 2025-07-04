@echo off
REM VX10 Complete Setup Script - Windows Wrapper
REM This script runs the bash setup script using Git Bash

echo ================================
echo     VX10 Setup Script (Windows)
echo ================================
echo.

REM Check if Git Bash is available
where bash >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Git Bash not found. Please install Git for Windows first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Run the bash script with Git Bash
echo Running VX10 setup script...
echo.

bash setup-vx10-complete.sh %*

echo.
echo Setup script completed.
pause
