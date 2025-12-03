# 🔐 LOGIN ADMIN - Quick Reference

## ✅ KREDENSIAL LOGIN

```
URL      : http://localhost:7575/login
Username : admin
Password : admin123
```

## 🚀 Quick Start

### Cara Tercepat (Windows)
Double-click file:
```
quick-fix-login.bat
```

### Manual
```bash
# 1. Stop aplikasi
Stop-Process -Name node -Force

# 2. Reset database
node reset-safe.js

# 3. Jalankan aplikasi
node app.js

# 4. Login di browser
# http://localhost:7575/login
```

## 📝 Script Tersedia

| Script | Fungsi |
|--------|--------|
| `quick-fix-login.bat` | Fix login otomatis (all-in-one) |
| `reset-safe.js` | Reset database & buat admin |
| `verify-admin.js` | Cek status database |
| `test-login.js` | Test login otomatis |
| `reset-complete-fresh.js` | Reset dengan custom credentials |

## 🔧 Troubleshooting

### Tidak bisa login?
```bash
node verify-admin.js
```

### Database error?
```bash
node reset-safe.js
```

### Test login?
```bash
node test-login.js
```

## ⚠️ PENTING

1. **Ganti password** setelah login pertama
2. **Backup database** secara berkala
3. **Jangan share** kredensial admin

## 📚 Dokumentasi Lengkap

Lihat file `SOLUSI_LOGIN_ADMIN.md` untuk dokumentasi lengkap.

---

**Status Terakhir:** ✅ Login berhasil ditest dan berfungsi
**Tanggal:** 4 Desember 2025
