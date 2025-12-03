# 🔐 Admin Management Guide

## 📋 Daftar Isi
1. [Setup Admin Pertama Kali](#setup-admin-pertama-kali)
2. [Reset Password Admin](#reset-password-admin)
3. [Reset Database (Hapus Semua User)](#reset-database)
4. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Admin Pertama Kali

### Kapan Digunakan?
- Saat pertama kali install aplikasi
- Setelah reset database (hapus semua user)

### Langkah-Langkah:

1. **Jalankan aplikasi:**
   ```bash
   npm start
   ```

2. **Buka browser:**
   ```
   http://localhost:7575
   ```

3. **Otomatis redirect ke `/setup-account`**

4. **Isi form:**
   - **Username:** Min 3 karakter (huruf, angka, underscore)
   - **Password:** Min 8 karakter (harus ada huruf kecil, BESAR, dan angka)
   - **Confirm Password:** Ketik ulang password
   - **Avatar:** Opsional

5. **Contoh password valid:**
   - ✅ `Admin123456`
   - ✅ `MyPass123`
   - ❌ `admin123` (tidak ada huruf besar)
   - ❌ `ADMIN123` (tidak ada huruf kecil)

6. **Klik "Complete Setup"**

7. **✅ Selesai!** Anda akan otomatis login sebagai admin.

---

## 🔑 Reset Password Admin

### Kapan Digunakan?
- Lupa password admin
- Ingin mengganti password admin yang ada

### Cara 1: Via Script (Tercepat)

```bash
node quick-reset-admin.js
```

**Output:**
```
✅ Password reset successfully!

Username: admin
New Password: Admin123456
```

**Login dengan:**
- Username: `admin`
- Password: `Admin123456`

⚠️ **Ganti password setelah login di menu Settings!**

### Cara 2: Via Menu Settings (Jika Masih Bisa Login)

1. Login sebagai admin
2. Klik menu **Settings**
3. Isi form "Change Password"
4. Klik **Update Password**

---

## 🗑️ Reset Database (Hapus Semua User)

### ⚠️ WARNING
**Ini akan menghapus SEMUA user dan data terkait!**
- Semua user akan dihapus
- Semua videos, audios, streams akan dihapus
- Tidak bisa di-undo!

### Kapan Digunakan?
- Ingin mulai fresh dari awal
- Tidak bisa login sama sekali
- Database bermasalah

### Langkah-Langkah:

1. **Jalankan script reset:**
   ```bash
   node reset-database-fresh.js
   ```

2. **Output:**
   ```
   ✅ Berhasil menghapus X user!
   ✅ Database siap untuk setup admin baru!
   ```

3. **Restart aplikasi:**
   ```bash
   npm start
   ```

4. **Buka browser:**
   ```
   http://localhost:7575
   ```

5. **Setup admin baru** (lihat bagian "Setup Admin Pertama Kali")

---

## 🐛 Troubleshooting

### 1. Tidak Bisa Akses `/setup-account`

**Penyebab:** Sudah ada user di database

**Solusi:**
```bash
# Cek status database
node fix-setup-account.js

# Jika ada user, gunakan salah satu:
# - Login dengan user yang ada
# - Reset password admin: node quick-reset-admin.js
# - Reset database: node reset-database-fresh.js
```

### 2. Error: "Failed to create user"

**Penyebab:** Database sudah ada user

**Solusi:**
```bash
# Reset database
node reset-database-fresh.js

# Restart aplikasi
npm start
```

### 3. Error: "Password must be at least 8 characters"

**Penyebab:** Password tidak memenuhi syarat

**Solusi:** Gunakan password dengan:
- Min 8 karakter
- Ada huruf kecil (a-z)
- Ada huruf BESAR (A-Z)
- Ada angka (0-9)

Contoh: `Admin123456`

### 4. Lupa Username Admin

**Solusi:**
```bash
# Cek daftar user
node fix-setup-account.js

# Atau reset password admin pertama
node quick-reset-admin.js
```

### 5. Tidak Bisa Login Setelah Reset Password

**Solusi:**
```bash
# Restart aplikasi
npm start

# Atau jika pakai PM2
pm2 restart streamflow

# Coba login lagi
```

### 6. Database Locked

**Solusi:**
```bash
# Stop aplikasi
pm2 stop streamflow

# Jalankan script
node reset-database-fresh.js

# Start aplikasi
pm2 start streamflow
```

---

## 📊 Perbedaan Setup Account vs Signup

| Fitur | Setup Account | Signup |
|-------|---------------|--------|
| **Route** | `/setup-account` | `/signup` |
| **Kapan** | Database kosong | Sudah ada admin |
| **User Role** | Admin | Member |
| **Status** | Active | Inactive (perlu approval) |
| **Auto Login** | Ya | Tidak |
| **Password Min** | 8 karakter | 6 karakter |

---

## 🔧 Utility Scripts

### Diagnostic & Fix
```bash
# Cek status database dan setup account
node fix-setup-account.js

# Cek struktur database
node check-db.js

# Fix signup issues
node fix-signup.js
```

### User Management
```bash
# Reset password admin
node quick-reset-admin.js

# Aktivasi semua user inactive
node activate-all-users.js

# Reset database (hapus semua user)
node reset-database-fresh.js

# Hapus semua user (dengan konfirmasi)
node delete-all-users.js
```

### Testing
```bash
# Test signup functionality
node test-signup.js

# Health check
node health-check.js
```

---

## 💡 Tips & Best Practices

### 1. Gunakan Password yang Kuat
```
❌ Lemah: admin123
✅ Kuat: Admin@2024!Stream
```

### 2. Backup Database Secara Berkala
```bash
# Backup manual
copy db\streamflow.db db\streamflow.db.backup

# Atau gunakan fitur backup di aplikasi
```

### 3. Ganti Password Default
Setelah reset password dengan script, segera ganti password di menu Settings.

### 4. Catat Kredensial
Simpan username dan password di tempat yang aman.

---

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah:

1. **Cek logs aplikasi:**
   ```bash
   pm2 logs streamflow --lines 50
   ```

2. **Jalankan diagnostic:**
   ```bash
   node fix-setup-account.js
   ```

3. **Lihat dokumentasi lain:**
   - `README.md` - Panduan umum
   - `QUICK_START.md` - Quick start guide
   - `DEPLOYMENT.md` - Deployment guide

---

**Dokumentasi ini mencakup semua yang perlu Anda ketahui tentang admin management!** 🚀
