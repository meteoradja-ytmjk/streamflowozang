// Database Migration Script
// Run this to add missing columns to existing database

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting database migration...');

// Add audio_id column to streams table
db.run(`ALTER TABLE streams ADD COLUMN audio_id TEXT`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✓ Column audio_id already exists in streams table');
    } else {
      console.error('✗ Error adding audio_id column:', err.message);
    }
  } else {
    console.log('✓ Added audio_id column to streams table');
  }
});

// Create audios table if not exists
db.run(`CREATE TABLE IF NOT EXISTS audios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  filepath TEXT NOT NULL,
  file_size INTEGER,
  duration REAL,
  format TEXT,
  bitrate INTEGER,
  sample_rate INTEGER,
  channels INTEGER,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`, (err) => {
  if (err) {
    console.error('✗ Error creating audios table:', err.message);
  } else {
    console.log('✓ Audios table created/verified');
  }
});

// Create schedule_templates table if not exists
db.run(`CREATE TABLE IF NOT EXISTS schedule_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stream_id TEXT NOT NULL,
  recurrence_type TEXT NOT NULL,
  recurrence_days TEXT,
  start_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  end_date TEXT,
  is_active INTEGER DEFAULT 1,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`, (err) => {
  if (err) {
    console.error('✗ Error creating schedule_templates table:', err.message);
  } else {
    console.log('✓ Schedule_templates table created/verified');
  }
});

// Create scheduled_streams table if not exists
db.run(`CREATE TABLE IF NOT EXISTS scheduled_streams (
  id TEXT PRIMARY KEY,
  template_id TEXT,
  stream_id TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TEXT,
  ended_at TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES schedule_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`, (err) => {
  if (err) {
    console.error('✗ Error creating scheduled_streams table:', err.message);
  } else {
    console.log('✓ Scheduled_streams table created/verified');
  }
  
  // Close database after all operations
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\n✓ Migration completed successfully!');
        console.log('You can now run: npm start');
      }
    });
  }, 1000);
});
