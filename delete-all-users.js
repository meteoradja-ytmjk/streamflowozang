#!/usr/bin/env node

/**
 * Delete All Users (DANGEROUS)
 * Use this ONLY if you want to start fresh
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  DELETE ALL USERS - DANGEROUS OPERATION\n');
console.log('='.repeat(60));
console.log('\n⚠️  WARNING: This will delete ALL users from database!');
console.log('   This action CANNOT be undone!');
console.log('   Use this ONLY if you want to start fresh.\n');

async function deleteAllUsers() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found at:', dbPath);
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath);

  try {
    // Show existing users
    const users = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, username, user_role, status FROM users',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (users.length === 0) {
      console.log('✅ No users found in database.');
      console.log('   You can create first admin via /setup-account');
      db.close();
      rl.close();
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s) to delete:\n`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.user_role}) - ${user.status}`);
    });

    console.log('\n' + '='.repeat(60));

    rl.question('\n⚠️  Type "DELETE ALL USERS" to confirm deletion: ', async (answer) => {
      if (answer.trim() === 'DELETE ALL USERS') {
        console.log('\n🗑️  Deleting all users...\n');

        try {
          // Delete all users
          await new Promise((resolve, reject) => {
            db.run('DELETE FROM users', [], function (err) {
              if (err) reject(err);
              else resolve(this);
            });
          });

          console.log('✅ All users deleted successfully!');
          console.log('\n📋 Next steps:');
          console.log('   1. Restart the application');
          console.log('   2. Go to: http://localhost:7575');
          console.log('   3. You will be redirected to /setup-account');
          console.log('   4. Create your first admin account');
          console.log('\n' + '='.repeat(60));

        } catch (error) {
          console.error('\n❌ Error deleting users:', error.message);
        }
      } else {
        console.log('\n❌ Deletion cancelled. No users were deleted.');
      }

      db.close();
      rl.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    db.close();
    rl.close();
    process.exit(1);
  }
}

deleteAllUsers();
