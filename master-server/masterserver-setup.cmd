@echo off
echo Supraball Master Server Emulator - Setup
echo =======================================

REM Check administrator privileges
net session >nul 2>&1
if errorlevel 1 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click on setup.bat and select "Run as Administrator".
    pause
    exit /b 1
)

echo.
echo 1. Configuring hosts file...

REM Create backup of original hosts file
if not exist "C:\Windows\System32\drivers\etc\hosts.backup" (
    copy "C:\Windows\System32\drivers\etc\hosts" "C:\Windows\System32\drivers\etc\hosts.backup"
    echo    - Backup of original hosts file created
)

REM Check if entry already exists
findstr /C:"masterserver.supraball.net" "C:\Windows\System32\drivers\etc\hosts" >nul 2>&1
if errorlevel 1 (
    REM Add entry
    echo 127.0.0.1    masterserver.supraball.net >> "C:\Windows\System32\drivers\etc\hosts"
    echo    - masterserver.supraball.net added to hosts file
) else (
    echo    - masterserver.supraball.net already configured in hosts file
)

REM Check if master.supraball.net entry exists
findstr /C:"master.supraball.net" "C:\Windows\System32\drivers\etc\hosts" >nul 2>&1
if errorlevel 1 (
    REM Add entry
    echo 127.0.0.1    master.supraball.net >> "C:\Windows\System32\drivers\etc\hosts"
    echo    - master.supraball.net added to hosts file
) else (
    echo    - master.supraball.net already configured in hosts file
)

echo.
echo 2. Configuring firewall rules...

REM Add firewall rules for Master Server
netsh advfirewall firewall show rule name="Supraball Master Server HTTP" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server HTTP" dir=in action=allow protocol=TCP localport=80
    echo    - HTTP Port 80 opened
)

netsh advfirewall firewall show rule name="Supraball Master Server TCP" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server TCP" dir=in action=allow protocol=TCP localport=28900
    echo    - TCP Port 28900 opened
)

netsh advfirewall firewall show rule name="Supraball Master Server UDP" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server UDP" dir=in action=allow protocol=UDP localport=28900
    echo    - UDP Port 28900 opened
)

netsh advfirewall firewall show rule name="Supraball Master Server TCP 8991" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server TCP 8991" dir=in action=allow protocol=TCP localport=8991
    echo    - TCP Port 8991 opened
)

netsh advfirewall firewall show rule name="Supraball Master Server UDP 8991" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server UDP 8991" dir=in action=allow protocol=UDP localport=8991
    echo    - UDP Port 8991 opened
)

netsh advfirewall firewall show rule name="Supraball Master Server HTTP 8991" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server HTTP 8991" dir=in action=allow protocol=TCP localport=8991
    echo    - HTTP Port 8991 opened
)

netsh advfirewall firewall show rule name="Supraball Lobby Server TCP 8992" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Lobby Server TCP 8992" dir=in action=allow protocol=TCP localport=8992
    echo    - Lobby TCP Port 8992 opened
)

echo.
echo 3. Configuring Game Server firewall rules...

netsh advfirewall firewall show rule name="Supraball Game Server UDP 7777" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Game Server UDP 7777" dir=in action=allow protocol=UDP localport=7777
    echo    - Game Server UDP Port 7777 opened
) else (
    echo    - Game Server UDP Port 7777 already opened
)

netsh advfirewall firewall show rule name="Supraball Game Server TCP 7777" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Game Server TCP 7777" dir=in action=allow protocol=TCP localport=7777
    echo    - Game Server TCP Port 7777 opened
) else (
    echo    - Game Server TCP Port 7777 already opened
)

netsh advfirewall firewall show rule name="Supraball Query Server UDP 27015" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Query Server UDP 27015" dir=in action=allow protocol=UDP localport=27015
    echo    - Query Server UDP Port 27015 opened
) else (
    echo    - Query Server UDP Port 27015 already opened
)

echo.
echo 4. Installing Node.js dependencies...
npm install

echo.
echo =======================================
echo Setup completed successfully!
echo =======================================
echo.
echo The Master Server Emulator is now ready.
echo.
echo NEXT STEPS:
echo 1. Run "start.bat" to start the Master Server
echo 2. Open http://localhost/ to see the web interface
echo 3. Start your Supraball Dedicated Server
echo.
echo IMPORTANT: 
echo - The Master Server must be running before you start Supraball servers
echo - All Supraball servers on the network will automatically use the emulator
echo.
echo To uninstall: Run "uninstall.bat"
echo.
pause