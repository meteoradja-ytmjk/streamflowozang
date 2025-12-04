# Auto-Login Diaktifkan

## Perubahan yang Dilakukan

Fitur login dan signup telah dinonaktifkan sementara. Aplikasi sekarang menggunakan sistem **auto-login** yang memungkinkan akses langsung ke dashboard tanpa perlu login.

## Cara Kerja

1. **Akses Otomatis**: Ketika pengguna mengakses aplikasi, sistem akan otomatis:
   - Mencari user pertama yang ada di database
   - Jika ada user, langsung login sebagai user tersebut
   - Jika tidak ada user, membuat user default dengan kredensial:
     - Username: `admin`
     - Password: `admin123`
     - Role: `admin`
     - Status: `active`

2. **Route yang Dinonaktifkan**:
   - `/login` (GET & POST) → redirect ke `/dashboard`
   - `/signup` (GET & POST) → redirect ke `/dashboard`
   - `/setup-account` (GET & POST) → redirect ke `/dashboard`
   - `/logout` → redirect ke `/dashboard`

3. **Middleware `isAuthenticated`**:
   - Dimodifikasi untuk otomatis membuat session jika belum ada
   - Tidak lagi redirect ke halaman login

## Cara Menggunakan

1. Jalankan aplikasi seperti biasa:
   ```bash
   npm start
   ```

2. Buka browser dan akses:
   ```
   http://localhost:7575
   ```

3. Aplikasi akan langsung masuk ke dashboard tanpa perlu login

## Cara Mengembalikan Login/Signup

Jika ingin mengembalikan fitur login dan signup, restore file `app.js` dari backup atau git history sebelum perubahan ini.

## Catatan Keamanan

⚠️ **PERINGATAN**: Konfigurasi ini hanya untuk development/testing. 
**JANGAN** gunakan di production karena tidak aman!

## Tanggal Perubahan

Dibuat: 4 Desember 2025
