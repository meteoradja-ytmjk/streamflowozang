# 📤 Git & GitHub Guide

## 🎯 Quick Push (Termudah)

### Windows:
```bash
# Double-click file ini:
push-updates.bat
```

### Linux/Mac:
```bash
chmod +x push-updates.sh
./push-updates.sh
```

---

## 🚀 Manual Push (4 Cara)

### **Cara 1: Command Line** ⭐

```bash
# 1. Configure git (sekali saja)
git config user.email "meteoradja@github.com"
git config user.name "Mas Ozang"

# 2. Add all changes
git add .

# 3. Commit with message
git commit -m "Your commit message here"

# 4. Push to GitHub
git push origin main
```

### **Cara 2: GitHub Desktop**

1. Buka **GitHub Desktop**
2. Review changes di sidebar
3. Isi commit message
4. Klik **"Commit to main"**
5. Klik **"Push origin"**

Download: https://desktop.github.com/

### **Cara 3: VS Code**

1. Buka **VS Code**
2. Klik icon **Source Control** (Ctrl+Shift+G)
3. Review changes
4. Isi commit message
5. Klik **✓ Commit**
6. Klik **"..."** → **Push**

### **Cara 4: Git GUI**

```bash
git gui
```

---

## 📋 Git Commands Cheat Sheet

### Basic Commands

```bash
# Check status
git status

# Add specific file
git add filename.js

# Add all files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest changes
git pull origin main
```

### Branch Management

```bash
# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main

# List branches
git branch

# Delete branch
git branch -d feature-name

# Push branch
git push origin feature-name
```

### Undo Changes

```bash
# Discard changes in file
git restore filename.js

# Discard all changes
git restore .

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### View History

```bash
# View commit history
git log

# View last 5 commits
git log --oneline -5

# View changes
git diff

# View changes in specific file
git diff filename.js
```

---

## 🐛 Troubleshooting

### 1. Authentication Failed

**Solusi A: Personal Access Token**

1. GitHub → Settings → Developer settings
2. Personal access tokens → Generate new token
3. Select scope: `repo`
4. Copy token
5. Use token as password when pushing

**Solusi B: SSH Key**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub → Settings → SSH Keys
```

### 2. Merge Conflict

```bash
# Pull first
git pull origin main

# Resolve conflicts in files
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "Resolve conflicts"
git push origin main
```

### 3. Large Files Error

```bash
# Check file sizes
du -sh *

# Add to .gitignore
echo "large-file.mp4" >> .gitignore

# Remove from git cache
git rm --cached large-file.mp4

# Commit
git add .gitignore
git commit -m "Remove large file"
git push origin main
```

### 4. Detached HEAD

```bash
# Return to main branch
git checkout main

# Or create new branch from current state
git checkout -b new-branch-name
```

### 5. Permission Denied

```bash
# Check remote URL
git remote -v

# Change to HTTPS
git remote set-url origin https://github.com/username/repo.git

# Or change to SSH
git remote set-url origin git@github.com:username/repo.git
```

---

## 📊 Good Commit Messages

### Format:
```
type: Short description (max 50 chars)

Longer description if needed (wrap at 72 chars)
- Bullet points for details
- What changed and why
```

### Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### Examples:

```bash
# Good ✅
git commit -m "feat: Add user authentication system"
git commit -m "fix: Resolve signup error with max_streams"
git commit -m "docs: Update installation guide"

# Bad ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

---

## 🔄 Update VPS After Push

Setelah push ke GitHub, update di VPS:

```bash
# 1. SSH to VPS
ssh user@your-server-ip

# 2. Navigate to app directory
cd /path/to/app

# 3. Pull latest changes
git pull origin main

# 4. Install new dependencies
npm install

# 5. Run migrations (if any)
node migrate-database.js

# 6. Restart application
pm2 restart streamflow

# 7. Check status
pm2 status

# 8. Check logs
pm2 logs streamflow --lines 50
```

---

## 🔐 .gitignore Best Practices

File yang HARUS di-ignore:

```gitignore
# Environment
.env
.env.local

# Dependencies
node_modules/

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Uploads
uploads/
public/uploads/

# Build
dist/
build/

# Temporary
tmp/
temp/
*.tmp
```

---

## 💡 Git Best Practices

### 1. Commit Often
- Commit small, logical changes
- Don't wait for too many changes
- Easier to track and revert

### 2. Write Clear Messages
- Explain WHAT and WHY
- Not just "update" or "fix"
- Future you will thank you

### 3. Pull Before Push
```bash
git pull origin main
# Resolve conflicts if any
git push origin main
```

### 4. Use Branches
```bash
# For new features
git checkout -b feature/user-auth

# For bug fixes
git checkout -b fix/signup-error

# Merge when done
git checkout main
git merge feature/user-auth
```

### 5. Review Before Commit
```bash
# Check what changed
git status
git diff

# Add selectively
git add specific-file.js

# Or add all
git add .
```

### 6. Backup Important Branches
```bash
# Create backup branch
git branch backup-main

# Or tag important commits
git tag v1.0.0
git push origin v1.0.0
```

---

## 📚 Learn More

### Official Documentation
- Git: https://git-scm.com/doc
- GitHub: https://docs.github.com

### Interactive Tutorials
- Learn Git Branching: https://learngitbranching.js.org/
- GitHub Skills: https://skills.github.com/

### Cheat Sheets
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

## 🎯 Quick Reference

```bash
# Daily workflow
git pull origin main          # Get latest
git add .                     # Stage changes
git commit -m "message"       # Commit
git push origin main          # Push

# Check status
git status                    # What changed?
git log --oneline -5          # Recent commits

# Undo mistakes
git restore filename          # Discard changes
git reset --soft HEAD~1       # Undo commit

# Branch work
git checkout -b new-feature   # New branch
git checkout main             # Switch back
git merge new-feature         # Merge branch
```

---

**Repository:** https://github.com/meteoradja-ytmjk/streamflowozang

**Happy coding!** 🚀
