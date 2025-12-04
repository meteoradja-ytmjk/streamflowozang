# 🔐 Panduan Sistem Login StreamFlow

## 📋 Daftar Isi
- [Fitur Utama](#fitur-utama)
- [Role & Permissions](#role--permissions)
- [Cara Menggunakan](#cara-menggunakan)
- [Manajemen User](#manajemen-user)
- [Batasan Live Streaming](#batasan-live-streaming)
- [FAQ](#faq)

---

## ✨ Fitur Utama

### 1. **Sistem Login yang Aman**
- Login dengan username dan password
- Rate limiting untuk mencegah brute force attack
- Session management yang aman
- CSRF protection

### 2. **Dua Role Pengguna**
- **Admin**: Akses penuh ke semua fitur
- **User**: Akses terbatas sesuai permission

### 3. **Manajemen User oleh Admin**
- Buat user baru
- Edit informasi user
- Atur batasan live streaming per user
- Aktifkan/nonaktifkan user
- Hapus user

### 4. **Batasan Live Streaming**
- Admin dapat membatasi jumlah maksimal live streaming per user
- Unlimited atau custom limit (1, 2, 3, dst.)
- Validasi otomatis saat user mencoba membuat/start stream

---

## 👥 Role & Permissions

### 🔴 Admin
**Akses Penuh:**
- ✅ Membuat unlimited live streams
- ✅ Akses halaman User Management
- ✅ Membuat user baru
- ✅ Edit semua user
- ✅ Mengatur batasan stream per user
- ✅ Aktifkan/nonaktifkan user
- ✅ Hapus user (kecuali diri sendiri)
- ✅ Melihat statistik semua user
- ✅ Akses semua fitur aplikasi

### 🔵 User (Member)
**Akses Terbatas:**
- ✅ Membuat live streams (sesuai limit yang ditentukan admin)
- ✅ Upload video & audio
- ✅ Manage konten sendiri
- ✅ Edit profil sendiri
- ❌ Tidak bisa akses User Management
- ❌ Tidak bisa edit user lain
- ❌ Tidak bisa ubah role sendiri

---

## 🚀 Cara Menggunakan

### Setup Awal (Pertama Kali)

#### Opsi 1: Setup Manual
1. Jalankan aplikasi:
   ```bash
   npm start
   ```

2. Buka browser dan akses: `http://localhost:7575`

3. Anda akan diarahkan ke halaman **Setup Admin Account**

4. Buat akun admin pertama:
   - Username: minimal 3 karakter
   - Password: minimal 8 karakter

5. Setelah setup, Anda akan otomatis login sebagai admin

#### Opsi 2: Menggunakan Demo Users
1. Jalankan script untuk membuat demo users:
   ```bash
   node create-demo-users.js
   ```

2. Script akan membuat 2 user:
   - **Admin**: username `admin`, password `admin123`
   - **User**: username `user`, password `user123`

3. Jalankan aplikasi:
   ```bash
   npm start
   ```

4. Login dengan salah satu akun di atas

### Login
1. Akses `http://localhost:7575/login`
2. Masukkan username dan password
3. Klik "Log In"

### Logout
1. Klik avatar di pojok kanan atas
2. Pilih "Logout"

### Sign Up (Pendaftaran User Baru)
1. Akses `http://localhost:7575/signup`
2. Isi form pendaftaran:
   - Upload foto profil (opsional)
   - Username
   - Password
   - Konfirmasi password
3. Klik "Create Account"
4. Setelah berhasil, login dengan akun yang baru dibuat

**Catatan:** User yang mendaftar sendiri akan memiliki role "user" dengan status "active" dan unlimited streams secara default. Admin dapat mengubah pengaturan ini nanti.

---

## 👨‍💼 Manajemen User (Admin Only)

### Akses User Management
1. Login sebagai admin
2. Klik menu "Users" di sidebar
3. Anda akan melihat daftar semua user

### Membuat User Baru
1. Klik tombol "Create New User"
2. Isi form:
   - **Profile Picture**: Upload foto (opsional)
   - **Username**: Username untuk login
   - **Role**: Pilih Admin atau Member
   - **Status**: Active atau Inactive
   - **Password**: Password untuk user
   - **Max Streams Limit**: 
     - `-1` untuk unlimited
     - Angka positif untuk membatasi (contoh: `2` untuk maksimal 2 stream)
3. Klik "Create User"

### Edit User
1. Klik icon edit (✏️) pada user yang ingin diedit
2. Ubah informasi yang diperlukan:
   - Username
   - Role
   - Status
   - Password (opsional, kosongkan jika tidak ingin mengubah)
   - Max Streams Limit
3. Klik "Save Changes"

### Hapus User
1. Klik icon hapus (🗑️) pada user yang ingin dihapus
2. Konfirmasi penghapusan
3. User dan semua data terkait (video, stream) akan dihapus

**Catatan:** Admin tidak bisa menghapus akun sendiri.

---

## 🎥 Batasan Live Streaming

### Cara Kerja
Admin dapat mengatur batasan jumlah live streaming untuk setiap user:

- **Unlimited (`-1`)**: User bisa membuat dan menjalankan stream tanpa batas
- **Limited (angka positif)**: User dibatasi jumlah stream yang bisa dibuat/dijalankan

### Contoh Skenario

#### Skenario 1: User dengan Limit 2 Stream
```
User: john
Max Streams: 2

✅ Bisa membuat stream ke-1
✅ Bisa membuat stream ke-2
❌ Tidak bisa membuat stream ke-3 (harus hapus salah satu stream dulu)
```

#### Skenario 2: User dengan Unlimited Stream
```
User: admin
Max Streams: -1 (Unlimited)

✅ Bisa membuat stream sebanyak yang diinginkan
✅ Tidak ada batasan
```

### Validasi
Sistem akan melakukan validasi di 2 titik:

1. **Saat Membuat Stream Baru**
   - Jika user sudah mencapai limit, akan muncul error
   - Error: "You have reached the maximum limit of X stream(s)"

2. **Saat Start Stream**
   - Jika user sudah memiliki X stream yang sedang live, tidak bisa start stream baru
   - Error: "You have reached the maximum limit of X active stream(s)"

### Mengubah Limit
Admin dapat mengubah limit kapan saja:

1. Buka User Management
2. Edit user yang ingin diubah limitnya
3. Ubah nilai "Max Streams Limit"
4. Save changes

Perubahan akan langsung berlaku.

---

## ❓ FAQ

### Q: Bagaimana cara reset password user?
**A:** Ada 3 cara:

**Cara 1: Melalui User Management (Admin)**
1. Login sebagai admin
2. Buka User Management
3. Edit user yang ingin direset passwordnya
4. Isi field "New Password"
5. Save changes

**Cara 2: Via Command Line (Admin)**
1. Jalankan: `npm run admin:reset-user-password`
   ATAU double-click: `RESET_USER_PASSWORD.bat`
2. Pilih user yang ingin direset
3. Masukkan password baru
4. Konfirmasi

**Cara 3: Forgot Password (User)**
1. User klik "Forgot Password?" di halaman login
2. User menghubungi admin via WhatsApp
3. Admin reset password menggunakan cara 1 atau 2
4. Admin memberikan password baru ke user via WhatsApp

### Q: Apa yang terjadi jika user dinonaktifkan?
**A:** User yang dinonaktifkan (status: inactive):
- Tidak bisa login
- Session yang aktif akan tetap berjalan sampai logout
- Semua data tetap tersimpan

### Q: Bisakah user mengubah role sendiri?
**A:** Tidak. Hanya admin yang bisa mengubah role user.

### Q: Apa perbedaan antara "Max Streams" dan "Active Streams"?
**A:** 
- **Max Streams**: Batasan jumlah stream yang bisa dibuat (total)
- **Active Streams**: Jumlah stream yang sedang live saat ini

### Q: Bagaimana cara membuat admin baru?
**A:** 
1. Login sebagai admin
2. Buka User Management
3. Create New User
4. Pilih Role: Admin
5. Set Max Streams: -1 (unlimited)

### Q: Apakah auto-login masih aktif?
**A:** Tidak. Auto-login sudah dinonaktifkan. Semua user harus login dengan username dan password.

### Q: Bagaimana cara mengubah limit stream untuk banyak user sekaligus?
**A:** Saat ini harus dilakukan satu per satu melalui User Management. Untuk bulk update, bisa menggunakan script database langsung.

### Q: Apa yang terjadi jika user mencoba membuat stream melebihi limit?
**A:** Sistem akan menolak dan menampilkan pesan error. User harus menghapus stream yang ada terlebih dahulu.

---

## 🔧 Troubleshooting

### Tidak bisa login
1. Pastikan username dan password benar
2. Cek apakah akun masih aktif (status: active)
3. Coba reset password melalui admin

### Tidak bisa membuat stream
1. Cek limit stream Anda di User Management
2. Hapus stream yang tidak terpakai
3. Hubungi admin untuk menaikkan limit

### Lupa password admin
1. Jalankan script reset admin:
   ```bash
   node quick-reset-admin.js
   ```
2. Atau reset password via command line:
   ```bash
   npm run admin:reset-user-password
   ```
3. Atau reset database dan setup ulang:
   ```bash
   node reset-database-fresh.js
   node create-demo-users.js
   ```

### Lupa password user
1. Klik "Forgot Password?" di halaman login
2. Hubungi admin via WhatsApp
3. Admin akan reset password Anda

---

## 📞 Support

Jika mengalami masalah atau butuh bantuan:
1. Cek dokumentasi ini terlebih dahulu
2. Lihat file TROUBLESHOOTING.md
3. Hubungi administrator sistem

---

**Dibuat dengan ❤️ untuk StreamFlow**
