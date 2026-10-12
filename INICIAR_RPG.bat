@echo off
setlocal
set "ROOT=%~dp0"
start "" /b node "%ROOT%js\offline-server.mjs"
timeout /t 1 >nul
start "RPG Master — Fangorn" "http://127.0.0.1:41731/"
