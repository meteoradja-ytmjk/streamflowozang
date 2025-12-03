#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "   StreamFlow Quick Installer  "
echo "   Modified by Mas Ozang       "
echo "================================"
echo

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
  echo -e "${YELLOW}⚠️  Warning: Running as root is not recommended${NC}"
  read -p "Continue anyway? (y/n): " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && echo "Installation cancelled." && exit 1
fi

read -p "Start installation? (y/n): " -n 1 -r
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && echo "Installation cancelled." && exit 1

echo
echo "🔄 Updating system..."
sudo apt update && sudo apt upgrade -y

echo
echo "📦 Installing Node.js v22..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "Node.js $NODE_VERSION already installed"
  read -p "Reinstall Node.js? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo
echo "🎬 Installing FFmpeg and Git..."
sudo apt install ffmpeg git -y

echo
echo "📥 Cloning repository..."
REPO_URL="https://github.com/meteoradja-ytmjk/streamflowozang.git"
INSTALL_DIR="streamflow"

if [ -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}⚠️  Directory $INSTALL_DIR already exists${NC}"
  read -p "Remove and reinstall? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR"
  else
    echo "Using existing directory..."
  fi
else
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

echo
echo "⚙️ Installing dependencies..."
npm install

echo
echo "🔐 Generating secret key..."
if [ -f ".env" ]; then
  echo -e "${YELLOW}⚠️  .env file already exists${NC}"
  read -p "Generate new secret key? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    node generate-secret.js
  fi
else
  cp .env.example .env
  node generate-secret.js
fi

echo
echo "🔍 Running health check..."
node health-check.js
HEALTH_STATUS=$?

if [ $HEALTH_STATUS -ne 0 ]; then
  echo -e "${RED}❌ Health check failed${NC}"
  echo "Please fix the issues above before continuing"
  exit 1
fi

echo
echo "🕐 Setting timezone to Asia/Jakarta..."
sudo timedatectl set-timezone Asia/Jakarta

echo
echo "🔧 Configuring firewall..."
# Check if UFW is installed
if command -v ufw &> /dev/null; then
  echo "Configuring UFW firewall..."
  sudo ufw allow ssh
  sudo ufw allow 7575
  
  # Check if UFW is active
  if sudo ufw status | grep -q "Status: active"; then
    echo "UFW is already active"
  else
    read -p "Enable UFW firewall? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      sudo ufw --force enable
    fi
  fi
else
  echo -e "${YELLOW}⚠️  UFW not installed, skipping firewall configuration${NC}"
fi

echo
echo "🚀 Installing PM2..."
if command -v pm2 &> /dev/null; then
  echo "PM2 already installed"
else
  sudo npm install -g pm2
fi

echo
echo "▶️ Starting StreamFlow..."
# Stop existing instance if running
pm2 delete streamflow 2>/dev/null || true

# Start with ecosystem config
pm2 start ecosystem.config.js

# Setup PM2 startup
echo
echo "🔄 Setting up PM2 auto-start..."
pm2 startup | grep -E "^sudo" | bash || true
pm2 save

# Get server IP
echo
echo "🌐 Getting server IP address..."
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}' || echo "localhost")

echo
echo "================================"
echo -e "${GREEN}✅ INSTALLATION COMPLETE!${NC}"
echo "================================"
echo
echo "🌐 Access URL: http://$SERVER_IP:7575"
echo
echo "📋 Next steps:"
echo "1. Open the URL in your browser"
echo "2. Create admin username & password"
echo "3. Start uploading videos and streaming!"
echo
echo "📊 Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs streamflow - View application logs"
echo "  pm2 restart streamflow - Restart application"
echo "  pm2 stop streamflow - Stop application"
echo
echo "🔧 Configuration:"
echo "  Config file: .env"
echo "  Logs: ./logs/"
echo "  Database: ./db/streamflow.db"
echo
echo "================================"
echo -e "${GREEN}Happy Streaming! 🎬${NC}"
echo "================================"
