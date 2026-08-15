@echo off
cd /d "%~dp0"
start "cheat-app" cmd /k npm run dev
timeout /t 4 /nobreak >nul
start "cheat-tunnel" cmd /k "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173
echo Wait for the tunnel window. Copy the https://....trycloudflare.com link from there.
pause
