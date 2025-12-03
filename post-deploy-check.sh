#!/bin/bash

# Post-deployment Check Script
# Run this after deployment to verify everything is working

echo "🔍 Post-Deployment Check for StreamFlow"
echo "========================================="
echo

# Check if running on VPS
if [ -f "/etc/os-release" ]; then
  . /etc/os-release
  echo "📊 System: $PRETTY_NAME"
else
  echo "📊 System: Unknown"
fi

# Check Node.js
echo
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "✅ Node.js $NODE_VERSION installed"
  
  MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
  if [ "$MAJOR_VERSION" -ge 18 ]; then
    echo "✅ Node.js version is compatible"
  else
    echo "⚠️  Node.js version might be too old (minimum: v18)"
  fi
else
  echo "❌ Node.js not found"
fi

# Check FFmpeg
echo
echo "🎬 Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
  FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n1 | cut -d' ' -f3)
  echo "✅ FFmpeg $FFMPEG_VERSION installed"
else
  echo "❌ FFmpeg not found"
fi

# Check PM2
echo
echo "🚀 Checking PM2..."
if command -v pm2 &> /dev/null; then
  PM2_VERSION=$(pm2 -v)
  echo "✅ PM2 $PM2_VERSION installed"
  
  # Check if streamflow is running
  if pm2 list | grep -q "streamflow"; then
    echo "✅ StreamFlow is running in PM2"
    pm2 list | grep streamflow
  else
    echo "⚠️  StreamFlow not found in PM2"
  fi
else
  echo "⚠️  PM2 not installed"
fi

# Check .env file
echo
echo "🔐 Checking environment configuration..."
if [ -f ".env" ]; then
  echo "✅ .env file exists"
  
  if grep -q "PLEASE_RUN_GENERATE_SECRET" .env; then
    echo "❌ SESSION_SECRET not configured!"
    echo "   Run: node generate-secret.js"
  else
    echo "✅ SESSION_SECRET is configured"
  fi
else
  echo "❌ .env file not found"
fi

# Check directories
echo
echo "📁 Checking directories..."
REQUIRED_DIRS=(
  "db"
  "logs"
  "public/uploads/videos"
  "public/uploads/audios"
  "public/uploads/thumbnails"
  "public/uploads/avatars"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/"
  else
    echo "❌ $dir/ not found"
  fi
done

# Check database
echo
echo "💾 Checking database..."
if [ -f "db/streamflow.db" ]; then
  DB_SIZE=$(du -h db/streamflow.db | cut -f1)
  echo "✅ Database exists ($DB_SIZE)"
else
  echo "⚠️  Database not found (will be created on first run)"
fi

# Check port
echo
echo "🔌 Checking port..."
PORT=${PORT:-7575}
if command -v netstat &> /dev/null; then
  if netstat -tuln | grep -q ":$PORT "; then
    echo "✅ Port $PORT is in use (application running)"
  else
    echo "⚠️  Port $PORT is not in use"
  fi
else
  echo "⚠️  netstat not available, cannot check port"
fi

# Check firewall
echo
echo "🔥 Checking firewall..."
if command -v ufw &> /dev/null; then
  if sudo ufw status | grep -q "Status: active"; then
    echo "✅ UFW firewall is active"
    
    if sudo ufw status | grep -q "$PORT"; then
      echo "✅ Port $PORT is allowed in firewall"
    else
      echo "⚠️  Port $PORT not found in firewall rules"
      echo "   Run: sudo ufw allow $PORT"
    fi
  else
    echo "⚠️  UFW firewall is not active"
  fi
else
  echo "⚠️  UFW not installed"
fi

# Check disk space
echo
echo "💿 Checking disk space..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
DISK_AVAIL=$(df -h . | tail -1 | awk '{print $4}')
echo "📊 Disk usage: ${DISK_USAGE}% (${DISK_AVAIL} available)"

if [ "$DISK_USAGE" -gt 90 ]; then
  echo "⚠️  Warning: Disk usage is high!"
elif [ "$DISK_USAGE" -gt 80 ]; then
  echo "⚠️  Disk usage is getting high"
else
  echo "✅ Disk space is sufficient"
fi

# Check memory
echo
echo "🧠 Checking memory..."
if command -v free &> /dev/null; then
  TOTAL_MEM=$(free -h | grep Mem | awk '{print $2}')
  USED_MEM=$(free -h | grep Mem | awk '{print $3}')
  FREE_MEM=$(free -h | grep Mem | awk '{print $4}')
  echo "📊 Memory: $USED_MEM used / $TOTAL_MEM total ($FREE_MEM free)"
else
  echo "⚠️  Cannot check memory"
fi

# Test application
echo
echo "🌐 Testing application..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|302"; then
  echo "✅ Application is responding"
else
  echo "⚠️  Application is not responding on port $PORT"
fi

# Get server IP
echo
echo "🌍 Server information..."
if command -v curl &> /dev/null; then
  SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  echo "📍 Server IP: $SERVER_IP"
  echo "🔗 Access URL: http://$SERVER_IP:$PORT"
else
  echo "⚠️  Cannot determine server IP"
fi

# Summary
echo
echo "========================================="
echo "📊 Deployment Status Summary"
echo "========================================="
echo

# Count checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Simple status
if command -v node &> /dev/null && \
   command -v ffmpeg &> /dev/null && \
   [ -f ".env" ] && \
   ! grep -q "PLEASE_RUN_GENERATE_SECRET" .env 2>/dev/null && \
   [ -d "db" ] && \
   [ -d "logs" ]; then
  echo "✅ DEPLOYMENT SUCCESSFUL!"
  echo
  echo "🎉 StreamFlow is ready to use!"
  echo
  echo "📋 Next steps:"
  echo "1. Access: http://$SERVER_IP:$PORT"
  echo "2. Create admin account"
  echo "3. Upload videos and start streaming"
else
  echo "⚠️  DEPLOYMENT INCOMPLETE"
  echo
  echo "Please review the warnings above and fix any issues."
  echo
  echo "Common fixes:"
  echo "- Run: node generate-secret.js"
  echo "- Run: pm2 start ecosystem.config.js"
  echo "- Run: sudo ufw allow $PORT"
fi

echo
echo "========================================="
