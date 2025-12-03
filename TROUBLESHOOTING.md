# 🔧 Troubleshooting Guide

Panduan lengkap mengatasi masalah umum di StreamFlow

---

## 📋 Daftar Isi

1. [Setup & Installation](#setup--installation)
2. [Admin & Authentication](#admin--authentication)
3. [Signup & Login](#signup--login)
4. [Database Issues](#database-issues)
5. [Streaming Problems](#streaming-problems)
6. [Performance Issues](#performance-issues)
7. [Git & GitHub](#git--github)
8. [Server & Deployment](#server--deployment)

---

## 🚀 Setup & Installation

### Cannot Access /setup-account

**Gejala:** Redirect ke /login atau error saat akses /setup-account

**Penyebab:** Sudah ada user di database

**Solusi:**
```bash
# Check database
node fix-setup-account.js

# Option 1: Login dengan user yang ada
# Option 2: Reset password admin
node quick-reset-admin.js

# Option 3: Reset database (HAPUS SEMUA USER)
node reset-database-fresh.js
```

### Error: "Failed to create user"

**Penyebab:** Database sudah ada user atau error database

**Solusi:**
```bash
# Diagnose
node fix-setup-account.js

# Reset database jika perlu
node reset-database-fresh.js

# Restart aplikasi
pm2 restart streamflow
```

### Port 7575 Already in Use

**Solusi:**
```bash
# Check what's using port
netstat -tulpn | grep 7575

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=8080
```

---

## 🔐 Admin & Authentication

### Lupa Password Admin

**Solusi Tercepat:**
```bash
node quick-reset-admin.js
```

**Output:**
```
Username: admin
Password: Admin123456
```

**Ganti password setelah login di menu Settings!**

### Lupa Username Admin

**Solusi:**
```bash
# Check users
node fix-setup-account.js

# Atau reset admin pertama
node quick-reset-admin.js
```

### Cannot Login After Reset

**Solusi:**
```bash
# Restart aplikasi
pm2 restart streamflow

# Clear browser cache
# Ctrl+Shift+Delete

# Try incognito mode
```

### Session Expired Terus

**Penyebab:** SESSION_SECRET tidak di-set atau berubah

**Solusi:**
```bash
# Generate new secret
node generate-secret.js

# Copy ke .env
SESSION_SECRET=<generated-secret>

# Restart
pm2 restart streamflow
```

---

## 👤 Signup & Login

### Signup Error: "An error occurred during registration"

**Solusi:**
```bash
# Fix signup
node fix-signup.js

# Test signup
node test-signup.js

# Restart aplikasi
pm2 restart streamflow
```

### User Tidak Bisa Login Setelah Signup

**Penyebab:** Status user masih `inactive`

**Solusi:**
```bash
# Aktivasi semua user
node activate-all-users.js

# Atau via admin panel
# Login sebagai admin → Users → Activate user
```

### Password Requirements Error

**Untuk Setup Account:**
- Min 8 karakter
- Harus ada huruf kecil (a-z)
- Harus ada huruf BESAR (A-Z)
- Harus ada angka (0-9)

**Contoh valid:** `Admin123456`

**Untuk Signup:**
- Min 6 karakter
- Tidak ada aturan khusus

### Username Already Exists

**Solusi:**
```bash
# Check existing users
node fix-setup-account.js

# Gunakan username lain
# Atau hapus user lama (jika perlu)
node delete-all-users.js
```

---

## 💾 Database Issues

### Database Locked

**Solusi:**
```bash
# Stop aplikasi
pm2 stop streamflow

# Run script
node <your-script>.js

# Start aplikasi
pm2 start streamflow
```

### Database Corrupted

**Solusi:**
```bash
# Backup database
cp db/streamflow.db db/streamflow.db.backup

# Try to fix
sqlite3 db/streamflow.db "PRAGMA integrity_check;"

# If failed, restore from backup
# Or reset database
node reset-database-fresh.js
```

### Missing Columns Error

**Solusi:**
```bash
# Check and fix
node fix-setup-account.js

# Or run migration
node migrate-database.js
```

### Cannot Write to Database

**Solusi:**
```bash
# Check permissions
ls -la db/

# Fix permissions
chmod 644 db/streamflow.db
chmod 755 db/

# Check disk space
df -h
```

---

## 🎥 Streaming Problems

### Stream Not Starting

**Check:**
1. Video file exists and readable
2. RTMP URL and Stream Key correct
3. FFmpeg installed: `ffmpeg -version`
4. Enough disk space: `df -h`
5. Check logs: `pm2 logs streamflow`

**Solusi:**
```bash
# Restart stream
# Via dashboard: Stop → Start

# Check FFmpeg
which ffmpeg

# Install if missing
sudo apt install ffmpeg -y
```

### Stream Keeps Stopping

**Penyebab:**
- Network unstable
- Server resources low
- RTMP server down

**Solusi:**
```bash
# Check resources
node health-check.js

# Check network
ping youtube.com

# Reduce bitrate/resolution
# Via stream settings
```

### Poor Stream Quality

**Solusi:**
1. Increase bitrate (2500-4000 kbps)
2. Check server CPU: `top`
3. Check network: `speedtest-cli`
4. Reduce concurrent streams

### Audio Not Working

**Check:**
1. Audio file exists
2. Audio format supported (MP3, AAC)
3. Volume not 0
4. FFmpeg audio codecs: `ffmpeg -codecs | grep audio`

---

## ⚡ Performance Issues

### High CPU Usage

**Solusi:**
```bash
# Check processes
top

# Reduce concurrent streams
# Lower bitrate/resolution
# Upgrade server specs
```

### High Memory Usage

**Solusi:**
```bash
# Check memory
free -h

# Restart PM2
pm2 restart streamflow

# Clear logs
pm2 flush

# Upgrade RAM if needed
```

### Slow Response

**Check:**
```bash
# System stats
node health-check.js

# Disk space
df -h

# Memory
free -h

# CPU
top
```

**Solusi:**
- Clear old logs
- Delete old videos
- Optimize database
- Upgrade server

### Application Crashes

**Solusi:**
```bash
# Check logs
pm2 logs streamflow --lines 100

# Restart
pm2 restart streamflow

# Check for errors
node health-check.js

# Update dependencies
npm install
```

---

## 🔄 Git & GitHub

### Authentication Failed

**Solusi 1: Personal Access Token**
1. GitHub → Settings → Developer settings
2. Personal access tokens → Generate new
3. Select scope: `repo`
4. Use token as password

**Solusi 2: SSH Key**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Add to GitHub → Settings → SSH Keys
```

### Merge Conflict

**Solusi:**
```bash
# Pull first
git pull origin main

# Resolve conflicts in files
# Look for <<<<<<< markers

# After resolving
git add .
git commit -m "Resolve conflicts"
git push origin main
```

### Large Files Error

**Solusi:**
```bash
# Check file sizes
du -sh *

# Add to .gitignore
echo "large-file.mp4" >> .gitignore

# Remove from git
git rm --cached large-file.mp4

# Commit
git add .gitignore
git commit -m "Remove large file"
git push origin main
```

### Push Rejected

**Solusi:**
```bash
# Pull first
git pull origin main

# Resolve conflicts if any
# Then push
git push origin main

# Or force push (DANGEROUS)
git push -f origin main
```

---

## 🖥️ Server & Deployment

### Cannot SSH to Server

**Check:**
1. Server is running
2. SSH port open (default: 22)
3. Correct IP address
4. Correct username
5. SSH key or password correct

**Solusi:**
```bash
# Test connection
ping <server-ip>

# Try with verbose
ssh -v user@server-ip

# Check SSH service
sudo systemctl status ssh
```

### Firewall Blocking Access

**Solusi:**
```bash
# Check firewall
sudo ufw status

# Allow port
sudo ufw allow 7575

# Allow SSH (IMPORTANT!)
sudo ufw allow ssh

# Enable firewall
sudo ufw enable
```

### PM2 Not Starting

**Solusi:**
```bash
# Check PM2
pm2 list

# Start manually
pm2 start ecosystem.config.js

# Check logs
pm2 logs

# Reinstall PM2
sudo npm install -g pm2
```

### Application Not Accessible

**Check:**
1. Application running: `pm2 list`
2. Port open: `sudo ufw status`
3. Correct IP and port
4. Firewall rules
5. Server firewall (cloud provider)

**Solusi:**
```bash
# Check if app is running
pm2 list

# Check port
netstat -tulpn | grep 7575

# Restart app
pm2 restart streamflow

# Check logs
pm2 logs streamflow
```

### SSL/HTTPS Issues

**Setup Nginx + Let's Encrypt:**
```bash
# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Configure Nginx reverse proxy
# See DEPLOYMENT.md for details
```

---

## 🔍 Diagnostic Commands

### Quick Health Check
```bash
node health-check.js
```

### Database Check
```bash
node check-db.js
node fix-setup-account.js
```

### Signup/Login Check
```bash
node fix-signup.js
node test-signup.js
node quick-login-fix.js
```

### System Check
```bash
# Disk space
df -h

# Memory
free -h

# CPU
top

# Processes
pm2 list

# Logs
pm2 logs streamflow --lines 50
```

---

## 📞 Getting Help

### Before Asking for Help

1. **Check this guide** for your issue
2. **Run diagnostic scripts**
3. **Check logs**: `pm2 logs streamflow`
4. **Try suggested solutions**

### When Reporting Issues

Include:
1. **Error message** (exact text)
2. **Steps to reproduce**
3. **System info** (OS, Node version)
4. **Logs** (relevant parts)
5. **What you've tried**

### Where to Get Help

- **GitHub Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues
- **Documentation**: See [DOCS_INDEX.md](DOCS_INDEX.md)

---

## 💡 Prevention Tips

### Regular Maintenance

```bash
# Weekly
pm2 logs --lines 0  # Clear logs
pm2 restart streamflow  # Restart app

# Monthly
npm update  # Update dependencies
node health-check.js  # Health check

# Backup database
cp db/streamflow.db db/streamflow.db.backup
```

### Best Practices

1. **Backup regularly** - Database and uploads
2. **Monitor resources** - CPU, RAM, disk
3. **Update dependencies** - Security patches
4. **Check logs** - Catch issues early
5. **Test before deploy** - Avoid production issues

### Security

1. **Change default passwords**
2. **Use strong passwords**
3. **Keep system updated**
4. **Use firewall**
5. **Regular backups**

---

## 📚 Related Documentation

- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin management
- [SIGNUP_FIX_GUIDE.md](SIGNUP_FIX_GUIDE.md) - Signup issues
- [LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md) - Login issues
- [GIT_GUIDE.md](GIT_GUIDE.md) - Git problems
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment issues
- [DOCS_INDEX.md](DOCS_INDEX.md) - All documentation

---

**Troubleshooting guide maintained by Mas Ozang**

**Last updated: December 4, 2024**

**Repository:** https://github.com/meteoradja-ytmjk/streamflowozang
