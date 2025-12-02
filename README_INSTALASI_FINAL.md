# ✅ Panduan Instalasi StreamFlow - FINAL

## 🎯 Repository GitHub Anda
**https://github.com/meteoradja-ytmjk/streamflowozang**

---

## 📚 Dokumentasi yang Tersedia

### 1. **INSTALASI_VPS.md** ⭐ (UTAMA)
Panduan lengkap instalasi di VPS dengan:
- ✅ Instalasi otomatis (1 command)
- ✅ Instalasi manual step-by-step
- ✅ Konfigurasi firewall
- ✅ Setup PM2 auto-restart
- ✅ Troubleshooting lengkap
- ✅ Monitoring & maintenance
- ✅ Security best practices

**Link**: https://github.com/meteoradja-ytmjk/streamflowozang/blob/main/INSTALASI_VPS.md

### 2. **README.md**
Dokumentasi utama dengan overview fitur dan quick start

**Link**: https://github.com/meteoradja-ytmjk/streamflowozang/blob/main/README.md

### 3. **INSTALLATION_GUIDE.md**
Panduan instalasi original dari Bang Tutorial

---

## 🚀 Cara Install di VPS (Quick Start)

### Opsi 1: Instalasi Otomatis (Termudah)

```bash
curl -o install.sh https://raw.githubusercontent.com/meteoradja-ytmjk/streamflowozang/main/install.sh && chmod +x install.sh && ./install.sh
```

### Opsi 2: Instalasi Manual

```bash
# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js v22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install FFmpeg & Git
sudo apt install ffmpeg git -y

# 4. Clone repository
git clone https://github.com/meteoradja-ytmjk/streamflowozang.git
cd streamflowozang

# 5. Install dependencies
npm install

# 6. Generate secret key (PENTING!)
node generate-secret.js

# 7. Setup firewall
sudo ufw allow ssh
sudo ufw allow 7575
sudo ufw enable

# 8. Install PM2
sudo npm install -g pm2

# 9. Start aplikasi
pm2 start app.js --name streamflow
pm2 startup
pm2 save

# 10. Akses aplikasi
# http://IP_VPS:7575
```

---

## 📖 Panduan Lengkap

Untuk panduan detail dengan troubleshooting dan tips keamanan, buka:

**📄 [INSTALASI_VPS.md](https://github.com/meteoradja-ytmjk/streamflowozang/blob/main/INSTALASI_VPS.md)**

---

## 🎯 Setelah Instalasi

1. **Akses aplikasi**: `http://IP_VPS:7575`
2. **Buat akun admin**: Sign Up → isi form
3. **Upload video**: Menu Gallery → Upload Video
4. **Buat stream**: Menu Dashboard → New Stream
5. **Set timezone**: `sudo timedatectl set-timezone Asia/Jakarta`

---

## 🔧 Perintah Penting

```bash
# Check status
pm2 status

# Restart aplikasi
pm2 restart streamflow

# Lihat logs
pm2 logs streamflow

# Reset password
node reset-password.js

# Update aplikasi
git pull origin main
npm install
pm2 restart streamflow
```

---

## 📞 Support

- **Repository**: https://github.com/meteoradja-ytmjk/streamflowozang
- **Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues
- **Original**: [@bangtutorial](https://youtube.com/@bangtutorial)

---

## ✅ Checklist Instalasi

- [ ] VPS sudah siap (Ubuntu/Debian)
- [ ] Akses SSH tersedia
- [ ] Port 7575 available
- [ ] Minimal 1GB RAM
- [ ] Jalankan instalasi (otomatis/manual)
- [ ] Generate secret key
- [ ] Setup firewall
- [ ] Start dengan PM2
- [ ] Akses di browser
- [ ] Buat akun admin
- [ ] Test upload video
- [ ] Test create stream

---

**Selamat menggunakan StreamFlow!** 🎉

Modified by Mas Ozang | Original by Bang Tutorial
