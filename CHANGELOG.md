# Changelog - StreamFlow

## [2.4.0] - 2024-12-04

### 🚀 Interactive Management Tools
- **Added streamflow-cli.js** ⭐⭐⭐ - Interactive CLI for all management tasks
  - Admin management (reset password, activate users)
  - Database operations (check, reset)
  - Application control (start, stop, restart, logs)
  - Git operations (push, pull, status)
  - Documentation access
  - Color-coded terminal output
  - Easy-to-use menu system

- **Added setup-wizard.js** ⭐⭐ - First-time setup wizard
  - Prerequisites check (Node.js, npm, FFmpeg, Git, PM2)
  - Automated dependency installation
  - Environment configuration
  - Database initialization
  - PM2 setup
  - Application startup
  - Step-by-step guidance

- **Added backup-manager.js** ⭐⭐ - Automated backup and restore
  - Create full backups (database, .env, uploads)
  - List all backups with details
  - Restore from backup
  - Delete old backups
  - Automatic backup info tracking
  - Size calculation and reporting

### 📦 NPM Scripts Enhancement
- Added 15+ new npm scripts for common tasks:
  ```bash
  npm run cli              # Interactive CLI
  npm run setup            # Setup wizard
  npm run backup           # Create backup
  npm run backup:list      # List backups
  npm run admin:reset      # Reset admin password
  npm run admin:activate   # Activate all users
  npm run db:reset         # Reset database
  npm run db:check         # Check database
  npm run fix:setup        # Fix setup issues
  npm run fix:signup       # Fix signup issues
  ```

### 🎨 User Experience
- Interactive menus for easier management
- Color-coded terminal output for better readability
- Step-by-step wizards for complex tasks
- Automated checks and validations
- Clear error messages and solutions

### 📝 Documentation
- Updated README.md with management tools section
- Updated package.json to v2.3.0
- Added comprehensive tool documentation

---

## [2.3.0] - 2024-12-04

### 📚 Documentation Overhaul
- **Added TROUBLESHOOTING.md** ⭐ - Comprehensive troubleshooting guide
  - Setup & installation issues
  - Admin & authentication problems
  - Signup & login issues
  - Database problems
  - Streaming issues
  - Performance problems
  - Git & GitHub issues
  - Server & deployment issues
  
- **Added GIT_GUIDE.md** - Complete Git & GitHub guide
  - Push/pull commands
  - Branch management
  - Troubleshooting
  - Best practices
  - Cheat sheet
  
- **Added DOCS_INDEX.md** - Documentation navigation index
  - All docs organized by category
  - Quick links to common tasks
  - Easy navigation
  
- **Added push-updates.sh** - Linux/Mac push script
  - Automated git workflow
  - Interactive commit messages

### 🗑️ Cleanup
- Removed `PUSH_TO_GITHUB.md` (consolidated into GIT_GUIDE.md)
- Removed `PUSH_INSTRUCTIONS.md` (consolidated into GIT_GUIDE.md)
- Better organization and easier navigation

### 🎯 Improvements
- All documentation now properly indexed
- Easier to find solutions
- Better troubleshooting workflow
- Comprehensive guides for all common issues

---

## [2.2.0] - 2024-12-04

### 🔧 Admin Management
- **Database Reset Tool** - `reset-database-fresh.js` for complete database reset
- **Setup Account Diagnostics** - `fix-setup-account.js` to diagnose setup issues
- **Delete All Users** - `delete-all-users.js` with confirmation prompt

### 📚 Documentation
- Added `ADMIN_GUIDE.md` - Comprehensive admin management guide
  - Setup admin pertama kali
  - Reset password admin
  - Reset database
  - Troubleshooting lengkap
- Cleaned up duplicate documentation files
- Consolidated all admin guides into one

### 🐛 Bug Fixes
- Fixed setup account blocking when users exist
- Improved error messages for setup account
- Better database cleanup on user deletion

### 📦 New Scripts
```bash
node reset-database-fresh.js   # Reset database (hapus semua user)
node fix-setup-account.js      # Diagnose setup account issues
node delete-all-users.js       # Delete all users with confirmation
```

---

## [2.1.1] - 2024-12-02

### 🐛 Bug Fixes
- **Fixed signup error** - Resolved "An error occurred during registration" issue
  - Added missing `max_streams` parameter in User.create()
  - Improved error handling with specific error messages
  - Added detailed logging for debugging

### ✨ New Features
- **Quick Admin Reset** - `quick-reset-admin.js` for instant admin password reset
- **User Activation Tool** - `activate-all-users.js` to activate all inactive users
- **Signup Diagnostics** - `fix-signup.js` to check and fix signup issues
- **Signup Testing** - `test-signup.js` to verify signup functionality

### 📚 Documentation
- Added `SIGNUP_FIX_GUIDE.md` - Complete guide for fixing signup issues
- Added `RESET_ADMIN_GUIDE.md` - Guide for resetting admin password
- Added `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- Added `READY_TO_DEPLOY.md` - Deployment readiness status
- Added `QUICK_START.md` - Quick start guide

### 🔧 Improvements
- Better error messages for signup failures
- Enhanced logging for troubleshooting
- Improved database error handling
- Added validation for user creation

### 📦 Scripts
```bash
node quick-reset-admin.js      # Reset admin password instantly
node activate-all-users.js     # Activate all inactive users
node fix-signup.js             # Diagnose and fix signup issues
node test-signup.js            # Test signup functionality
node health-check.js           # System health check
```

---

## [2.1.0] - 2024-12-XX

### 🚀 Production Ready
- Complete deployment setup for VPS
- Automated installation script (`install.sh`)
- PM2 ecosystem configuration
- Health check system
- Pre/post deployment checks

### 📚 Documentation
- Complete deployment documentation
- VPS installation guide (INSTALASI_VPS.md)
- Deployment guide (DEPLOYMENT.md)
- Quick start guide

### 🔐 Security
- Improved .gitignore
- Secure .env.example template
- Session secret generation
- Database file protection

### 🛠️ Infrastructure
- PM2 production configuration
- Automated startup scripts
- Health monitoring
- Error logging

---

## [2.0.0] - Original Release

### Features
- Multi-platform streaming (YouTube, Facebook, Twitch, etc.)
- Video gallery management
- Google Drive integration
- Scheduled streaming
- Recurring schedules
- Advanced stream settings
- Real-time monitoring
- Audio overlay
- Backup & recovery
- Multi-user support
- Responsive UI

---

## How to Update

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run fixes if needed
node fix-signup.js

# Restart application
pm2 restart streamflow
```

---

## Support

- **Repository**: https://github.com/meteoradja-ytmjk/streamflowozang
- **Issues**: https://github.com/meteoradja-ytmjk/streamflowozang/issues

---

Modified by Mas Ozang | Original by Bang Tutorial
