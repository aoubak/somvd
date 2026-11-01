@echo off
rem SOMVD personal mode: builds the app and runs it from one local server.
rem Any site yt-dlp supports, no rate limits. For your own use only; do not expose it to the internet.
setlocal
cd /d "%~dp0"

if not exist node_modules call npm install || goto :fail
if not exist backend\node_modules (
  pushd backend
  call npm install || (popd & goto :fail)
  popd
)

set VITE_PERSONAL_MODE=true
call npm run build || goto :fail

set PERSONAL_MODE=true
if not defined PORT set PORT=3002

rem Open the browser once the server has had a moment to start
start "" /b cmd /c "ping -n 4 127.0.0.1 >nul & start http://localhost:%PORT%/somvdapp/"

node backend\server.js
goto :eof

:fail
echo.
echo Something went wrong. Read the message above, then press a key to close.
pause >nul
exit /b 1
