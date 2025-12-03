# 🔧 Panduan Perbaikan Signup Error

## ❌ Masalah
Error: "An error occurred during registration. Please try again."

## ✅ Solusi (3 Langkah)

### **Langkah 1: Perbaiki Database**

Jalankan script untuk check dan fix database:

```bash
node fix-signup.js
```

**Output yang diharapkan:**
```
🔧 Fix Signup Issues

==================================================

1️⃣ Checking database structure...

✅ Users table exists

📋 Table columns:
   - id
   - username
   - password
   - avatar_path
   - user_role
   - status
   - max_streams
   - created_at
   - updated_at

✅ max_streams column exists

2️⃣ Checking existing users...

✅ Found 1 user(s):

   1. admin (admin) - active

3️⃣ Testing database write permissions...

✅ Database is writable

4️⃣ Checking uploads directory...

✅ Avatars directory exists

==================================================

✅ Signup system check complete!

📋 Summary:
   - Database: OK
   - Users table: OK
   - Columns: OK
   - Total users: 1
   - Inactive users: 0
   - Uploads directory: OK

✅ Signup should work now!
   Try creating a new account at: /signup

==================================================
```

### **Langkah 2: Restart Aplikasi**

Restart aplikasi untuk apply perubahan:

```bash
pm2 restart streamflow
```

Atau jika tidak pakai PM2:

```bash
# Stop aplikasi (Ctrl+C)
# Start lagi
npm start
```

### **Langkah 3: Test Signup**

**Opsi A: Test via Script**

```bash
node test-signup.js
```

**Output yang diharapkan:**
```
🧪 Test Signup Functionality

==================================================

1️⃣ Creating test user...

   Username: testuser_1234567890
   Password: Test123456
   Role: member
   Status: inactive

✅ Test user created successfully!

   User ID: abc-123-def-456
   Username: testuser_1234567890
   Role: member
   Status: inactive

2️⃣ Verifying user in database...

✅ User found in database
   ID: abc-123-def-456
   Username: testuser_1234567890
   Role: member
   Status: inactive
   Max Streams: -1

3️⃣ Cleaning up test user...

✅ Test user deleted

==================================================

🎉 Signup test PASSED!

✅ Signup functionality is working correctly
   You can now create accounts via /signup

==================================================
```

**Opsi B: Test via Browser**

1. Buka: `http://localhost:7575/signup`
2. Isi form:
   - Username: `testuser`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
3. Klik "Create Account"
4. Seharusnya muncul: "Account created successfully! Please wait for admin approval..."

---

## 🎯 Setelah Signup Berhasil

### Aktifkan User Baru

User baru akan berstatus **inactive** dan perlu diaktifkan oleh admin.

**Cara 1: Login sebagai Admin**

```bash
# Reset password admin dulu
node quick-reset-admin.js

# Login dengan:
# Username: admin
# Password: Admin123456

# Lalu aktifkan user di menu Users
```

**Cara 2: Aktifkan Semua User Otomatis**

```bash
node activate-all-users.js
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

```bash
npm install
node fix-signup.js
```

### Error: "Database locked"

```bash
pm2 stop streamflow
node fix-signup.js
pm2 start streamflow
```

### Error: "UNIQUE constraint failed"

Username sudah ada, gunakan username lain atau hapus user lama:

```bash
# Lihat daftar user
sqlite3 db/streamflow.db "SELECT username FROM users;"

# Hapus user tertentu (ganti USERNAME)
sqlite3 db/streamflow.db "DELETE FROM users WHERE username='USERNAME';"
```

### Error: "Permission denied"

Fix permissions:

```bash
chmod 644 db/streamflow.db
chmod 755 public/uploads/avatars/
```

### Signup masih error setelah fix

Check logs aplikasi:

```bash
pm2 logs streamflow --lines 50
```

Atau jika tidak pakai PM2, check terminal output saat signup.

---

## 📋 Checklist

- [ ] Jalankan `node fix-signup.js`
- [ ] Restart aplikasi (`pm2 restart streamflow`)
- [ ] Test signup (`node test-signup.js`)
- [ ] Coba signup via browser
- [ ] Aktifkan user baru (`node activate-all-users.js`)
- [ ] Login dengan user baru

---

## 🎉 Selesai!

Setelah mengikuti langkah di atas, signup seharusnya sudah berfungsi normal.

**Jika masih ada masalah, jalankan:**

```bash
# Full diagnostic
node fix-signup.js

# Check logs
pm2 logs streamflow

# Test signup
node test-signup.js
```

---

## 💡 Perubahan yang Dilakukan

1. ✅ Fixed `User.create()` - Added `max_streams: -1` parameter
2. ✅ Improved error handling - More specific error messages
3. ✅ Added logging - Better debugging information
4. ✅ Created fix script - `fix-signup.js` for diagnostics
5. ✅ Created test script - `test-signup.js` for testing

---

**Signup sudah diperbaiki dan siap digunakan!** 🚀
