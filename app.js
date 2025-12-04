require('dotenv').config();
// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Garbage collection hints
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 60000); // GC setiap 1 menit
}

// Memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  
  if (heapUsedMB > 350) {
    console.warn(`⚠️  High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
    if (global.gc) global.gc();
  }
}, 30000); // Check setiap 30 detik

// Process optimization
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('MaxListeners warning suppressed');
  }
});

// ========================================

require('./services/logger.js');
const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const os = require('os');
const multer = require('multer');
const fs = require('fs');
const csrf = require('csrf');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('./models/User');
const { db, checkIfUsersExist } = require('./db/database');
const systemMonitor = require('./services/systemMonitor');
const { uploadVideo, uploadAudio, upload } = require('./middleware/uploadMiddleware');
const { ensureDirectories } = require('./utils/storage');
const { getVideoInfo, generateThumbnail } = require('./utils/videoProcessor');
const { getAudioInfo } = require('./utils/audioProcessor');
const Video = require('./models/Video');
const Audio = require('./models/Audio');
const Playlist = require('./models/Playlist');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const streamingService = require('./services/streamingService');
const schedulerService = require('./services/schedulerService');
const recurringSchedulerService = require('./services/recurringSchedulerService');
const ScheduleTemplate = require('./models/ScheduleTemplate');
const backupService = require('./services/backupService');
const StreamBackup = require('./models/StreamBackup');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Initialize recurring scheduler
recurringSchedulerService.initialize().catch(err => {
  console.error('Failed to initialize recurring scheduler:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('-----------------------------------');
  console.error('UNHANDLED REJECTION AT:', promise);
  console.error('REASON:', reason);
  console.error('-----------------------------------');
});
process.on('uncaughtException', (error) => {
  console.error('-----------------------------------');
  console.error('UNCAUGHT EXCEPTION:', error);
  console.error('-----------------------------------');
});
const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 7575;
const tokens = new csrf();
ensureDirectories();
ensureDirectories();
app.locals.helpers = {
  getUsername: function (req) {
    if (req.session && req.session.username) {
      return req.session.username;
    }
    return 'User';
  },
  getAvatar: function (req) {
    if (req.session && req.session.userId) {
      const avatarPath = req.session.avatar_path;
      if (avatarPath) {
        return `<img src="${avatarPath}" alt="${req.session.username || 'User'}'s Profile" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/default-avatar.svg';">`;
      }
    }
    return '<img src="/images/default-avatar.svg" alt="Default Profile" class="w-full h-full object-cover">';
  },
  getPlatformIcon: function (platform) {
    switch (platform) {
      case 'YouTube': return 'youtube';
      case 'Facebook': return 'facebook';
      case 'Twitch': return 'twitch';
      case 'TikTok': return 'tiktok';
      case 'Instagram': return 'instagram';
      case 'Shopee Live': return 'shopping-bag';
      case 'Restream.io': return 'live-photo';
      default: return 'broadcast';
    }
  },
  getPlatformColor: function (platform) {
    switch (platform) {
      case 'YouTube': return 'red-500';
      case 'Facebook': return 'blue-500';
      case 'Twitch': return 'purple-500';
      case 'TikTok': return 'gray-100';
      case 'Instagram': return 'pink-500';
      case 'Shopee Live': return 'orange-500';
      case 'Restream.io': return 'teal-500';
      default: return 'gray-400';
    }
  },
  formatDateTime: function (isoString) {
    if (!isoString) return '--';
    
    const utcDate = new Date(isoString);
    
    return utcDate.toLocaleString('en-US', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },
  formatDuration: function (seconds) {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  }
};
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './db/',
    table: 'sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.session.username = user.username;
        req.session.avatar_path = user.avatar_path;
        if (user.email) req.session.email = user.email;
        res.locals.user = {
          id: user.id,
          username: user.username,
          avatar_path: user.avatar_path,
          email: user.email
        };
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  res.locals.req = req;
  next();
});
app.use(function (req, res, next) {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = uuidv4();
  }
  res.locals.csrfToken = tokens.create(req.session.csrfSecret);
  next();
});
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

app.use('/uploads', function (req, res, next) {
  res.header('Cache-Control', 'no-cache');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10gb' }));
app.use(express.json({ limit: '10gb' }));

const csrfProtection = function (req, res, next) {
  if ((req.path === '/login' && req.method === 'POST') ||
    (req.path === '/setup-account' && req.method === 'POST')) {
    return next();
  }
  const token = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];
  if (!token || !tokens.verify(req.session.csrfSecret, token)) {
    return res.status(403).render('error', {
      title: 'Error',
      error: 'CSRF validation failed. Please try again.'
    });
  }
  next();
};
const isAuthenticated = async (req, res, next) => {
  // Auto-login: Jika tidak ada session, buat session default
  if (!req.session.userId) {
    try {
      // Cari user pertama yang ada di database
      const users = await User.findAll();
      if (users && users.length > 0) {
        const defaultUser = users[0]; // Gunakan user pertama
        req.session.userId = defaultUser.id;
        req.session.username = defaultUser.username;
        req.session.avatar_path = defaultUser.avatar_path;
        req.session.user_role = defaultUser.user_role;
      } else {
        // Jika tidak ada user, buat user default
        const defaultUser = await User.create({
          username: 'admin',
          password: 'admin123',
          avatar_path: null,
          user_role: 'admin',
          status: 'active'
        });
        req.session.userId = defaultUser.id;
        req.session.username = defaultUser.username;
        req.session.avatar_path = defaultUser.avatar_path;
        req.session.user_role = defaultUser.user_role;
      }
    } catch (error) {
      console.error('Auto-login error:', error);
    }
  }
  return next();
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    const user = await User.findById(req.session.userId);
    if (!user || user.user_role !== 'admin') {
      return res.redirect('/dashboard');
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.redirect('/dashboard');
  }
};
app.use('/uploads', function (req, res, next) {
  res.header('Cache-Control', 'no-cache');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});
app.use('/uploads/avatars', (req, res, next) => {
  const file = path.join(__dirname, 'public', 'uploads', 'avatars', path.basename(req.path));
  if (fs.existsSync(file)) {
    const ext = path.extname(file).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    res.header('Content-Type', contentType);
    res.header('Cache-Control', 'max-age=60, must-revalidate');
    fs.createReadStream(file).pipe(res);
  } else {
    next();
  }
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('login', {
      title: 'Login',
      error: 'Too many login attempts. Please try again in 15 minutes.'
    });
  },
  requestWasSuccessful: (request, response) => {
    return response.statusCode < 400;
  }
});
const loginDelayMiddleware = async (req, res, next) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  next();
};
// Login route disabled - auto-login enabled
app.get('/login', async (req, res) => {
  res.redirect('/dashboard');
});
// Login POST disabled - auto-login enabled
app.post('/login', async (req, res) => {
  res.redirect('/dashboard');
});
// Logout disabled - redirect to dashboard
app.get('/logout', (req, res) => {
  res.redirect('/dashboard');
});

