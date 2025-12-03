# 🚀 Panduan Deployment StreamFlow ke VPS

Panduan lengkap untuk deploy StreamFlow ke VPS dengan aman dan tanpa error.

## 📋 Persyaratan Minimum

- **OS**: Ubuntu 20.04/22.04 atau Debian 10/11
- **RAM**: 1GB (Rekomendasi: 2GB)
- **CPU**: 1 Core (Rekomendasi: 2 Core)
- **Storage**: 10GB free space
- **Port**: 7575 (atau custom)
- **Akses**: SSH dengan sudo privileges

## ⚡ Instalasi Cepat (Recommended)

```bash
curl -o install.sh https://raw.githubusercontent.com/meteoradja-ytmjk/streamflowozang/main/install.sh && chmod +x install.sh && ./install.sh
```

Script akan otomatis:
- ✅ Install Node.js v22
- ✅ Install FFmpeg & Git
- ✅ Clone repository
- ✅ Install dependencies
- ✅ Generate secret key
- ✅ Setup firewall
- ✅ Install & configure PM2
- ✅ Start aplikasi

## 🔧 Instalasi Manual

### 1. Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js v22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify installation
```

### 3. Install FFmpeg & Git

```bash
sudo apt install ffmpeg git -y
ffmpeg -version  # Verify installation
```

### 4. Clone Repository

```bash
git clone https://github.com/meteoradja-ytmjk/streamflowozang.git
cd streamflowozang
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Konfigurasi Environment

```bash
# Copy .env.example ke .env
cp .env.example .env

# Generate secret key (WAJIB!)
node generate-secret.js
```

### 7. Health Check

```bash
# Jalankan health check untuk memastikan semua OK
node health-check.js
```

### 8. Setup Firewall

```bash
# PENTING: Buka port SSH dulu!
sudo ufw allow ssh

# Buka port aplikasi
sudo ufw allow 7575

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 9. Install PM2

```bash
sudo npm install -g pm2
```

### 10. Start Aplikasi

```bash
# Start dengan PM2
pm2 start ecosystem.config.js

# Setup auto-restart saat server reboot
pm2 startup
# Jalankan command yang muncul (biasanya dimulai dengan sudo)

# Save konfigurasi
pm2 save
```

## 🔍 Verifikasi Instalasi

### Check Status Aplikasi

```bash
pm2 status
```

Output yang diharapkan:
```
┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode        │ ↺       │ status  │ cpu      │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ streamflow   │ fork        │ 0       │ online  │ 0%       │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### Check Logs

```bash
# Real-time logs
pm2 logs streamflow

# Last 100 lines
pm2 logs streamflow --lines 100
```

### Test Akses

```bash
# Get server IP
curl ifconfig.me

# Test dari server
curl http://localhost:7575

# Buka di browser
# http://YOUR_SERVER_IP:7575
```

## 🎯 Setup Awal Aplikasi

1. **Akses aplikasi** di browser: `http://YOUR_SERVER_IP:7575`

2. **Buat akun admin** pertama kali:
   - Username: admin (atau pilihan Anda)
   - Password: Minimal 8 karakter (huruf besar, kecil, angka)

3. **Login** dengan kredensial yang baru dibuat

4. **Upload video** pertama dan test streaming

## 🔐 Keamanan

### 1. Ganti Default Port (Optional)

Edit `.env`:
```bash
nano .env
```

Ubah:
```
PORT=8080  # Atau port lain
```

Update firewall:
```bash
sudo ufw allow 8080
sudo ufw delete allow 7575
```

Restart aplikasi:
```bash
pm2 restart streamflow
```

### 2. Setup HTTPS dengan Nginx (Recommended)

Install Nginx:
```bash
sudo apt install nginx -y
```

Buat konfigurasi:
```bash
sudo nano /etc/nginx/sites-available/streamflow
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:7575;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/streamflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Install SSL dengan Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 3. Firewall Rules

```bash
# Allow HTTP & HTTPS
sudo ufw allow 'Nginx Full'

# Block direct access to app port
sudo ufw delete allow 7575

