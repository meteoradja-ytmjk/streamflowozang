# ✅ Deployment Checklist - StreamFlow

## Pre-Deployment (Sebelum Push ke GitHub)

- [x] File `.env` berisi placeholder secret (bukan secret asli)
- [x] File `.env` ada di `.gitignore`
- [x] File `.gitignore` sudah lengkap
- [x] Database files (*.db) tidak di-track git
- [x] node_modules tidak di-track git
- [x] Upload files tidak di-track git
- [x] Semua folder penting punya `.gitkeep`
- [x] File `ecosystem.config.js` sudah ada
- [x] File `install.sh` sudah ada dan executable
- [x] File `health-check.js` sudah ada
- [x] File `start.sh` sudah ada
- [x] Dokumentasi lengkap (README, INSTALASI_VPS, DEPLOYMENT)
- [x] package.json scripts sudah lengkap

## Deployment ke VPS

### 1. Persiapan VPS
- [ ] VPS sudah siap (Ubuntu/Debian)
- [ ] Akses SSH tersedia
- [ ] Port 7575 available
- [ ] Minimal 1GB RAM, 1 Core CPU, 10GB Storage

### 2. Instalasi Otomatis
```bash
curl -o install.sh https://raw.githubusercontent.com/meteoradja-ytmjk/streamflowozang/main/install.sh && chmod +x install.sh && ./install.sh
```

### 3. Verifikasi Instalasi
- [ ] Node.js v18+ terinstall
- [ ] FFmpeg terinstall
- [ ] Dependencies terinstall (npm install)
- [ ] .env file ada dan SESSION_SECRET sudah di-generate
- [ ] Semua folder required ada (db, logs, uploads)
- [ ] Firewall configured (SSH + port 7575)
- [ ] PM2 terinstall
- [ ] Aplikasi running di PM2
- [ ] PM2 auto-restart configured

### 4. Testing
- [ ] Aplikasi bisa diakses di browser
- [ ] Bisa buat akun admin
- [ ] Bisa login
- [ ] Bisa upload video
- [ ] Bisa buat stream
- [ ] Stream bisa start/stop
- [ ] Logs tidak ada error

### 5. Post-Deployment
- [ ] Timezone sudah di-set (Asia/Jakarta)
- [ ] Backup strategy sudah di-setup
- [ ] Monitoring sudah aktif
- [ ] Documentation sudah dibaca

## Perintah Verifikasi

```bash
# Health check
node health-check.js

# Post-deployment check
bash post-deploy-check.sh

# Check PM2 status
pm2 status

# Check logs
pm2 logs streamflow --lines 50

# Check firewall
sudo ufw status

# Check port
netstat -tuln | grep 7575

# Check disk space
df -h

# Check memory
free -h
```

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Port already in use | `sudo lsof -i :7575` then `sudo kill -9 <PID>` |
| FFmpeg not found | `sudo apt install ffmpeg -y` |
| Permission error | `chmod -R 755 public/uploads/ db/ logs/` |
| Database error | Check `db/streamflow.db` exists and has correct permissions |
| Can't access app | Check firewall: `sudo ufw allow 7575` |
| PM2 not starting | Check logs: `pm2 logs streamflow` |
| Out of memory | Increase PM2 limit in `ecosystem.config.js` |

## Security Checklist

- [ ] SESSION_SECRET di-generate dengan `node generate-secret.js`
- [ ] Firewall aktif dan configured
- [ ] SSH port secured (jika custom)
- [ ] Strong admin password (min 8 char, uppercase, lowercase, number)
- [ ] HTTPS setup (optional tapi recommended)
- [ ] Regular backups configured
- [ ] Logs rotation configured

## Maintenance Schedule

### Daily
- [ ] Check PM2 status
- [ ] Check disk space
- [ ] Check logs for errors

### Weekly
- [ ] Review system resources
- [ ] Clean old logs
- [ ] Check for updates

### Monthly
- [ ] Full backup (database + uploads)
- [ ] Update dependencies
- [ ] Security audit

## Emergency Contacts

- **GitHub Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues
- **Documentation**: https://github.com/meteoradja-ytmjk/streamflowozang

## Quick Commands Reference

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop streamflow

# Restart
pm2 restart streamflow

# Logs
pm2 logs streamflow

# Monitor
pm2 monit

# Status
pm2 status

# Health check
node health-check.js

# Reset password
node reset-password.js

# Update app
git pull && npm install && pm2 restart streamflow

# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz db/ public/uploads/ .env
```

---

## Status: ✅ READY FOR DEPLOYMENT

Aplikasi sudah siap untuk di-deploy ke VPS!

Modified by Mas Ozang | Original by Bang Tutorial
