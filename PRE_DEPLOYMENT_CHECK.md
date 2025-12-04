# ✅ Pre-Deployment Checklist - VPS 103.31.204.105

## 📋 Checklist Sebelum Deploy

### 1. Akses VPS
- [ ] Bisa SSH ke VPS: `ssh root@103.31.204.105`
- [ ] Punya password/SSH key untuk akses
- [ ] Koneksi internet stabil

### 2. VPS Requirements
- [ ] OS: Linux (Ubuntu/Debian recommended)
- [ ] RAM: Minimal 1GB (2GB+ recommended)
- [ ] Storage: Minimal 10GB free space
- [ ] Port 7575 available (atau port lain yang free)

### 3. Software di VPS
- [ ] Node.js v14+ terinstall
- [ ] npm terinstall
- [ ] PM2 terinstall (atau akan diinstall otomatis)
- [ ] Git terinstall (optional)

### 4. Persiapan Lokal
- [ ] Semua perubahan sudah di-save
- [ ] Test lokal sudah berhasil
- [ ] File .env.example sudah ada
- [ ] Tidak ada error di aplikasi

### 5. Backup
- [ ] Backup database lokal (jika ada data penting)
- [ ] Backup file konfigurasi
- [ ] Catat credentials yang digunakan

---

## 🔍 Quick Test - Koneksi VPS

### Test 1: SSH Connection
```bash
ssh root@103.31.204.105
```

**Expected:** Bisa login ke VPS

**Jika gagal:**
- Check IP address benar
- Check firewall VPS allow port 22
- Check SSH service running: `systemctl status sshd`

### Test 2: Check Node.js
```bash
ssh root@103.31.204.105 "node --version"
```

**Expected:** v14.0.0 atau lebih tinggi

**Jika belum terinstall:**
```bash
ssh root@103.31.204.105 "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
```

### Test 3: Check Available Space
```bash
ssh root@103.31.204.105 "df -h"
```

**Expected:** Minimal 10GB free space di /var/www

### Test 4: Check Port 7575
```bash
ssh root@103.31.204.105 "sudo netstat -tulpn | grep 7575"
```

**Expected:** Port 7575 tidak digunakan (kosong)

**Jika port digunakan:**
- Gunakan port lain (edit .env nanti)
- Atau stop aplikasi yang menggunakan port tersebut

---

## 🛠️ Setup VPS (Jika Belum)

### Install Node.js
```bash
ssh root@103.31.204.105

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Install PM2
```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

### Install Git (Optional)
```bash
sudo apt install -y git

# Verify
git --version
```

### Setup Firewall
```bash
# Allow SSH (PENTING!)
sudo ufw allow 22/tcp

# Allow aplikasi
sudo ufw allow 7575/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📦 Pilih Metode Deployment

### Metode 1: Automated Script (RECOMMENDED)

**Windows:**
```bash
# Pastikan SSH terinstall
# Settings > Apps > Optional Features > OpenSSH Client

# Jalankan script
deploy-to-vps.bat
```

**Linux/Mac:**
```bash
# Beri permission
chmod +x deploy-to-vps.sh

# Jalankan script
./deploy-to-vps.sh
```

**Kelebihan:**
- ✅ Otomatis semua
- ✅ Cepat (5-10 menit)
- ✅ Tidak perlu manual steps

**Kekurangan:**
- ❌ Butuh SSH dari command line
- ❌ Butuh tar command (Git Bash di Windows)

---

### Metode 2: Manual dengan WinSCP/FileZilla

**Step 1: Upload Files**
1. Download WinSCP: https://winscp.net
2. Connect ke 103.31.204.105
3. Upload semua file ke `/var/www/streamflow`
4. Exclude: node_modules, .git, db/*.db, logs/*, public/uploads/*

**Step 2: SSH ke VPS**
```bash
ssh root@103.31.204.105
cd /var/www/streamflow
```

**Step 3: Install & Setup**
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit SESSION_SECRET

# Create admin
node reset-admin-default.js
# Ketik: yes

# Start aplikasi
pm2 start app.js --name streamflow
pm2 save
pm2 startup
```

