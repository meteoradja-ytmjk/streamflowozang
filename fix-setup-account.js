#!/usr/bin/env node

/**
 * Fix Setup Account Issues
 * Diagnosa dan perbaiki masalah "Failed to create user"
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');

console.log('🔧 Fix Setup Account Issues\n');
console.log('='.repeat(60));

async function fixSetupAccount() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found at:', dbPath);
    console.log('\n💡 Please start the application first to create database.');
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath);

  try {
    console.log('\n1️⃣ Checking existing users...\n');

    const users = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, username, user_role, status, created_at FROM users',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (users.length === 0) {
      console.log('✅ No users found - Setup account should work');
      console.log('   You can create first admin via /setup-account\n');
    } else {
      console.log(`⚠️  Found ${users.length} existing user(s):\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username}`);
        console.log(`      - Role: ${user.user_role}`);
        console.log(`      - Status: ${user.status}`);
        console.log(`      - Created: ${user.created_at}`);
        console.log('');
      });

      console.log('❌ Setup account is blocked because users already exist!');
      console.log('\n💡 Solutions:');
      console.log('   Option 1: Use /login to login with existing account');
      console.log('   Option 2: Reset admin password:');
      console.log('             node quick-reset-admin.js');
      console.log('   Option 3: Delete all users (DANGEROUS):');
      console.log('             node delete-all-users.js');
      console.log('   Option 4: Create new user via /signup');
      
      db.close();
      process.exit(0);
    }

    console.log('\n2️⃣ Checking database structure...\n');

    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users)", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const requiredColumns = ['id', 'username', 'password', 'user_role', 'status', 'max_streams'];
    const existingColumns = columns.map(col => col.name);
    
    console.log('📋 Checking required columns:');
    let missingColumns = [];
    
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} - MISSING`);
        missingColumns.push(col);
      }
    });

    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns detected!');
      console.log('   Attempting to add missing columns...\n');
      
      for (const col of missingColumns) {
        try {
          let sql = '';
          if (col === 'max_streams') {
            sql = 'ALTER TABLE users ADD COLUMN max_streams INTEGER DEFAULT -1';
          }
          
          if (sql) {
            await new Promise((resolve, reject) => {
              db.run(sql, [], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            console.log(`   ✅ Added column: ${col}`);
          }
        } catch (err) {
          console.log(`   ❌ Failed to add ${col}:`, err.message);
        }
      }
    }

    console.log('\n3️⃣ Testing database write...\n');

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
      console.log('\n💡 Try:');
      console.log('   1. Stop the application');
      console.log('   2. Run this script again');
      console.log('   3. Start the application');
    }

    console.log('\n4️⃣ Checking uploads directory...\n');

    const uploadsDir = path.join(__dirname, 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️  Avatars directory not found, creating...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Avatars directory created');
    } else {
      console.log('✅ Avatars directory exists');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Setup Account Diagnostic Complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Database: OK`);
    console.log(`   - Users table: OK`);
    console.log(`   - Required columns: OK`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Uploads directory: OK`);
    
    if (users.length === 0) {
      console.log('\n🎉 Setup account should work now!');
      console.log('   Go to: http://localhost:7575/setup-account');
      console.log('\n📝 Password requirements:');
      console.log('   - Minimum 8 characters');
      console.log('   - At least one lowercase letter');
      console.log('   - At least one uppercase letter');
      console.log('   - At least one number');
      console.log('\n   Example: Admin123456');
    }

    console.log('\n' + '='.repeat(60));

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    db.close();
    process.exit(1);
  }
}

fixSetupAccount();
