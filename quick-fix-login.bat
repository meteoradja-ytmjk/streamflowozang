@echo off
echo ================================================
echo    QUICK FIX LOGIN ADMIN - StreamFlow
echo ================================================
echo.
echo Script ini akan:
echo 1. Stop aplikasi yang berjalan
echo 2. Reset database
echo 3. Buat admin baru
echo 4. Jalankan aplikasi
echo 5. Test login
echo.
pause

echo.
echo [1/5] Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo Done!

echo.
echo [2/5] Resetting database...
node reset-safe.js
if errorlevel 1 (
    echo ERROR: Failed to reset database
    pause
    exit /b 1
)

echo.
echo [3/5] Verifying database...
node verify-admin.js

echo.
echo [4/5] Starting application...
start /B node app.js
timeout /t 5 >nul

echo.
echo [5/5] Testing login...
node test-login.js

echo.
echo ================================================
echo    SELESAI!
echo ================================================
echo.
echo Kredensial Login:
echo URL      : http://localhost:7575/login
echo Username : admin
echo Password : admin123
echo.
echo Aplikasi sedang berjalan di background.
echo Buka browser dan login dengan kredensial di atas.
echo.
echo PENTING: Ganti password setelah login pertama!
echo.
pause
