#!/usr/bin/env node

/**
 * Health Check Script for StreamFlow
 * Checks if all required dependencies and configurations are ready
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 StreamFlow Health Check\n');
console.log('='.repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check Node.js version
console.log('\n📦 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (OK)`);
} else {
  console.log(`❌ Node.js ${nodeVersion} (Minimum required: v18)`);
  hasErrors = true;
}

// Check if .env exists
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  
  // Check SESSION_SECRET
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('SESSION_SECRET=') && 
      !envContent.includes('PLEASE_RUN_GENERATE_SECRET') &&
      !envContent.includes('your_random_secret_here')) {
    console.log('✅ SESSION_SECRET is configured');
  } else {
    console.log('⚠️  SESSION_SECRET not configured properly');
    console.log('   Run: node generate-secret.js');
    hasWarnings = true;
  }
} else {
  console.log('⚠️  .env file not found');
  console.log('   Copying from .env.example...');
  try {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created');
    console.log('   ⚠️  Please run: node generate-secret.js');
    hasWarnings = true;
  } catch (err) {
    console.log('❌ Failed to create .env file');
    hasErrors = true;
  }
}

// Check FFmpeg
console.log('\n🎬 Checking FFmpeg...');
try {
  const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  const versionMatch = ffmpegVersion.match(/ffmpeg version (\S+)/);
  if (versionMatch) {
    console.log(`✅ FFmpeg ${versionMatch[1]} installed`);
  } else {
    console.log('✅ FFmpeg installed');
  }
} catch (err) {
  console.log('❌ FFmpeg not found');
  console.log('   Install: sudo apt install ffmpeg -y');
  hasErrors = true;
}

// Check required directories
console.log('\n📁 Checking directories...');
const requiredDirs = [
  'db',
  'logs',
  'public/uploads',
  'public/uploads/videos',
  'public/uploads/audios',
  'public/uploads/thumbnails',
  'public/uploads/avatars'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`⚠️  ${dir}/ not found, creating...`);
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ Created ${dir}/`);
    } catch (err) {
      console.log(`   ❌ Failed to create ${dir}/`);
      hasErrors = true;
    }
  }
});

// Check database
console.log('\n💾 Checking database...');
if (fs.existsSync('db/streamflow.db')) {
  console.log('✅ Database file exists');
} else {
  console.log('⚠️  Database will be created on first run');
  hasWarnings = true;
}

// Check node_modules
console.log('\n📚 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
  
  // Check critical packages
  const criticalPackages = [
    'express',
    'sqlite3',
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    'bcrypt',
    'dotenv'
  ];
  
  let missingPackages = [];
  criticalPackages.forEach(pkg => {
    if (!fs.existsSync(`node_modules/${pkg}`)) {
      missingPackages.push(pkg);
    }
  });
  
  if (missingPackages.length > 0) {
    console.log('⚠️  Missing packages:', missingPackages.join(', '));
    console.log('   Run: npm install');
    hasWarnings = true;
  } else {
    console.log('✅ All critical packages installed');
  }
} else {
  console.log('❌ node_modules not found');
  console.log('   Run: npm install');
  hasErrors = true;
}

// Check port availability
console.log('\n🔌 Checking port availability...');
const port = process.env.PORT || 7575;
try {
  const net = require('net');
  const server = net.createServer();
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use`);
      console.log('   Another instance might be running');
      hasWarnings = true;
    }
  });
  
  server.once('listening', () => {
    console.log(`✅ Port ${port} is available`);
    server.close();
  });
  
  server.listen(port);
} catch (err) {
  console.log(`⚠️  Could not check port ${port}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Health Check Summary:\n');

if (hasErrors) {
  console.log('❌ FAILED - Please fix the errors above before starting');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNINGS - Application may not work correctly');
  console.log('   Please address the warnings above');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED');
  console.log('\n🚀 Ready to start StreamFlow!');
  console.log('\nStart with:');
  console.log('  Development: npm run dev');
  console.log('  Production:  pm2 start ecosystem.config.js');
  process.exit(0);
}
