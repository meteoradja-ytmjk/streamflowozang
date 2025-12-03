# StreamFlow - Live Streaming Application

![StreamFlow Logo](https://github.com/user-attachments/assets/50231124-d546-43cb-9cf4-7a06a1dad5bd)

**StreamFlow** adalah aplikasi live streaming yang powerful dan mudah digunakan. Stream ke YouTube, Facebook, Twitch, dan platform lainnya secara bersamaan menggunakan protokol RTMP.

[![GitHub stars](https://img.shields.io/github/stars/meteoradja-ytmjk/streamflowozang?style=social)](https://github.com/meteoradja-ytmjk/streamflowozang)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

---

## 🚀 Quick Start - Deploy ke VPS

### Instalasi Super Cepat (1 Command)

```bash
curl -o install.sh https://raw.githubusercontent.com/meteoradja-ytmjk/streamflowozang/main/install.sh && chmod +x install.sh && ./install.sh
```

Tunggu 5-10 menit, lalu akses: `http://YOUR_SERVER_IP:7575`

**Selesai!** Buat akun admin dan mulai streaming! 🎉

---

## ✨ Fitur Utama

- 🎥 **Multi-Platform Streaming** - Stream ke YouTube, Facebook, Twitch, TikTok, Instagram secara bersamaan
- 📹 **Video Gallery** - Kelola koleksi video dengan mudah
- ☁️ **Google Drive Integration** - Import video langsung dari Google Drive
- ⏰ **Scheduled Streaming** - Jadwalkan stream dengan pengaturan waktu fleksibel
- 🔄 **Recurring Schedule** - Stream otomatis berulang (daily/weekly)
- ⚙️ **Advanced Settings** - Kontrol penuh bitrate, resolusi, FPS, orientasi
- 📊 **Real-time Monitoring** - Dashboard monitoring dengan statistik lengkap
- 🎵 **Audio Overlay** - Tambahkan audio background ke video
- 🗑️ **Backup & Recovery** - Backup otomatis dan restore stream
- 👥 **Multi-User** - User management dengan role admin/member
- 📱 **Responsive UI** - Antarmuka modern yang responsif di semua perangkat

---

## 📋 System Requirements

- **OS**: Ubuntu 20.04/22.04 atau Debian 10/11
- **Node.js**: v18 atau lebih baru
- **RAM**: Minimal 1GB (Rekomendasi: 2GB)
- **CPU**: Minimal 1 Core (Rekomendasi: 2 Core)
- **Storage**: Minimal 10GB free space
- **Port**: 7575 (dapat disesuaikan)
- **FFmpeg**: Untuk video processing

---

## 📚 Dokumentasi Lengkap

| Dokumen | Deskripsi |
|---------|-----------|
| **[QUICK_START.md](QUICK_START.md)** | Panduan cepat instalasi dan penggunaan |
| **[INSTALASI_VPS.md](INSTALASI_VPS.md)** | Panduan instalasi detail di VPS |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Panduan deployment production |

---

## 🛠️ Instalasi Manual

### 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js v22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg & Git
sudo apt install ffmpeg git -y
```

### 2. Clone & Setup

```bash
# Clone repository
git clone https://github.com/meteoradja-ytmjk/streamflowozang.git
cd streamflowozang

# Install dependencies
npm install

# Generate secret key (WAJIB!)
node generate-secret.js

# Health check
node health-check.js
```

### 3. Setup Firewall

```bash
# PENTING: Buka port SSH dulu!
sudo ufw allow ssh

# Buka port aplikasi
sudo ufw allow 7575

# Enable firewall
sudo ufw enable
```

### 4. Start Aplikasi

```bash
# Install PM2
sudo npm install -g pm2

# Start aplikasi
pm2 start ecosystem.config.js

# Setup auto-restart
pm2 startup
pm2 save
```

### 5. Akses Aplikasi

Buka browser: `http://YOUR_SERVER_IP:7575`

---

## 🎯 Cara Penggunaan

### 1. Setup Akun Admin

- Akses aplikasi di browser
- Buat username & password admin
- Login dengan kredensial baru

### 2. Upload Video

- Menu **Gallery** → **Upload Video**
- Pilih file video dari komputer
- Atau import dari Google Drive

### 3. Buat Stream

- Menu **Dashboard** → **New Stream**
- Pilih video dari gallery
- Masukkan RTMP URL & Stream Key
- Atur bitrate, resolusi, FPS
- Klik **Create Stream**

### 4. Jadwalkan Stream

- Saat membuat stream, aktifkan **Schedule**
- Set waktu mulai dan durasi
- Atau buat **Recurring Schedule** untuk stream berulang

---

## 🔧 Perintah Penting

```bash
# Check status aplikasi
pm2 status

# Restart aplikasi
pm2 restart streamflow

# Lihat logs
pm2 logs streamflow

# Monitor resources
pm2 monit

# Reset password user
node reset-password.js

# Update aplikasi
git pull origin main
npm install
pm2 restart streamflow

# Health check
node health-check.js
```

---

## 🔐 Keamanan

### Generate Secret Key Baru

```bash
node generate-secret.js
```

**PENTING:** Selalu generate secret key baru setelah clone repository!

### Setup HTTPS (Recommended)

Gunakan Nginx sebagai reverse proxy dengan SSL certificate dari Let's Encrypt. Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap.

---

## 🐛 Troubleshooting

### Aplikasi tidak bisa diakses

```bash
# Check logs
pm2 logs streamflow

# Check firewall
sudo ufw status

# Restart aplikasi
pm2 restart streamflow
```

### Port sudah digunakan

```bash
# Cari proses yang menggunakan port
sudo lsof -i :7575

# Kill proses
sudo kill -9 <PID>
```

### Database error

```bash
# Check database
ls -lh db/streamflow.db

# Fix permissions
chmod 644 db/streamflow.db
```

### FFmpeg not found

```bash
# Install FFmpeg
sudo apt install ffmpeg -y

# Verify
ffmpeg -version
```

Untuk troubleshooting lengkap, lihat [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📊 Monitoring

### PM2 Dashboard

```bash
pm2 monit
```

### System Stats

Akses di aplikasi: **Dashboard** → **System Stats**

---

## 🔄 Update Aplikasi

```bash
cd streamflowozang
git pull origin main
npm install
pm2 restart streamflow
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

- **GitHub Repository**: https://github.com/meteoradja-ytmjk/streamflowozang
- **Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues
- **Original Creator**: [@bangtutorial](https://youtube.com/@bangtutorial)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🙏 Credits

- **Original Creator**: [Bang Tutorial](https://youtube.com/@bangtutorial)
- **Modified by**: Mas Ozang
- **Built with**: Node.js, Express, SQLite, FFmpeg

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Happy Streaming!** 🎬🚀

Modified by Mas Ozang | Original by Bang Tutorial
