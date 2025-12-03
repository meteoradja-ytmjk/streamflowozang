const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('Running migration: Add max_streams column to users table');

db.run(`ALTER TABLE users ADD COLUMN max_streams INTEGER DEFAULT -1`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column max_streams already exists, skipping migration');
    } else {
      console.error('Error adding max_streams column:', err.message);
    }
  } else {
    console.log('Successfully added max_streams column to users table');
  }
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Migration completed');
    }
  });
});
