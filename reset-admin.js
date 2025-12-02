// Reset Admin Password Script
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('=================================');
console.log('StreamFlow - Reset Admin Password');
console.log('=================================\n');

// Get all users
db.all('SELECT id, username, user_role FROM users', [], (err, users) => {
  if (err) {
    console.error('Error fetching users:', err.message);
    db.close();
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('No users found in database.');
    console.log('Please run the app and create an account via /setup-account');
    db.close();
    process.exit(0);
  }

  console.log('Available users:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} (${user.user_role})`);
  });

  rl.question('\nSelect user number to reset password: ', (answer) => {
    const userIndex = parseInt(answer) - 1;
    
    if (userIndex < 0 || userIndex >= users.length) {
      console.log('Invalid selection!');
      db.close();
      rl.close();
      process.exit(1);
    }

    const selectedUser = users[userIndex];
    
    rl.question('Enter new password: ', (password) => {
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

        // Update password
        db.run(
          'UPDATE users SET password = ?, user_role = ?, status = ? WHERE id = ?',
          [hashedPassword, 'admin', 'active', selectedUser.id],
          function(err) {
            if (err) {
              console.error('Error updating password:', err.message);
              db.close();
              rl.close();
              process.exit(1);
            }

            console.log('\n✓ Password updated successfully!');
            console.log(`✓ User "${selectedUser.username}" is now an active admin`);
            console.log('\nYou can now login with:');
            console.log(`  Username: ${selectedUser.username}`);
            console.log(`  Password: ${password}`);
            console.log('\nGo to: http://localhost:7575/login');

            db.close();
            rl.close();
          }
        );
      });
    });
  });
});
