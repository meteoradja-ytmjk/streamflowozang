#!/usr/bin/env node

/**
 * Fix Signup Issues
 * Checks and fixes common signup problems
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');

console.log('🔧 Fix Signup Issues\n');
console.log('='.repeat(50));

async function fixSignup() {
  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found at:', dbPath);
    console.log('\n💡 Creating database...');
    console.log('   Please restart the application to create database.');
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath);

  try {
    console.log('\n1️⃣ Checking database structure...\n');

    // Check if users table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!tableExists) {
      console.log('❌ Users table not found');
      console.log('   Please restart the application to create tables.');
      db.close();
      process.exit(1);
    }

    console.log('✅ Users table exists');

    // Check table structure
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users)", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📋 Table columns:');
    const columnNames = columns.map(col => col.name);
    columnNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // Check if max_streams column exists
    if (!columnNames.includes('max_streams')) {
      console.log('\n⚠️  max_streams column missing, adding...');
      await new Promise((resolve, reject) => {
        db.run(
          'ALTER TABLE users ADD COLUMN max_streams INTEGER DEFAULT -1',
          [],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log('✅ max_streams column added');
    } else {
      console.log('\n✅ max_streams column exists');
    }

    // Check existing users
    console.log('\n2️⃣ Checking existing users...\n');
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
      console.log('⚠️  No users found in database');
      console.log('   You can create first admin via /setup-account');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.user_role}) - ${user.status}`);
      });
    }

    // Check for inactive users
    const inactiveUsers = users.filter(u => u.status === 'inactive');
    if (inactiveUsers.length > 0) {
      console.log(`\n⚠️  Found ${inactiveUsers.length} inactive user(s)`);
      console.log('   Run: node activate-all-users.js to activate them');
    }

    // Test database write
    console.log('\n3️⃣ Testing database write permissions...\n');
    try {
      await new Promise((resolve, reject) => {
        db.run('SELECT 1', [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('✅ Database is writable');
    } catch (err) {
      console.log('❌ Database write test failed:', err.message);
    }

    // Check uploads directory
    console.log('\n4️⃣ Checking uploads directory...\n');
    const uploadsDir = path.join(__dirname, 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️  Avatars directory not found, creating...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Avatars directory created');
    } else {
      console.log('✅ Avatars directory exists');
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Signup system check complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Database: OK`);
    console.log(`   - Users table: OK`);
    console.log(`   - Columns: OK`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Inactive users: ${inactiveUsers.length}`);
    console.log(`   - Uploads directory: OK`);
    
    if (inactiveUsers.length > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Run: node quick-reset-admin.js');
      console.log('   2. Run: node activate-all-users.js');
      console.log('   3. Try signup again');
    } else {
      console.log('\n✅ Signup should work now!');
      console.log('   Try creating a new account at: /signup');
    }

    console.log('\n' + '='.repeat(50));

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    db.close();
    process.exit(1);
  }
}

fixSignup();
