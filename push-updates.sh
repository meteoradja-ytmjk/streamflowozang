#!/bin/bash

# Push Updates to GitHub Script
# For Linux/Mac

echo "🚀 Push Updates to GitHub"
echo "=========================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "   Install git first: sudo apt install git"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository!"
    echo "   Run: git init"
    exit 1
fi

# Show current status
echo "📋 Current Status:"
git status --short
echo ""

# Ask for commit message
read -p "💬 Enter commit message (or press Enter for default): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
echo "📦 Adding files..."
git add .

echo "💾 Committing changes..."
git commit -m "$commit_msg"

echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔗 Repository: https://github.com/meteoradja-ytmjk/streamflowozang"
else
    echo ""
    echo "❌ Push failed!"
    echo "   Check your internet connection and GitHub credentials"
    exit 1
fi