# Reload
sudo ufw reload
```

## 🛠️ Maintenance

### Update Aplikasi

```bash
cd streamflowozang
git pull origin main
npm install
pm2 restart streamflow
```

### Backup Database

```bash
# Manual backup
cp db/streamflow.db db/streamflow.db.backup-$(date +%Y%m%d)

# Backup dengan uploads
tar -czf backup-$(date +%Y%m%d).tar.gz db/ public/uploads/
```

### Auto Backup Script

Buat file `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/backup/streamflow"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cd /path/to/streamflowozang

tar -czf $BACKUP_DIR/streamflow-$DATE.tar.gz \
  db/ \
  public/uploads/ \
  .env

# Keep only last 7 backups
ls -t $BACKUP_DIR/streamflow-*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup completed: streamflow-$DATE.tar.gz"
```

Setup cron:
```bash
crontab -e
```

Tambahkan:
```
0 2 * * * /path/to/backup.sh
```

### Monitor Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Disk usage
df -h

# Check logs size
du -sh logs/
```

### Clean Logs

```bash
# Clear PM2 logs
pm2 flush

# Clear application logs
rm logs/*.log

# Restart
pm2 restart streamflow
```

## 🐛 Troubleshooting

### Aplikasi Tidak Start

```bash
# Check logs
pm2 logs streamflow --lines 50

# Check health
node health-check.js

# Restart
pm2 restart streamflow
```

### Port Already in Use

```bash
# Find process
sudo lsof -i :7575

# Kill process
sudo kill -9 <PID>

# Restart
pm2 restart streamflow
```

### Database Error

```bash
# Check database file
ls -lh db/streamflow.db

# Check permissions
chmod 644 db/streamflow.db

# Backup and reset (WARNING: deletes all data)
mv db/streamflow.db db/streamflow.db.old
pm2 restart streamflow
```

### FFmpeg Not Found

```bash
# Reinstall FFmpeg
sudo apt update
sudo apt install ffmpeg -y

# Verify
ffmpeg -version

# Restart app
pm2 restart streamflow
```

### Out of Memory

```bash
# Check memory
free -h

# Increase PM2 memory limit
pm2 delete streamflow
pm2 start ecosystem.config.js

# Or edit ecosystem.config.js
# max_memory_restart: '2G'
```

### Permission Errors

```bash
# Fix uploads directory
chmod -R 755 public/uploads/

# Fix database directory
chmod -R 755 db/

# Fix logs directory
chmod -R 755 logs/
```

## 📊 Monitoring

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs streamflow

# Monitor
pm2 monit

# Info
pm2 info streamflow

# Restart
pm2 restart streamflow

# Stop
pm2 stop streamflow

# Delete
pm2 delete streamflow
```

### System Stats

```bash
# CPU & Memory
top

# Disk usage
df -h

# Network
netstat -tulpn | grep 7575
```

## 🔄 Update & Rollback

### Update ke Versi Terbaru

```bash
cd streamflowozang

# Backup dulu
tar -czf backup-before-update.tar.gz db/ public/uploads/ .env

# Pull update
git pull origin main

# Install dependencies
npm install

# Restart
pm2 restart streamflow
```

### Rollback

```bash
# Restore dari backup
tar -xzf backup-before-update.tar.gz

# Atau git reset
git reset --hard HEAD~1

# Restart
pm2 restart streamflow
```

## 📞 Support

- **GitHub**: https://github.com/meteoradja-ytmjk/streamflowozang
- **Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues
- **Original**: [@bangtutorial](https://youtube.com/@bangtutorial)

## ✅ Checklist Deployment

- [ ] Server requirements met (RAM, CPU, Storage)
- [ ] Node.js v18+ installed
- [ ] FFmpeg installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env`)
- [ ] Secret key generated (`node generate-secret.js`)
- [ ] Health check passed (`node health-check.js`)
- [ ] Firewall configured (SSH + App port)
- [ ] PM2 installed and configured
- [ ] Application started (`pm2 start`)
- [ ] Auto-restart configured (`pm2 startup`)
- [ ] Timezone set (`timedatectl`)
- [ ] Admin account created
- [ ] Test upload & streaming
- [ ] Backup strategy implemented
- [ ] Monitoring setup

---

**Selamat! StreamFlow siap digunakan di VPS! 🎉**

Modified by Mas Ozang | Original by Bang Tutorial
