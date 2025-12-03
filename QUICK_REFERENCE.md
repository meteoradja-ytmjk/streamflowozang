# ⚡ Quick Reference Guide

Panduan cepat untuk tugas-tugas umum di StreamFlow

---

## 🚀 Getting Started

### First Time Setup
```bash
npm run setup
```
Interactive wizard akan memandu Anda melalui:
- Prerequisites check
- Dependency installation
- Environment setup
- Database initialization
- Application startup

### Access Application
```
http://localhost:7575
```

---

## 🎯 Interactive CLI (Recommended)

### Launch CLI
```bash
npm run cli
```

**Menu Options:**
1. Reset Admin Password
2. Reset Database
3. Activate All Users
4. Create New Admin
5. Check Database
6. Fix Setup Issues
7. Fix Signup Issues
8. Health Check
9-12. Application Control
13-15. Git Operations
16-18. Documentation

---

## 🔐 Admin Management

### Reset Admin Password
```bash
npm run admin:reset
# Username: admin
# Password: Admin123456
```

### Activate All Users
```bash
npm run admin:activate
```

### Create New Admin
```bash
node create-admin.js
```

---

## 💾 Database Operations

### Check Database
```bash
npm run db:check
```

### Reset Database (Delete All Users)
```bash
npm run db:reset
```

### Fix Setup Account Issues
```bash
npm run fix:setup
```

### Fix Signup Issues
```bash
npm run fix:signup
```

---

## 📦 Backup & Restore

### Create Backup
```bash
npm run backup
```

### List Backups
```bash
npm run backup:list
```

### Restore Backup
```bash
node backup-manager.js restore backup_2024-12-04_10-30-00
```

### Delete Backup
```bash
node backup-manager.js delete backup_2024-12-04_10-30-00
```

---

## 🔧 Application Control

### Start Application
```bash
npm start
# or with PM2
npm run pm2:start
```

### Stop Application
```bash
npm run pm2:stop
```

### Restart Application
```bash
npm run pm2:restart
```

### View Logs
```bash
npm run pm2:logs
```

### Check Status
```bash
npm run pm2:status
```

---

## 🔍 Diagnostics

### System Health Check
```bash
npm run health-check
```

### Check All Systems
```bash
node streamflow-cli.js
# Select option 8: System Health Check
```

---

## 🔄 Git Operations

### Push to GitHub
```bash
git add -A
git commit -m "Your message"
git push origin main

# Or use CLI
npm run cli
# Select option 13: Push to GitHub
```

### Pull from GitHub
```bash
git pull origin main

# Or use CLI
npm run cli
# Select option 14: Pull from GitHub
```

### Check Git Status
```bash
git status

# Or use CLI
npm run cli
# Select option 15: View Git Status
```

---

## 📚 Documentation

### View Documentation Index
```bash
cat DOCS_INDEX.md
# Or open in browser/editor
```

### Quick Access
- **Admin Guide:** `ADMIN_GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Git Guide:** `GIT_GUIDE.md`
- **Quick Start:** `QUICK_START.md`

---

## 🐛 Common Issues

### Cannot Login
```bash
npm run admin:reset
```

### Setup Account Not Working
```bash
npm run fix:setup
```

### Signup Error
```bash
npm run fix:signup
```

### Database Issues
```bash
npm run db:check
```

### Application Not Starting
```bash
npm run health-check
npm run pm2:restart
```

---

## 💡 Pro Tips

### Use Interactive CLI
```bash
npm run cli
```
Easiest way to manage everything!

### Regular Backups
```bash
npm run backup
```
Create backups before major changes.

### Check Health Regularly
```bash
npm run health-check
```
Monitor system health.

### Use PM2 for Production
```bash
npm run pm2:start
```
Better process management.

---

## 📊 All NPM Scripts

```bash
# Setup & Installation
npm run setup              # Setup wizard
npm run health-check       # Health check

# Admin Management
npm run admin:reset        # Reset admin password
npm run admin:activate     # Activate all users

# Database
npm run db:check           # Check database
npm run db:reset           # Reset database

# Backup & Restore
npm run backup             # Create backup
npm run backup:list        # List backups

# Diagnostics
npm run fix:setup          # Fix setup issues
npm run fix:signup         # Fix signup issues

# Application
npm start                  # Start app
npm run dev                # Development mode

# PM2
npm run pm2:start          # Start with PM2
npm run pm2:stop           # Stop app
npm run pm2:restart        # Restart app
npm run pm2:logs           # View logs
npm run pm2:status         # Check status

# Interactive
npm run cli                # Interactive CLI
```

---

## 🔗 Quick Links

- **Repository:** https://github.com/meteoradja-ytmjk/streamflowozang
- **Documentation:** [DOCS_INDEX.md](DOCS_INDEX.md)
- **Admin Guide:** [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📞 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Run diagnostics: `npm run health-check`
3. Use interactive CLI: `npm run cli`
4. Read [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

---

**Quick Reference Guide - StreamFlow v2.4.0**

**Last updated: December 4, 2024**
