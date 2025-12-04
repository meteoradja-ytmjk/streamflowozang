# 🔧 Troubleshooting: Tidak Bisa Buka Aplikasi

## Aplikasi Sudah Running di VPS

Saya lihat aplikasi sudah berjalan di:
```
http://103.31.204.105:7575
```

## ✅ Langkah-langkah Troubleshooting

### 1. Cek Status Aplikasi di VPS

Login ke VPS via SSH/PuTTY, lalu jalankan:

```bash
pm2 status
```

Pastikan status `streamflow` adalah **online** (hijau).

### 2. Cek Log Aplikasi

```bash
pm2 logs streamflow --lines 50
```

Lihat apakah ada error. Jika ada error, catat pesannya.

### 3. Cek Port 7575

```bash
netstat -tulpn | grep 7575
```

Pastikan port 7575 sedang listening.

### 4. Cek Firewall VPS

Port 7575 harus dibuka di firewall. Jalankan:

```bash
# Untuk UFW (Ubuntu/Debian)
sudo ufw status
sudo ufw allow 7575

# Untuk Firewalld (CentOS/RHEL)
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=7575/tcp
sudo firewall-cmd --reload
```

### 5. Cek Security Group (Cloud Provider)

Jika menggunakan cloud provider (AWS, DigitalOcean, dll):
- Buka dashboard cloud provider
- Cek Security Group / Firewall Rules
- Pastikan port 7575 dibuka untuk inbound traffic
- Source: 0.0.0.0/0 (atau IP Anda)

### 6. Coba Akses dari VPS

Login ke VPS, lalu test:

```bash
curl http://localhost:7575
```

Jika berhasil, berarti aplikasi berjalan tapi firewall/security group yang block.

### 7. Restart Aplikasi

```bash
pm2 restart streamflow
```

### 8. Cek Database

```bash
ls -la db/
```

Pastikan file `streamflow.db` ada dan bisa diakses.

---

## 🌐 Cara Akses yang Benar

### Dari Browser:

1. **Akses via IP Public:**
   ```
   http://103.31.204.105:7575
   ```

2. **Atau via Domain (jika sudah setup):**
   ```
   http://yourdomain.com:7575
   ```

3. **Jika pakai Nginx/Apache (reverse proxy):**
   ```
   http://yourdomain.com
   ```

---

## ❌ Masalah Umum & Solusi

### Masalah 1: "This site can't be reached"

**Penyebab:**
- Firewall VPS block port 7575
- Security Group tidak allow port 7575
- Aplikasi tidak running

**Solusi:**
1. Buka port 7575 di firewall VPS
2. Buka port 7575 di Security Group cloud provider
3. Restart aplikasi: `pm2 restart streamflow`

### Masalah 2: "Connection refused"

**Penyebab:**
- Aplikasi crash atau tidak running
- Port salah

**Solusi:**
1. Cek status: `pm2 status`
2. Cek log: `pm2 logs streamflow`
3. Restart: `pm2 restart streamflow`

### Masalah 3: "ERR_CONNECTION_TIMED_OUT"

**Penyebab:**
- Firewall block
- Security Group block

**Solusi:**
1. Buka port di firewall
2. Buka port di Security Group

### Masalah 4: Halaman Blank / Error 500

**Penyebab:**
- Database error
- File permission error
- Dependency missing

**Solusi:**
1. Cek log: `pm2 logs streamflow --err`
2. Cek database: `ls -la db/`
3. Install dependencies: `npm install`
4. Restart: `pm2 restart streamflow`

---

## 🔍 Debug Mode

Untuk melihat error detail:

```bash
# Stop PM2
pm2 stop streamflow

# Run manual untuk lihat error
cd /path/to/streamflow
node app.js
```

Lihat error yang muncul di terminal.

---

## 📞 Jika Masih Tidak Bisa

### Kirim Info Berikut ke Admin:

1. **Screenshot error di browser**

2. **Output command berikut:**
   ```bash
   pm2 status
   pm2 logs streamflow --lines 50
   netstat -tulpn | grep 7575
   sudo ufw status
   ```

3. **Cloud Provider yang digunakan:**
   - AWS / DigitalOcean / Vultr / dll

4. **Sistem Operasi VPS:**
   ```bash
   cat /etc/os-release
   ```

### Contact:
**WhatsApp**: 089621453431

---

## ✅ Checklist Sebelum Contact Admin

- [ ] Sudah cek `pm2 status` - aplikasi online?
- [ ] Sudah cek `pm2 logs` - ada error?
- [ ] Sudah buka port 7575 di firewall VPS?
- [ ] Sudah buka port 7575 di Security Group?
- [ ] Sudah coba restart: `pm2 restart streamflow`?
- [ ] Sudah coba akses dari VPS: `curl http://localhost:7575`?

---

## 🚀 Quick Fix (Paling Sering Berhasil)

```bash
# 1. Buka port di firewall
sudo ufw allow 7575

# 2. Restart aplikasi
pm2 restart streamflow

# 3. Cek status
pm2 status

# 4. Coba akses lagi di browser
# http://103.31.204.105:7575
```

---

**Semoga berhasil! 🎉**
