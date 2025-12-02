const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/streamflow.db');

console.log('Checking database tables...\n');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Tables in database:');
  tables.forEach(table => {
    console.log('  -', table.name);
  });
  
  // Check for stream_backups
  const hasBackups = tables.some(t => t.name === 'stream_backups');
  console.log('\nstream_backups table:', hasBackups ? '✅ EXISTS' : '❌ NOT FOUND');
  
  // Check streams table for deleted_at
  db.all("PRAGMA table_info(streams)", (err, columns) => {
    if (err) {
      console.error('Error checking streams:', err);
    } else {
      const hasDeletedAt = columns.some(col => col.name === 'deleted_at');
      console.log('deleted_at column:', hasDeletedAt ? '✅ EXISTS' : '❌ NOT FOUND');
      
      if (!hasBackups || !hasDeletedAt) {
        console.log('\n⚠️  Migration needed! Run: node run-backup-migration.js');
      } else {
        console.log('\n✅ Database is ready!');
      }
    }
    
    db.close();
  });
});
