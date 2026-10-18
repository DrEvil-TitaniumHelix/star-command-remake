@echo off
rem One-click launcher for the Veteran Crew save (lane testsave): same as "Play Star Command.cmd", but it loads
rem game/assets/saves/veteran (eight veterans, fitted Warrior, 50,000 credits) fresh on every start. It uses
rem 127.0.0.1 instead of localhost: a separate browser storage, so the regular game's save is never touched.
set ROOT=%~dp0
set PORT=8088
set PY=python
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>&1
if errorlevel 1 (
  start "Star Command server" /min "%PY%" -I "%ROOT%tools\serve.py" %PORT%
  timeout /t 2 /nobreak >nul
)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:%PORT%/index.html?save=veteran&force=1" --start-fullscreen
