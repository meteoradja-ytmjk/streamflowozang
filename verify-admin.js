require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('\n==============================================');
console.log('   DATABASE VERIFICATION');
console.log('==============================================\n');

// Check all users
db.all('SELECT * FROM users', [], async (err, users) => {
  if (err) {
    console.error('❌ Error reading users:', err);
    db.close();
    return;
  }
  
  console.log(`📊 Total users in database: ${users.length}\n`);
  
  if (users.length === 0) {
    console.log('⚠️  No users found in database!');
    db.close();
    return;
  }
  
  for (const user of users) {
    console.log('─────────────────────────────────────────────');
    console.log(`User ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.user_role}`);
    console.log(`Status: ${user.status}`);
    console.log(`Max Streams: ${user.max_streams}`);
    console.log(`Created: ${user.created_at}`);
    console.log(`Updated: ${user.updated_at}`);
    
    // Test password verification
    try {
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Password Test (admin123): ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } catch (err) {
      console.log(`Password Test: ❌ Error - ${err.message}`);
    }
  }
  
  console.log('─────────────────────────────────────────────\n');
  
  // Check other tables
  db.get('SELECT COUNT(*) as count FROM videos', [], (err, row) => {
    if (!err) console.log(`📹 Videos: ${row.count}`);
  });
  
  db.get('SELECT COUNT(*) as count FROM streams', [], (err, row) => {
    if (!err) console.log(`📡 Streams: ${row.count}`);
  });
  
  db.get('SELECT COUNT(*) as count FROM stream_history', [], (err, row) => {
    if (!err) console.log(`📜 History: ${row.count}`);
  });
  
  setTimeout(() => {
    console.log('\n==============================================');
    console.log('   READY TO LOGIN');
    console.log('==============================================');
    console.log('URL: http://localhost:7575/login');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('==============================================\n');
    db.close();
  }, 500);
});
