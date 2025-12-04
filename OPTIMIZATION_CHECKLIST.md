# ✅ Checklist Optimasi StreamFlow

## 📋 Pre-Optimization Checklist

- [x] Backup database (`npm run backup`)
- [x] Check current RAM usage (353.69 MB)
- [x] Check current CPU usage (4%)
- [x] Stop aplikasi jika sedang berjalan

## 🔧 Optimization Steps

### 1. File Optimization
- [x] `optimize-performance.js` - Created ✅
- [x] `apply-app-optimization.js` - Created ✅
- [x] `optimize-database.js` - Created ✅
- [x] `cleanup-memory.js` - Created ✅
- [x] `START_OPTIMIZED.bat` - Created ✅
- [x] `MONITOR_PERFORMANCE.bat` - Created ✅

### 2. Configuration Updates
- [x] `ecosystem.config.js` - Optimized ✅
  - [x] max_memory_restart: 512M
  - [x] NODE_OPTIONS: --max-old-space-size=384
  - [x] kill_timeout: 3000
  - [x] listen_timeout: 8000

- [x] `.env` - Updated ✅
  - [x] SESSION_MAX_AGE=3600000
  - [x] MAX_FILE_SIZE=500MB
  - [x] FFMPEG_PRESET=veryfast
  - [x] NODE_OPTIONS added

- [x] `app.js` - Enhanced ✅
  - [x] Auto garbage collection
  - [x] Memory monitoring
  - [x] Warning suppression

- [x] `package.json` - Scripts added ✅
  - [x] start:optimized
  - [x] pm2:optimized
  - [x] cleanup
  - [x] monitor
  - [x] db:optimize
  - [x] optimize:all

### 3. Database Optimization
- [x] Run `node optimize-database.js` ✅
  - [x] VACUUM completed
  - [x] ANALYZE completed
  - [x] PRAGMA optimizations applied
  - [x] Old sessions cleaned
  - [x] Old history cleaned

### 4. Documentation
- [x] `OPTIMIZATION_GUIDE.md` - Created ✅
- [x] `QUICK_OPTIMIZATION.txt` - Created ✅
- [x] `OPTIMIZATION_COMPLETE.md` - Created ✅
- [x] `OPTIMIZATION_CHECKLIST.md` - Created ✅

## 🚀 Post-Optimization Steps

### Immediate Actions (WAJIB)
- [ ] **Restart aplikasi**
  ```bash
  pm2 restart streamflow
  # atau
  START_OPTIMIZED.bat
  ```

- [ ] **Verify aplikasi berjalan**
  ```bash
  pm2 status
  pm2 logs streamflow --lines 20
  ```

- [ ] **Test akses aplikasi**
  - [ ] Buka: http://localhost:7575
  - [ ] Login berhasil
  - [ ] Dashboard loading
  - [ ] Upload test (optional)

### Monitoring (First 24 Hours)
- [ ] **Check RAM usage setiap 2 jam**
  ```bash
  pm2 show streamflow
  ```

- [ ] **Check CPU usage**
  ```bash
  pm2 monit
  # atau
  MONITOR_PERFORMANCE.bat
  ```

- [ ] **Check logs untuk errors**
  ```bash
  pm2 logs streamflow
  ```

- [ ] **Verify memory tidak melebihi 512MB**
  - Jika melebihi: aplikasi akan auto-restart
  - Check logs untuk memory warnings

### Daily Maintenance
- [ ] **Run cleanup** (setiap hari)
  ```bash
  npm run cleanup
  ```

- [ ] **Check logs**
  ```bash
  pm2 logs streamflow --lines 50
  ```

- [ ] **Monitor performance**
  - RAM usage trend
  - CPU usage trend
  - Restart count

### Weekly Maintenance
- [ ] **Database optimization** (setiap Minggu)
  ```bash
  npm run db:optimize
  pm2 restart streamflow
  ```

- [ ] **Review logs**
  - Check for memory warnings
  - Check for errors
  - Check restart frequency

- [ ] **Cleanup old files**
  - Old videos (jika ada)
  - Old logs (>7 days)
  - Old backups (>30 days)

### Monthly Maintenance
- [ ] **Full optimization**
  ```bash
  npm run optimize:all
  pm2 restart streamflow
  ```

- [ ] **Performance review**
  - Compare RAM usage (before vs after)
  - Compare CPU usage
  - Compare response time
  - Check uptime

- [ ] **Backup database**
  ```bash
  npm run backup
  ```

## 📊 Success Metrics

### Target Performance
- [ ] RAM usage: 250-300 MB (idle)
- [ ] RAM usage: 300-400 MB (1 stream)
- [ ] CPU usage: 2-5% (idle)
- [ ] CPU usage: 15-25% (1 stream)
- [ ] Startup time: <10 seconds
- [ ] Response time: <500ms

### Monitoring Checklist
- [ ] No memory leaks detected
- [ ] No frequent restarts (max 1/day)
- [ ] No error spikes in logs
- [ ] Database size stable
- [ ] Session cleanup working

## 🔍 Troubleshooting Checklist

### If RAM Usage High (>400MB idle)
- [ ] Run cleanup: `npm run cleanup`
- [ ] Restart app: `pm2 restart streamflow`
- [ ] Check for memory leaks in logs
- [ ] Lower max_memory_restart to 384M
- [ ] Check for zombie FFmpeg processes

### If CPU Usage High (>10% idle)
- [ ] Check FFmpeg processes: `tasklist | findstr ffmpeg`
- [ ] Kill zombie processes
- [ ] Restart app: `pm2 restart streamflow`
- [ ] Reduce concurrent streams limit
- [ ] Check for infinite loops in logs

### If App Keeps Restarting
- [ ] Check logs: `pm2 logs streamflow --lines 100`
- [ ] Increase max_memory_restart to 768M
- [ ] Check for errors in app.js
- [ ] Verify database not corrupted
- [ ] Check disk space

### If Performance Degraded
- [ ] Run database optimization: `npm run db:optimize`
- [ ] Clear old sessions manually
- [ ] Restart app: `pm2 restart streamflow`
- [ ] Check system resources
- [ ] Review recent changes

## 📝 Notes & Observations

### Date: _______________

**RAM Usage:**
- Before: 353.69 MB
- After: _______ MB
- Improvement: _______ %

**CPU Usage:**
- Before: 4%
- After: _______ %
- Improvement: _______ %

**Issues Found:**
- [ ] None
- [ ] Memory leak: _________________
- [ ] CPU spike: _________________
- [ ] Errors: _________________

**Actions Taken:**
- [ ] _________________________
- [ ] _________________________
- [ ] _________________________

**Next Review Date:** _______________

## ✅ Final Verification

- [ ] All optimization files created
- [ ] All configurations updated
- [ ] Database optimized
- [ ] Application restarted
- [ ] Performance monitored
- [ ] Documentation reviewed
- [ ] Backup created
- [ ] Team notified (if applicable)

---

**Optimization Completed By:** _________________
**Date:** December 4, 2025
**Version:** StreamFlow 2.3.0
**Status:** ✅ COMPLETE

## 🎯 Next Steps

1. ✅ Restart aplikasi (WAJIB)
2. ✅ Monitor 24 jam pertama
3. ✅ Setup daily cleanup
4. ✅ Setup weekly database optimization
5. ✅ Review performance setelah 1 minggu

---

*Checklist ini harus diupdate setiap kali melakukan maintenance atau troubleshooting*
