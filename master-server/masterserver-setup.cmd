@echo off
echo Supraball Master Server Emulator - Setup
echo =======================================

REM Administrator-Rechte prüfen
net session >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Dieses Script muss als Administrator ausgeführt werden!
    echo Rechtsklick auf setup.bat und "Als Administrator ausführen" wählen.
    pause
    exit /b 1
)

echo.
echo 1. Hosts-Datei wird konfiguriert...

REM Backup der originalen Hosts-Datei erstellen
if not exist "C:\Windows\System32\drivers\etc\hosts.backup" (
    copy "C:\Windows\System32\drivers\etc\hosts" "C:\Windows\System32\drivers\etc\hosts.backup"
    echo    - Backup der originalen Hosts-Datei erstellt
)

REM Prüfen ob der Eintrag bereits vorhanden ist
findstr /C:"masterserver.supraball.net" "C:\Windows\System32\drivers\etc\hosts" >nul 2>&1
if errorlevel 1 (
    REM Eintrag hinzufügen
    echo 127.0.0.1    masterserver.supraball.net >> "C:\Windows\System32\drivers\etc\hosts"
    echo    - masterserver.supraball.net zu Hosts-Datei hinzugefügt
) else (
    echo    - masterserver.supraball.net ist bereits in der Hosts-Datei konfiguriert
)

REM Prüfen ob master.supraball.net Eintrag vorhanden ist
findstr /C:"master.supraball.net" "C:\Windows\System32\drivers\etc\hosts" >nul 2>&1
if errorlevel 1 (
    REM Eintrag hinzufügen
    echo 127.0.0.1    master.supraball.net >> "C:\Windows\System32\drivers\etc\hosts"
    echo    - master.supraball.net zu Hosts-Datei hinzugefügt
) else (
    echo    - master.supraball.net ist bereits in der Hosts-Datei konfiguriert
)

echo.
echo 2. Firewall-Regeln werden konfiguriert...

REM Firewall-Regeln für den Master Server hinzufügen
netsh advfirewall firewall show rule name="Supraball Master Server HTTP" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server HTTP" dir=in action=allow protocol=TCP localport=80
    echo    - HTTP Port 80 freigegeben
)

netsh advfirewall firewall show rule name="Supraball Master Server TCP" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server TCP" dir=in action=allow protocol=TCP localport=28900
    echo    - TCP Port 28900 freigegeben
)

netsh advfirewall firewall show rule name="Supraball Master Server UDP" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server UDP" dir=in action=allow protocol=UDP localport=28900
    echo    - UDP Port 28900 freigegeben
)

netsh advfirewall firewall show rule name="Supraball Master Server TCP 8991" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server TCP 8991" dir=in action=allow protocol=TCP localport=8991
    echo    - TCP Port 8991 freigegeben
)

netsh advfirewall firewall show rule name="Supraball Master Server UDP 8991" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server UDP 8991" dir=in action=allow protocol=UDP localport=8991
    echo    - UDP Port 8991 freigegeben
)

netsh advfirewall firewall show rule name="Supraball Master Server HTTP 8991" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Master Server HTTP 8991" dir=in action=allow protocol=TCP localport=8991
    echo    - HTTP Port 8991 freigegeben
)

netsh advfirewall firewall show rule name="Supraball Lobby Server TCP 8992" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Lobby Server TCP 8992" dir=in action=allow protocol=TCP localport=8992
    echo    - Lobby TCP Port 8992 freigegeben
)

echo.
echo 3. Game Server Firewall-Regeln werden konfiguriert...

netsh advfirewall firewall show rule name="Supraball Game Server UDP 7777" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Game Server UDP 7777" dir=in action=allow protocol=UDP localport=7777
    echo    - Game Server UDP Port 7777 freigegeben
) else (
    echo    - Game Server UDP Port 7777 bereits freigegeben
)

netsh advfirewall firewall show rule name="Supraball Game Server TCP 7777" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Game Server TCP 7777" dir=in action=allow protocol=TCP localport=7777
    echo    - Game Server TCP Port 7777 freigegeben
) else (
    echo    - Game Server TCP Port 7777 bereits freigegeben
)

netsh advfirewall firewall show rule name="Supraball Query Server UDP 27015" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Supraball Query Server UDP 27015" dir=in action=allow protocol=UDP localport=27015
    echo    - Query Server UDP Port 27015 freigegeben
) else (
    echo    - Query Server UDP Port 27015 bereits freigegeben
)

echo.
echo 4. Node.js Dependencies werden installiert...
npm install

echo.
echo =======================================
echo Setup erfolgreich abgeschlossen!
echo =======================================
echo.
echo Der Master Server Emulator ist nun bereit.
echo.
echo NÄCHSTE SCHRITTE:
echo 1. Führen Sie "start.bat" aus, um den Master Server zu starten
echo 2. Öffnen Sie http://localhost/ um die Web-Oberfläche zu sehen
echo 3. Starten Sie Ihren Supraball Dedicated Server
echo.
echo WICHTIG: 
echo - Der Master Server muss laufen, bevor Sie Supraball-Server starten
echo - Alle Supraball-Server im Netzwerk werden automatisch den Emulator nutzen
echo.
echo Zum Rückgängigmachen: Führen Sie "uninstall.bat" aus
echo.
pause