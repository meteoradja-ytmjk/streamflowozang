// Create New Admin Script
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('============================');
console.log('StreamFlow - Create New Admin');
console.log('============================\n');

rl.question('Enter username: ', (username) => {
  if (username.length < 3) {
    console.log('Username must be at least 3 characters!');
    db.close();
    rl.close();
    process.exit(1);
  }

  // Check if username exists
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error checking username:', err.message);
      db.close();
      rl.close();
      process.exit(1);
    }

    if (row) {
      console.log(`Username "${username}" already exists!`);
      console.log('Use reset-admin.js to reset password instead.');
      db.close();
      rl.close();
      process.exit(1);
    }

    rl.question('Enter password: ', (password) => {
      if (password.length < 6) {
        console.log('Password must be at least 6 characters!');
        db.close();
        rl.close();
        process.exit(1);
      }

      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err.message);
          db.close();
          rl.close();
          process.exit(1);
        }

        const userId = uuidv4();
        const now = new Date().toISOString();

        // Create admin user
        db.run(
          `INSERT INTO users (id, username, password, user_role, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, username, hashedPassword, 'admin', 'active', now, now],
          function(err) {
            if (err) {
              console.error('Error creating admin:', err.message);
              db.close();
              rl.close();
              process.exit(1);
            }

            console.log('\n✓ Admin created successfully!');
            console.log('\nLogin credentials:');
            console.log(`  Username: ${username}`);
            console.log(`  Password: ${password}`);
            console.log(`  Role: admin`);
            console.log(`  Status: active`);
            console.log('\nGo to: http://localhost:7575/login');

            db.close();
            rl.close();
          }
        );
      });
    });
  });
});
