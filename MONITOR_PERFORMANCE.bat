@echo off
:loop
cls
echo ========================================
echo   StreamFlow Performance Monitor
echo ========================================
echo.
pm2 monit
timeout /t 5 >nul
goto loop
