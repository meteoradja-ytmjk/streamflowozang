@echo off
setlocal enabledelayedexpansion

REM StreamFlow VPS Deployment Script for Windows
REM VPS IP: 103.31.204.105

echo ==========================================
echo   StreamFlow - VPS Deployment Script
echo ==========================================
echo.

REM VPS Configuration
set VPS_IP=103.31.204.105
set VPS_USER=root
set VPS_PATH=/var/www/streamflow

echo VPS IP: %VPS_IP%
echo VPS User: %VPS_USER%
echo VPS Path: %VPS_PATH%
echo.

REM Check if SSH is available
where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] SSH not found. Please install OpenSSH or use PuTTY/WinSCP
    echo.
    echo Options:
    echo 1. Install OpenSSH: Settings ^> Apps ^> Optional Features ^> OpenSSH Client
    echo 2. Use WinSCP for manual upload
    echo 3. Use the manual deployment guide: VPS_DEPLOYMENT_GUIDE.md
    pause
    exit /b 1
)

echo [1/8] Checking SSH connection...
ssh -o ConnectTimeout=5 %VPS_USER%@%VPS_IP% "echo SSH OK" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to VPS
    echo.
    echo Please check:
    echo - VPS IP: %VPS_IP%
    echo - SSH access and credentials
    echo - Firewall settings
    echo.
    echo Alternative: Use WinSCP or FileZilla for manual upload
    echo Read: VPS_DEPLOYMENT_GUIDE.md for manual steps
    pause
    exit /b 1
)
echo [OK] SSH connection successful
echo.

echo [2/8] Creating backup on VPS...
ssh %VPS_USER%@%VPS_IP% "if [ -d %VPS_PATH% ]; then cd %VPS_PATH% && if [ -f db/streamflow.db ]; then cp db/streamflow.db db/streamflow.db.backup-$(date +%%Y%%m%%d-%%H%%M%%S); echo Backup created; fi; fi"
echo.

echo [3/8] Creating directory structure...
ssh %VPS_USER%@%VPS_IP% "mkdir -p %VPS_PATH% && cd %VPS_PATH% && mkdir -p db logs public/uploads/videos public/uploads/audios public/uploads/avatars public/uploads/thumbnails"
echo [OK] Directories created
echo.

echo [4/8] Uploading files to VPS...
echo This may take a while depending on your connection...
echo.

REM Check if tar is available (Git Bash includes tar)
where tar >nul 2>nul
if %errorlevel% equ 0 (
    echo Creating archive...
    tar -czf streamflow-deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=db/*.db --exclude=logs/* --exclude=public/uploads/* .
    
    echo Uploading archive...
    scp streamflow-deploy.tar.gz %VPS_USER%@%VPS_IP%:/tmp/
    
    echo Extracting on VPS...
    ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && tar -xzf /tmp/streamflow-deploy.tar.gz && rm /tmp/streamflow-deploy.tar.gz"
    
    del streamflow-deploy.tar.gz
    echo [OK] Files uploaded
) else (
    echo [WARNING] tar not found. Please use one of these methods:
    echo.
    echo Method 1: Use WinSCP
    echo   1. Download WinSCP: https://winscp.net
    echo   2. Connect to %VPS_IP%
    echo   3. Upload all files to %VPS_PATH%
    echo.
    echo Method 2: Use FileZilla
    echo   1. Download FileZilla: https://filezilla-project.org
    echo   2. Connect to %VPS_IP% via SFTP
    echo   3. Upload all files to %VPS_PATH%
    echo.
    echo After upload, continue with manual steps in VPS_DEPLOYMENT_GUIDE.md
    pause
    exit /b 1
)
echo.

echo [5/8] Installing dependencies...
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && npm install --production"
echo [OK] Dependencies installed
echo.

echo [6/8] Setting up environment...
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && if [ ! -f .env ]; then cp .env.example .env && SESSION_SECRET=$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\") && sed -i \"s/your-secret-key-here/$SESSION_SECRET/g\" .env && sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env; fi && chmod -R 755 public/uploads db logs"
echo [OK] Environment configured
echo.

echo [7/8] Setting up admin account...
echo Creating admin with default credentials (admin/Admin123)...
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && echo 'yes' | node reset-admin-default.js"
echo [OK] Admin account created
echo.

echo [8/8] Starting application...
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && if ! command -v pm2 ^&^> /dev/null; then npm install -g pm2; fi && pm2 stop streamflow 2^>^&1 ^|^| true && pm2 start app.js --name streamflow && pm2 save"
echo [OK] Application started
echo.

echo ==========================================
echo   Deployment Complete!
echo ==========================================
echo.
echo Application URL:
echo   http://%VPS_IP%:7575
echo.
echo Default Login:
echo   Username: admin
echo   Password: Admin123
echo.
echo WARNING: Change the default password after first login!
echo.
echo Useful commands:
echo   Check status:  ssh %VPS_USER%@%VPS_IP% "pm2 status"
echo   View logs:     ssh %VPS_USER%@%VPS_IP% "pm2 logs streamflow"
echo   Restart:       ssh %VPS_USER%@%VPS_IP% "pm2 restart streamflow"
echo.
echo For detailed guide, read: VPS_DEPLOYMENT_GUIDE.md
echo.
pause
