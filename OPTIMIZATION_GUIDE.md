# 🚀 Panduan Optimasi RAM & CPU StreamFlow

## Status Saat Ini
- **RAM Usage**: 353.69 MB / 961.50 MB (36.8%)
- **CPU Usage**: 4%

## Optimasi yang Diterapkan

### 1. Memory Limits
- Max memory: **512MB** (turun dari 1GB)
- Node.js heap: **384MB**
- Auto-restart jika melebihi limit

### 2. Node.js Optimization Flags
```bash
--max-old-space-size=384
--optimize-for-size
```

### 3. PM2 Configuration
- Kill timeout: 3s (lebih cepat)
- Listen timeout: 8s
- Max restarts: 10
- Restart delay: 4s

### 4. Session Optimization
- Session max age: 1 jam (turun dari 24 jam)
- SQLite session store dengan cleanup otomatis

### 5. Upload Limits
- Max file size: 500MB (turun dari 10GB)
- Mencegah memory spike saat upload

## Cara Menggunakan

### Opsi 1: Jalankan Optimizer (Recommended)
```bash
node optimize-performance.js
```

### Opsi 2: Start dengan Optimasi
```bash
# Windows
START_OPTIMIZED.bat

# Linux/Mac
npm run start:optimized
```

### Opsi 3: PM2 dengan Optimasi
```bash
npm run pm2:optimized
```

## Monitoring Performance

### Real-time Monitor
```bash
# Windows
MONITOR_PERFORMANCE.bat

# Linux/Mac
npm run monitor
```

### Check Status
```bash
pm2 status
pm2 monit
```

## Cleanup Memory

Jalankan secara berkala untuk membersihkan memory:
```bash
npm run cleanup
```

Atau otomatis dengan cron job (Linux):
```bash
# Cleanup setiap hari jam 3 pagi
0 3 * * * cd /path/to/streamflow && npm run cleanup
```

## Tips Tambahan

### 1. Batasi Concurrent Streams
Edit di app.js atau database:
```javascript
max_streams: 2  // Maksimal 2 stream bersamaan per user
```

### 2. Gunakan FFmpeg Preset Cepat
```javascript
FFMPEG_PRESET=veryfast  // Lebih cepat, CPU lebih rendah
```

### 3. Disable Watch Mode
Pastikan `watch: false` di ecosystem.config.js

### 4. Clear Old Files
```bash
# Hapus video lama (manual)
# Atau buat cron job untuk auto-cleanup
```

### 5. Database Optimization
```bash
# Vacuum database secara berkala
sqlite3 db/streamflow.db "VACUUM;"
```

## Troubleshooting

### Memory Masih Tinggi?
1. Restart aplikasi: `pm2 restart streamflow`
2. Jalankan cleanup: `npm run cleanup`
3. Turunkan max_memory_restart ke 384M

### CPU Spike?
1. Kurangi concurrent streams
2. Gunakan FFmpeg preset lebih cepat
3. Batasi upload size

### Aplikasi Sering Restart?
1. Naikkan max_memory_restart ke 768M
2. Check logs: `pm2 logs streamflow`
3. Identifikasi memory leak

## Monitoring Commands

```bash
# PM2 monitoring
pm2 monit
pm2 status
pm2 logs streamflow --lines 100

# System monitoring
node health-check.js

# Memory usage
pm2 show streamflow
```

## Expected Results

Setelah optimasi:
- **RAM Usage**: ~250-350 MB (turun 30-40%)
- **CPU Usage**: 2-5% (idle), 15-30% (streaming)
- **Startup Time**: Lebih cepat
- **Response Time**: Lebih responsif

## Rollback

Jika ada masalah, restore file original:
```bash
git checkout ecosystem.config.js
pm2 restart streamflow
```

---

**Catatan**: Optimasi ini cocok untuk VPS dengan RAM 1-2GB. Sesuaikan nilai sesuai kebutuhan.
