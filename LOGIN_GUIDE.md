# Panduan Login StreamFlow

## 2 Jenis Login dalam Aplikasi

### 1. Login Admin (Complete Setup)
**Digunakan untuk:** Setup awal aplikasi pertama kali

**Kapan muncul:**
- Saat aplikasi baru diinstall dan belum ada user
- Otomatis redirect ke `/setup-account`

**Fitur:**
- Membuat admin pertama
- Upload foto profil (opsional)
- Username custom
- Password (tanpa konfirmasi password untuk efisiensi)
- Otomatis set sebagai admin dengan status active

**Cara akses:**
- Buka: `http://localhost:7575/setup-account`
- Atau otomatis redirect jika belum ada user

---

### 2. Login User (Login Biasa)
**Digunakan untuk:** Login sehari-hari untuk admin dan member

**Kapan muncul:**
- Setelah ada user di database
- Halaman login standar

**Fitur:**
- Login dengan username dan password
- Untuk admin dan member
- Rate limiting (5 percobaan per 15 menit)

**Cara akses:**
- Buka: `http://localhost:7575/login`

---

## Default Admin Credentials

Untuk kemudahan setup, tersedia script untuk membuat admin dengan credentials default:

**Username:** `admin`  
**Password:** `Admin123`

### Cara Menggunakan:

#### Windows:
```bash
# Double click atau jalankan:
reset-admin-default.bat
```

#### Linux/Mac:
```bash
node reset-admin-default.js
```

---

## Script Reset Admin

### 1. `reset-admin-default.js`
- Membuat/reset admin dengan credentials default
- Username: admin
- Password: Admin123
- Paling cepat dan mudah

### 2. `reset-complete-fresh.js`
- Reset database lengkap (hapus semua data)
- Pilihan menggunakan default credentials atau custom
- Untuk fresh start

### 3. `reset-admin.js`
- Reset password admin yang sudah ada
- Custom username dan password

---

## Perbedaan Complete Setup vs Login

| Fitur | Complete Setup | Login Biasa |
|-------|---------------|-------------|
| **Kapan** | Pertama kali / belum ada user | Setelah ada user |
| **URL** | `/setup-account` | `/login` |
| **Confirm Password** | ❌ Tidak ada (efisien) | ❌ Tidak perlu |
| **Upload Avatar** | ✅ Ya | ❌ Tidak (di settings) |
| **Auto Admin** | ✅ Ya | ❌ Tergantung role |
| **Rate Limiting** | ❌ Tidak | ✅ Ya (5x/15 menit) |

---

## Troubleshooting

### Tidak bisa akses Complete Setup
**Solusi:** Hapus semua user atau jalankan `reset-complete-fresh.js`

### Lupa Password Admin
**Solusi:** Jalankan `reset-admin-default.bat` atau `reset-admin.js`

### Terlalu banyak percobaan login
**Solusi:** Tunggu 15 menit atau restart aplikasi

---

## Keamanan

1. **Ganti password default** setelah login pertama kali
2. Password minimal 8 karakter dengan kombinasi huruf, angka, dan simbol
3. Jangan share credentials admin
4. Gunakan password yang kuat untuk production

---

## Quick Start

### Setup Pertama Kali:
1. Jalankan aplikasi: `npm start`
2. Buka: `http://localhost:7575`
3. Otomatis redirect ke Complete Setup
4. Isi username dan password
5. Klik "Complete Setup"
6. Login otomatis ke dashboard

### Atau Gunakan Default Admin:
1. Jalankan: `reset-admin-default.bat`
2. Buka: `http://localhost:7575/login`
3. Login dengan:
   - Username: `admin`
   - Password: `Admin123`
4. Ganti password di Settings
