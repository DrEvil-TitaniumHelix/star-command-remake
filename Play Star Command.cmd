@echo off
setlocal
set "PY="
for /f "delims=" %%P in ('where python.exe 2^>nul ^| findstr /i /v /l /c:"\Microsoft\WindowsApps"') do if not defined PY set "PY=%%P"
if not defined PY goto fallback
"%PY%" -I -c "import sys; sys.exit(sys.version_info.major != 3)" >nul 2>&1
if errorlevel 1 goto fallback
"%PY%" -I "%~dp0tools\serve.py" --play %*
exit /b %errorlevel%
:fallback
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve.ps1" --play %*
exit /b %errorlevel%
