require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetAdminDefault() {
  console.log('\n==============================================');
  console.log('   RESET ADMIN WITH DEFAULT CREDENTIALS');
  console.log('==============================================\n');
  
  console.log('Default Admin Credentials:');
  console.log('  Username: admin');
  console.log('  Password: Admin123\n');
  
  const confirm = await question('Create/Reset admin with these credentials? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('\n❌ Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  const dbPath = path.join(__dirname, 'db', 'streamflow.db');
  const db = new sqlite3.Database(dbPath);
  
  const username = 'admin';
  const password = 'Admin123';
  
  console.log('\n🔄 Processing...');
  
  // Check if admin user exists
  const existingUser = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existingUser) {
    // Update existing admin
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, user_role = ?, status = ?, updated_at = ? WHERE username = ?',
        [hashedPassword, 'admin', 'active', new Date().toISOString(), username],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('\n✅ Admin account updated successfully!');
  } else {
    // Create new admin
    const userId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, password, user_role, status, max_streams, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, username, hashedPassword, 'admin', 'active', -1, new Date().toISOString(), new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('\n✅ Admin account created successfully!');
  }
  
  // Verify the admin
  const verifyUser = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (verifyUser) {
    console.log('\n==============================================');
    console.log('   ADMIN CREDENTIALS');
    console.log('==============================================');
    console.log(`Username: ${verifyUser.username}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${verifyUser.user_role}`);
    console.log(`Status: ${verifyUser.status}`);
    console.log(`Max Streams: ${verifyUser.max_streams === -1 ? 'Unlimited' : verifyUser.max_streams}`);
    console.log('==============================================\n');
    console.log('✅ Admin verified in database');
  }
  
  db.close();
  rl.close();
  
  console.log('\n📌 Next steps:');
  console.log('   1. Go to http://localhost:7575/login');
  console.log('   2. Login with:');
  console.log('      Username: admin');
  console.log('      Password: Admin123\n');
}

resetAdminDefault().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
