const fs = require('fs');
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
      console.log(`Deleted old log: ${file}`);
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
