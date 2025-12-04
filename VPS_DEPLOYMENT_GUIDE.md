# 🚀 Panduan Deploy ke VPS - StreamFlow

## 📋 Informasi VPS
- **IP Address:** 103.31.204.105
- **OS:** Linux (Ubuntu/Debian recommended)
- **Port:** 7575 (default) atau custom

---

## ✅ Pre-Deployment Checklist

### 1. Persiapan Lokal
- [x] Semua perubahan sudah di-commit
- [ ] Test lokal sudah berhasil
- [ ] Database backup sudah dibuat
- [ ] File .env sudah dikonfigurasi

### 2. Persiapan VPS
- [ ] SSH access ke VPS
- [ ] Node.js terinstall (v14+ recommended)
- [ ] PM2 terinstall (untuk process manager)
- [ ] Nginx terinstall (untuk reverse proxy)
- [ ] Firewall dikonfigurasi

---

## 🔧 Step 1: Koneksi ke VPS

```bash
# Koneksi SSH ke VPS
ssh root@103.31.204.105

# Atau dengan user lain
ssh username@103.31.204.105
```

---

## 📦 Step 2: Install Dependencies di VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (jika belum)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Git (jika belum)
sudo apt install -y git

# Install Nginx (optional, untuk reverse proxy)
sudo apt install -y nginx
```

---

## 📁 Step 3: Upload Project ke VPS

### Opsi A: Menggunakan Git (Recommended)

```bash
# Di VPS, buat folder untuk aplikasi
cd /var/www
sudo mkdir streamflow
sudo chown -R $USER:$USER streamflow
cd streamflow

# Clone repository (jika ada)
git clone https://github.com/your-repo/streamflow.git .

# Atau init git dan push dari lokal
git init
git remote add origin https://github.com/your-repo/streamflow.git
```

### Opsi B: Menggunakan SCP (Upload Manual)

```bash
# Di komputer lokal (Windows PowerShell)
# Compress project terlebih dahulu
tar -czf streamflow.tar.gz streamflow-main/

# Upload ke VPS
scp streamflow.tar.gz root@103.31.204.105:/var/www/

# Di VPS, extract
cd /var/www
tar -xzf streamflow.tar.gz
mv streamflow-main streamflow
cd streamflow
```

### Opsi C: Menggunakan SFTP (FileZilla/WinSCP)

1. Buka FileZilla atau WinSCP
2. Connect ke: 103.31.204.105
3. Upload folder `streamflow-main` ke `/var/www/streamflow`

---

## ⚙️ Step 4: Konfigurasi Environment

```bash
# Di VPS, masuk ke folder project
cd /var/www/streamflow

# Copy .env.example ke .env
cp .env.example .env

# Edit .env
nano .env
```

**Konfigurasi .env untuk Production:**

```env
# Application
NODE_ENV=production
PORT=7575

# Session Secret (GANTI dengan random string yang kuat!)
SESSION_SECRET=your-super-secret-random-string-here-change-this

# Database (default SQLite, sudah OK)
# Tidak perlu diubah jika menggunakan SQLite

# Optional: Domain
DOMAIN=103.31.204.105
# Atau jika punya domain:
# DOMAIN=streamflow.yourdomain.com
```

**Generate Session Secret yang Kuat:**

```bash
# Di VPS
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy hasil output dan paste ke SESSION_SECRET di .env

---

## 📦 Step 5: Install Dependencies & Setup

```bash
# Install npm packages
npm install

# Buat folder yang diperlukan
mkdir -p db logs public/uploads/videos public/uploads/audios public/uploads/avatars public/uploads/thumbnails

# Set permissions
chmod -R 755 public/uploads
chmod -R 755 db
chmod -R 755 logs

# Setup admin dengan default credentials
node reset-admin-default.js
# Ketik: yes
```

---

## 🚀 Step 6: Start Aplikasi dengan PM2

```bash
# Start aplikasi dengan PM2
pm2 start app.js --name streamflow

# Atau gunakan ecosystem file (recommended)
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup (auto-start on reboot)
pm2 startup
# Copy dan jalankan command yang muncul

# Check status
pm2 status

# View logs
pm2 logs streamflow
```

---

## 🌐 Step 7: Konfigurasi Firewall