// Signup route disabled - auto-login enabled
app.get('/signup', async (req, res) => {
  res.redirect('/dashboard');
});

// Signup POST disabled - auto-login enabled
app.post('/signup', async (req, res) => {
  res.redirect('/dashboard');
});

// Setup account disabled - auto-login enabled
app.get('/setup-account', async (req, res) => {
  res.redirect('/dashboard');
});
// Setup account POST disabled - auto-login enabled
app.post('/setup-account', async (req, res) => {
  res.redirect('/dashboard');
});
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});
app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('dashboard', {
      title: 'Dashboard',
      active: 'dashboard',
      user: user
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/login');
  }
});
app.get('/gallery', isAuthenticated, async (req, res) => {
  try {
    const videos = await Video.findAll(req.session.userId);
    const audios = await Audio.findAll(req.session.userId);
    res.render('gallery', {
      title: 'Media Gallery',
      active: 'gallery',
      user: await User.findById(req.session.userId),
      videos: videos,
      audios: audios
    });
  } catch (error) {
    console.error('Gallery error:', error);
    res.redirect('/dashboard');
  }
});

app.get('/settings', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: user
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.redirect('/login');
  }
});
app.get('/schedules', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('schedules', {
      title: 'Recurring Schedules',
      active: 'schedules',
      user: user
    });
  } catch (error) {
    console.error('Schedules error:', error);
    res.redirect('/dashboard');
  }
});

