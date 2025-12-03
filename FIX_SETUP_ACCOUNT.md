# 🔧 Fix: Tidak Bisa Setup Account

## ❌ Masalah

Error: **"Failed to create user. Please try again."** di halaman `/setup-account`

## 🔍 Penyebab

Setup account **HANYA bisa digunakan saat database masih kosong** (belum ada user sama sekali).

Saat ini database Anda sudah memiliki **2 user**:
1. **ozang88** (admin) - active
2. **Tes** (member) - active

Karena sudah ada user, route `/setup-account` akan **menolak pembuatan user baru** dan menampilkan error.

---

## ✅ Solusi

Anda punya **4 pilihan**:

### **Pilihan 1: Login dengan Akun yang Ada** ⭐ (RECOMMENDED)

Gunakan akun yang sudah ada untuk login:

```
URL: http://localhost:7575/login

Username: ozang88
Password: [password Anda]
```

Jika lupa password, lanjut ke Pilihan 2.

---

### **Pilihan 2: Reset Password Admin**

Reset password admin yang sudah ada:

```bash
node quick-reset-admin.js
```

**Output:**
```
✅ Admin password reset successfully!

Username: ozang88
New Password: Admin123456

You can now login at: http://localhost:7575/login
```

Setelah itu login dengan:
- Username: `ozang88`
- Password: `Admin123456`

---

### **Pilihan 3: Buat User Baru via Signup**

Buat user baru (bukan admin) via halaman signup:

```
URL: http://localhost:7575/signup

1. Isi form signup
2. User baru akan dibuat dengan status: inactive
3. Login sebagai admin (ozang88)
4. Aktifkan user baru di menu Users
```

**Atau aktifkan otomatis:**
```bash
node activate-all-users.js
```

---

### **Pilihan 4: Hapus Semua User dan Mulai Fresh** ⚠️ (DANGEROUS)

**⚠️ WARNING: Ini akan menghapus SEMUA user dan data terkait!**

```bash
node delete-all-users.js
```

**Konfirmasi:**
```
Type "DELETE ALL USERS" to confirm deletion: DELETE ALL USERS
```

**Setelah dihapus:**
1. Restart aplikasi
2. Buka: http://localhost:7575
3. Otomatis redirect ke `/setup-account`
4. Buat admin baru

---

## 🎯 Penjelasan: Kenapa Setup Account Tidak Bisa Digunakan?

### Logika di `app.js`:

```javascript
// Route: GET /setup-account
app.get('/setup-account', async (req, res) => {
  try {
    const usersExist = await checkIfUsersExist();
    
    // Jika sudah ada user DAN belum login
    if (usersExist && !req.session.userId) {
      return res.redirect('/login');  // ❌ Redirect ke login
    }
    
    // Jika sudah login dan punya username
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user && user.username) {
        return res.redirect('/dashboard');  // ❌ Redirect ke dashboard
      }
    }
    
    // Hanya tampilkan form jika:
    // 1. Belum ada user ATAU
    // 2. Sudah login tapi belum punya username
    res.render('setup-account', {
      title: 'Complete Your Account',
      user: req.session.userId ? await User.findById(req.session.userId) : {},
      error: null
    });
  } catch (error) {
    console.error('Setup account error:', error);
    res.redirect('/login');
  }
});
```

### Logika di `POST /setup-account`:

```javascript
app.post('/setup-account', upload.single('avatar'), async (req, res) => {
  try {
    const usersExist = await checkIfUsersExist();
    
    if (!usersExist) {
      // ✅ Jika belum ada user, buat admin baru
      const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        avatar_path: avatarPath,
        user_role: 'admin',
        status: 'active'
      });
      
      // Auto login
      req.session.userId = user.id;
      return res.redirect('/dashboard');
    } else {
      // ❌ Jika sudah ada user, hanya update user yang sedang login
      await User.update(req.session.userId, {
        username: req.body.username,
        password: req.body.password,
        avatar_path: avatarPath,
      });
      res.redirect('/dashboard');
    }
  } catch (error) {
    // ❌ Error: "Failed to create user"
    res.render('setup-account', {
      title: 'Complete Your Account',
      user: {},
      error: 'Failed to create user. Please try again.'
    });
  }
});
```

**Kesimpulan:**
- Setup account **hanya untuk first-time setup**
- Jika sudah ada user, gunakan `/login` atau `/signup`

---

## 📊 Status Database Anda Saat Ini

```
Total Users: 2

1. ozang88
   - Role: admin
   - Status: active
   - Created: 2025-12-01 18:50:31

2. Tes
   - Role: member
   - Status: active
   - Created: 2025-12-02 21:40:24
```

---

## 🔧 Diagnostic Commands

### Cek Status Database
```bash
node fix-setup-account.js
```

### Cek User yang Ada
```bash
node check-db.js
```

### Reset Admin Password
```bash
node quick-reset-admin.js
```

### Aktivasi Semua User
```bash
node activate-all-users.js
```

### Hapus Semua User (DANGEROUS)
```bash
node delete-all-users.js
```

---

## 💡 Rekomendasi

**Untuk kasus Anda, saya rekomendasikan:**

### **Opsi A: Reset Password Admin** (Paling Aman)

```bash
# 1. Reset password admin
node quick-reset-admin.js

# 2. Login dengan:
#    Username: ozang88
#    Password: Admin123456

# 3. Ganti password di menu Settings
```

### **Opsi B: Hapus User "Tes" dan Login sebagai ozang88**

Jika Anda ingat password ozang88, login saja dengan akun itu.

Jika tidak ingat, gunakan Opsi A.

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
node fix-setup-account.js
```

### Error: "Database locked"
```bash
# Stop aplikasi dulu
pm2 stop streamflow

# Jalankan script
node fix-setup-account.js

# Start lagi
pm2 start streamflow
```

### Masih tidak bisa login setelah reset
```bash
# Cek logs
pm2 logs streamflow --lines 50

# Atau restart aplikasi
pm2 restart streamflow
```

---

## 📋 Checklist

- [ ] Jalankan `node fix-setup-account.js` untuk diagnosa
- [ ] Pilih solusi yang sesuai (1, 2, 3, atau 4)
- [ ] Jika pilih reset password: `node quick-reset-admin.js`
- [ ] Login dengan akun yang ada
- [ ] Ganti password di menu Settings (opsional)

---

## 🎉 Kesimpulan

**Setup account tidak bisa digunakan karena sudah ada user di database.**

**Solusi tercepat:**
```bash
node quick-reset-admin.js
```

Lalu login dengan:
- Username: `ozang88`
- Password: `Admin123456`

---

**Masalah sudah dipahami dan solusi sudah tersedia!** 🚀
