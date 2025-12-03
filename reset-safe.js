require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Default admin credentials
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

async function resetDatabase() {
  console.log('\n==============================================');
  console.log('   SAFE DATABASE RESET & CREATE ADMIN');
  console.log('==============================================\n');
  
  console.log('⚠️  IMPORTANT: Make sure your application is STOPPED!');
  console.log('   Close any running Node.js processes first.\n');
  
  const dbPath = path.join(__dirname, 'db', 'streamflow.db');
  const sessionsPath = path.join(__dirname, 'db', 'sessions.db');
  
  // Try to backup and rename instead of delete
  if (fs.existsSync(dbPath)) {
    const timestamp = Date.now();
    const backupPath = path.join(__dirname, 'db', `streamflow.db.backup-${timestamp}`);
    const oldPath = path.join(__dirname, 'db', `streamflow.db.old-${timestamp}`);
    
    try {
      // Create backup
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
      
      // Try to rename old database
      try {
        fs.renameSync(dbPath, oldPath);
        console.log(`✅ Old database renamed to: ${oldPath}`);
      } catch (renameErr) {
        console.log('⚠️  Cannot rename database (might be in use)');
        console.log('   Attempting to clear tables instead...\n');
        
        // If can't rename, we'll clear the tables
        const db = new sqlite3.Database(dbPath);
        
        await new Promise((resolve, reject) => {
          db.serialize(() => {
            console.log('🗑️  Clearing all tables...');
            
            db.run('DELETE FROM scheduled_streams', (err) => {
              if (err) console.log('   Note: scheduled_streams table might not exist');
            });
            
            db.run('DELETE FROM schedule_templates', (err) => {
              if (err) console.log('   Note: schedule_templates table might not exist');
            });
            
            db.run('DELETE FROM playlist_videos', (err) => {
              if (err) console.log('   Note: playlist_videos table might not exist');
            });
            
            db.run('DELETE FROM playlists', (err) => {
              if (err) console.log('   Note: playlists table might not exist');
            });
            
            db.run('DELETE FROM stream_history', (err) => {
              if (err) console.log('   Note: stream_history table might not exist');
            });
            
            db.run('DELETE FROM streams', (err) => {
              if (err) console.log('   Note: streams table might not exist');
            });
            
            db.run('DELETE FROM audios', (err) => {
              if (err) console.log('   Note: audios table might not exist');
            });
            
            db.run('DELETE FROM videos', (err) => {
              if (err) console.log('   Note: videos table might not exist');
            });
            
            db.run('DELETE FROM users', (err) => {
              if (err) {
                console.error('❌ Error clearing users table:', err);
                reject(err);
              } else {
                console.log('✅ All tables cleared');
                resolve();
              }
            });
          });
        });
        
        // Now create the admin user
        console.log('\n📝 Creating admin account...');
        
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const userId = uuidv4();
        
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO users (id, username, password, user_role, status, max_streams) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, DEFAULT_USERNAME, hashedPassword, 'admin', 'active', -1],
            function(err) {
              if (err) {
                console.error('\n❌ Error creating admin:', err);
                reject(err);
              } else {
                console.log('✅ Admin account created successfully!');
                resolve();
              }
            }
          );
        });
        
        // Verify the user was created
        await new Promise((resolve, reject) => {
          db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
              console.error('❌ Error verifying user:', err);
              reject(err);
            } else if (row) {
              console.log('\n✅ User verified in database');
              console.log('   Username:', row.username);
              console.log('   Role:', row.user_role);
              console.log('   Status:', row.status);
              console.log('   Max Streams:', row.max_streams);
              resolve();
            } else {
              console.log('❌ User not found in database!');
              reject(new Error('User not found'));
            }
          });
        });
        
        // Count total users
        await new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
            if (err) {
              console.error('❌ Error counting users:', err);
              reject(err);
            } else {
              console.log('   Total users in database:', row.count);
              resolve();
            }
          });
        });
        
        db.close();
        
        console.log('\n==============================================');
        console.log('   ADMIN CREDENTIALS');
        console.log('==============================================');
        console.log(`Username: ${DEFAULT_USERNAME}`);
        console.log(`Password: ${DEFAULT_PASSWORD}`);
        console.log(`Role: admin`);
        console.log(`Status: active`);
        console.log('==============================================\n');
        
        console.log('✅ Database reset complete!\n');
        console.log('📌 Next steps:');
        console.log('   1. Restart your application');
        console.log('   2. Go to http://localhost:7575/login');
        console.log('   3. Login with credentials above\n');
        console.log('⚠️  IMPORTANT: Change your password after first login!\n');
        
        return;
      }
    } catch (err) {
      console.error('❌ Error during backup:', err);
      throw err;
    }
  }
  
  // Delete sessions
  if (fs.existsSync(sessionsPath)) {
    try {
      fs.unlinkSync(sessionsPath);
      console.log('✅ Old sessions deleted');
    } catch (err) {
      console.log('⚠️  Could not delete sessions (might be in use)');
    }
  }
  
  // Create new database
  const db = new sqlite3.Database(dbPath);
  
  console.log('\n📦 Creating fresh database tables...');
  
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar_path TEXT,
        gdrive_api_key TEXT,
        user_role TEXT DEFAULT 'admin',
        status TEXT DEFAULT 'active',
        max_streams INTEGER DEFAULT -1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Error creating users table:', err);
          reject(err);
        } else {
          console.log('✅ Users table created');
        }
      });
      
      // Create videos table
      db.run(`CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filepath TEXT NOT NULL,
        thumbnail_path TEXT,
        file_size INTEGER,
        duration REAL,
        format TEXT,
        resolution TEXT,
        bitrate INTEGER,
        fps TEXT,
        user_id TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating videos table:', err);
        else console.log('✅ Videos table created');
      });
      
      // Create audios table
      db.run(`CREATE TABLE IF NOT EXISTS audios (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_size INTEGER,
        duration REAL,
        format TEXT,
        bitrate INTEGER,
        sample_rate INTEGER,
        channels INTEGER,
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating audios table:', err);
        else console.log('✅ Audios table created');
      });
      
      // Create streams table
      db.run(`CREATE TABLE IF NOT EXISTS streams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        video_id TEXT,
        audio_id TEXT,
        rtmp_url TEXT NOT NULL,
        stream_key TEXT NOT NULL,
        platform TEXT,
        platform_icon TEXT,
        bitrate INTEGER DEFAULT 2500,
        resolution TEXT,
        fps INTEGER DEFAULT 30,
        orientation TEXT DEFAULT 'horizontal',
        loop_video BOOLEAN DEFAULT 1,
        schedule_time TIMESTAMP,
        duration INTEGER,
        status TEXT DEFAULT 'offline',
        status_updated_at TIMESTAMP,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        use_advanced_settings BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (video_id) REFERENCES videos(id),
        FOREIGN KEY (audio_id) REFERENCES audios(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating streams table:', err);
        else console.log('✅ Streams table created');
      });
      
      // Create stream_history table
      db.run(`CREATE TABLE IF NOT EXISTS stream_history (
        id TEXT PRIMARY KEY,
        stream_id TEXT,
        title TEXT NOT NULL,
        platform TEXT,
        platform_icon TEXT,
        video_id TEXT,
        video_title TEXT,
        resolution TEXT,
        bitrate INTEGER,
        fps INTEGER,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        duration INTEGER,
        use_advanced_settings BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (stream_id) REFERENCES streams(id),
        FOREIGN KEY (video_id) REFERENCES videos(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating stream_history table:', err);
        else console.log('✅ Stream history table created');
      });
      
      // Create playlists table
      db.run(`CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_shuffle BOOLEAN DEFAULT 0,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating playlists table:', err);
        else console.log('✅ Playlists table created');
      });
      
      // Create playlist_videos table
      db.run(`CREATE TABLE IF NOT EXISTS playlist_videos (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error('❌ Error creating playlist_videos table:', err);
        else console.log('✅ Playlist videos table created');
      });
      
      // Create schedule_templates table
      db.run(`CREATE TABLE IF NOT EXISTS schedule_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        stream_id TEXT NOT NULL,
        recurrence_type TEXT NOT NULL,
        recurrence_days TEXT,
        start_time TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating schedule_templates table:', err);
        else console.log('✅ Schedule templates table created');
      });
      
      // Create scheduled_streams table
      db.run(`CREATE TABLE IF NOT EXISTS scheduled_streams (
        id TEXT PRIMARY KEY,
        template_id TEXT,
        stream_id TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        started_at TEXT,
        ended_at TEXT,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES schedule_templates(id) ON DELETE SET NULL,
        FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error('❌ Error creating scheduled_streams table:', err);
        else console.log('✅ Scheduled streams table created');
        resolve();
      });
    });
  });
  
  console.log('\n📝 Creating admin account...');
  
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const userId = uuidv4();
  
  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (id, username, password, user_role, status, max_streams) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, DEFAULT_USERNAME, hashedPassword, 'admin', 'active', -1],
      function(err) {
        if (err) {
          console.error('\n❌ Error creating admin:', err);
          reject(err);
        } else {
          console.log('✅ Admin account created successfully!');
          resolve();
        }
      }
    );
  });
  
  // Verify the user was created
  await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('❌ Error verifying user:', err);
        reject(err);
      } else if (row) {
        console.log('\n✅ User verified in database');
        console.log('   Username:', row.username);
        console.log('   Role:', row.user_role);
        console.log('   Status:', row.status);
        console.log('   Max Streams:', row.max_streams);
        resolve();
      } else {
        console.log('❌ User not found in database!');
        reject(new Error('User not found'));
      }
    });
  });
  
  // Count total users
  await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
      if (err) {
        console.error('❌ Error counting users:', err);
        reject(err);
      } else {
        console.log('   Total users in database:', row.count);
        resolve();
      }
    });
  });
  
  db.close();
  
  console.log('\n==============================================');
  console.log('   ADMIN CREDENTIALS');
  console.log('==============================================');
  console.log(`Username: ${DEFAULT_USERNAME}`);
  console.log(`Password: ${DEFAULT_PASSWORD}`);
  console.log(`Role: admin`);
  console.log(`Status: active`);
  console.log('==============================================\n');
  
  console.log('✅ Database reset complete!\n');
  console.log('📌 Next steps:');
  console.log('   1. Restart your application');
  console.log('   2. Go to http://localhost:7575/login');
  console.log('   3. Login with credentials above\n');
  console.log('⚠️  IMPORTANT: Change your password after first login!\n');
}

resetDatabase().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
