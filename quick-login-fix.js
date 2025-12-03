#!/usr/bin/env node

/**
 * Quick Login Fix - Aktifkan user dan reset password jika perlu
 * Usage: node quick-login-fix.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Quick Login Fix\n');
console.log('='.repeat(50));

async function quickLoginFix() {
  try {
    // Get all users
    const users = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, username, user_role, status FROM users ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (users.length === 0) {
      console.log('\n❌ No users found in database');
      console.log('   Please create an account via /signup first');
      db.close();
      rl.close();
      process.exit(1);
    }

    console.log('\n📋 Users in database:\n');
    users.forEach((user, index) => {
      const statusIcon = user.status === 'active' ? '✅' : '❌';
      console.log(`${index + 1}. ${user.username} (${user.user_role}) ${statusIcon} ${user.status}`);
    });

    // Check for inactive users
    const inactiveUsers = users.filter(u => u.status === 'inactive');
    
    if (inactiveUsers.length > 0) {
      console.log(`\n⚠️  Found ${inactiveUsers.length} inactive user(s)`);
      console.log('\nOptions:');
      console.log('1. Activate all inactive users');
      console.log('2. Activate specific user');
      console.log('3. Exit');
      
      rl.question('\nChoose option (1-3): ', async (option) => {
        if (option === '1') {
          // Activate all
          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE users SET status = 'active' WHERE status = 'inactive'",
              [],
              function(err) {
                if (err) reject(err);
                else resolve(this);
              }
            );
          });
          
          console.log('\n✅ All users activated successfully!');
          console.log('\n🌐 You can now login at: http://localhost:7575/login');
          db.close();
          rl.close();
          
        } else if (option === '2') {
          // Activate specific user
          rl.question('\nEnter user number to activate: ', async (userNum) => {
            const userIndex = parseInt(userNum) - 1;
            
            if (userIndex < 0 || userIndex >= users.length) {
              console.log('❌ Invalid user number');
              db.close();
              rl.close();
              process.exit(1);
            }
            
            const selectedUser = users[userIndex];
            
            await new Promise((resolve, reject) => {
              db.run(
                "UPDATE users SET status = 'active' WHERE id = ?",
                [selectedUser.id],
                function(err) {
                  if (err) reject(err);
                  else resolve(this);
                }
              );
            });
            
            console.log(`\n✅ User "${selectedUser.username}" activated!`);
            
            // Ask if want to reset password
            rl.question('\nReset password for this user? (y/n): ', async (resetPwd) => {
              if (resetPwd.toLowerCase() === 'y') {
                rl.question('Enter new password: ', async (password) => {
                  if (password.length < 6) {
                    console.log('❌ Password must be at least 6 characters');
                    db.close();
                    rl.close();
                    process.exit(1);
                  }
                  
                  const hashedPassword = await bcrypt.hash(password, 10);
                  
                  await new Promise((resolve, reject) => {
                    db.run(
                      'UPDATE users SET password = ? WHERE id = ?',
                      [hashedPassword, selectedUser.id],
                      function(err) {
                        if (err) reject(err);
                        else resolve(this);
                      }
                    );
                  });
                  
                  console.log('\n✅ Password updated successfully!');
                  console.log('\n🎉 Login credentials:');
                  console.log(`   Username: ${selectedUser.username}`);
                  console.log(`   Password: ${password}`);
                  console.log(`   Status: active`);
                  console.log('\n🌐 Login at: http://localhost:7575/login');
                  
                  db.close();
                  rl.close();
                });
              } else {
                console.log('\n🌐 Login at: http://localhost:7575/login');
                db.close();
                rl.close();
              }
            });
          });
          
        } else {
          console.log('\nExiting...');
          db.close();
          rl.close();
        }
      });
      
    } else {
      console.log('\n✅ All users are already active!');
      console.log('\nIf you still cannot login, try:');
      console.log('1. Check username and password');
      console.log('2. Clear browser cache');
      console.log('3. Restart application: pm2 restart streamflow');
      console.log('4. Reset password: node reset-password.js');
      
      db.close();
      rl.close();
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    db.close();
    rl.close();
    process.exit(1);
  }
}

quickLoginFix();
