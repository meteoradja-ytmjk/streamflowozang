@echo off
echo Starting StreamFlow with optimized settings...

REM Set Node.js memory limits
set NODE_OPTIONS=--max-old-space-size=384 --optimize-for-size

REM Start dengan PM2 (recommended)
pm2 start ecosystem.config.js

REM Atau start langsung (alternative)
REM node app.js

echo.
echo StreamFlow started with optimized performance settings
echo Memory limit: 384MB
echo CPU optimization: Enabled
pause