```bash
# Allow port 7575
sudo ufw allow 7575/tcp

# Allow SSH (PENTING!)
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS (jika pakai Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🔒 Step 8: Setup Nginx Reverse Proxy (Optional tapi Recommended)

```bash
# Buat Nginx config
sudo nano /etc/nginx/sites-available/streamflow
```

**Paste konfigurasi ini:**

```nginx
server {
    listen 80;
    server_name 103.31.204.105;
    # Atau jika punya domain:
    # server_name streamflow.yourdomain.com;

    client_max_body_size 10G;

    location / {
        proxy_pass http://localhost:7575;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout untuk upload video besar
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Static files
    location /uploads/ {
        alias /var/www/streamflow/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site dan restart Nginx:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/streamflow /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

---

## 🔐 Step 9: Setup SSL dengan Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan SSL certificate (jika punya domain)
sudo certbot --nginx -d streamflow.yourdomain.com

# Auto-renewal sudah disetup otomatis
# Test renewal
sudo certbot renew --dry-run
```

---

## ✅ Step 10: Verifikasi Deployment

### Test dari Browser

1. **Tanpa Nginx (Direct):**
   ```
   http://103.31.204.105:7575
   ```

2. **Dengan Nginx:**
   ```
   http://103.31.204.105
   ```

3. **Login dengan Default Credentials:**
   - Username: `admin`
   - Password: `Admin123`

### Test dari Command Line

```bash
# Test dari VPS
curl http://localhost:7575

# Test dari luar
curl http://103.31.204.105:7575
```

---

## 📊 Step 11: Monitoring & Maintenance

### PM2 Commands

```bash
# Status aplikasi
pm2 status

# View logs
pm2 logs streamflow

# Restart aplikasi
pm2 restart streamflow

# Stop aplikasi
pm2 stop streamflow

# Start aplikasi
pm2 start streamflow

# View detailed info
pm2 info streamflow

# Monitor resources
pm2 monit
```

### Check Logs

```bash
# Application logs
pm2 logs streamflow --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Database Backup

```bash
# Backup database
cd /var/www/streamflow
cp db/streamflow.db db/streamflow.db.backup-$(date +%Y%m%d-%H%M%S)

# Automated backup (crontab)
crontab -e

# Add this line untuk backup setiap hari jam 2 pagi
0 2 * * * cd /var/www/streamflow && cp db/streamflow.db db/streamflow.db.backup-$(date +\%Y\%m\%d)
```

---

## 🔄 Step 12: Update Aplikasi (Future Updates)

```bash
# Koneksi ke VPS
ssh root@103.31.204.105

# Masuk ke folder project
cd /var/www/streamflow

# Backup database
cp db/streamflow.db db/streamflow.db.backup-$(date +%Y%m%d-%H%M%S)

# Pull latest changes (jika pakai Git)
git pull origin main

# Atau upload file baru via SCP/SFTP

# Install dependencies (jika ada perubahan)
npm install

# Restart aplikasi
pm2 restart streamflow

# Check logs
pm2 logs streamflow
```

---

## 🚨 Troubleshooting

### Aplikasi tidak bisa diakses

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs streamflow

# Check port
sudo netstat -tulpn | grep 7575

# Check firewall
sudo ufw status

# Restart aplikasi
pm2 restart streamflow
```

### Error "Cannot find module"

```bash
# Install dependencies
cd /var/www/streamflow
npm install

# Restart
pm2 restart streamflow
```

### Database error

```bash
# Check database file
ls -la db/streamflow.db

# Check permissions
chmod 644 db/streamflow.db
chmod 755 db/

# Reset database (HATI-HATI: hapus semua data!)
node reset-complete-fresh.js
```

### Nginx error

```bash
# Test config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port sudah digunakan

```bash
# Check apa yang menggunakan port 7575
sudo lsof -i :7575

# Kill process
sudo kill -9 <PID>

# Atau ubah port di .env
nano .env
# Ubah PORT=7575 ke PORT=8080 (atau port lain)

# Restart aplikasi
pm2 restart streamflow
```

---

## 🔒 Security Best Practices

### 1. Ganti Default Credentials

```bash
# Login ke aplikasi
# Buka: http://103.31.204.105
# Login: admin / Admin123
# Pergi ke Settings
# Ganti password
```

### 2. Setup Firewall dengan Benar

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3. Disable Root Login (Recommended)

```bash
# Buat user baru
sudo adduser streamflow
sudo usermod -aG sudo streamflow

# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Ubah:
PermitRootLogin no
PasswordAuthentication no  # Jika pakai SSH key

# Restart SSH
sudo systemctl restart sshd
```

### 4. Setup Fail2Ban

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Enable
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📝 Quick Commands Cheat Sheet

```bash
# Start aplikasi
pm2 start streamflow

# Stop aplikasi
pm2 stop streamflow

# Restart aplikasi
pm2 restart streamflow

# View logs
pm2 logs streamflow

# Status
pm2 status

# Backup database
cp db/streamflow.db db/streamflow.db.backup-$(date +%Y%m%d)

# Reset admin
node reset-admin-default.js

# Update aplikasi
git pull && npm install && pm2 restart streamflow
```

---

## 📞 Support

Jika ada masalah:
1. Check PM2 logs: `pm2 logs streamflow`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check firewall: `sudo ufw status`
4. Restart aplikasi: `pm2 restart streamflow`

---

## ✅ Deployment Checklist

- [ ] SSH ke VPS berhasil
- [ ] Node.js & PM2 terinstall
- [ ] Project di-upload ke VPS
- [ ] .env dikonfigurasi dengan benar
- [ ] SESSION_SECRET diganti
- [ ] npm install berhasil
- [ ] Admin default dibuat
- [ ] PM2 start berhasil
- [ ] Firewall dikonfigurasi
- [ ] Nginx dikonfigurasi (optional)
- [ ] Aplikasi bisa diakses dari browser
- [ ] Login dengan admin/Admin123 berhasil
- [ ] Password default sudah diganti
- [ ] PM2 startup dikonfigurasi
- [ ] Database backup schedule disetup

---

**Status:** Ready for Deployment ✅  
**Date:** 4 Desember 2024  
**VPS IP:** 103.31.204.105
