# 📚 Documentation Index

Panduan lengkap untuk StreamFlow - Live Streaming Application

---

## 🚀 Getting Started

### Untuk Pemula
1. **[README.md](README.md)** ⭐ - Mulai di sini!
   - Overview aplikasi
   - Quick start guide
   - System requirements

2. **[QUICK_START.md](QUICK_START.md)** - Panduan cepat
   - Instalasi 1 command
   - Setup pertama kali
   - Cara streaming

### Untuk Deployment
3. **[INSTALASI_VPS.md](INSTALASI_VPS.md)** - Instalasi detail di VPS
   - Step-by-step installation
   - Troubleshooting
   - Best practices

4. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment
   - Pre-deployment checklist
   - Deployment steps
   - Post-deployment verification

5. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Checklist lengkap
   - Pre-deployment checks
   - Deployment tasks
   - Post-deployment tasks

---

## 🔐 Admin Management

### Setup & Reset
6. **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** ⭐⭐⭐ - WAJIB BACA!
   - Setup admin pertama kali
   - Reset password admin
   - Reset database
   - Troubleshooting lengkap

7. **[RESET_ADMIN_GUIDE.md](RESET_ADMIN_GUIDE.md)** - Reset password
   - Cara reset password admin
   - Multiple methods
   - Recovery options

### User Management
8. **[SIGNUP_FIX_GUIDE.md](SIGNUP_FIX_GUIDE.md)** - Fix signup issues
   - Diagnose signup errors
   - Fix common problems
   - Testing signup

9. **[LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md)** - Fix login issues
   - Login troubleshooting
   - Session problems
   - Authentication fixes

### Troubleshooting
10. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** ⭐⭐ - Complete troubleshooting guide
    - Setup & installation issues
    - Admin & authentication problems
    - Database issues
    - Streaming problems
    - Performance issues
    - Git & GitHub issues
    - Server & deployment issues

---

## 🔧 Development & Git

### Git & GitHub
11. **[GIT_GUIDE.md](GIT_GUIDE.md)** - Git & GitHub guide
    - Push/pull commands
    - Branch management
    - Troubleshooting
    - Best practices

### Updates
12. **[CHANGELOG.md](CHANGELOG.md)** - Version history
    - All changes by version
    - New features
    - Bug fixes

13. **[UPDATE_SUMMARY.md](UPDATE_SUMMARY.md)** - Latest update summary
    - Recent changes
    - New files
    - Improvements

---

## 📦 Utility Scripts & Tools

### 🎯 Interactive Tools (NEW!)
```bash
# Interactive CLI - All-in-one management tool
npm run cli
node streamflow-cli.js

# Setup Wizard - First-time setup
npm run setup
node setup-wizard.js

# Backup Manager - Backup and restore
npm run backup              # Create backup
npm run backup:list         # List backups
node backup-manager.js restore <name>  # Restore backup
```

### Admin Tools
```bash
# Setup & Reset
npm run admin:reset            # Reset admin password
npm run db:reset               # Reset database (hapus semua user)
node fix-setup-account.js      # Diagnose setup account issues
node delete-all-users.js       # Delete all users with confirmation

# User Management
npm run admin:activate         # Activate all inactive users
node create-admin.js           # Create new admin
```

### Diagnostics
```bash
# Database & System
node check-db.js               # Check database structure
node health-check.js           # System health check

# Signup & Login
node fix-signup.js             # Fix signup issues
node test-signup.js            # Test signup functionality
node quick-login-fix.js        # Fix login issues
```

### Deployment
```bash
# Pre/Post Deployment
./pre-deploy-check.sh          # Pre-deployment checks
./post-deploy-check.sh         # Post-deployment verification

# Installation
./install.sh                   # Automated installation
./start.sh                     # Start application
```

---

## 📖 Documentation by Category

### 🎯 By User Type

#### Untuk End User
- [README.md](README.md) - Overview
- [QUICK_START.md](QUICK_START.md) - Quick start

#### Untuk Admin
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin management
- [RESET_ADMIN_GUIDE.md](RESET_ADMIN_GUIDE.md) - Password reset
- [SIGNUP_FIX_GUIDE.md](SIGNUP_FIX_GUIDE.md) - Signup fixes
- [LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md) - Login fixes
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Complete troubleshooting

