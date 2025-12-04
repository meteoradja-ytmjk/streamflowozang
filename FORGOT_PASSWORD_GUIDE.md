# 🔑 Panduan Forgot Password

## Untuk User

### Jika Lupa Password:

1. **Buka halaman login**: `http://localhost:7575/login`

2. **Klik "Forgot Password?"** di bawah field password

3. **Hubungi Admin via WhatsApp**:
   - Klik tombol "Open WhatsApp"
   - Atau manual ke: **089621453431**
   - Berikan username Anda

4. **Tunggu Admin Reset Password**:
   - Admin akan verifikasi identitas Anda
   - Admin akan reset password
   - Anda akan menerima password baru via WhatsApp

5. **Login dengan Password Baru**:
   - Gunakan password yang diberikan admin
   - Ubah password di Settings jika perlu

---

## Untuk Admin

### Cara Reset Password User:

#### Opsi 1: Via User Management (Web)
1. Login sebagai admin
2. Klik menu **"Users"**
3. Klik icon **edit (✏️)** pada user
4. Isi field **"New Password"**
5. Klik **"Save Changes"**
6. Berikan password baru ke user via WhatsApp

#### Opsi 2: Via Command Line
1. Jalankan salah satu:
   ```bash
   npm run admin:reset-user-password
   ```
   ATAU double-click:
   ```
   RESET_USER_PASSWORD.bat
   ```

2. Pilih user dari daftar

3. Masukkan password baru (min 6 karakter)

4. Konfirmasi password

5. Konfirmasi reset

6. Password berhasil direset!

7. Berikan password baru ke user via WhatsApp

---

## Keamanan

### Tips untuk User:
- ✅ Jangan share password dengan siapa pun
- ✅ Gunakan password yang kuat
- ✅ Ubah password secara berkala
- ✅ Jangan gunakan password yang sama dengan akun lain

### Tips untuk Admin:
- ✅ Verifikasi identitas user sebelum reset password
- ✅ Kirim password baru via WhatsApp (lebih aman)
- ✅ Sarankan user untuk segera mengubah password
- ✅ Catat aktivitas reset password untuk audit

---

## FAQ

**Q: Apakah ada fitur reset password via email?**  
A: Tidak. Untuk keamanan, reset password hanya bisa dilakukan oleh admin.

**Q: Berapa lama proses reset password?**  
A: Tergantung respons admin. Biasanya dalam beberapa menit jika admin online.

**Q: Apakah password lama masih bisa digunakan setelah reset?**  
A: Tidak. Setelah reset, hanya password baru yang bisa digunakan.

**Q: Bisakah user reset password sendiri?**  
A: Tidak. Untuk keamanan, hanya admin yang bisa reset password.

**Q: Bagaimana jika admin lupa password?**  
A: Jalankan script: `node quick-reset-admin.js` atau `npm run admin:reset`

---

## Kontak Admin

**WhatsApp**: 089621453431

Hubungi admin jika:
- Lupa password
- Akun terkunci
- Butuh bantuan login
- Masalah lainnya

---

**Dibuat dengan ❤️ untuk StreamFlow**
