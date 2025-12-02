const { db } = require('../database');

/**
 * Migration: Add backup and soft delete support
 */
function runMigration() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Add deleted_at column to streams table
      db.run(`
        ALTER TABLE streams 
        ADD COLUMN deleted_at TEXT DEFAULT NULL
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding deleted_at column:', err.message);
        } else {
          console.log('✓ Added deleted_at column to streams table');
        }
      });

      // 2. Create stream_backups table
      db.run(`
        CREATE TABLE IF NOT EXISTS stream_backups (
          id TEXT PRIMARY KEY,
          stream_id TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          backup_data TEXT NOT NULL,
          backup_type TEXT DEFAULT 'auto',
          version INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating stream_backups table:', err.message);
          return reject(err);
        }
        console.log('✓ Created stream_backups table');
      });

      // 3. Create index for faster queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_stream_backups_stream_id 
        ON stream_backups(stream_id)
      `, (err) => {
        if (err) {
          console.error('Error creating index:', err.message);
        } else {
          console.log('✓ Created index on stream_backups');
        }
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_stream_backups_user_id 
        ON stream_backups(user_id)
      `, (err) => {
        if (err) {
          console.error('Error creating index:', err.message);
        } else {
          console.log('✓ Created index on stream_backups user_id');
        }
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_streams_deleted_at 
        ON streams(deleted_at)
      `, (err) => {
        if (err) {
          console.error('Error creating index:', err.message);
        } else {
          console.log('✓ Created index on streams deleted_at');
          resolve();
        }
      });
    });
  });
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };
