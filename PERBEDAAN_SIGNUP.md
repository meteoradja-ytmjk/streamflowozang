# 🔐 Perbedaan Sign Up Admin dan Sign Up User

## 📋 Ringkasan

Aplikasi ini memiliki **2 jenis signup** dengan perbedaan signifikan:

| Aspek | Sign Up Admin | Sign Up User |
|-------|---------------|--------------|
| **Route** | `/setup-account` | `/signup` |
| **Kapan Digunakan** | Saat **belum ada user** di database | Saat **sudah ada user** di database |
| **User Role** | `admin` | `member` |
| **Status Awal** | `active` (langsung aktif) | `inactive` (perlu approval) |
| **Auto Login** | ✅ Ya (langsung login) | ❌ Tidak (perlu aktivasi dulu) |
| **Validasi Password** | Ketat (min 8 char, uppercase, lowercase, number) | Sedang (min 6 char) |
| **Max Streams** | `-1` (unlimited) | `-1` (unlimited) |

---

## 1️⃣ Sign Up Admin (`/setup-account`)

### 📍 Kapan Digunakan?
- **Hanya saat pertama kali setup aplikasi**
- Ketika **belum ada user sama sekali** di database
- Otomatis redirect ke `/setup-account` jika database kosong

### 🔑 Karakteristik

```javascript
// Route: /setup-account
// File: app.js (line ~460)

const user = await User.create({
  username: req.body.username,
  password: req.body.password,
  avatar_path: avatarPath,
  user_role: 'admin',        // ✅ Langsung jadi admin
  status: 'active'            // ✅ Langsung aktif
});

// Auto login setelah signup
req.session.userId = user.id;
req.session.username = req.body.username;
req.session.user_role = user.user_role;

// Redirect ke dashboard
return res.redirect('/dashboard');
```

### ✅ Validasi Password (Ketat)

```javascript
body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
```

**Contoh password valid:**
- ✅ `Admin123456`
- ✅ `MyPass123`
- ❌ `admin123` (tidak ada uppercase)
- ❌ `ADMIN123` (tidak ada lowercase)
- ❌ `AdminPass` (tidak ada number)

### 🎯 Flow Sign Up Admin

```
1. User buka aplikasi pertama kali
   ↓
2. Cek: Apakah ada user di database?
   ↓ (Tidak ada)
3. Redirect ke /setup-account
   ↓
4. User isi form:
   - Username (3-20 char, alphanumeric + underscore)
   - Password (min 8 char, harus ada lowercase, uppercase, number)
   - Confirm Password
   - Avatar (optional)
   ↓
5. Submit form
   ↓
6. Create user dengan:
   - user_role: 'admin'
   - status: 'active'
   ↓
7. Auto login (set session)
   ↓
8. Redirect ke /dashboard
   ↓
9. ✅ Admin langsung bisa akses semua fitur
```

---

## 2️⃣ Sign Up User (`/signup`)

### 📍 Kapan Digunakan?
- **Setelah admin sudah dibuat**
- Ketika **sudah ada minimal 1 user** di database
- User baru yang ingin mendaftar

### 🔑 Karakteristik

```javascript
// Route: /signup
// File: app.js (line ~380)

const newUser = await User.create({
  username,
  password,
  avatar_path: avatarPath,
  user_role: user_role || 'member',  // ✅ Default: member
  status: status || 'inactive',       // ✅ Default: inactive (perlu approval)
  max_streams: -1
});

// TIDAK auto login
// User harus menunggu admin aktivasi

return res.render('signup', {
  title: 'Sign Up',
  error: null,
  success: 'Account created successfully! Please wait for admin approval to activate your account.'
});
```

### ✅ Validasi Password (Sedang)

```javascript
// Validasi di app.js
if (password.length < 6) {
  return res.render('signup', {
    title: 'Sign Up',
    error: 'Password must be at least 6 characters long',
    success: null
  });
}
```

**Contoh password valid:**
- ✅ `Test123456`
- ✅ `mypass123`
- ✅ `123456` (minimal 6 char)
- ❌ `12345` (kurang dari 6 char)

### 🎯 Flow Sign Up User

```
1. User buka /signup
   ↓
2. Cek: Apakah ada user di database?
   ↓ (Ada)
3. Tampilkan form signup
   ↓
4. User isi form:
   - Username
   - Password (min 6 char)
   - Confirm Password
   - Avatar (optional)
   ↓
5. Submit form
   ↓
6. Create user dengan:
   - user_role: 'member'
   - status: 'inactive'
   ↓
7. Tampilkan pesan sukses:
   "Account created successfully! 
    Please wait for admin approval to activate your account."
   ↓
8. User TIDAK bisa login (status: inactive)
   ↓
9. Admin harus aktivasi user:
   - Via menu /users (admin panel)
   - Atau jalankan: node activate-all-users.js
   ↓
10. Setelah diaktivasi (status: active)
    ↓
11. ✅ User bisa login
```

---

## 🔄 Perbedaan Detail

### A. Route & Akses

| Aspek | Admin | User |
|-------|-------|------|
| **URL** | `/setup-account` | `/signup` |
| **Akses** | Hanya jika DB kosong | Setelah admin ada |
| **Redirect** | Auto redirect jika DB kosong | Manual access |

### B. User Role

```javascript
// Admin
user_role: 'admin'  // Bisa akses semua fitur + user management

// User
user_role: 'member' // Akses terbatas, tidak bisa manage user lain
```