app.get('/history', isAuthenticated, async (req, res) => {
  try {
    const db = require('./db/database').db;
    const history = await new Promise((resolve, reject) => {
      db.all(
        `SELECT h.*, v.thumbnail_path 
         FROM stream_history h 
         LEFT JOIN videos v ON h.video_id = v.id 
         WHERE h.user_id = ? 
         ORDER BY h.start_time DESC`,
        [req.session.userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.render('history', {
      active: 'history',
      title: 'Stream History',
      history: history,
      helpers: app.locals.helpers
    });
  } catch (error) {
    console.error('Error fetching stream history:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load stream history',
      error: error
    });
  }
});
app.delete('/api/history/:id', isAuthenticated, async (req, res) => {
  try {
    const db = require('./db/database').db;
    const historyId = req.params.id;
    const history = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM stream_history WHERE id = ? AND user_id = ?',
        [historyId, req.session.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History entry not found or not authorized'
      });
    }
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM stream_history WHERE id = ?',
        [historyId],
        function (err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    res.json({ success: true, message: 'History entry deleted' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete history entry'
    });
  }
});

app.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const videoStats = await new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as totalSize 
           FROM videos WHERE user_id = ?`,
          [user.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      const streamStats = await new Promise((resolve, reject) => {
         db.get(
           `SELECT COUNT(*) as count FROM streams WHERE user_id = ?`,
           [user.id],
           (err, row) => {
             if (err) reject(err);
             else resolve(row);
           }
         );
       });
       
       const activeStreamStats = await new Promise((resolve, reject) => {
         db.get(
           `SELECT COUNT(*) as count FROM streams WHERE user_id = ? AND status = 'live'`,
           [user.id],
           (err, row) => {
             if (err) reject(err);
             else resolve(row);
           }
         );
       });
      
      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      return {
         ...user,
         videoCount: videoStats.count,
         totalVideoSize: videoStats.totalSize > 0 ? formatFileSize(videoStats.totalSize) : null,
         streamCount: streamStats.count,
         activeStreamCount: activeStreamStats.count
       };
    }));
    
    res.render('users', {
      title: 'User Management',
      active: 'users',
      users: usersWithStats,
      user: req.user
    });
  } catch (error) {
    console.error('Users page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load users page',
      user: req.user
    });
  }
});

app.post('/api/users/status', isAdmin, async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or status'
      });
    }

    if (userId == req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.updateStatus(userId, status);
    
    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

app.post('/api/users/role', isAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or role'
      });
    }

    if (userId == req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.updateRole(userId, role);
    
    res.json({
      success: true,
      message: `User role updated to ${role} successfully`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

app.post('/api/users/delete', isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (userId == req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.delete(userId);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

app.post('/api/users/update', isAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { userId, username, role, status, password, maxStreams } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let avatarPath = user.avatar_path;
    if (req.file) {
      avatarPath = `/uploads/avatars/${req.file.filename}`;
    }

    const updateData = {
      username: username || user.username,
      user_role: role || user.user_role,
      status: status || user.status,
      avatar_path: avatarPath
    };

    if (password && password.trim() !== '') {
      const bcrypt = require('bcrypt');
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (maxStreams !== undefined) {
      updateData.max_streams = parseInt(maxStreams);
    }

    await User.updateProfile(userId, updateData);
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

app.post('/api/users/create', isAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { username, role, status, password, maxStreams } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    let avatarPath = '/uploads/avatars/default-avatar.png';
    if (req.file) {
      avatarPath = `/uploads/avatars/${req.file.filename}`;
    }

    const userData = {
      username: username,
      password: password,
      user_role: role || 'user',
      status: status || 'active',
      avatar_path: avatarPath,
      max_streams: maxStreams !== undefined ? parseInt(maxStreams) : -1
    };

    const result = await User.create(userData);
    
    res.json({
      success: true,
      message: 'User created successfully',
      userId: result.id
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

app.get('/api/users/:id/videos', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const videos = await Video.findAll(userId);
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user videos' });
  }
});

app.get('/api/users/:id/streams', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const streams = await Stream.findAll(userId);
    res.json({ success: true, streams });
  } catch (error) {
    console.error('Get user streams error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user streams' });
  }
});

app.get('/api/system-stats', isAuthenticated, async (req, res) => {
  try {
    const stats = await systemMonitor.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    });
  });
  return addresses.length > 0 ? addresses : ['localhost'];
}
app.post('/settings/profile', isAuthenticated, upload.single('avatar'), [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('settings', {
        title: 'Settings',
        active: 'settings',
        user: await User.findById(req.session.userId),
        error: errors.array()[0].msg,
        activeTab: 'profile'
      });
    }
    const currentUser = await User.findById(req.session.userId);
    if (req.body.username !== currentUser.username) {
      const existingUser = await User.findByUsername(req.body.username);
      if (existingUser) {
        return res.render('settings', {
          title: 'Settings',
          active: 'settings',
          user: currentUser,
          error: 'Username is already taken',
          activeTab: 'profile'
        });
      }
    }
    const updateData = {
      username: req.body.username
    };
    if (req.file) {
      updateData.avatar_path = `/uploads/avatars/${req.file.filename}`;
    }
    await User.update(req.session.userId, updateData);
    req.session.username = updateData.username;
    if (updateData.avatar_path) {
      req.session.avatar_path = updateData.avatar_path;
    }
    return res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: await User.findById(req.session.userId),
      success: 'Profile updated successfully!',
      activeTab: 'profile'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: await User.findById(req.session.userId),
      error: 'An error occurred while updating your profile',
      activeTab: 'profile'
    });
  }
});
app.post('/settings/password', isAuthenticated, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('settings', {
        title: 'Settings',
        active: 'settings',
        user: await User.findById(req.session.userId),
        error: errors.array()[0].msg,
        activeTab: 'security'
      });
    }
    const user = await User.findById(req.session.userId);
    const passwordMatch = await User.verifyPassword(req.body.currentPassword, user.password);
    if (!passwordMatch) {
      return res.render('settings', {
        title: 'Settings',
        active: 'settings',
        user: user,
        error: 'Current password is incorrect',
        activeTab: 'security'
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await User.update(req.session.userId, { password: hashedPassword });
    return res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: await User.findById(req.session.userId),
      success: 'Password changed successfully',
      activeTab: 'security'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: await User.findById(req.session.userId),
      error: 'An error occurred while changing your password',
      activeTab: 'security'
    });
  }
});
app.get('/settings', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: user
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.redirect('/dashboard');
  }
});

app.get('/trash', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('trash', {
      title: 'Trash',
      active: 'trash',
      user: user
    });
  } catch (error) {
    console.error('Trash error:', error);
    res.redirect('/dashboard');
  }
});
app.post('/settings/integrations/gdrive', isAuthenticated, [
  body('apiKey').notEmpty().withMessage('API Key is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('settings', {
        title: 'Settings',
        active: 'settings',
        user: await User.findById(req.session.userId),
        error: errors.array()[0].msg,
        activeTab: 'integrations'
      });
    }
    await User.update(req.session.userId, {
      gdrive_api_key: req.body.apiKey
    });
    return res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: await User.findById(req.session.userId),
      success: 'Google Drive API key saved successfully!',
      activeTab: 'integrations'
    });
  } catch (error) {
    console.error('Error saving Google Drive API key:', error);
    res.render('settings', {
      title: 'Settings',
      active: 'settings',
      user: await User.findById(req.session.userId),
      error: 'An error occurred while saving your Google Drive API key',
      activeTab: 'integrations'
    });
  }
});
app.post('/upload/video', isAuthenticated, uploadVideo.single('video'), async (req, res) => {
  try {
    console.log('Upload request received:', req.file);
    console.log('Session userId for upload:', req.session.userId);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    const { filename, originalname, path: videoPath, mimetype, size } = req.file;
    const thumbnailName = path.basename(filename, path.extname(filename)) + '.jpg';
    const videoInfo = await getVideoInfo(videoPath);
    const thumbnailRelativePath = await generateThumbnail(videoPath, thumbnailName)
      .then(() => `/uploads/thumbnails/${thumbnailName}`)
      .catch(() => null);
    let format = 'unknown';
    if (mimetype === 'video/mp4') format = 'mp4';
    else if (mimetype === 'video/avi') format = 'avi';
    else if (mimetype === 'video/quicktime') format = 'mov';
    const videoData = {
      title: path.basename(originalname, path.extname(originalname)),
      original_filename: originalname,
      filepath: `/uploads/videos/${filename}`,
      thumbnail_path: thumbnailRelativePath,
      file_size: size,
      duration: videoInfo.duration,
      format: format,
      user_id: req.session.userId
    };
    const video = await Video.create(videoData);
    res.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        filepath: video.filepath,
        thumbnail_path: video.thumbnail_path,
        duration: video.duration,
        file_size: video.file_size,
        format: video.format
      }
    });
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
});
app.post('/api/videos/upload', isAuthenticated, (req, res, next) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          success: false, 
          error: 'File too large. Maximum size is 10GB.' 
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          success: false, 
          error: 'Unexpected file field.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video file provided' 
      });
    }
    let title = path.parse(req.file.originalname).name;
    const filePath = `/uploads/videos/${req.file.filename}`;
    const fullFilePath = path.join(__dirname, 'public', filePath);
    const fileSize = req.file.size;
    await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(fullFilePath, (err, metadata) => {
        if (err) {
          console.error('Error extracting metadata:', err);
          return reject(err);
        }
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        const duration = metadata.format.duration || 0;
        const format = metadata.format.format_name || '';
        const resolution = videoStream ? `${videoStream.width}x${videoStream.height}` : '';
        const bitrate = metadata.format.bit_rate ?
          Math.round(parseInt(metadata.format.bit_rate) / 1000) :
          null;
        let fps = null;
        if (videoStream && videoStream.avg_frame_rate) {
          const fpsRatio = videoStream.avg_frame_rate.split('/');
          if (fpsRatio.length === 2 && parseInt(fpsRatio[1]) !== 0) {
            fps = Math.round((parseInt(fpsRatio[0]) / parseInt(fpsRatio[1]) * 100)) / 100;
          } else {
            fps = parseInt(fpsRatio[0]) || null;
          }
        }
        const thumbnailFilename = `thumb-${path.parse(req.file.filename).name}.jpg`;
        const thumbnailPath = `/uploads/thumbnails/${thumbnailFilename}`;
        const fullThumbnailPath = path.join(__dirname, 'public', thumbnailPath);
        ffmpeg(fullFilePath)
          .screenshots({
            timestamps: ['10%'],
            filename: thumbnailFilename,
            folder: path.join(__dirname, 'public', 'uploads', 'thumbnails'),
            size: '854x480'
          })
          .on('end', async () => {
            try {
              const videoData = {
                title,
                filepath: filePath,
                thumbnail_path: thumbnailPath,
                file_size: fileSize,
                duration,
                format,
                resolution,
                bitrate,
                fps,
                user_id: req.session.userId
              };
              const video = await Video.create(videoData);
              res.json({
                success: true,
                message: 'Video uploaded successfully',
                video
              });
              resolve();
            } catch (dbError) {
              console.error('Database error:', dbError);
              reject(dbError);
            }
          })
          .on('error', (err) => {
            console.error('Error creating thumbnail:', err);
            reject(err);
          });
      });
    });
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
});
app.get('/api/videos', isAuthenticated, async (req, res) => {
  try {
    const videos = await Video.findAll(req.session.userId);
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch videos' });
  }
});
app.delete('/api/videos/:id', isAuthenticated, async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    if (video.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const videoPath = path.join(__dirname, 'public', video.filepath);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    if (video.thumbnail_path) {
      const thumbnailPath = path.join(__dirname, 'public', video.thumbnail_path);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    await Video.delete(videoId, req.session.userId);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
});
app.post('/api/videos/:id/rename', isAuthenticated, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    if (video.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You don\'t have permission to rename this video' });
    }
    await Video.update(req.params.id, { title: req.body.title });
    res.json({ success: true, message: 'Video renamed successfully' });
  } catch (error) {
    console.error('Error renaming video:', error);
    res.status(500).json({ error: 'Failed to rename video' });
  }
});
app.get('/stream/:videoId', isAuthenticated, async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).send('Video not found');
    }
    if (video.user_id !== req.session.userId) {
      return res.status(403).send('You do not have permission to access this video');
    }
    const videoPath = path.join(__dirname, 'public', video.filepath);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).send('Error streaming video');
  }
});
app.get('/api/settings/gdrive-status', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.json({
      hasApiKey: !!user.gdrive_api_key,
      message: user.gdrive_api_key ? 'Google Drive API key is configured' : 'No Google Drive API key found'
    });
  } catch (error) {
    console.error('Error checking Google Drive API status:', error);
    res.status(500).json({ error: 'Failed to check API key status' });
  }
});
app.post('/api/settings/gdrive-api-key', isAuthenticated, [
  body('apiKey').notEmpty().withMessage('API Key is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    await User.update(req.session.userId, {
      gdrive_api_key: req.body.apiKey
    });
    return res.json({
      success: true,
      message: 'Google Drive API key saved successfully!'
    });
  } catch (error) {
    console.error('Error saving Google Drive API key:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while saving your Google Drive API key'
    });
  }
});
app.post('/api/videos/import-drive', isAuthenticated, [
  body('driveUrl').notEmpty().withMessage('Google Drive URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    const { driveUrl } = req.body;
    const { extractFileId, downloadFile } = require('./utils/googleDriveService');
    try {
      const fileId = extractFileId(driveUrl);
      const jobId = uuidv4();
      processGoogleDriveImport(jobId, fileId, req.session.userId)
        .catch(err => console.error('Drive import failed:', err));
      return res.json({
        success: true,
        message: 'Video import started',
        jobId: jobId
      });
    } catch (error) {
      console.error('Google Drive URL parsing error:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid Google Drive URL format'
      });
    }
  } catch (error) {
    console.error('Error importing from Google Drive:', error);
    res.status(500).json({ success: false, error: 'Failed to import video' });
  }
});
app.get('/api/videos/import-status/:jobId', isAuthenticated, async (req, res) => {
  const jobId = req.params.jobId;
  if (!importJobs[jobId]) {
    return res.status(404).json({ success: false, error: 'Import job not found' });
  }
  return res.json({
    success: true,
    status: importJobs[jobId]
  });
});
const importJobs = {};
async function processGoogleDriveImport(jobId, fileId, userId) {
  const { downloadFile } = require('./utils/googleDriveService');
  const { getVideoInfo, generateThumbnail } = require('./utils/videoProcessor');
  const ffmpeg = require('fluent-ffmpeg');
  
  importJobs[jobId] = {
    status: 'downloading',
    progress: 0,
    message: 'Starting download...'
  };
  
  try {
    const result = await downloadFile(fileId, (progress) => {
      importJobs[jobId] = {
        status: 'downloading',
        progress: progress.progress,
        message: `Downloading ${progress.filename}: ${progress.progress}%`
      };
    });
    
    importJobs[jobId] = {
      status: 'processing',
      progress: 100,
      message: 'Processing video...'
    };
    
    const videoInfo = await getVideoInfo(result.localFilePath);
    
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(result.localFilePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata);
      });
    });
    
    let resolution = '';
    let bitrate = null;
    
    const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
    if (videoStream) {
      resolution = `${videoStream.width}x${videoStream.height}`;
    }
    
    if (metadata.format && metadata.format.bit_rate) {
      bitrate = Math.round(parseInt(metadata.format.bit_rate) / 1000);
    }
    
    const thumbnailName = path.basename(result.filename, path.extname(result.filename)) + '.jpg';
    const thumbnailRelativePath = await generateThumbnail(result.localFilePath, thumbnailName)
      .then(() => `/uploads/thumbnails/${thumbnailName}`)
      .catch(() => null);
    
    let format = path.extname(result.filename).toLowerCase().replace('.', '');
    if (!format) format = 'mp4';
    
    const videoData = {
      title: path.basename(result.originalFilename, path.extname(result.originalFilename)),
      filepath: `/uploads/videos/${result.filename}`,
      thumbnail_path: thumbnailRelativePath,
      file_size: result.fileSize,
      duration: videoInfo.duration,
      format: format,
      resolution: resolution,
      bitrate: bitrate,
      user_id: userId
    };
    
    const video = await Video.create(videoData);
    
    importJobs[jobId] = {
      status: 'complete',
      progress: 100,
      message: 'Video imported successfully',
      videoId: video.id
    };
    setTimeout(() => {
      delete importJobs[jobId];
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error('Error processing Google Drive import:', error);
    importJobs[jobId] = {
      status: 'failed',
      progress: 0,
      message: error.message || 'Failed to import video'
    };
    setTimeout(() => {
      delete importJobs[jobId];
    }, 5 * 60 * 1000);
  }
}
app.get('/api/stream/videos', isAuthenticated, async (req, res) => {
  try {
    const videos = await Video.findAll(req.session.userId);
    const formattedVideos = videos.map(video => {
      const duration = video.duration ? Math.floor(video.duration) : 0;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      return {
        id: video.id,
        name: video.title,
        thumbnail: video.thumbnail_path,
        resolution: video.resolution || '1280x720',
        duration: formattedDuration,
        url: `/stream/${video.id}`,
        type: 'video'
      };
    });
    res.json(formattedVideos);
  } catch (error) {
    console.error('Error fetching videos for stream:', error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

app.get('/api/stream/content', isAuthenticated, async (req, res) => {
  try {
    const videos = await Video.findAll(req.session.userId);
    const formattedVideos = videos.map(video => {
      const duration = video.duration ? Math.floor(video.duration) : 0;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      return {
        id: video.id,
        name: video.title,
        thumbnail: video.thumbnail_path,
        resolution: video.resolution || '1280x720',
        duration: formattedDuration,
        url: `/stream/${video.id}`,
        type: 'video'
      };
    });

    const playlists = await Playlist.findAll(req.session.userId);
    const formattedPlaylists = playlists.map(playlist => {
      return {
        id: playlist.id,
        name: playlist.name,
        thumbnail: '/images/playlist-thumbnail.svg',
        resolution: 'Playlist',
        duration: `${playlist.video_count || 0} videos`,
        url: `/playlist/${playlist.id}`,
        type: 'playlist',
        description: playlist.description,
        is_shuffle: playlist.is_shuffle
      };
    });

    const allContent = [...formattedPlaylists, ...formattedVideos];
    
    res.json(allContent);
  } catch (error) {
    console.error('Error fetching content for stream:', error);
    res.status(500).json({ error: 'Failed to load content' });
  }
});
// Audio Routes
app.get('/api/audios/for-stream', isAuthenticated, async (req, res) => {
  try {
    const audios = await Audio.findAll(req.session.userId);
    const formattedAudios = audios.map(audio => ({
      id: audio.id,
      title: audio.title,
      duration: audio.duration,
      format: audio.format,
      file_size: audio.file_size
    }));
    res.json({ success: true, audios: formattedAudios });
  } catch (error) {
    console.error('Error fetching audios for stream:', error);
    res.status(500).json({ success: false, error: 'Failed to load audios' });
  }
});

app.post('/api/check-video-audio-compatibility', isAuthenticated, async (req, res) => {
  try {
    const { videoId, audioId } = req.body;
    
    if (!videoId || !audioId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Video ID and Audio ID are required' 
      });
    }
    
    const video = await Video.findById(videoId);
    const audio = await Audio.findById(audioId);
    
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    if (!audio) {
      return res.status(404).json({ success: false, error: 'Audio not found' });
    }
    
    const projectRoot = path.join(__dirname);
    const videoPath = path.join(projectRoot, 'public', video.filepath);
    const audioPath = path.join(projectRoot, 'public', audio.filepath);
    
    const { checkCompatibility } = require('./utils/videoAudioMerger');
    const compatibility = await checkCompatibility(videoPath, audioPath);
    
    res.json({
      success: true,
      compatible: compatibility.compatible,
      video: compatibility.video,
      audio: compatibility.audio,
      loopCount: compatibility.loopCount,
      message: `Video will loop ${compatibility.loopCount} time(s) to match audio duration`
    });
  } catch (error) {
    console.error('Error checking compatibility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check compatibility: ' + error.message 
    });
  }
});

app.post('/api/audios/upload', isAuthenticated, (req, res, next) => {
  uploadAudio.single('audio')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          success: false, 
          error: 'File too large. Maximum size is 10GB.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No audio file provided' 
      });
    }

    const title = path.parse(req.file.originalname).name;
    const filePath = `/uploads/audios/${req.file.filename}`;
    const fullFilePath = path.join(__dirname, 'public', filePath);
    const fileSize = req.file.size;

    const audioInfo = await getAudioInfo(fullFilePath);

    const audioData = {
      title: title,
      filepath: filePath,
      file_size: fileSize,
      duration: audioInfo.duration,
      format: audioInfo.format,
      bitrate: audioInfo.bitrate,
      sample_rate: audioInfo.sample_rate,
      channels: audioInfo.channels,
      user_id: req.session.userId
    };

    const audio = await Audio.create(audioData);

    res.json({
      success: true,
      message: 'Audio uploaded successfully',
      audio: audio
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload audio'
    });
  }
});

app.get('/api/audios', isAuthenticated, async (req, res) => {
  try {
    const audios = await Audio.findAll(req.session.userId);
    res.json(audios);
  } catch (error) {
    console.error('Error fetching audios:', error);
    res.status(500).json({ error: 'Failed to load audios' });
  }
});

app.delete('/api/audios/:id', isAuthenticated, async (req, res) => {
  try {
    const audioId = req.params.id;
    const audio = await Audio.findById(audioId);
    
    if (!audio) {
      return res.status(404).json({ success: false, error: 'Audio not found' });
    }
    
    if (audio.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Audio.delete(audioId);
    res.json({ success: true, message: 'Audio deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio:', error);
    res.status(500).json({ success: false, error: 'Failed to delete audio' });
  }
});

app.post('/api/audios/:id/rename', isAuthenticated, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    if (audio.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You don\'t have permission to rename this audio' });
    }

    await Audio.update(req.params.id, { title: req.body.title });
    res.json({ success: true, message: 'Audio renamed successfully' });
  } catch (error) {
    console.error('Error renaming audio:', error);
    res.status(500).json({ error: 'Failed to rename audio' });
  }
});

app.get('/audio-stream/:audioId', isAuthenticated, async (req, res) => {
  try {
    const audioId = req.params.audioId;
    const audio = await Audio.findById(audioId);
    
    if (!audio) {
      return res.status(404).send('Audio not found');
    }
    
    if (audio.user_id !== req.session.userId) {
      return res.status(403).send('You do not have permission to access this audio');
    }

    const audioPath = path.join(__dirname, 'public', audio.filepath);
    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(audioPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(audioPath).pipe(res);
    }
  } catch (error) {
    console.error('Audio streaming error:', error);
    res.status(500).send('Error streaming audio');
  }
});

const Stream = require('./models/Stream');
const { title } = require('process');
app.get('/api/streams', isAuthenticated, async (req, res) => {
  try {
    const filter = req.query.filter;
    const streams = await Stream.findAll(req.session.userId, filter);
    res.json({ success: true, streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch streams' });
  }
});
app.post('/api/streams', isAuthenticated, [
  body('streamTitle').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('rtmpUrl').trim().isLength({ min: 1 }).withMessage('RTMP URL is required'),
  body('streamKey').trim().isLength({ min: 1 }).withMessage('Stream key is required')
], async (req, res) => {
  try {
    console.log('Session userId for stream creation:', req.session.userId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    // Check stream limit
    const user = await User.findById(req.session.userId);
    if (user && user.max_streams !== -1) {
      const Stream = require('./models/Stream');
      const userStreams = await Stream.findAll(req.session.userId);
      if (userStreams.length >= user.max_streams) {
        return res.status(403).json({ 
          success: false, 
          error: `You have reached the maximum limit of ${user.max_streams} stream(s). Please delete an existing stream to create a new one.` 
        });
      }
    }
    let platform = 'Custom';
    let platform_icon = 'ti-broadcast';
    if (req.body.rtmpUrl.includes('youtube.com')) {
      platform = 'YouTube';
      platform_icon = 'ti-brand-youtube';
    } else if (req.body.rtmpUrl.includes('facebook.com')) {
      platform = 'Facebook';
      platform_icon = 'ti-brand-facebook';
    } else if (req.body.rtmpUrl.includes('twitch.tv')) {
      platform = 'Twitch';
      platform_icon = 'ti-brand-twitch';
    } else if (req.body.rtmpUrl.includes('tiktok.com')) {
      platform = 'TikTok';
      platform_icon = 'ti-brand-tiktok';
    } else if (req.body.rtmpUrl.includes('instagram.com')) {
      platform = 'Instagram';
      platform_icon = 'ti-brand-instagram';
    } else if (req.body.rtmpUrl.includes('shopee.io')) {
      platform = 'Shopee Live';
      platform_icon = 'ti-brand-shopee';
    } else if (req.body.rtmpUrl.includes('restream.io')) {
      platform = 'Restream.io';
      platform_icon = 'ti-live-photo';
    }
    const streamData = {
      title: req.body.streamTitle,
      video_id: req.body.videoId || null,
      audio_id: req.body.audioId || null,
      rtmp_url: req.body.rtmpUrl,
      stream_key: req.body.streamKey,
      platform,
      platform_icon,
      bitrate: parseInt(req.body.bitrate) || 2500,
      resolution: req.body.resolution || '1280x720',
      fps: parseInt(req.body.fps) || 30,
      orientation: req.body.orientation || 'horizontal',
      loop_video: req.body.loopVideo === 'true' || req.body.loopVideo === true,
      use_advanced_settings: req.body.useAdvancedSettings === 'true' || req.body.useAdvancedSettings === true,
      user_id: req.session.userId
    };
    if (req.body.scheduleTime) {
      const scheduleDate = new Date(req.body.scheduleTime);
      
      const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(`[CREATE STREAM] Server timezone: ${serverTimezone}`);
      console.log(`[CREATE STREAM] Input time: ${req.body.scheduleTime}`);
      console.log(`[CREATE STREAM] Parsed time: ${scheduleDate.toISOString()}`);
      console.log(`[CREATE STREAM] Local display: ${scheduleDate.toLocaleString('en-US', { timeZone: serverTimezone })}`);
      
      streamData.schedule_time = scheduleDate.toISOString();
    }
    if (req.body.duration) {
      streamData.duration = parseInt(req.body.duration);
    }
    streamData.status = req.body.scheduleTime ? 'scheduled' : 'offline';
    const stream = await Stream.create(streamData);
    res.json({ success: true, stream });
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ success: false, error: 'Failed to create stream' });
  }
});
app.get('/api/streams/:id', isAuthenticated, async (req, res) => {
  try {
    const stream = await Stream.getStreamWithVideo(req.params.id);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this stream' });
    }
    res.json({ success: true, stream });
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stream' });
  }
});
app.put('/api/streams/:id', isAuthenticated, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this stream' });
    }
    const updateData = {};
    if (req.body.streamTitle) updateData.title = req.body.streamTitle;
    if (req.body.videoId) updateData.video_id = req.body.videoId;
    if (req.body.rtmpUrl) updateData.rtmp_url = req.body.rtmpUrl;
    if (req.body.streamKey) updateData.stream_key = req.body.streamKey;
    if (req.body.bitrate) updateData.bitrate = parseInt(req.body.bitrate);
    if (req.body.resolution) updateData.resolution = req.body.resolution;
    if (req.body.fps) updateData.fps = parseInt(req.body.fps);
    if (req.body.orientation) updateData.orientation = req.body.orientation;
    if (req.body.loopVideo !== undefined) {
      updateData.loop_video = req.body.loopVideo === 'true' || req.body.loopVideo === true;
    }
    if (req.body.useAdvancedSettings !== undefined) {
      updateData.use_advanced_settings = req.body.useAdvancedSettings === 'true' || req.body.useAdvancedSettings === true;
    }
    if (req.body.scheduleTime) {
      const scheduleDate = new Date(req.body.scheduleTime);
      
      const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(`[UPDATE STREAM] Server timezone: ${serverTimezone}`);
      console.log(`[UPDATE STREAM] Input time: ${req.body.scheduleTime}`);
      console.log(`[UPDATE STREAM] Parsed time: ${scheduleDate.toISOString()}`);
      console.log(`[UPDATE STREAM] Local display: ${scheduleDate.toLocaleString('en-US', { timeZone: serverTimezone })}`);
      
      updateData.schedule_time = scheduleDate.toISOString();
      updateData.status = 'scheduled';
    } else if ('scheduleTime' in req.body && !req.body.scheduleTime) {
      updateData.schedule_time = null;
      updateData.status = 'offline';
    }
    
    const updatedStream = await Stream.update(req.params.id, updateData);
    res.json({ success: true, stream: updatedStream });
  } catch (error) {
    console.error('Error updating stream:', error);
    res.status(500).json({ success: false, error: 'Failed to update stream' });
  }
});
app.delete('/api/streams/:id', isAuthenticated, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this stream' });
    }
    await Stream.delete(req.params.id, req.session.userId);
    res.json({ success: true, message: 'Stream deleted successfully' });
  } catch (error) {
    console.error('Error deleting stream:', error);
    res.status(500).json({ success: false, error: 'Failed to delete stream' });
  }
});
app.post('/api/streams/:id/status', isAuthenticated, [
  body('status').isIn(['live', 'offline', 'scheduled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    const streamId = req.params.id;
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const newStatus = req.body.status;
    if (newStatus === 'live') {
      if (stream.status === 'live') {
        return res.json({
          success: false,
          error: 'Stream is already live',
          stream
        });
      }
      if (!stream.video_id) {
        return res.json({
          success: false,
          error: 'No video attached to this stream',
          stream
        });
      }
      const result = await streamingService.startStream(streamId);
      if (result.success) {
        const updatedStream = await Stream.getStreamWithVideo(streamId);
        return res.json({
          success: true,
          stream: updatedStream,
          isAdvancedMode: result.isAdvancedMode
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to start stream'
        });
      }
    } else if (newStatus === 'offline') {
      if (stream.status === 'live') {
        const result = await streamingService.stopStream(streamId);
        if (!result.success) {
          console.warn('Failed to stop FFmpeg process:', result.error);
        }
        await Stream.update(streamId, {
          schedule_time: null
        });
        console.log(`Reset schedule_time for stopped stream ${streamId}`);
      } else if (stream.status === 'scheduled') {
        await Stream.update(streamId, {
          schedule_time: null,
          status: 'offline'
        });
        console.log(`Scheduled stream ${streamId} was cancelled`);
      }
      const result = await Stream.updateStatus(streamId, 'offline', req.session.userId);
      if (!result.updated) {
        return res.status(404).json({
          success: false,
          error: 'Stream not found or not updated'
        });
      }
      return res.json({ success: true, stream: result });
    } else {
      const result = await Stream.updateStatus(streamId, newStatus, req.session.userId);
      if (!result.updated) {
        return res.status(404).json({
          success: false,
          error: 'Stream not found or not updated'
        });
      }
      return res.json({ success: true, stream: result });
    }
  } catch (error) {
    console.error('Error updating stream status:', error);
    res.status(500).json({ success: false, error: 'Failed to update stream status' });
  }
});
app.get('/api/streams/check-key', isAuthenticated, async (req, res) => {
  try {
    const streamKey = req.query.key;
    const excludeId = req.query.excludeId || null;
    if (!streamKey) {
      return res.status(400).json({
        success: false,
        error: 'Stream key is required'
      });
    }
    const isInUse = await Stream.isStreamKeyInUse(streamKey, req.session.userId, excludeId);
    res.json({
      success: true,
      isInUse: isInUse,
      message: isInUse ? 'Stream key is already in use' : 'Stream key is available'
    });
  } catch (error) {
    console.error('Error checking stream key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check stream key'
    });
  }
});
app.get('/api/streams/:id/logs', isAuthenticated, async (req, res) => {
  try {
    const streamId = req.params.id;
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const logs = streamingService.getStreamLogs(streamId);
    const isActive = streamingService.isStreamActive(streamId);
    res.json({
      success: true,
      logs,
      isActive,
      stream
    });
  } catch (error) {
    console.error('Error fetching stream logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stream logs' });
  }
});
app.get('/playlist', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.findAll(req.session.userId);
    const videos = await Video.findAll(req.session.userId);
    res.render('playlist', {
      title: 'Playlist',
      active: 'playlist',
      user: await User.findById(req.session.userId),
      playlists: playlists,
      videos: videos
    });
  } catch (error) {
    console.error('Playlist error:', error);
    res.redirect('/dashboard');
  }
});

// Schedule Templates Routes
app.get('/api/schedule-templates', isAuthenticated, async (req, res) => {
  try {
    const templates = await ScheduleTemplate.findAll(req.session.userId);
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching schedule templates:', error);
    res.status(500).json({ success: false, error: 'Failed to load schedule templates' });
  }
});

app.post('/api/schedule-templates', isAuthenticated, [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('streamId').notEmpty().withMessage('Stream ID is required'),
  body('recurrenceType').isIn(['once', 'daily', 'weekly', 'monthly']).withMessage('Invalid recurrence type'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const {
      name,
      streamId,
      recurrenceType,
      recurrenceDays,
      startTime,
      durationMinutes,
      endDate
    } = req.body;

    // Validate stream exists and belongs to user
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Validate recurrence days for weekly
    if (recurrenceType === 'weekly') {
      if (!recurrenceDays || !Array.isArray(recurrenceDays) || recurrenceDays.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Recurrence days are required for weekly schedule' 
        });
      }
    }

    const template = await ScheduleTemplate.create({
      name,
      stream_id: streamId,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceDays,
      start_time: startTime,
      duration_minutes: parseInt(durationMinutes),
      end_date: endDate || null,
      is_active: true,
      user_id: req.session.userId
    });

    // Schedule the template
    await recurringSchedulerService.scheduleTemplate(template);

    res.json({ 
      success: true, 
      message: 'Schedule template created successfully',
      template 
    });
  } catch (error) {
    console.error('Error creating schedule template:', error);
    res.status(500).json({ success: false, error: 'Failed to create schedule template' });
  }
});

app.put('/api/schedule-templates/:id', isAuthenticated, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('durationMinutes').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const template = await ScheduleTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    if (template.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.recurrenceType) updateData.recurrence_type = req.body.recurrenceType;
    if (req.body.recurrenceDays) updateData.recurrence_days = req.body.recurrenceDays;
    if (req.body.startTime) updateData.start_time = req.body.startTime;
    if (req.body.durationMinutes) updateData.duration_minutes = parseInt(req.body.durationMinutes);
    if (req.body.endDate !== undefined) updateData.end_date = req.body.endDate;

    await ScheduleTemplate.update(req.params.id, updateData);

    // Reschedule the template
    await recurringSchedulerService.rescheduleTemplate(req.params.id);

    res.json({ 
      success: true, 
      message: 'Schedule template updated successfully' 
    });
  } catch (error) {
    console.error('Error updating schedule template:', error);
    res.status(500).json({ success: false, error: 'Failed to update schedule template' });
  }
});

app.delete('/api/schedule-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const template = await ScheduleTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    if (template.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Cancel scheduled streams
    await recurringSchedulerService.cancelTemplate(req.params.id);

    // Delete template
    await ScheduleTemplate.delete(req.params.id, req.session.userId);

    res.json({ 
      success: true, 
      message: 'Schedule template deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting schedule template:', error);
    res.status(500).json({ success: false, error: 'Failed to delete schedule template' });
  }
});

app.post('/api/schedule-templates/:id/toggle', isAuthenticated, async (req, res) => {
  try {
    const template = await ScheduleTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    if (template.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await ScheduleTemplate.toggleActive(req.params.id, req.session.userId);

    // Reschedule or cancel based on new status
    const updatedTemplate = await ScheduleTemplate.findById(req.params.id);
    if (updatedTemplate.is_active) {
      await recurringSchedulerService.scheduleTemplate(updatedTemplate);
    } else {
      await recurringSchedulerService.cancelTemplate(req.params.id);
    }

    res.json({ 
      success: true, 
      message: `Schedule template ${updatedTemplate.is_active ? 'activated' : 'deactivated'}`,
      is_active: updatedTemplate.is_active
    });
  } catch (error) {
    console.error('Error toggling schedule template:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle schedule template' });
  }
});

app.get('/api/schedule-templates/upcoming', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const upcoming = await recurringSchedulerService.getUpcomingStreams(req.session.userId, limit);
    res.json({ success: true, upcoming });
  } catch (error) {
    console.error('Error fetching upcoming streams:', error);
    res.status(500).json({ success: false, error: 'Failed to load upcoming streams' });
  }
});

app.get('/api/schedule-templates/history', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await recurringSchedulerService.getScheduleHistory(req.session.userId, limit);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching schedule history:', error);
    res.status(500).json({ success: false, error: 'Failed to load schedule history' });
  }
});

// ============================================
// Backup & Recovery Routes
// ============================================

// Get all backups for user
app.get('/api/backups', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const backups = await StreamBackup.findByUserId(req.session.userId, limit);
    res.json({ success: true, backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ success: false, error: 'Failed to load backups' });
  }
});

// Get backups for specific stream
app.get('/api/backups/stream/:streamId', isAuthenticated, async (req, res) => {
  try {
    const backups = await StreamBackup.findByStreamId(req.params.streamId);
    res.json({ success: true, backups });
  } catch (error) {
    console.error('Error fetching stream backups:', error);
    res.status(500).json({ success: false, error: 'Failed to load stream backups' });
  }
});

// Create manual backup
app.post('/api/backups/create/:streamId', isAuthenticated, async (req, res) => {
  try {
    const Stream = require('./models/Stream');
    const stream = await Stream.findById(req.params.streamId);
    
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const result = await backupService.manualBackup(
      req.params.streamId,
      req.session.userId,
      stream
    );

    if (result.success) {
      res.json({ success: true, message: 'Backup created successfully', backup: result.backup });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, error: 'Failed to create backup' });
  }
});

// Restore from backup
app.post('/api/backups/restore/:backupId', isAuthenticated, async (req, res) => {
  try {
    const result = await backupService.restoreFromBackup(req.params.backupId, req.session.userId);
    
    if (result.success) {
      res.json({ success: true, message: 'Backup restored successfully', data: result.data });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ success: false, error: 'Failed to restore backup' });
  }
});

// Delete backup
app.delete('/api/backups/:backupId', isAuthenticated, async (req, res) => {
  try {
    const backup = await StreamBackup.findById(req.params.backupId);
    
    if (!backup) {
      return res.status(404).json({ success: false, error: 'Backup not found' });
    }
    
    if (backup.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await StreamBackup.delete(req.params.backupId);
    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ success: false, error: 'Failed to delete backup' });
  }
});

// Export all configurations
app.get('/api/export/config', isAuthenticated, async (req, res) => {
  try {
    const result = await backupService.exportConfig(req.session.userId);
    
    if (result.success) {
      const filename = `streamflow-config-${new Date().toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(result.config);
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error exporting config:', error);
    res.status(500).json({ success: false, error: 'Failed to export configuration' });
  }
});

