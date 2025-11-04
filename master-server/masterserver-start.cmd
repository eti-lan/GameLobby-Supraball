@echo off
echo Supraball Master Server Emulator wird gestartet...
echo ============================================

REM Prüfen ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Node.js ist nicht installiert!
    echo Bitte installieren Sie Node.js von: https://nodejs.org/
    pause
    exit /b 1
)

REM Ins richtige Verzeichnis wechseln
cd /d "%~dp0"

REM Abhängigkeiten installieren falls nicht vorhanden
if not exist "node_modules" (
    echo Installiere Abhängigkeiten...
    npm install
)

REM Master Server starten
echo.
echo Master Server wird gestartet...
echo Web Interface: http://localhost/
echo TCP/UDP Server: Port 28900
echo.
echo Drücken Sie Strg+C zum Beenden
echo.

node server.js

pause