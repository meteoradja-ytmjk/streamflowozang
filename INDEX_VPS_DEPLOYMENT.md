# 📚 Index VPS Deployment - StreamFlow

## 🎯 VPS Information
- **IP Address:** 103.31.204.105
- **Default Port:** 7575
- **Default Path:** /var/www/streamflow

---

## 🚀 Quick Start - Pilih Metode Anda

### Metode 1: Automated Script (RECOMMENDED)

**Windows:**
```bash
deploy-to-vps.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

**Waktu:** 5-10 menit  
**Kesulitan:** ⭐ Easy

---

### Metode 2: Manual dengan WinSCP/FileZilla

1. Baca: **VPS_DEPLOYMENT_GUIDE.md** (Section: Manual Upload)
2. Download WinSCP: https://winscp.net
3. Upload files ke VPS
4. SSH dan setup

**Waktu:** 15-20 menit  
**Kesulitan:** ⭐⭐ Medium

---

### Metode 3: Git Clone

1. Baca: **VPS_DEPLOYMENT_GUIDE.md** (Section: Git Clone)
2. Push code ke GitHub/GitLab
3. SSH ke VPS dan clone
4. Setup dan start

**Waktu:** 10-15 menit  
**Kesulitan:** ⭐⭐ Medium

---

## 📁 File Deployment yang Tersedia

### 🔧 Scripts (2 files)

1. **deploy-to-vps.sh**
   - Automated deployment untuk Linux/Mac
   - Upload, install, setup, start - semua otomatis
   - Usage: `./deploy-to-vps.sh`

2. **deploy-to-vps.bat**
   - Automated deployment untuk Windows
   - Upload, install, setup, start - semua otomatis
   - Usage: Double-click atau `deploy-to-vps.bat`

---

### 📚 Dokumentasi (5 files)

1. **VPS_DEPLOYMENT_GUIDE.md** ⭐⭐⭐ MOST IMPORTANT
   - Panduan lengkap deployment step-by-step
   - 3 metode deployment
   - Install dependencies
   - Konfigurasi environment
   - Setup PM2
   - Setup Nginx (optional)
   - Setup SSL (optional)
   - Troubleshooting lengkap
   - Security best practices
   - Monitoring & maintenance

2. **VPS_QUICK_START.txt**
   - Quick reference untuk deployment
   - Commands cheat sheet
   - URLs dan credentials
   - Troubleshooting singkat
   - Tools yang dibutuhkan

3. **PRE_DEPLOYMENT_CHECK.md**
   - Checklist sebelum deploy
   - Test koneksi VPS
   - Check requirements
   - Setup VPS (jika belum)
   - Pilih metode deployment
   - Common issues & solutions

4. **DEPLOYMENT_SUMMARY.txt**
   - Summary singkat deployment
   - 3 metode deployment
   - Default credentials
   - URLs akses
   - Commands penting
   - Troubleshooting quick tips

5. **INDEX_VPS_DEPLOYMENT.md** (file ini)
   - Index semua file deployment
   - Panduan memilih file yang tepat
   - Flow deployment

---

## 📖 Cara Menggunakan Dokumentasi

### Untuk Pemula (Belum Pernah Deploy)

1. **Baca:** DEPLOYMENT_SUMMARY.txt
   - Pahami overview deployment
   - Pilih metode yang cocok

2. **Baca:** PRE_DEPLOYMENT_CHECK.md
   - Check requirements
   - Test koneksi VPS
   - Setup VPS jika belum

3. **Baca:** VPS_DEPLOYMENT_GUIDE.md
   - Follow step-by-step guide
   - Pilih metode yang sudah dipilih
   - Deploy!

4. **Gunakan:** VPS_QUICK_START.txt
   - Quick reference saat deploy
   - Commands yang sering dipakai

---

### Untuk Yang Sudah Berpengalaman

1. **Baca:** DEPLOYMENT_SUMMARY.txt (2 menit)
2. **Jalankan:** deploy-to-vps.bat atau deploy-to-vps.sh
3. **Reference:** VPS_QUICK_START.txt (jika butuh)

---

### Untuk Troubleshooting

1. **Check:** VPS_DEPLOYMENT_GUIDE.md (Section: Troubleshooting)
2. **Check:** VPS_QUICK_START.txt (Section: Troubleshooting)
3. **Check:** PM2 logs: `pm2 logs streamflow`

---

## 🎯 Deployment Flow

```
START
  │
  ├─→ Baca DEPLOYMENT_SUMMARY.txt
  │   (Pahami overview)
  │
  ├─→ Baca PRE_DEPLOYMENT_CHECK.md
  │   (Check requirements & test VPS)
  │
  ├─→ Pilih Metode:
  │   │
  │   ├─→ Automated Script?
  │   │   └─→ Jalankan deploy-to-vps.bat/sh
  │   │
  │   ├─→ Manual Upload?
  │   │   └─→ Follow VPS_DEPLOYMENT_GUIDE.md
  │   │
  │   └─→ Git Clone?
  │       └─→ Follow VPS_DEPLOYMENT_GUIDE.md
  │
  ├─→ Deploy!
  │
  ├─→ Verify:
  │   - http://103.31.204.105:7575
  │   - Login: admin/Admin123
  │
  ├─→ Post-Deployment:
  │   - Ganti password
  │   - Test upload
  │   - Test streaming
  │
  └─→ DONE! ✅