**Kelebihan:**
- ✅ Tidak butuh command line di Windows
- ✅ Visual interface (drag & drop)
- ✅ Bisa lihat progress upload

**Kekurangan:**
- ❌ Lebih banyak manual steps
- ❌ Lebih lama (15-20 menit)

---

### Metode 3: Git Clone (Jika Punya Repository)

**Step 1: SSH ke VPS**
```bash
ssh root@103.31.204.105
```

**Step 2: Clone Repository**
```bash
cd /var/www
git clone https://github.com/your-repo/streamflow.git
cd streamflow
```

**Step 3: Install & Setup**
```bash
npm install
cp .env.example .env
nano .env  # Edit SESSION_SECRET
node reset-admin-default.js  # Ketik: yes
pm2 start app.js --name streamflow
pm2 save
pm2 startup
```

**Kelebihan:**
- ✅ Mudah update nanti (git pull)
- ✅ Version control
- ✅ Cepat

**Kekurangan:**
- ❌ Butuh Git repository
- ❌ Butuh push code ke GitHub/GitLab

---

## 🎯 Recommended Deployment Flow

### Untuk Windows Users:

**Jika punya SSH & Git Bash:**
→ Gunakan `deploy-to-vps.bat`

**Jika tidak punya SSH:**
→ Gunakan WinSCP (Metode 2)

### Untuk Linux/Mac Users:

**Jika punya Git repository:**
→ Gunakan Git Clone (Metode 3)

**Jika tidak:**
→ Gunakan `deploy-to-vps.sh`

---

## 📝 Informasi Penting

### Default Credentials
```
Username: admin
Password: Admin123
```

⚠️ **WAJIB GANTI** setelah login pertama!

### URLs
```
Aplikasi:  http://103.31.204.105:7575
Login:     http://103.31.204.105:7575/login
Dashboard: http://103.31.204.105:7575/dashboard
```

### VPS Paths
```
Application: /var/www/streamflow
Database:    /var/www/streamflow/db/streamflow.db
Logs:        /var/www/streamflow/logs/
Uploads:     /var/www/streamflow/public/uploads/
```

### Important Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs streamflow

# Restart
pm2 restart streamflow

# Stop
pm2 stop streamflow
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Cannot SSH to VPS
**Solution:**
- Check VPS IP: `ping 103.31.204.105`
- Check firewall: Port 22 harus terbuka
- Check SSH service: `systemctl status sshd`
- Try different SSH client (PuTTY)

### Issue 2: Port 7575 Already in Use
**Solution:**
```bash
# Check what's using the port
sudo lsof -i :7575

# Kill the process
sudo kill -9 <PID>

# Or use different port
# Edit .env: PORT=8080
```

### Issue 3: Permission Denied
**Solution:**
```bash
# Fix permissions
cd /var/www/streamflow
chmod -R 755 public/uploads
chmod -R 755 db
chmod -R 755 logs
```

### Issue 4: npm install Failed
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use --legacy-peer-deps
npm install --legacy-peer-deps
```

---

## ✅ Final Checklist Before Deploy

- [ ] VPS accessible via SSH
- [ ] Node.js & npm installed on VPS
- [ ] Port 7575 available (or alternative port chosen)
- [ ] Firewall configured (allow 22, 7575)
- [ ] Deployment method chosen
- [ ] Backup created (if updating existing installation)
- [ ] .env.example file exists
- [ ] All local changes saved

---

## 🚀 Ready to Deploy?

### Quick Start:

**Windows:**
```bash
deploy-to-vps.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

### After Deployment:

1. Open: http://103.31.204.105:7575
2. Login: admin / Admin123
3. Change password immediately
4. Test upload video
5. Test streaming

---

## 📚 Documentation

- **VPS_DEPLOYMENT_GUIDE.md** - Detailed deployment guide
- **VPS_QUICK_START.txt** - Quick reference
- **LOGIN_GUIDE.md** - Login system guide
- **QUICK_COMMANDS.txt** - Command reference

---

**Status:** Ready for Deployment ✅  
**VPS IP:** 103.31.204.105  
**Date:** 4 Desember 2024