### C. Status Awal

```javascript
// Admin
status: 'active'    // ✅ Langsung bisa login

// User  
status: 'inactive'  // ❌ Perlu approval admin dulu
```

### D. Auto Login

```javascript
// Admin - Auto login setelah signup
req.session.userId = user.id;
req.session.username = req.body.username;
req.session.user_role = user.user_role;
res.redirect('/dashboard');

// User - Tidak auto login
res.render('signup', {
  success: 'Please wait for admin approval...'
});
```

### E. Validasi Password

```javascript
// Admin - Ketat (8+ char, lowercase, uppercase, number)
body('password')
  .isLength({ min: 8 })
  .matches(/[a-z]/)
  .matches(/[A-Z]/)
  .matches(/[0-9]/)

// User - Sedang (6+ char)
if (password.length < 6) {
  return error;
}
```

---

## 🛡️ Middleware & Proteksi

### isAdmin Middleware

```javascript
// File: app.js (line ~210)
const isAdmin = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    const user = await User.findById(req.session.userId);
    if (!user || user.user_role !== 'admin') {
      return res.redirect('/dashboard');  // Non-admin tidak bisa akses
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.redirect('/dashboard');
  }
};
```

**Route yang dilindungi isAdmin:**
- `/users` - User management
- `/api/users/*` - User API endpoints

---

## 📊 Tabel Perbandingan Lengkap

| Fitur | Admin (`/setup-account`) | User (`/signup`) |
|-------|--------------------------|------------------|
| **Kapan Tersedia** | Hanya saat DB kosong | Setelah admin ada |
| **User Role** | `admin` | `member` |
| **Status Awal** | `active` | `inactive` |
| **Auto Login** | ✅ Ya | ❌ Tidak |
| **Password Min** | 8 karakter | 6 karakter |
| **Password Rules** | Lowercase + Uppercase + Number | Tidak ada |
| **Username Min** | 3 karakter | Tidak ada validasi khusus |
| **Username Rules** | Alphanumeric + underscore | Tidak ada validasi khusus |
| **Max Streams** | `-1` (unlimited) | `-1` (unlimited) |
| **Bisa Manage User** | ✅ Ya | ❌ Tidak |
| **Perlu Approval** | ❌ Tidak | ✅ Ya |
| **Redirect After** | `/dashboard` | Stay di `/signup` |

---

## 🔧 Cara Aktivasi User Baru

### Opsi 1: Via Admin Panel (Recommended)

```
1. Login sebagai admin
2. Buka menu "Users" (/users)
3. Cari user yang status: inactive
4. Klik tombol "Activate"
5. ✅ User sekarang bisa login
```

### Opsi 2: Via Script

```bash
# Aktivasi semua user inactive
node activate-all-users.js
```

### Opsi 3: Via Database (Manual)

```bash
# Lihat user inactive
sqlite3 db/streamflow.db "SELECT id, username, status FROM users WHERE status='inactive';"

# Aktivasi user tertentu (ganti USER_ID)
sqlite3 db/streamflow.db "UPDATE users SET status='active' WHERE id='USER_ID';"

# Atau aktivasi semua
sqlite3 db/streamflow.db "UPDATE users SET status='active' WHERE status='inactive';"
```

---

## 💡 Tips & Best Practices

### 1. Setup Awal
```bash
# Pertama kali install
npm start

# Buka browser: http://localhost:7575
# Otomatis redirect ke /setup-account
# Buat admin pertama
```

### 2. Buat User Baru
```bash
# Setelah admin ada
# User baru buka: http://localhost:7575/signup
# Isi form dan submit
# Admin aktivasi via /users
```

### 3. Reset Admin
```bash
# Jika lupa password admin
node quick-reset-admin.js

# Login dengan:
# Username: admin
# Password: Admin123456
```

### 4. Aktivasi Batch
```bash
# Aktivasi semua user sekaligus
node activate-all-users.js
```

---

## 🐛 Troubleshooting

### Error: "Cannot access /setup-account"
**Penyebab:** Sudah ada user di database

**Solusi:**
```bash
# Cek jumlah user
sqlite3 db/streamflow.db "SELECT COUNT(*) FROM users;"

# Jika ada user, gunakan /signup atau /login
```

### Error: "Cannot access /signup"
**Penyebab:** Belum ada user di database

**Solusi:**
```bash
# Buat admin dulu via /setup-account
# Atau jalankan:
node create-admin.js
```

### User tidak bisa login setelah signup
**Penyebab:** Status masih `inactive`

**Solusi:**
```bash
# Aktivasi user
node activate-all-users.js

# Atau via admin panel /users
```

---

## 📝 Kesimpulan

### Sign Up Admin (`/setup-account`)
- ✅ Untuk **setup awal** aplikasi
- ✅ Langsung jadi **admin** dengan **status active**
- ✅ **Auto login** setelah signup
- ✅ Validasi password **lebih ketat**
- ✅ Bisa **manage semua user**

### Sign Up User (`/signup`)
- ✅ Untuk **user baru** setelah admin ada
- ✅ Jadi **member** dengan **status inactive**
- ✅ **Perlu approval** admin untuk aktivasi
- ✅ Validasi password **lebih ringan**
- ✅ Akses **terbatas** (tidak bisa manage user)

---

**Dokumentasi ini menjelaskan perbedaan lengkap antara signup admin dan signup user di aplikasi StreamFlow.** 🚀
