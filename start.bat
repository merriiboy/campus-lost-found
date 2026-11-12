@echo off
title Campus Lost and Found Server
cd /d "%~dp0"

echo ========================================================
echo       Campus Lost and Found Management System
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please install Node.js from https://nodejs.org/ before running.
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [SETUP] First time setup: Installing required package (mongodb)...
    call npm install
    echo.
)

echo [INFO] Starting server...
echo [INFO] Once started, open your browser and go to:
echo        http://localhost:3000
echo.
echo Press Ctrl + C to stop the server anytime.
echo ========================================================
echo.
node server.js
pause
