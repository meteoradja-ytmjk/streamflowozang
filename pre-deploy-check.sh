#!/bin/bash

# Pre-deployment Check Script
# Run this before pushing to GitHub to ensure everything is ready

echo "🔍 Pre-Deployment Check for StreamFlow"
echo "========================================"
echo

# Check if .env has placeholder secret
if grep -q "PLEASE_RUN_GENERATE_SECRET" .env; then
  echo "✅ .env has placeholder secret (good for GitHub)"
else
  echo "⚠️  Warning: .env might contain real secret key"
  echo "   Make sure .env is in .gitignore"
fi

# Check if .gitignore exists
if [ -f ".gitignore" ]; then
  echo "✅ .gitignore exists"
  
  # Check if .env is in .gitignore
  if grep -q "^\.env$" .gitignore; then
    echo "✅ .env is in .gitignore"
  else
    echo "⚠️  Warning: .env not in .gitignore"
  fi
else
  echo "❌ .gitignore not found"
fi

# Check required files
echo
echo "📁 Checking required files..."
REQUIRED_FILES=(
  "package.json"
  "app.js"
  "ecosystem.config.js"
  "install.sh"
  "health-check.js"
  ".env.example"
  "README.md"
  "INSTALASI_VPS.md"
  "DEPLOYMENT.md"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file not found"
  fi
done

# Check required directories
echo
echo "📂 Checking required directories..."
REQUIRED_DIRS=(
  "db"
  "logs"
  "public/uploads/videos"
  "public/uploads/audios"
  "public/uploads/thumbnails"
  "public/uploads/avatars"
  "models"
  "services"
  "middleware"
  "utils"
  "views"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/"
  else
    echo "❌ $dir/ not found"
  fi
done

# Check .gitkeep files
echo
echo "📌 Checking .gitkeep files..."
GITKEEP_DIRS=(
  "db"
  "logs"
  "public/uploads/videos"
  "public/uploads/audios"
  "public/uploads/thumbnails"
  "public/uploads/avatars"
)

for dir in "${GITKEEP_DIRS[@]}"; do
  if [ -f "$dir/.gitkeep" ]; then
    echo "✅ $dir/.gitkeep"
  else
    echo "⚠️  $dir/.gitkeep not found (creating...)"
    touch "$dir/.gitkeep"
  fi
done

# Check if database files are excluded
echo
echo "💾 Checking database exclusion..."
if grep -q "\.db$" .gitignore; then
  echo "✅ Database files excluded from git"
else
  echo "⚠️  Warning: Database files might be tracked by git"
fi

# Check if node_modules is excluded
echo
echo "📦 Checking node_modules exclusion..."
if grep -q "node_modules" .gitignore; then
  echo "✅ node_modules excluded from git"
else
  echo "❌ node_modules not excluded from git"
fi

# Check if uploads are excluded
echo
echo "📤 Checking uploads exclusion..."
if grep -q "public/uploads/\*" .gitignore || grep -q "public/uploads/videos/\*" .gitignore; then
  echo "✅ Upload files excluded from git"
else
  echo "⚠️  Warning: Upload files might be tracked by git"
fi

# Summary
echo
echo "========================================"
echo "✅ Pre-deployment check complete!"
echo
echo "📋 Next steps:"
echo "1. Review warnings above (if any)"
echo "2. Commit changes: git add . && git commit -m 'Ready for deployment'"
echo "3. Push to GitHub: git push origin main"
echo "4. Deploy to VPS using install.sh"
echo
echo "🚀 Ready to deploy!"