#### Untuk Developer
- [GIT_GUIDE.md](GIT_GUIDE.md) - Git workflow
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md) - Latest updates
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Technical issues

#### Untuk DevOps
- [INSTALASI_VPS.md](INSTALASI_VPS.md) - VPS installation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Checklist
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Server issues

### 🔍 By Topic

#### Installation
- [README.md](README.md) - Quick install
- [QUICK_START.md](QUICK_START.md) - Quick start
- [INSTALASI_VPS.md](INSTALASI_VPS.md) - VPS install
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deploy

#### Admin Management
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Complete guide
- [RESET_ADMIN_GUIDE.md](RESET_ADMIN_GUIDE.md) - Password reset

#### Troubleshooting
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Complete guide ⭐
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin issues
- [SIGNUP_FIX_GUIDE.md](SIGNUP_FIX_GUIDE.md) - Signup errors
- [LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md) - Login problems
- [GIT_GUIDE.md](GIT_GUIDE.md) - Git issues

#### Development
- [GIT_GUIDE.md](GIT_GUIDE.md) - Git workflow
- [CHANGELOG.md](CHANGELOG.md) - Changes
- [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md) - Updates

---

## 🎯 Quick Links

### Most Important Docs
1. [README.md](README.md) - Start here
2. [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin management
3. [QUICK_START.md](QUICK_START.md) - Quick start

### Common Tasks

#### First Time Setup
1. Read [README.md](README.md)
2. Follow [QUICK_START.md](QUICK_START.md)
3. Setup admin via [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

#### Forgot Admin Password
1. Read [RESET_ADMIN_GUIDE.md](RESET_ADMIN_GUIDE.md)
2. Run: `node quick-reset-admin.js`
3. Login with new password

#### Signup Not Working
1. Read [SIGNUP_FIX_GUIDE.md](SIGNUP_FIX_GUIDE.md)
2. Run: `node fix-signup.js`
3. Test: `node test-signup.js`

#### Deploy to VPS
1. Read [INSTALASI_VPS.md](INSTALASI_VPS.md)
2. Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Follow [DEPLOYMENT.md](DEPLOYMENT.md)

#### Push to GitHub
1. Read [GIT_GUIDE.md](GIT_GUIDE.md)
2. Run: `./push-updates.sh` (Linux/Mac)
3. Or: `push-updates.bat` (Windows)

---

## 📊 Documentation Stats

```
Total Documents: 16+
Total Scripts: 16+
Categories: 5 (Getting Started, Admin, Troubleshooting, Development, Deployment)
Languages: English & Indonesian
```

---

## 💡 Tips

### For Beginners
- Start with [README.md](README.md)
- Follow [QUICK_START.md](QUICK_START.md) step by step
- Read [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for admin tasks

### For Admins
- Bookmark [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- Keep [RESET_ADMIN_GUIDE.md](RESET_ADMIN_GUIDE.md) handy
- Use utility scripts for common tasks

### For Developers
- Read [GIT_GUIDE.md](GIT_GUIDE.md) for workflow
- Check [CHANGELOG.md](CHANGELOG.md) for changes
- Follow best practices in guides

### For DevOps
- Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Automate with scripts
- Monitor with health checks

---

## 🔄 Keeping Docs Updated

### When to Update
- After adding new features
- After fixing bugs
- After changing workflows
- After user feedback

### How to Update
1. Edit relevant .md file
2. Update [CHANGELOG.md](CHANGELOG.md)
3. Update this index if needed
4. Push to GitHub

---

## 📞 Need Help?

### Check Documentation First
1. Search this index for your topic
2. Read relevant guide
3. Try suggested solutions

### Still Stuck?
1. Check [ADMIN_GUIDE.md](ADMIN_GUIDE.md) troubleshooting
2. Run diagnostic scripts
3. Check logs: `pm2 logs streamflow`

### Report Issues
- GitHub Issues: https://github.com/meteoradja-ytmjk/streamflowozang/issues
- Include error messages
- Include steps to reproduce

---

## 🎉 Contributing

Want to improve documentation?

1. Fork repository
2. Edit documentation
3. Submit pull request
4. Follow [GIT_GUIDE.md](GIT_GUIDE.md)

---

**Documentation maintained by Mas Ozang**

**Last updated: December 4, 2024**

**Repository:** https://github.com/meteoradja-ytmjk/streamflowozang
