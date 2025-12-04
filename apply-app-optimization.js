#!/usr/bin/env node
/**
 * Apply runtime optimizations to app.js
 * Menambahkan memory management dan performance tweaks
 */

const fs = require('fs');

console.log('🔧 Applying app.js optimizations...\n');

// Baca app.js
let appContent = fs.readFileSync('app.js', 'utf8');

// Cek apakah sudah ada optimasi
if (appContent.includes('PERFORMANCE OPTIMIZATION')) {
  console.log('⚠️  Optimasi sudah diterapkan sebelumnya');
  process.exit(0);
}

// Tambahkan optimasi di awal file (setelah require dotenv)
const optimizationCode = `
// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Garbage collection hints
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 60000); // GC setiap 1 menit
}

// Memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  
  if (heapUsedMB > 350) {
    console.warn(\`⚠️  High memory usage: \${heapUsedMB}MB / \${heapTotalMB}MB\`);
    if (global.gc) global.gc();
  }
}, 30000); // Check setiap 30 detik

// Process optimization
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('MaxListeners warning suppressed');
  }
});

// ========================================
`;

// Insert setelah require('dotenv').config();
appContent = appContent.replace(
  "require('dotenv').config();",
  "require('dotenv').config();" + optimizationCode
);

// Tulis kembali
fs.writeFileSync('app.js', appContent);

console.log('✅ app.js dioptimalkan dengan:');
console.log('   - Auto garbage collection setiap 1 menit');
console.log('   - Memory monitoring setiap 30 detik');
console.log('   - Warning suppression');
console.log('\n⚠️  PENTING: Restart aplikasi untuk menerapkan perubahan');
console.log('   Jalankan: pm2 restart streamflow');
console.log('   Atau: START_OPTIMIZED.bat\n');
