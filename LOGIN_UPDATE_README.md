# 🔐 Update: Sistem Login & Manajemen User

## ✨ Apa yang Baru?

Sistem login yang lengkap dengan manajemen user dan kontrol batasan live streaming telah ditambahkan ke StreamFlow!

### Fitur Utama:
1. ✅ **Login System** - Username & password authentication
2. ✅ **2 Role** - Admin (full access) & User (limited access)
3. ✅ **User Management** - Admin dapat manage semua user
4. ✅ **Stream Limit Control** - Admin dapat set maksimal live streaming per user
5. ✅ **Self Registration** - User bisa signup sendiri

---

## 🚀 Quick Start

### Cara Tercepat (Recommended):

```bash
# 1. Buat demo users (admin & user)
npm run users:create-demo

# 2. Jalankan aplikasi
npm start

# 3. Login dengan:
#    Admin: username=admin, password=admin123
#    User:  username=user, password=user123
```

### Atau Setup Manual:

```bash
# 1. Jalankan aplikasi
npm start

# 2. Buka browser: http://localhost:7575
# 3. Ikuti wizard setup admin account
```

---

## 📋 Kredensial Demo

Setelah menjalankan `npm run users:create-demo`:

| Role  | Username | Password  | Max Streams |
|-------|----------|-----------|-------------|
| Admin | admin    | admin123  | Unlimited   |
| User  | user     | user123   | 2           |

---

## 👥 Manajemen User (Admin Only)

### Membuat User Baru:
1. Login sebagai admin
2. Klik menu **"Users"** di sidebar
3. Klik **"Create New User"**
4. Isi form dan set **Max Streams Limit**:
   - `-1` = Unlimited
   - `1, 2, 3, ...` = Limited

### Edit User:
1. Klik icon **edit (✏️)** pada user
2. Ubah informasi (username, role, status, max streams)
3. Save changes

### Hapus User:
1. Klik icon **hapus (🗑️)** pada user
2. Konfirmasi penghapusan

---

## 🎥 Batasan Live Streaming

Admin dapat mengatur berapa banyak live streaming yang bisa dibuat/dijalankan oleh setiap user.

### Contoh:
```
User: john
Max Streams: 2

✅ Bisa buat stream #1
✅ Bisa buat stream #2
❌ Tidak bisa buat stream #3 (harus hapus salah satu dulu)
```

### Validasi:
- Saat **membuat stream baru** → Cek total streams
- Saat **start stream** → Cek active streams

---

## 📁 File Baru

| File | Deskripsi |
|------|-----------|
| `create-demo-users.js` | Script untuk membuat demo users |
| `CREATE_DEMO_USERS.bat` | Batch file untuk Windows |
| `LOGIN_SYSTEM_GUIDE.md` | Dokumentasi lengkap sistem login |
| `QUICK_LOGIN_GUIDE.txt` | Quick reference guide |
| `LOGIN_UPDATE_README.md` | File ini |

---

## 🔧 Perubahan Kode

### app.js
- ✅ Auto-login **DINONAKTIFKAN**
- ✅ Login/logout routes **DIAKTIFKAN**
- ✅ Signup route **DIAKTIFKAN**
- ✅ Validasi max streams saat create/start stream
- ✅ Admin middleware untuk protect admin routes

### models/User.js
- ✅ Field `max_streams` sudah ada
- ✅ Methods untuk CRUD user

### views/users.ejs
- ✅ Tampilan max streams di tabel
- ✅ Form edit dengan field max streams
- ✅ Form create dengan field max streams

---

## 📖 Dokumentasi

Untuk panduan lengkap, baca:
- **LOGIN_SYSTEM_GUIDE.md** - Dokumentasi lengkap
- **QUICK_LOGIN_GUIDE.txt** - Quick reference

---

## ❓ FAQ

**Q: Apakah auto-login masih aktif?**  
A: Tidak. Auto-login sudah dinonaktifkan. Semua user harus login.

**Q: Bagaimana cara reset password admin?**  
A: Jalankan `node quick-reset-admin.js`

**Q: User yang signup sendiri dapat limit berapa?**  
A: Default unlimited (-1). Admin bisa ubah nanti.

**Q: Bisakah user mengubah limitnya sendiri?**  
A: Tidak. Hanya admin yang bisa mengubah limit.

---

## 🎉 Selamat!

Sistem login dan manajemen user sudah siap digunakan. Selamat streaming! 🚀

---

**Need Help?** Baca dokumentasi lengkap di `LOGIN_SYSTEM_GUIDE.md`
