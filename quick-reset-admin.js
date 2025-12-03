#!/usr/bin/env node

/**
 * Quick Admin Reset - Langsung reset admin tanpa interaksi
 * Usage: node quick-reset-admin.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');
const db = new sqlite3.Database(dbPath);

console.log('🔐 Quick Admin Reset\n');
console.log('='.repeat(50));

// Default credentials
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Admin123456';

async function resetAdmin() {
  try {
    // Cari user admin
    const admin = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE user_role = 'admin' ORDER BY created_at ASC LIMIT 1",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!admin) {
      console.log('❌ No admin user found in database');
      console.log('\n💡 Creating new admin user...\n');
      
      // Buat admin baru
      const { v4: uuidv4 } = require('uuid');
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const userId = uuidv4();
      const now = new Date().toISOString();

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (id, username, password, user_role, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, DEFAULT_USERNAME, hashedPassword, 'admin', 'active', now, now],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      console.log('✅ New admin created successfully!\n');
    } else {
      console.log(`📋 Found admin: ${admin.username}\n`);
      console.log('🔄 Resetting password...\n');

      // Hash password baru
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

      // Update password dan pastikan status active
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET password = ?, user_role = ?, status = ? WHERE id = ?',
          [hashedPassword, 'admin', 'active', admin.id],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      console.log('✅ Password reset successfully!\n');
    }

    // Tampilkan kredensial
    console.log('='.repeat(50));
    console.log('\n🎉 Admin Ready!\n');
    console.log('Login credentials:');
    console.log(`  Username: ${DEFAULT_USERNAME}`);
    console.log(`  Password: ${DEFAULT_PASSWORD}`);
    console.log(`  Role: admin`);
    console.log(`  Status: active`);
    console.log('\n🌐 Login at: http://localhost:7575/login');
    console.log('\n⚠️  IMPORTANT: Change this password after login!');
    console.log('\n='.repeat(50));

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    db.close();
    process.exit(1);
  }
}

resetAdmin();
