# 🚀 Quick Start - StreamFlow VPS Deployment

## Instalasi Super Cepat (1 Command)

```bash
curl -o install.sh https://raw.githubusercontent.com/meteoradja-ytmjk/streamflowozang/main/install.sh && chmod +x install.sh && ./install.sh
```

Tunggu 5-10 menit, lalu akses: `http://YOUR_SERVER_IP:7575`

## Setelah Instalasi

1. **Buka browser** → `http://YOUR_SERVER_IP:7575`
2. **Buat akun admin** (username & password)
3. **Upload video** → Menu Gallery
4. **Buat stream** → Menu Dashboard → New Stream
5. **Selesai!** 🎉

## Perintah Penting

```bash
# Check status
pm2 status

# Restart
pm2 restart streamflow

# Lihat logs
pm2 logs streamflow

# Reset password
node reset-password.js
```

## Troubleshooting

### Aplikasi tidak bisa diakses?
```bash
pm2 logs streamflow
sudo ufw allow 7575
pm2 restart streamflow
```

### Lupa password?
```bash
cd streamflowozang
node reset-password.js
```

### Update aplikasi?
```bash
cd streamflowozang
git pull origin main
npm install
pm2 restart streamflow
```

## Dokumentasi Lengkap

- **Instalasi Detail**: [INSTALASI_VPS.md](INSTALASI_VPS.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Main README**: [README.md](README.md)

## Support

- GitHub: https://github.com/meteoradja-ytmjk/streamflowozang
- Issues: https://github.com/meteoradja-ytmjk/streamflowozang/issues

---

Modified by Mas Ozang | Original by Bang Tutorial
