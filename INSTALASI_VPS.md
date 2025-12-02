# 🚀 Panduan Instalasi StreamFlow di VPS

Panduan lengkap instalasi StreamFlow modified by Mas Ozang di VPS Ubuntu/Debian.

## 📋 Persyaratan Sistem

- **OS**: Ubuntu 20.04/22.04 atau Debian 10/11
- **RAM**: Minimal 1GB (Rekomendasi 2GB)
- **CPU**: Minimal 1 Core (Rekomendasi 2 Core)
- **Storage**: Minimal 5GB free space
- **Port**: 7575 (atau custom sesuai kebutuhan)
- **Akses**: SSH root atau sudo access

## ⚡ Instalasi Otomatis (Recommended)

Jalankan script instalasi otomatis:

```bash
curl -o install.sh https://raw.githubusercontent.com/meteoradja-ytmjk/streamflowozang/main/install.sh && chmod +x install.sh && ./install.sh
```

Script akan otomatis menginstall:
- ✅ Node.js v22
- ✅ FFmpeg
- ✅ Git
- ✅ PM2 Process Manager
- ✅ StreamFlow Application
- ✅ Firewall Configuration

**Setelah instalasi selesai, lanjut ke [Konfigurasi Awal](#-konfigurasi-awal)**

---

## 🔧 Instalasi Manual (Step by Step)

### 1️⃣ Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Install Node.js v22

```bash
# Download dan install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

**Output yang diharapkan:**
```
v22.x.x
10.x.x
```

### 3️⃣ Install FFmpeg

```bash
sudo apt install ffmpeg -y

# Verifikasi instalasi
ffmpeg -version
```

### 4️⃣ Install Git

```bash
sudo apt install git -y

# Verifikasi instalasi
git --version
```

### 5️⃣ Clone Repository

```bash
# Clone dari GitHub
git clone https://github.com/meteoradja-ytmjk/streamflowozang.git

# Masuk ke folder project
cd streamflowozang
```

### 6️⃣ Install Dependencies

```bash
# Install semua package yang diperlukan
npm install
```

**Note:** Proses ini akan memakan waktu 2-5 menit tergantung kecepatan internet.

### 7️⃣ Generate Secret Key

⚠️ **PENTING:** Generate secret key baru untuk keamanan!

```bash
node generate-secret.js
```

Script akan otomatis:
- Generate random secret key
- Update file `.env`
- Menampilkan secret key yang di-generate

### 8️⃣ Konfigurasi Port (Optional)

Jika ingin menggunakan port selain 7575:

```bash
nano .env
```

Edit baris `PORT`:
```env
PORT=7575  # Ganti dengan port yang diinginkan
```

Simpan dengan `Ctrl + X`, lalu `Y`, lalu `Enter`

### 9️⃣ Konfigurasi Firewall

**⚠️ PENTING: Buka port SSH terlebih dahulu!**

```bash
# Buka port SSH (default 22)
sudo ufw allow ssh

# Atau jika menggunakan port custom SSH
# sudo ufw allow 2222

# Buka port aplikasi (default 7575)
sudo ufw allow 7575

# Verifikasi aturan firewall
sudo ufw status verbose

# Aktifkan firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 🔟 Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verifikasi instalasi
pm2 --version
```

### 1️⃣1️⃣ Jalankan Aplikasi

```bash
# Start aplikasi dengan PM2
pm2 start app.js --name streamflow

# Setup auto-restart saat server reboot
pm2 startup
# Ikuti instruksi yang muncul (copy-paste command yang diberikan)

# Save konfigurasi PM2
pm2 save
```

### 1️⃣2️⃣ Verifikasi Aplikasi Berjalan

```bash
# Check status aplikasi
pm2 status

# Lihat logs
pm2 logs streamflow

# Monitor resource usage
pm2 monit
```

---

## 🎯 Konfigurasi Awal

### 1. Akses Aplikasi

Buka browser dan akses:
```
http://IP_VPS_ANDA:7575
```

Contoh: `http://103.123.45.67:7575`

### 2. Setup Admin Account

Saat pertama kali akses, Anda akan diminta membuat akun admin:

1. Klik **"Sign Up"**
2. Isi form:
   - **Username**: admin (atau username pilihan Anda)
   - **Email**: admin@example.com
   - **Password**: Password yang kuat (min 8 karakter)
3. Klik **"Create Account"**
4. Login dengan kredensial yang baru dibuat

### 3. Konfigurasi Timezone

Untuk memastikan scheduled streaming akurat:

```bash
# Cek timezone saat ini
timedatectl status

# Lihat daftar timezone
timedatectl list-timezones | grep Asia

# Set timezone ke WIB (Jakarta)
sudo timedatectl set-timezone Asia/Jakarta

# Restart aplikasi
pm2 restart streamflow
```

---

## 📺 Cara Menggunakan

### Upload Video

1. Login ke dashboard
2. Klik menu **"Gallery"**
3. Klik tombol **"Upload Video"**
4. Pilih file video dari komputer
5. Tunggu proses upload selesai

### Buat Stream Baru

1. Klik menu **"Dashboard"**
2. Klik tombol **"New Stream"**
3. Isi form:
   - **Select Video**: Pilih video dari gallery
   - **Stream Title**: Judul stream
   - **RTMP URL**: URL platform streaming (YouTube/Facebook/dll)
   - **Stream Key**: Stream key dari platform
4. Klik **"Create Stream"**

### Jadwalkan Stream

1. Saat membuat stream, aktifkan **"Recurring Schedule"**
2. Pilih tipe schedule:
   - **Daily**: Stream setiap hari
   - **Weekly**: Stream di hari tertentu
3. Set waktu mulai dan durasi
4. Klik **"Create Stream"**

---

## 🛠️ Perintah PM2 Berguna

```bash
# Lihat status semua aplikasi
pm2 status

# Restart aplikasi
pm2 restart streamflow

# Stop aplikasi
pm2 stop streamflow

# Start aplikasi
pm2 start streamflow

# Hapus aplikasi dari PM2
pm2 delete streamflow

# Lihat logs real-time
pm2 logs streamflow

# Lihat logs dengan filter
pm2 logs streamflow --lines 100

# Monitor CPU & Memory
pm2 monit

# Flush logs
pm2 flush

# Save konfigurasi
pm2 save

# Reload aplikasi (zero-downtime)
pm2 reload streamflow
```

---

## 🔐 Reset Password

Jika lupa password admin:

```bash
cd streamflowozang
node reset-password.js
```

Ikuti instruksi untuk reset password.

---

## 🔄 Update Aplikasi

Jika ada update dari repository:

```bash
# Masuk ke folder aplikasi
cd streamflowozang

# Pull update terbaru
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Restart aplikasi
pm2 restart streamflow
```

---

## 🐛 Troubleshooting

### Aplikasi Tidak Bisa Diakses

**Cek status aplikasi:**
```bash
pm2 status
```

**Cek logs untuk error:**
```bash
pm2 logs streamflow --lines 50
```

**Restart aplikasi:**
```bash
pm2 restart streamflow
```

### Port Already in Use

**Cek proses yang menggunakan port:**
```bash
sudo lsof -i :7575
```

**Kill proses jika diperlukan:**
```bash
sudo kill -9 <PID>
```

### Permission Error

**Fix permission untuk folder uploads:**
```bash
cd streamflowozang
chmod -R 755 public/uploads/
```

### Database Error

**Reset database (⚠️ akan menghapus semua data):**
```bash
cd streamflowozang
rm db/*.db
pm2 restart streamflow
```

### FFmpeg Not Found

**Install ulang FFmpeg:**
```bash
sudo apt update
sudo apt install ffmpeg -y
ffmpeg -version
```

### Node.js Version Error

**Update Node.js ke versi terbaru:**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

### Memory Issues

**Increase PM2 memory limit:**
```bash
pm2 delete streamflow
pm2 start app.js --name streamflow --max-memory-restart 1G
pm2 save
```

### Firewall Blocking

**Check firewall status:**
```bash
sudo ufw status
```

**Allow port:**
```bash
sudo ufw allow 7575
```

---

## 📊 Monitoring & Maintenance

### Check Resource Usage

```bash
# CPU & Memory usage
pm2 monit

# Detailed info
pm2 show streamflow

# System resources
htop
```

### Backup Database

```bash
# Backup database
cd streamflowozang
cp -r db/ db_backup_$(date +%Y%m%d)/

# Backup uploads
cp -r public/uploads/ uploads_backup_$(date +%Y%m%d)/
```

### Clean Logs

```bash
# Clear PM2 logs
pm2 flush

# Clear application logs
cd streamflowozang
rm logs/*.log
```

### Auto Backup Script

Buat script backup otomatis:

```bash
nano backup.sh
```

Isi dengan:
```bash
#!/bin/bash
cd /path/to/streamflowozang
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz db/ public/uploads/
echo "Backup completed: backup_$DATE.tar.gz"
```

Jadwalkan dengan cron:
```bash
crontab -e
```

Tambahkan:
```
0 2 * * * /path/to/backup.sh
```

---

## 🔒 Keamanan

### Update Sistem Secara Berkala

```bash
sudo apt update && sudo apt upgrade -y
```

### Ganti Default Port

Edit `.env`:
```bash
nano .env
```

Ganti port:
```env
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

### Gunakan Password Kuat

- Minimal 12 karakter
- Kombinasi huruf besar, kecil, angka, dan simbol
- Jangan gunakan password yang sama untuk semua akun

### Enable HTTPS (Recommended)

Gunakan Nginx sebagai reverse proxy dengan SSL:

```bash
# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Setup SSL
sudo certbot --nginx -d yourdomain.com
```

---

## 📞 Support & Bantuan

### Repository
- **GitHub**: https://github.com/meteoradja-ytmjk/streamflowozang
- **Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues

### Original Creator
- **YouTube**: [@bangtutorial](https://youtube.com/@bangtutorial)
- **GitHub**: [bangtutorial/streamflow](https://github.com/bangtutorial/streamflow)

### Modified By
- **Mas Ozang**

---

## 📄 License

MIT License - © 2025 Bang Tutorial | Modified by Mas Ozang

---

## ✅ Checklist Instalasi

- [ ] Update sistem
- [ ] Install Node.js v22
- [ ] Install FFmpeg
- [ ] Install Git
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Generate secret key (`node generate-secret.js`)
- [ ] Konfigurasi firewall
- [ ] Install PM2
- [ ] Start aplikasi dengan PM2
- [ ] Setup PM2 auto-restart
- [ ] Akses aplikasi di browser
- [ ] Buat akun admin
- [ ] Set timezone
- [ ] Upload video test
- [ ] Buat stream test

---

**Selamat! StreamFlow sudah siap digunakan di VPS Anda!** 🎉

Jika ada pertanyaan atau masalah, silakan buka issue di GitHub repository.
