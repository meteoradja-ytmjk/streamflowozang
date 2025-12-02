# Panduan Upload ke GitHub

## Persiapan Sebelum Upload

### 1. Semua File Akan Diupload

⚠️ **PERHATIAN:** Semua file akan diupload ke GitHub termasuk:
- ✅ `node_modules/` - Dependencies (ukuran besar!)
- ✅ `public/uploads/` - File upload user
- ✅ `logs/` - Log aplikasi
- ✅ `.env` - Environment variables (SESSION_SECRET sudah diganti dengan placeholder)

### 2. File yang Akan Diupload

**Core Application:**
- ✅ `app.js` - Main application
- ✅ `package.json` & `package-lock.json` - Dependencies
- ✅ `.env.example` - Template environment

**Folders:**
- ✅ `db/` - Database structure
- ✅ `middleware/` - Express middleware
- ✅ `models/` - Database models
- ✅ `public/` - Static files (CSS, JS, images)
- ✅ `scripts/` - Utility scripts
- ✅ `services/` - Business logic
- ✅ `utils/` - Utility functions
- ✅ `views/` - EJS templates

**Documentation:**
- ✅ `README.md` - Main documentation
- ✅ `INSTALLATION_GUIDE.md` - Installation guide
- ✅ `LICENSE.md` - License

**Configuration:**
- ✅ `.gitignore` - Git ignore rules
- ✅ `.dockerignore` - Docker ignore
- ✅ `docker-compose.yml` - Docker config
- ✅ `Dockerfile` - Docker image

**Utility Scripts:**
- ✅ `check-db.js`
- ✅ `create-admin.js`
- ✅ `generate-secret.js`
- ✅ `install.sh`
- ✅ `migrate-database.js`
- ✅ `reset-admin.js`
- ✅ `reset-password.js`
- ✅ `run-backup-migration.js`

## Langkah Upload ke GitHub

### Opsi 1: Upload via GitHub Web (Mudah)

1. **Buat Repository Baru di GitHub**
   - Buka https://github.com/new
   - Nama repository: `streamflow` (atau nama lain)
   - Description: "Live Streaming Application - Modified by Mas Ozang"
   - Pilih: Public atau Private
   - **JANGAN** centang "Add a README file"
   - Klik "Create repository"

2. **Compress Project**
   ```bash
   # Di folder streamflow-main
   cd ..
   tar -czf streamflow.tar.gz streamflow-main/ --exclude=node_modules --exclude=public/uploads --exclude=logs --exclude=.env
   ```

3. **Upload via Web**
   - Di halaman repository baru, klik "uploading an existing file"
   - Drag & drop file `streamflow.tar.gz`
   - Atau extract dulu, lalu upload folder per folder

### Opsi 2: Upload via Git Command (Recommended)

1. **Install Git (jika belum)**
   ```bash
   sudo apt install git -y
   ```

2. **Konfigurasi Git**
   ```bash
   git config --global user.name "Mas Ozang"
   git config --global user.email "your-email@example.com"
   ```

3. **Initialize Git Repository**
   ```bash
   cd /path/to/streamflow-main
   git init
   ```

4. **Add Remote Repository**
   ```bash
   # Ganti URL dengan repository Anda
   git remote add origin https://github.com/YOUR_USERNAME/streamflow.git
   ```

5. **Add & Commit Files**
   ```bash
   # Add semua file (kecuali yang di .gitignore)
   git add .
   
   # Commit dengan message
   git commit -m "Initial commit - StreamFlow modified by Mas Ozang"
   ```

6. **Push ke GitHub**
   ```bash
   # Push ke branch main
   git push -u origin main
   
   # Jika diminta login, masukkan:
   # Username: your_github_username
   # Password: your_personal_access_token (bukan password biasa!)
   ```

### Opsi 3: Upload via GitHub Desktop (Windows/Mac)

1. Download GitHub Desktop: https://desktop.github.com/
2. Login dengan akun GitHub
3. File → Add Local Repository
4. Pilih folder `streamflow-main`
5. Publish repository
6. Pilih nama dan deskripsi
7. Klik "Publish repository"

## Membuat Personal Access Token (untuk Git Command)

1. Buka GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Pilih scopes: `repo` (full control)
5. Generate token
6. **SIMPAN TOKEN** - tidak akan ditampilkan lagi!
7. Gunakan token sebagai password saat push

## Setelah Upload

### 1. Verifikasi Upload
- Buka repository di GitHub
- Pastikan semua file terupload
- Check file `.env` **TIDAK** ada (harus di-ignore)
- Check folder `node_modules/` **TIDAK** ada

### 2. Update Repository Description
- Tambahkan description yang jelas
- Tambahkan topics/tags: `streaming`, `nodejs`, `ffmpeg`, `live-streaming`

### 3. Buat Release (Optional)
- Pergi ke Releases
- Create a new release
- Tag version: `v2.1-modified`
- Release title: "StreamFlow v2.1 - Modified by Mas Ozang"
- Describe changes

### 4. Update README Badge (Optional)
Tambahkan badge di README.md:
```markdown
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/streamflow)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/streamflow)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/streamflow)
```

## Clone Repository (untuk User Lain)

User lain dapat clone dengan:
```bash
git clone https://github.com/YOUR_USERNAME/streamflow.git
cd streamflow
npm install
node generate-secret.js
npm run dev
```

## Update Repository (Jika Ada Perubahan)

```bash
# Add perubahan
git add .

# Commit
git commit -m "Update: deskripsi perubahan"

# Push
git push origin main
```

## Troubleshooting

### Error: Permission Denied
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add SSH key ke GitHub
cat ~/.ssh/id_ed25519.pub
# Copy output, paste ke GitHub → Settings → SSH Keys
```

### Error: Repository Already Exists
```bash
# Hapus remote lama
git remote remove origin

# Add remote baru
git remote add origin https://github.com/YOUR_USERNAME/streamflow.git
```

### Error: Large Files
```bash
# Check file size
du -sh *

# Jika ada file besar, tambahkan ke .gitignore
echo "nama-file-besar" >> .gitignore
```

## Checklist Sebelum Upload

- [x] SESSION_SECRET di `.env` sudah diganti dengan placeholder
- [x] README.md sudah diupdate
- [x] Credit "modified by Mas Ozang" sudah ditambahkan
- [x] Semua file dokumentasi tidak penting sudah dihapus
- [x] .gitignore dikosongkan (semua file akan diupload)
- [ ] **PENTING:** User harus generate secret key baru setelah clone!

## Selesai!

Repository siap diupload ke GitHub! 🚀

---
**PENTING:** 
- ✅ SESSION_SECRET di `.env` sudah diganti dengan placeholder
- ⚠️ User WAJIB menjalankan `node generate-secret.js` setelah clone
- ⚠️ Upload akan memakan waktu lama karena termasuk `node_modules/` (ukuran besar)
