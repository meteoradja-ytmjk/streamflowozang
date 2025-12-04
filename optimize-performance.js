#!/usr/bin/env node
/**
 * StreamFlow Performance Optimizer
 * Mengoptimalkan penggunaan RAM dan CPU
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 StreamFlow Performance Optimizer\n');

// 1. Update ecosystem.config.js untuk optimasi PM2
const ecosystemConfig = `module.exports = {
  apps: [{
    name: 'streamflow',
    script: './app.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M', // Turun dari 1G ke 512M
    env: {
      NODE_ENV: 'production',
      PORT: 7575,
      // Node.js memory optimization
      NODE_OPTIONS: '--max-old-space-size=384 --optimize-for-size'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 3000, // Turun dari 5000
    listen_timeout: 8000, // Turun dari 10000
    shutdown_with_message: true,
    // Optimasi tambahan
    node_args: '--max-old-space-size=384 --optimize-for-size',
    max_old_space_size: 384
  }]
};
`;

fs.writeFileSync('ecosystem.config.js', ecosystemConfig);
console.log('✅ ecosystem.config.js dioptimalkan');

// 2. Buat file .env optimization hints
const envOptimization = `
# ========================================
# PERFORMANCE OPTIMIZATION SETTINGS
# ========================================

# Session optimization - kurangi waktu session
SESSION_MAX_AGE=3600000

# Upload limits - batasi ukuran upload
MAX_FILE_SIZE=500MB
MAX_VIDEO_SIZE=500MB

# FFmpeg optimization
FFMPEG_THREADS=2
FFMPEG_PRESET=veryfast

# Database optimization
DB_CACHE_SIZE=2000
DB_PAGE_SIZE=4096

# Memory limits
NODE_OPTIONS=--max-old-space-size=384 --optimize-for-size
`;

// Append ke .env jika belum ada
const envPath = '.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('PERFORMANCE OPTIMIZATION')) {
    fs.appendFileSync(envPath, envOptimization);
    console.log('✅ .env diupdate dengan optimization settings');
  }
}

// 3. Buat startup script yang optimal
const startScript = `@echo off
echo Starting StreamFlow with optimized settings...

REM Set Node.js memory limits
set NODE_OPTIONS=--max-old-space-size=384 --optimize-for-size

REM Start dengan PM2 (recommended)
pm2 start ecosystem.config.js

REM Atau start langsung (alternative)
REM node app.js

echo.
echo StreamFlow started with optimized performance settings
echo Memory limit: 384MB
echo CPU optimization: Enabled
pause
`;

fs.writeFileSync('START_OPTIMIZED.bat', startScript);
console.log('✅ START_OPTIMIZED.bat dibuat');

// 4. Buat monitoring script
const monitorScript = `@echo off
:loop
cls
echo ========================================
echo   StreamFlow Performance Monitor
echo ========================================
echo.
pm2 monit
timeout /t 5 >nul
goto loop
`;

fs.writeFileSync('MONITOR_PERFORMANCE.bat', monitorScript);
console.log('✅ MONITOR_PERFORMANCE.bat dibuat');

// 5. Buat cleanup script untuk free memory
const cleanupScript = `const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up to free memory...');

// Clear old logs
const logsDir = './logs';
if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir);
  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    const daysSinceModified = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);
    
    if (daysSinceModified > 7) {
      fs.unlinkSync(filePath);
      console.log(\`Deleted old log: \${file}\`);
    }
  });
}

// Clear old sessions
const sessionsDb = './db/sessions.db';
if (fs.existsSync(sessionsDb)) {
  console.log('Sessions database exists');
}

// Force garbage collection if available
if (global.gc) {
  global.gc();
  console.log('✅ Garbage collection triggered');
}

console.log('✅ Cleanup complete!');
`;

fs.writeFileSync('cleanup-memory.js', cleanupScript);
console.log('✅ cleanup-memory.js dibuat');

// 6. Update package.json scripts
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['start:optimized'] = 'node --max-old-space-size=384 --optimize-for-size app.js';
  packageJson.scripts['pm2:optimized'] = 'pm2 start ecosystem.config.js';
  packageJson.scripts['cleanup'] = 'node cleanup-memory.js';
  packageJson.scripts['monitor'] = 'pm2 monit';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json scripts diupdate');
}

console.log('\n========================================');
console.log('✨ Optimasi selesai!');
console.log('========================================\n');
console.log('Cara menggunakan:');
console.log('1. Jalankan: START_OPTIMIZED.bat');
console.log('2. Monitor: MONITOR_PERFORMANCE.bat');
console.log('3. Cleanup: node cleanup-memory.js');
console.log('\nAtau gunakan npm scripts:');
console.log('- npm run start:optimized');
console.log('- npm run pm2:optimized');
console.log('- npm run cleanup');
console.log('- npm run monitor');
console.log('\n========================================\n');
