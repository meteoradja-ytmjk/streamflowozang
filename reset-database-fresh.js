#!/usr/bin/env node

/**
 * Reset Database - Hapus Semua User
 * Untuk memulai fresh dengan admin baru
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'db', 'streamflow.db');

console.log('🔄 RESET DATABASE - Hapus Semua User\n');
console.log('='.repeat(60));

async function resetDatabase() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found at:', dbPath);
    console.log('   Database akan dibuat otomatis saat aplikasi dijalankan.');
    process.exit(0);
  }

  const db = new sqlite3.Database(dbPath);

  try {
    console.log('\n1️⃣ Checking existing users...\n');

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
      console.log('✅ Database sudah kosong, tidak ada user.');
      console.log('\n🎉 Anda bisa langsung membuat admin baru!');
      console.log('   1. Jalankan aplikasi: npm start');
      console.log('   2. Buka: http://localhost:7575');
      console.log('   3. Otomatis redirect ke /setup-account');
      console.log('   4. Buat admin baru\n');
      db.close();
      process.exit(0);
    }

    console.log(`📋 Ditemukan ${users.length} user yang akan dihapus:\n`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.user_role}) - ${user.status}`);
    });

    console.log('\n2️⃣ Deleting all users...\n');

    // Delete all users
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    console.log(`✅ Berhasil menghapus ${result} user!\n`);

    // Delete related data
    console.log('3️⃣ Cleaning up related data...\n');

    // Delete videos
    const videosDeleted = await new Promise((resolve, reject) => {
      db.run('DELETE FROM videos', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log(`   ✅ Deleted ${videosDeleted} videos`);

    // Delete audios
    const audiosDeleted = await new Promise((resolve, reject) => {
      db.run('DELETE FROM audios', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log(`   ✅ Deleted ${audiosDeleted} audios`);

    // Delete streams
    const streamsDeleted = await new Promise((resolve, reject) => {
      db.run('DELETE FROM streams', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log(`   ✅ Deleted ${streamsDeleted} streams`);

    // Delete playlists
    const playlistsDeleted = await new Promise((resolve, reject) => {
      db.run('DELETE FROM playlists', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log(`   ✅ Deleted ${playlistsDeleted} playlists`);

    // Delete stream history
    const historyDeleted = await new Promise((resolve, reject) => {
      db.run('DELETE FROM stream_history', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log(`   ✅ Deleted ${historyDeleted} stream history entries`);

    // Delete sessions
    const sessionsDeleted = await new Promise((resolve, reject) => {
      db.run('DELETE FROM sessions', [], function (err) {
        if (err) {
          // Sessions table might not exist, that's ok
          resolve(0);
        } else {
          resolve(this.changes);
        }
      });
    });
    console.log(`   ✅ Deleted ${sessionsDeleted} sessions`);

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 DATABASE RESET BERHASIL!\n');
    console.log('📋 Summary:');
    console.log(`   - Users deleted: ${result}`);
    console.log(`   - Videos deleted: ${videosDeleted}`);
    console.log(`   - Audios deleted: ${audiosDeleted}`);
    console.log(`   - Streams deleted: ${streamsDeleted}`);
    console.log(`   - Playlists deleted: ${playlistsDeleted}`);
    console.log(`   - History deleted: ${historyDeleted}`);
    console.log(`   - Sessions deleted: ${sessionsDeleted}`);
    
    console.log('\n📝 Langkah Selanjutnya:\n');
    console.log('   1. Jalankan aplikasi:');
    console.log('      npm start');
    console.log('');
    console.log('   2. Buka browser:');
    console.log('      http://localhost:7575');
    console.log('');
    console.log('   3. Anda akan otomatis diarahkan ke:');
    console.log('      /setup-account');
    console.log('');
    console.log('   4. Buat admin baru dengan:');
    console.log('      - Username: [pilih username Anda]');
    console.log('      - Password: [minimal 8 karakter]');
    console.log('        * Harus ada huruf kecil (a-z)');
    console.log('        * Harus ada huruf besar (A-Z)');
    console.log('        * Harus ada angka (0-9)');
    console.log('      - Contoh password: Admin123456');
    console.log('');
    console.log('   5. Klik "Complete Setup"');
    console.log('');
    console.log('   6. ✅ Admin baru berhasil dibuat!');
    console.log('      Anda akan langsung login dan masuk ke dashboard.');
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Database siap untuk setup admin baru!\n');

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    db.close();
    process.exit(1);
  }
}

resetDatabase();