```

---

## 📋 Checklist Deployment

### Pre-Deployment
- [ ] Baca DEPLOYMENT_SUMMARY.txt
- [ ] Baca PRE_DEPLOYMENT_CHECK.md
- [ ] Test SSH ke VPS
- [ ] Check Node.js terinstall
- [ ] Check port 7575 available
- [ ] Pilih metode deployment

### Deployment
- [ ] Upload/Clone files
- [ ] Install dependencies
- [ ] Configure .env
- [ ] Create admin
- [ ] Start PM2
- [ ] Configure firewall

### Post-Deployment
- [ ] Test akses aplikasi
- [ ] Login berhasil
- [ ] Ganti password
- [ ] Test upload video
- [ ] Test streaming
- [ ] Setup backup

---

## 🔐 Default Credentials

```
Username: admin
Password: Admin123
```

⚠️ **WAJIB GANTI** setelah login pertama!

---

## 🌐 URLs Akses

```
Aplikasi:  http://103.31.204.105:7575
Login:     http://103.31.204.105:7575/login
Dashboard: http://103.31.204.105:7575/dashboard
Settings:  http://103.31.204.105:7575/settings
```

---

## 🔧 Commands Penting

```bash
# SSH ke VPS
ssh root@103.31.204.105

# Check status
pm2 status

# View logs
pm2 logs streamflow

# Restart
pm2 restart streamflow

# Stop
pm2 stop streamflow

# Start
pm2 start streamflow
```

---

## 🚨 Troubleshooting Quick Tips

### Tidak bisa SSH
```bash
# Test koneksi
ping 103.31.204.105

# Check firewall
sudo ufw status

# Try PuTTY (Windows)
```

### Tidak bisa akses aplikasi
```bash
# Check PM2
pm2 status

# Check logs
pm2 logs streamflow

# Check port
sudo netstat -tulpn | grep 7575

# Restart
pm2 restart streamflow
```

### Error saat deploy
```bash
# Check logs
pm2 logs streamflow --lines 100

# Restart
pm2 restart streamflow

# Reset admin
node reset-admin-default.js
```

---

## 📚 Dokumentasi Terkait

### Login System
- **LOGIN_GUIDE.md** - Panduan sistem login
- **PERUBAHAN_LOGIN.md** - Detail perubahan login
- **ADMIN_DEFAULT_CREDENTIALS.txt** - Quick reference credentials

### General
- **QUICK_COMMANDS.txt** - Command reference
- **README_LOGIN_UPDATE.txt** - Update summary
- **DEPLOYMENT_CHECKLIST_LOGIN.md** - Checklist deployment login

---

## 🎓 Learning Path

### Level 1: Beginner
1. DEPLOYMENT_SUMMARY.txt (5 min)
2. VPS_QUICK_START.txt (10 min)
3. Deploy dengan automated script (10 min)

**Total:** 25 menit

---

### Level 2: Intermediate
1. PRE_DEPLOYMENT_CHECK.md (15 min)
2. VPS_DEPLOYMENT_GUIDE.md (30 min)
3. Deploy dengan manual method (20 min)

**Total:** 65 menit

---

### Level 3: Advanced
1. VPS_DEPLOYMENT_GUIDE.md (full) (60 min)
2. Setup Nginx reverse proxy (30 min)
3. Setup SSL/HTTPS (30 min)
4. Security hardening (30 min)

**Total:** 150 menit

---

## 🎯 Recommended Reading Order

### First Time Deployment
1. **DEPLOYMENT_SUMMARY.txt** - Overview
2. **PRE_DEPLOYMENT_CHECK.md** - Requirements
3. **VPS_DEPLOYMENT_GUIDE.md** - Step-by-step
4. **VPS_QUICK_START.txt** - Quick reference

### Quick Deployment (Experienced)
1. **DEPLOYMENT_SUMMARY.txt** - Quick overview
2. Run: **deploy-to-vps.bat/sh**
3. **VPS_QUICK_START.txt** - Reference

### Troubleshooting
1. **VPS_QUICK_START.txt** - Quick tips
2. **VPS_DEPLOYMENT_GUIDE.md** - Detailed solutions
3. Check logs: `pm2 logs streamflow`

---

## 📊 File Statistics

```
Total Deployment Files: 7 files
  - Scripts: 2 files
  - Documentation: 5 files

Total Size: ~50 KB
Total Reading Time: ~60 minutes (all docs)
Quick Start Time: ~5 minutes (automated)
Manual Deploy Time: ~20 minutes
```

---

## ✅ Status

- **Scripts:** ✅ Ready
- **Documentation:** ✅ Complete
- **Testing:** ✅ Verified
- **VPS:** ✅ Ready (103.31.204.105)

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

### Need Help?

Read: **VPS_DEPLOYMENT_GUIDE.md**

---

**Created:** 4 Desember 2024  
**Version:** 1.0  
**Status:** ✅ READY FOR DEPLOYMENT  
**VPS IP:** 103.31.204.105
