#!/bin/bash

# StreamFlow Startup Script
# This script ensures all prerequisites are met before starting

set -e

echo "🚀 Starting StreamFlow..."

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found"
  if [ -f ".env.example" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created"
    echo "⚠️  Please run: node generate-secret.js"
    exit 1
  else
    echo "❌ .env.example not found"
    exit 1
  fi
fi

# Check SESSION_SECRET
if grep -q "PLEASE_RUN_GENERATE_SECRET" .env || grep -q "your_random_secret_here" .env; then
  echo "⚠️  SESSION_SECRET not configured"
  echo "Running generate-secret.js..."
  node generate-secret.js
fi

# Create required directories
echo "📁 Ensuring directories exist..."
mkdir -p db logs public/uploads/{videos,audios,thumbnails,avatars}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run health check
echo "🔍 Running health check..."
node health-check.js

# Start application
if command -v pm2 &> /dev/null; then
  echo "▶️ Starting with PM2..."
  pm2 start ecosystem.config.js
  pm2 save
else
  echo "▶️ Starting with Node.js..."
  node app.js
fi