// Import configurations
app.post('/api/import/config', isAuthenticated, async (req, res) => {
  try {
    const configData = req.body;
    
    if (!configData || !configData.streams) {
      return res.status(400).json({ success: false, error: 'Invalid configuration data' });
    }

    const result = await backupService.importConfig(req.session.userId, configData);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Successfully imported ${result.imported} stream(s)`,
        imported: result.imported,
        errors: result.errors
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error importing config:', error);
    res.status(500).json({ success: false, error: 'Failed to import configuration' });
  }
});

// Get deleted streams (trash)
app.get('/api/trash', isAuthenticated, async (req, res) => {
  try {
    const deletedStreams = await backupService.getDeletedStreams(req.session.userId);
    res.json({ success: true, streams: deletedStreams });
  } catch (error) {
    console.error('Error fetching trash:', error);
    res.status(500).json({ success: false, error: 'Failed to load trash' });
  }
});

// Soft delete stream (move to trash)
app.post('/api/streams/:id/trash', isAuthenticated, async (req, res) => {
  try {
    const Stream = require('./models/Stream');
    const stream = await Stream.findById(req.params.id);
    
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    
    if (stream.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Create backup before deleting
    await backupService.autoBackup(req.params.id, req.session.userId, stream);

    // Soft delete
    const result = await backupService.softDelete(req.params.id, req.session.userId);
    
    if (result.success) {
      res.json({ success: true, message: 'Stream moved to trash' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to move stream to trash' });
    }
  } catch (error) {
    console.error('Error moving to trash:', error);
    res.status(500).json({ success: false, error: 'Failed to move stream to trash' });
  }
});

// Restore deleted stream
app.post('/api/trash/restore/:id', isAuthenticated, async (req, res) => {
  try {
    const result = await backupService.restoreDeleted(req.params.id, req.session.userId);
    
    if (result.success && result.restored > 0) {
      res.json({ success: true, message: 'Stream restored successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Stream not found in trash' });
    }
  } catch (error) {
    console.error('Error restoring stream:', error);
    res.status(500).json({ success: false, error: 'Failed to restore stream' });
  }
});

// Permanently delete stream
app.delete('/api/trash/:id', isAuthenticated, async (req, res) => {
  try {
    const result = await backupService.permanentDelete(req.params.id, req.session.userId);
    
    if (result.success && result.deleted > 0) {
      res.json({ success: true, message: 'Stream permanently deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Stream not found in trash' });
    }
  } catch (error) {
    console.error('Error permanently deleting stream:', error);
    res.status(500).json({ success: false, error: 'Failed to permanently delete stream' });
  }
});

// Empty trash (delete all)
app.delete('/api/trash/empty', isAuthenticated, async (req, res) => {
  try {
    const deletedStreams = await backupService.getDeletedStreams(req.session.userId);
    
    let deleted = 0;
    for (const stream of deletedStreams) {
      const result = await backupService.permanentDelete(stream.id, req.session.userId);
      if (result.success) deleted++;
    }

    res.json({ 
      success: true, 
      message: `Permanently deleted ${deleted} stream(s)`,
      deleted 
    });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({ success: false, error: 'Failed to empty trash' });
  }
});

app.get('/api/schedule-templates/statistics', isAuthenticated, async (req, res) => {
  try {
    const stats = await recurringSchedulerService.getStatistics(req.session.userId);
    res.json({ success: true, statistics: stats });
  } catch (error) {
    console.error('Error fetching schedule statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to load statistics' });
  }
});

app.get('/api/playlists', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.findAll(req.session.userId);
    
    playlists.forEach(playlist => {
      playlist.shuffle = playlist.is_shuffle;
    });
    
    res.json({ success: true, playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch playlists' });
  }
});

app.post('/api/playlists', isAuthenticated, [
  body('name').trim().isLength({ min: 1 }).withMessage('Playlist name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const playlistData = {
      name: req.body.name,
      description: req.body.description || null,
      is_shuffle: req.body.shuffle === 'true' || req.body.shuffle === true,
      user_id: req.session.userId
    };

    const playlist = await Playlist.create(playlistData);
    
    if (req.body.videos && Array.isArray(req.body.videos) && req.body.videos.length > 0) {
      for (let i = 0; i < req.body.videos.length; i++) {
        await Playlist.addVideo(playlist.id, req.body.videos[i], i + 1);
      }
    }
    
    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to create playlist' });
  }
});

app.get('/api/playlists/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findByIdWithVideos(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    if (playlist.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    playlist.shuffle = playlist.is_shuffle;
    
    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch playlist' });
  }
});

app.put('/api/playlists/:id', isAuthenticated, [
  body('name').trim().isLength({ min: 1 }).withMessage('Playlist name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    if (playlist.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description || null,
      is_shuffle: req.body.shuffle === 'true' || req.body.shuffle === true
    };

    const updatedPlaylist = await Playlist.update(req.params.id, updateData);
    
    if (req.body.videos && Array.isArray(req.body.videos)) {
      const existingVideos = await Playlist.findByIdWithVideos(req.params.id);
      if (existingVideos && existingVideos.videos) {
        for (const video of existingVideos.videos) {
          await Playlist.removeVideo(req.params.id, video.id);
        }
      }
      
      for (let i = 0; i < req.body.videos.length; i++) {
        await Playlist.addVideo(req.params.id, req.body.videos[i], i + 1);
      }
    }
    
    res.json({ success: true, playlist: updatedPlaylist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to update playlist' });
  }
});

app.delete('/api/playlists/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    if (playlist.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Playlist.delete(req.params.id);
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to delete playlist' });
  }
});

app.post('/api/playlists/:id/videos', isAuthenticated, [
  body('videoId').notEmpty().withMessage('Video ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    if (playlist.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const video = await Video.findById(req.body.videoId);
    if (!video || video.user_id !== req.session.userId) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const position = await Playlist.getNextPosition(req.params.id);
    await Playlist.addVideo(req.params.id, req.body.videoId, position);
    
    res.json({ success: true, message: 'Video added to playlist' });
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to add video to playlist' });
  }
});

app.delete('/api/playlists/:id/videos/:videoId', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    if (playlist.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Playlist.removeVideo(req.params.id, req.params.videoId);
    res.json({ success: true, message: 'Video removed from playlist' });
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to remove video from playlist' });
  }
});

app.put('/api/playlists/:id/videos/reorder', isAuthenticated, [
  body('videoPositions').isArray().withMessage('Video positions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    if (playlist.user_id !== req.session.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Playlist.updateVideoPositions(req.params.id, req.body.videoPositions);
    res.json({ success: true, message: 'Video order updated' });
  } catch (error) {
    console.error('Error reordering videos:', error);
    res.status(500).json({ success: false, error: 'Failed to reorder videos' });
  }
});

app.get('/api/server-time', (req, res) => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedTime = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  res.json({
    serverTime: now.toISOString(),
    formattedTime: formattedTime
  });
});
const server = app.listen(port, '0.0.0.0', async () => {
  const ipAddresses = getLocalIpAddresses();
  console.log(`StreamFlow running at:`);
  if (ipAddresses && ipAddresses.length > 0) {
    ipAddresses.forEach(ip => {
      console.log(`  http://${ip}:${port}`);
    });
  } else {
    console.log(`  http://localhost:${port}`);
  }
  try {
    const streams = await Stream.findAll(null, 'live');
    if (streams && streams.length > 0) {
      console.log(`Resetting ${streams.length} live streams to offline state...`);
      for (const stream of streams) {
        await Stream.updateStatus(stream.id, 'offline');
      }
    }
  } catch (error) {
    console.error('Error resetting stream statuses:', error);
  }
  schedulerService.init(streamingService);
  try {
    await streamingService.syncStreamStatuses();
  } catch (error) {
    console.error('Failed to sync stream statuses:', error);
  }
});

server.timeout = 30 * 60 * 1000;
server.keepAliveTimeout = 30 * 60 * 1000;
server.headersTimeout = 30 * 60 * 1000;
