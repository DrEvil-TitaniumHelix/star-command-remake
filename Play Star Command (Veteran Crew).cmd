@echo off
set ROOT=%~dp0
set PORT=8088
set PY=python
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>&1
if errorlevel 1 (
  start "Star Command server" /min "%PY%" -I "%ROOT%tools\serve.py" %PORT%
  timeout /t 2 /nobreak >nul
)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:%PORT%/index.html?save=veteran&force=1" --start-fullscreen
