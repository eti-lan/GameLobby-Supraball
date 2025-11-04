@echo off
echo =====================================
echo Building Supraball Components
echo =====================================
echo.

REM Clean _dist directory
echo Cleaning _dist directory...
if exist "_dist" (
    rmdir /s /q "_dist"
)
mkdir "_dist"
mkdir "_dist\client"
mkdir "_dist\master-server"
echo.

REM Build master-server
echo =====================================
echo Building Master Server (.exe)...
echo =====================================
cd master-server

REM Check if node_modules exists
if not exist "node_modules" (
    echo WARNING: node_modules not found!
    echo Installing master-server dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install master-server dependencies!
        pause
        exit /b 1
    )
) else (
    echo Checking for missing dependencies...
    call npm install --package-lock-only
    if errorlevel 1 (
        echo WARNING: Some dependencies might be missing. Running full install...
        call npm install
    )
)

echo Building executable...
call npm run build:exe
if errorlevel 1 (
    echo ERROR: Master server build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

REM Build client
echo =====================================
echo Building Client...
echo =====================================
cd client

REM Check if node_modules exists
if not exist "node_modules" (
    echo WARNING: node_modules not found!
    echo Installing client dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install client dependencies!
        pause
        exit /b 1
    )
) else (
    echo Checking for missing dependencies...
    call npm install --package-lock-only
    if errorlevel 1 (
        echo WARNING: Some dependencies might be missing. Running full install...
        call npm install
    )
)

echo Building client executable...
call npm run build:dist
if errorlevel 1 (
    echo ERROR: Client build failed!
    cd ..
    pause
    exit /b 1
)

REM Clean up unpacked folder (we only need the portable .exe)
echo Cleaning up unpacked files...
if exist "..\\_dist\\client\\win-unpacked" (
    rmdir /s /q "..\\_dist\\client\\win-unpacked"
)
cd ..
echo.

echo =====================================
echo Build Complete!
echo =====================================
echo.
echo Output directory: _dist\
echo   - master-server: _dist\master-server\supraball-master-server.exe
echo   - client:        _dist\client\supraball-client.exe
echo.
echo Ready to distribute!
echo.
pause
