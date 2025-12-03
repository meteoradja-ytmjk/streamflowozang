# 🔐 Panduan Reset Admin - Lupa Password

## Masalah Anda

Anda tidak bisa sign up karena:
1. ✅ Akun baru berhasil dibuat
2. ❌ Tapi statusnya **inactive** (menunggu approval admin)
3. ❌ Anda lupa password admin untuk approve akun baru
4. ❌ Tidak bisa login karena akun inactive

## ✅ Solusi Cepat (3 Langkah)

### **Langkah 1: Reset Password Admin**

Buka terminal/command prompt, masuk ke folder aplikasi:

```bash
cd streamflowozang
```

Jalankan script reset cepat:

```bash
node quick-reset-admin.js
```

Output yang akan muncul:
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

⚠️  IMPORTANT: Change this password after login!

==================================================
```

### **Langkah 2: Login sebagai Admin**

1. Buka browser
2. Akses: `http://localhost:7575/login`
3. Login dengan:
   - **Username**: `admin`
   - **Password**: `Admin123456`

### **Langkah 3: Aktifkan User Baru**

Setelah login sebagai admin:

**Opsi A: Manual via Dashboard**
1. Klik menu **Users** (User Management)
2. Cari user yang baru dibuat
3. Klik tombol **Activate** atau ubah status ke **Active**

**Opsi B: Otomatis via Script**

Atau jalankan script untuk aktifkan semua user sekaligus:

```bash
node activate-all-users.js
```

Output:
```
👥 Activate All Users

==================================================

📋 Found 1 inactive user(s):

1. newuser (member)

🔄 Activating all users...

✅ All users activated successfully!

==================================================

📊 Summary:
  Activated: 1 user(s)

🌐 Users can now login at: http://localhost:7575/login

==================================================
```

---

## 🎯 Setelah Reset

### Ganti Password Admin (Recommended)

Setelah login sebagai admin:
1. Klik **Settings** atau **Profile**
2. Ganti password ke password yang Anda ingat
3. Logout dan login lagi dengan password baru

### Login dengan User Baru

Setelah user diaktifkan:
1. Logout dari admin
2. Login dengan username dan password user baru yang tadi dibuat

---

## 🚨 Troubleshooting

### Error: "Cannot find module 'sqlite3'"

```bash
npm install
node quick-reset-admin.js
```

### Error: "Database locked"

```bash
# Stop aplikasi dulu
pm2 stop streamflow

# Jalankan script
node quick-reset-admin.js

# Start aplikasi lagi
pm2 start streamflow
```

### Error: "No admin user found"

Script akan otomatis membuat admin baru dengan:
- Username: `admin`
- Password: `Admin123456`

### Masih Tidak Bisa Login

Reset total database (⚠️ HAPUS SEMUA DATA):

```bash
# Backup dulu
cp db/streamflow.db db/streamflow.db.backup

# Hapus database
rm db/streamflow.db

# Restart aplikasi
pm2 restart streamflow

# Akses aplikasi, akan redirect ke setup account
# http://localhost:7575
```

---

## 📝 Ringkasan Command

```bash
# 1. Reset password admin
node quick-reset-admin.js

# 2. Aktifkan semua user inactive
node activate-all-users.js

# 3. Check daftar user
sqlite3 db/streamflow.db "SELECT username, user_role, status FROM users;"

# 4. Restart aplikasi (jika perlu)
pm2 restart streamflow
```

---

## 💡 Tips Agar Tidak Lupa Password Lagi

1. **Gunakan Password Manager** (LastPass, 1Password, Bitwarden)
2. **Catat di tempat aman** (bukan di sticky note!)
3. **Gunakan password yang mudah diingat** tapi tetap kuat
4. **Simpan script reset** ini untuk emergency

---

## 🎉 Selesai!

Setelah mengikuti langkah di atas, Anda bisa:
- ✅ Login sebagai admin
- ✅ Approve/aktifkan user baru
- ✅ Ganti password admin
- ✅ Mulai menggunakan aplikasi

**Jangan lupa ganti password default setelah login!** 🔐

---

**Need help?** Baca dokumentasi lengkap di `DEPLOYMENT.md`
