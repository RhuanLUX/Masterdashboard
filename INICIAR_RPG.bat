@echo off
setlocal
set "ROOT=%~dp0"

rem O servidor Windows usa apenas PowerShell, já incluído no Windows 10/11.
rem Se já estiver ativo, apenas espera e abre o RPG.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient;try{$c.Connect('127.0.0.1',41731);exit 0}catch{exit 1}finally{$c.Dispose()}" >nul 2>&1
if errorlevel 1 start "RPG Master local" /b powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%ROOT%js\offline-server.ps1"

set /a TRIES=0
:wait_server
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient;try{$c.Connect('127.0.0.1',41731);exit 0}catch{exit 1}finally{$c.Dispose()}" >nul 2>&1
if not errorlevel 1 goto open_rpg
set /a TRIES+=1
if %TRIES% GEQ 30 goto server_error
timeout /t 1 /nobreak >nul
goto wait_server

:open_rpg
start "RPG Master — Fangorn" "http://127.0.0.1:41731/"
exit /b 0

:server_error
echo.
echo Nao foi possivel iniciar o servidor local do RPG Master.
echo Abra esta pasta e execute novamente INICIAR_RPG.bat.
pause
exit /b 1
