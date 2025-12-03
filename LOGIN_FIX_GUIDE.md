# 🔐 Panduan Fix Login - User Inactive

## ❌ Masalah

- ✅ Signup berhasil
- ❌ Tidak bisa login
- ❌ User status: **inactive** (menunggu approval admin)

## ✅ Solusi (2 Cara)

---

## **Cara 1: Aktifkan User Otomatis** ⭐ (Termudah)

Jalankan script untuk aktifkan semua user sekaligus:

```bash
node activate-all-users.js
```

**Output:**
```
👥 Activate All Users

==================================================

📋 Found 1 inactive user(s):

1. youruser (member)

🔄 Activating all users...

✅ All users activated successfully!

==================================================

📊 Summary:
  Activated: 1 user(s)

🌐 Users can now login at: http://localhost:7575/login

==================================================
```

**Setelah itu, langsung bisa login!** ✅

---

## **Cara 2: Login sebagai Admin & Aktifkan Manual**

### Langkah 1: Reset Password Admin

```bash
node quick-reset-admin.js
```

**Output:**
```
🔐 Quick Admin Reset

==================================================
📋 Found admin: admin

🔄 Resetting password...

✅ Password reset successfully!

==================================================

🎉 Admin Ready!

Login credentials:
  Username: admin
  Password: Admin123456
  Role: admin
  Status: active

🌐 Login at: http://localhost:7575/login

==================================================
```

### Langkah 2: Login sebagai Admin

1. Buka: `http://localhost:7575/login`
2. Login dengan:
   - **Username**: `admin`
   - **Password**: `Admin123456`

### Langkah 3: Aktifkan User

1. Klik menu **"Users"** (User Management)
2. Cari user yang baru dibuat
3. Klik tombol **"Activate"** atau ubah status ke **"Active"**
4. Logout dari admin
5. Login dengan username dan password user baru

---

## 🎯 Setelah User Diaktifkan

Sekarang Anda bisa login dengan:
- **Username**: username yang Anda buat saat signup
- **Password**: password yang Anda buat saat signup

---

## 🔍 Check Status User

Untuk melihat status user di database:

```bash
sqlite3 db/streamflow.db "SELECT username, user_role, status FROM users;"
```

**Output contoh:**
```
admin|admin|active
youruser|member|inactive  ← Ini yang perlu diaktifkan
```

---

## 🐛 Troubleshooting

### Masih tidak bisa login setelah aktivasi

**Check 1: Verifikasi status user**
```bash
sqlite3 db/streamflow.db "SELECT username, status FROM users WHERE username='youruser';"
```

Harusnya output: `youruser|active`

**Check 2: Restart aplikasi**
```bash
pm2 restart streamflow
```

**Check 3: Clear browser cache**
- Tekan Ctrl+Shift+Delete
- Clear cookies & cache
- Coba login lagi

### Error: "Invalid username or password"

Kemungkinan:
1. Username salah (case-sensitive)
2. Password salah
3. User belum diaktifkan

**Solusi: Reset password user**
```bash
node reset-password.js
```

Masukkan username, lalu set password baru.

### Error: "Account is not active"

User masih inactive, jalankan:
```bash
node activate-all-users.js
```

---

## 📝 Ringkasan Command

```bash
# Aktifkan semua user (RECOMMENDED)
node activate-all-users.js

# Reset admin password
node quick-reset-admin.js

# Reset password user tertentu
node reset-password.js

# Check status user
sqlite3 db/streamflow.db "SELECT username, status FROM users;"

# Restart aplikasi
pm2 restart streamflow
```

---

## 💡 Tips

1. **Gunakan `activate-all-users.js`** - Paling cepat dan mudah
2. **Catat password** - Simpan di tempat aman
3. **Ganti password admin** - Setelah login, ganti password default
4. **Backup database** - Sebelum melakukan perubahan besar

---

## 🎉 Selesai!

Setelah user diaktifkan, Anda bisa:
- ✅ Login dengan username & password Anda
- ✅ Upload video
- ✅ Buat stream
- ✅ Mulai streaming!

---

**Jalankan `node activate-all-users.js` sekarang untuk aktifkan user Anda!** 🚀

---

Modified by Mas Ozang | Original by Bang Tutorial
