#!/bin/bash

# StreamFlow VPS Deployment Script
# VPS IP: 103.31.204.105

echo "=========================================="
echo "  StreamFlow - VPS Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_IP="103.31.204.105"
VPS_USER="root"
VPS_PATH="/var/www/streamflow"
LOCAL_PATH="."

echo -e "${YELLOW}VPS IP:${NC} $VPS_IP"
echo -e "${YELLOW}VPS User:${NC} $VPS_USER"
echo -e "${YELLOW}VPS Path:${NC} $VPS_PATH"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check SSH connection
echo -e "${YELLOW}[1/8]${NC} Checking SSH connection..."
if ssh -o ConnectTimeout=5 $VPS_USER@$VPS_IP "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} SSH connection successful"
else
    echo -e "${RED}✗${NC} Cannot connect to VPS. Please check:"
    echo "  - VPS IP: $VPS_IP"
    echo "  - SSH access"
    echo "  - Firewall settings"
    exit 1
fi

# Create backup
echo ""
echo -e "${YELLOW}[2/8]${NC} Creating backup on VPS..."
ssh $VPS_USER@$VPS_IP "
    if [ -d $VPS_PATH ]; then
        cd $VPS_PATH
        if [ -f db/streamflow.db ]; then
            cp db/streamflow.db db/streamflow.db.backup-\$(date +%Y%m%d-%H%M%S)
            echo '✓ Database backup created'
        fi
    fi
"

# Create directory structure
echo ""
echo -e "${YELLOW}[3/8]${NC} Creating directory structure..."
ssh $VPS_USER@$VPS_IP "
    mkdir -p $VPS_PATH
    cd $VPS_PATH
    mkdir -p db logs public/uploads/videos public/uploads/audios public/uploads/avatars public/uploads/thumbnails
    echo '✓ Directories created'
"

# Upload files
echo ""
echo -e "${YELLOW}[4/8]${NC} Uploading files to VPS..."
echo "This may take a while depending on your connection..."

# Create temporary archive
echo "Creating archive..."
tar -czf /tmp/streamflow-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='db/*.db' \
    --exclude='logs/*' \
    --exclude='public/uploads/*' \
    .

# Upload archive
echo "Uploading archive..."
scp /tmp/streamflow-deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/

# Extract on VPS
echo "Extracting on VPS..."
ssh $VPS_USER@$VPS_IP "
    cd $VPS_PATH
    tar -xzf /tmp/streamflow-deploy.tar.gz
    rm /tmp/streamflow-deploy.tar.gz
    echo '✓ Files uploaded and extracted'
"

# Clean up local temp file
rm /tmp/streamflow-deploy.tar.gz

# Install dependencies
echo ""
echo -e "${YELLOW}[5/8]${NC} Installing dependencies..."
ssh $VPS_USER@$VPS_IP "
    cd $VPS_PATH
    npm install --production
    echo '✓ Dependencies installed'
"

# Setup environment
echo ""
echo -e "${YELLOW}[6/8]${NC} Setting up environment..."
ssh $VPS_USER@$VPS_IP "
    cd $VPS_PATH
    
    # Generate session secret if not exists
    if [ ! -f .env ]; then
        cp .env.example .env
        SESSION_SECRET=\$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")
        sed -i \"s/your-secret-key-here/\$SESSION_SECRET/g\" .env
        sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env
        echo '✓ Environment configured'
    else
        echo '✓ .env already exists'
    fi
    
    # Set permissions
    chmod -R 755 public/uploads
    chmod -R 755 db
    chmod -R 755 logs
    echo '✓ Permissions set'
"

# Setup admin
echo ""
echo -e "${YELLOW}[7/8]${NC} Setting up admin account..."
echo "Creating admin with default credentials (admin/Admin123)..."
ssh $VPS_USER@$VPS_IP "
    cd $VPS_PATH
    echo 'yes' | node reset-admin-default.js
    echo '✓ Admin account created'
"

# Start/Restart application
echo ""
echo -e "${YELLOW}[8/8]${NC} Starting application..."
ssh $VPS_USER@$VPS_IP "
    cd $VPS_PATH
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo 'Installing PM2...'
        npm install -g pm2
    fi
    
    # Stop if running
    pm2 stop streamflow 2>/dev/null || true
    
    # Start application
    pm2 start app.js --name streamflow
    pm2 save
    
    # Setup startup
    pm2 startup systemd -u $VPS_USER --hp /root 2>/dev/null || true
    
    echo '✓ Application started'
"

# Show status
echo ""
echo "=========================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Application URL:"
echo "  → http://$VPS_IP:7575"
echo ""
echo "Default Login:"
echo "  Username: admin"
echo "  Password: Admin123"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Change the default password after first login!${NC}"
echo ""
echo "Useful commands:"
echo "  Check status:  ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo "  View logs:     ssh $VPS_USER@$VPS_IP 'pm2 logs streamflow'"
echo "  Restart:       ssh $VPS_USER@$VPS_IP 'pm2 restart streamflow'"
echo ""
echo "For detailed guide, read: VPS_DEPLOYMENT_GUIDE.md"
echo ""
