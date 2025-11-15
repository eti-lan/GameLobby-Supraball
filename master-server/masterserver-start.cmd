@echo off
echo Starting Supraball Master Server Emulator...
echo ============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Change to correct directory
cd /d "%~dp0"

REM Install dependencies if not present
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start Master Server
echo.
echo Starting Master Server...
echo Web Interface: http://localhost/
echo TCP/UDP Server: Port 28900
echo.
echo Press Ctrl+C to stop
echo.

node server.js

pause