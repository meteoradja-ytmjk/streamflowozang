#!/usr/bin/env node
/**
 * Database Optimization Script
 * Mengoptimalkan SQLite database untuk performa lebih baik
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🗄️  Database Optimization Tool\n');

const databases = [
  './db/streamflow.db',
  './db/sessions.db'
];

async function optimizeDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dbPath)) {
      console.log(`⚠️  ${path.basename(dbPath)} tidak ditemukan, skip...`);
      return resolve();
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(`❌ Error opening ${path.basename(dbPath)}:`, err.message);
        return reject(err);
      }

      console.log(`📊 Optimizing ${path.basename(dbPath)}...`);

      // Get database size before
      const statsBefore = fs.statSync(dbPath);
      const sizeBefore = (statsBefore.size / 1024 / 1024).toFixed(2);

      // Run optimization commands
      db.serialize(() => {
        // 1. VACUUM - Rebuild database file, reclaim unused space
        db.run('VACUUM', (err) => {
          if (err) console.error('   VACUUM error:', err.message);
          else console.log('   ✓ VACUUM completed');
        });

        // 2. ANALYZE - Update query optimizer statistics
        db.run('ANALYZE', (err) => {
          if (err) console.error('   ANALYZE error:', err.message);
          else console.log('   ✓ ANALYZE completed');
        });

        // 3. Set PRAGMA for better performance
        const pragmas = [
          'PRAGMA journal_mode = WAL',           // Write-Ahead Logging
          'PRAGMA synchronous = NORMAL',         // Balance safety/speed
          'PRAGMA cache_size = 2000',            // 2000 pages cache
          'PRAGMA temp_store = MEMORY',          // Temp tables in memory
          'PRAGMA mmap_size = 30000000000',      // Memory-mapped I/O
          'PRAGMA page_size = 4096'              // Optimal page size
        ];

        pragmas.forEach(pragma => {
          db.run(pragma, (err) => {
            if (err) console.error(`   ${pragma} error:`, err.message);
            else console.log(`   ✓ ${pragma.split('=')[0].trim()}`);
          });
        });

        // Close and show results
        db.close((err) => {
          if (err) {
            console.error('   Error closing database:', err.message);
            return reject(err);
          }

          // Get database size after
          const statsAfter = fs.statSync(dbPath);
          const sizeAfter = (statsAfter.size / 1024 / 1024).toFixed(2);
          const saved = (sizeBefore - sizeAfter).toFixed(2);

          console.log(`   📦 Size: ${sizeBefore}MB → ${sizeAfter}MB (saved ${saved}MB)`);
          console.log(`   ✅ ${path.basename(dbPath)} optimized!\n`);
          resolve();
        });
      });
    });
  });
}

async function cleanOldSessions() {
  return new Promise((resolve, reject) => {
    const sessionsDb = './db/sessions.db';
    
    if (!fs.existsSync(sessionsDb)) {
      return resolve();
    }

    const db = new sqlite3.Database(sessionsDb, (err) => {
      if (err) return reject(err);

      console.log('🧹 Cleaning old sessions...');

      // Delete sessions older than 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      db.run(
        'DELETE FROM sessions WHERE expired < ?',
        [oneDayAgo],
        function(err) {
          if (err) {
            console.error('   Error cleaning sessions:', err.message);
            return reject(err);
          }

          console.log(`   ✓ Deleted ${this.changes} old sessions\n`);
          
          db.close(() => resolve());
        }
      );
    });
  });
}

async function cleanOldHistory() {
  return new Promise((resolve, reject) => {
    const mainDb = './db/streamflow.db';
    
    if (!fs.existsSync(mainDb)) {
      return resolve();
    }

    const db = new sqlite3.Database(mainDb, (err) => {
      if (err) return reject(err);

      console.log('🧹 Cleaning old stream history...');

      // Delete history older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString();
      
      db.run(
        'DELETE FROM stream_history WHERE start_time < ?',
        [thirtyDaysAgo],
        function(err) {
          if (err) {
            console.error('   Error cleaning history:', err.message);
            return reject(err);
          }

          console.log(`   ✓ Deleted ${this.changes} old history entries\n`);
          
          db.close(() => resolve());
        }
      );
    });
  });
}

// Main execution
(async () => {
  try {
    console.log('Starting database optimization...\n');
    
    // Optimize each database
    for (const dbPath of databases) {
      await optimizeDatabase(dbPath);
    }

    // Clean old data
    await cleanOldSessions();
    await cleanOldHistory();

    console.log('========================================');
    console.log('✨ Database optimization complete!');
    console.log('========================================\n');
    console.log('Recommendations:');
    console.log('- Run this script weekly: node optimize-database.js');
    console.log('- Or add to cron: 0 3 * * 0 (every Sunday 3 AM)');
    console.log('- Restart app after optimization: pm2 restart streamflow\n');

  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
})();
