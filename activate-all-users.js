#!/usr/bin/env node

/**
 * Activate All Users - Aktifkan semua user yang inactive
 * Usage: node activate-all-users.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('👥 Activate All Users\n');
console.log('='.repeat(50));

async function activateAllUsers() {
  try {
    // Get all inactive users
    const inactiveUsers = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, username, user_role, status FROM users WHERE status = 'inactive'",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (inactiveUsers.length === 0) {
      console.log('✅ No inactive users found. All users are already active!\n');
      db.close();
      process.exit(0);
      return;
    }

    console.log(`\n📋 Found ${inactiveUsers.length} inactive user(s):\n`);
    inactiveUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.user_role})`);
    });

    console.log('\n🔄 Activating all users...\n');

    // Activate all inactive users
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

    console.log('✅ All users activated successfully!\n');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  Activated: ${inactiveUsers.length} user(s)`);
    console.log('\n🌐 Users can now login at: http://localhost:7575/login');
    console.log('\n='.repeat(50));

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    db.close();
    process.exit(1);
  }
}

activateAllUsers();
