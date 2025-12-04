require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetDatabase() {
  console.log('\n==============================================');
  console.log('   RESET DATABASE & CREATE FRESH ADMIN');
  console.log('==============================================\n');
  
  console.log('⚠️  WARNING: This will DELETE ALL DATA including:');
  console.log('   - All users');
  console.log('   - All videos');
  console.log('   - All streams');
  console.log('   - All history');
  console.log('   - All sessions\n');
  
  const confirm = await question('Are you sure you want to continue? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('\n❌ Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  const dbPath = path.join(__dirname, 'db', 'streamflow.db');
  const sessionsPath = path.join(__dirname, 'db', 'sessions.db');
  
  // Backup existing database
  if (fs.existsSync(dbPath)) {
    const backupPath = path.join(__dirname, 'db', `streamflow.db.backup-${Date.now()}`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`\n✅ Backup created: ${backupPath}`);
  }
  
  // Delete old databases
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Old database deleted');
  }
  
  if (fs.existsSync(sessionsPath)) {
    fs.unlinkSync(sessionsPath);
    console.log('✅ Old sessions deleted');
  }
  
  // Create new database
  const db = new sqlite3.Database(dbPath);
  
  console.log('\n📦 Creating fresh database tables...');
  
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`CREATE TABLE users (
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
      db.run(`CREATE TABLE videos (
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
      db.run(`CREATE TABLE audios (
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
      db.run(`CREATE TABLE streams (
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
      db.run(`CREATE TABLE stream_history (
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
      db.run(`CREATE TABLE playlists (
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
      db.run(`CREATE TABLE playlist_videos (
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
      db.run(`CREATE TABLE schedule_templates (
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
      db.run(`CREATE TABLE scheduled_streams (
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
  
  console.log('\n📝 Creating new admin account...\n');
  
  console.log('Default Admin Credentials:');
  console.log('  Username: admin');
  console.log('  Password: Admin123\n');
  
  const useDefault = await question('Use default credentials? (yes/no): ');
  
  let username, password;
  
  if (useDefault.toLowerCase() === 'yes') {
    username = 'admin';
    password = 'Admin123';
    console.log('\n✅ Using default credentials');
  } else {
    username = await question('Enter admin username: ');
    password = await question('Enter admin password: ');
    
    if (!username || !password) {
      console.log('\n❌ Username and password are required!');
      db.close();
      rl.close();
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters!');
      db.close();
      rl.close();
      process.exit(1);
    }
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  
  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (id, username, password, user_role, status, max_streams) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, hashedPassword, 'admin', 'active', -1],
      function(err) {
        if (err) {
          console.error('\n❌ Error creating admin:', err);
          reject(err);
        } else {
          console.log('\n✅ Admin account created successfully!');
          console.log('\n==============================================');
          console.log('   ADMIN CREDENTIALS');
          console.log('==============================================');
          console.log(`Username: ${username}`);
          console.log(`Password: ${password}`);
          console.log(`Role: admin`);
          console.log(`Status: active`);
          console.log(`User ID: ${userId}`);
          console.log('==============================================\n');
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
        console.log('✅ User verified in database');
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
  
  db.close();
  rl.close();
  
  console.log('\n✅ Database reset complete!');
  console.log('\n📌 Next steps:');
  console.log('   1. Restart your application');
  console.log('   2. Go to http://localhost:7575/login');
  console.log('   3. Login with the credentials above\n');
}

resetDatabase().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
