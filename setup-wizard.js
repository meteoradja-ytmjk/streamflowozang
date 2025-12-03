#!/usr/bin/env node

/**
 * StreamFlow Setup Wizard
 * Interactive setup untuk first-time installation
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function c(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printBanner() {
  console.clear();
  console.log(c('╔════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(c('║              StreamFlow Setup Wizard                  ║', 'cyan'));
  console.log(c('║           First-Time Installation Helper              ║', 'cyan'));
  console.log(c('╚════════════════════════════════════════════════════════╝', 'cyan'));
  console.log('');
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(c(question, 'yellow'), (answer) => {
      resolve(answer.trim());
    });
  });
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkPrerequisites() {
  console.log(c('\n📋 Step 1: Checking Prerequisites\n', 'bright'));
  
  const checks = [
    { name: 'Node.js', command: 'node --version', required: true },
    { name: 'npm', command: 'npm --version', required: true },
    { name: 'FFmpeg', command: 'ffmpeg -version', required: true },
    { name: 'Git', command: 'git --version', required: false },
    { name: 'PM2', command: 'pm2 --version', required: false }
  ];
  
  let allGood = true;
  
  for (const check of checks) {
    process.stdout.write(`  Checking ${check.name}... `);
    const result = exec(check.command, true);
    
    if (result.success) {
      console.log(c('✅ Installed', 'green'));
    } else {
      if (check.required) {
        console.log(c('❌ Missing (Required!)', 'red'));
        allGood = false;
      } else {
        console.log(c('⚠️  Not installed (Optional)', 'yellow'));
      }
    }
  }
  
  if (!allGood) {
    console.log(c('\n❌ Missing required dependencies!', 'red'));
    console.log(c('\nPlease install:', 'yellow'));
    console.log('  - Node.js: https://nodejs.org/');
    console.log('  - FFmpeg: sudo apt install ffmpeg');
    return false;
  }
  
  console.log(c('\n✅ All prerequisites met!', 'green'));
  return true;
}

async function installDependencies() {
  console.log(c('\n📦 Step 2: Installing Dependencies\n', 'bright'));
  
  const answer = await ask('Install npm dependencies? (Y/n): ');
  
  if (answer.toLowerCase() !== 'n') {
    console.log(c('\n📥 Installing...', 'cyan'));
    const result = exec('npm install');
    
    if (result.success) {
      console.log(c('\n✅ Dependencies installed!', 'green'));
      return true;
    } else {
      console.log(c('\n❌ Installation failed!', 'red'));
      return false;
    }
  }
  
  return true;
}

async function setupEnvironment() {
  console.log(c('\n⚙️  Step 3: Environment Configuration\n', 'bright'));
  
  if (!fs.existsSync('.env')) {
    console.log(c('Creating .env file...', 'cyan'));
    
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log(c('✅ .env created from .env.example', 'green'));
    } else {
      console.log(c('⚠️  .env.example not found', 'yellow'));
    }
  } else {
    console.log(c('✅ .env already exists', 'green'));
  }
  
  // Generate SESSION_SECRET if needed
  console.log(c('\nGenerating SESSION_SECRET...', 'cyan'));
  const result = exec('node generate-secret.js', true);
  
  if (result.success) {
    console.log(c('✅ SESSION_SECRET generated', 'green'));
  }
  
  return true;
}

async function checkDatabase() {
  console.log(c('\n💾 Step 4: Database Check\n', 'bright'));
  
  console.log(c('Checking database...', 'cyan'));
  const result = exec('node check-db.js', true);
  
  if (result.success) {
    console.log(c('✅ Database ready', 'green'));
  } else {
    console.log(c('⚠️  Database needs initialization', 'yellow'));
  }
  
  return true;
}

async function setupPM2() {
  console.log(c('\n🔧 Step 5: PM2 Setup (Optional)\n', 'bright'));
  
  const hasPM2 = exec('pm2 --version', true).success;
  
  if (!hasPM2) {
    const answer = await ask('Install PM2 globally? (Y/n): ');
    
    if (answer.toLowerCase() !== 'n') {
      console.log(c('\n📥 Installing PM2...', 'cyan'));
      const result = exec('npm install -g pm2');
      
      if (result.success) {
        console.log(c('✅ PM2 installed!', 'green'));
      } else {
        console.log(c('❌ PM2 installation failed', 'red'));
        console.log(c('You can install it later with: npm install -g pm2', 'yellow'));
      }
    }
  } else {
    console.log(c('✅ PM2 already installed', 'green'));
  }
  
  return true;
}

async function startApplication() {
  console.log(c('\n🚀 Step 6: Start Application\n', 'bright'));
  
  const answer = await ask('Start application now? (Y/n): ');
  
  if (answer.toLowerCase() !== 'n') {
    const hasPM2 = exec('pm2 --version', true).success;
    
    if (hasPM2) {
      console.log(c('\n🚀 Starting with PM2...', 'cyan'));
      const result = exec('pm2 start ecosystem.config.js');
      
      if (result.success) {
        console.log(c('\n✅ Application started!', 'green'));
        console.log(c('\nUseful PM2 commands:', 'yellow'));
        console.log('  pm2 list          - List all processes');
        console.log('  pm2 logs          - View logs');
        console.log('  pm2 restart all   - Restart application');
        console.log('  pm2 stop all      - Stop application');
        return true;
      }
    } else {
      console.log(c('\n🚀 Starting with npm...', 'cyan'));
      console.log(c('\nRun: npm start', 'yellow'));
      console.log(c('Or: node app.js', 'yellow'));
    }
  }
  
  return true;
}

async function showNextSteps() {
  console.log(c('\n\n╔════════════════════════════════════════════════════════╗', 'green'));
  console.log(c('║                  Setup Complete! 🎉                    ║', 'green'));
  console.log(c('╚════════════════════════════════════════════════════════╝', 'green'));
  
  console.log(c('\n📝 Next Steps:\n', 'bright'));
  
  console.log(c('1. Access Application:', 'yellow'));
  console.log('   Open browser: http://localhost:7575');
  console.log('');
  
  console.log(c('2. Create Admin Account:', 'yellow'));
  console.log('   You will be redirected to /setup-account');
  console.log('   Create your first admin user');
  console.log('');
  
  console.log(c('3. Password Requirements:', 'yellow'));
  console.log('   - Minimum 8 characters');
  console.log('   - At least one lowercase letter');
  console.log('   - At least one uppercase letter');
  console.log('   - At least one number');
  console.log('   Example: Admin123456');
  console.log('');
  
  console.log(c('4. Useful Commands:', 'yellow'));
  console.log('   node streamflow-cli.js    - Interactive CLI');
  console.log('   node quick-reset-admin.js - Reset admin password');
  console.log('   node health-check.js      - System health check');
  console.log('');
  
  console.log(c('5. Documentation:', 'yellow'));
  console.log('   DOCS_INDEX.md            - All documentation');
  console.log('   ADMIN_GUIDE.md           - Admin management');
  console.log('   TROUBLESHOOTING.md       - Problem solving');
  console.log('');
  
  console.log(c('📚 Need Help?', 'cyan'));
  console.log('   Read: QUICK_START.md');
  console.log('   Or: ADMIN_GUIDE.md');
  console.log('');
  
  console.log(c('🎯 Happy Streaming! 🚀\n', 'green'));
}

async function main() {
  printBanner();
  
  console.log(c('Welcome to StreamFlow Setup Wizard!', 'bright'));
  console.log(c('This wizard will help you set up StreamFlow for the first time.\n', 'cyan'));
  
  const answer = await ask('Continue with setup? (Y/n): ');
  
  if (answer.toLowerCase() === 'n') {
    console.log(c('\n👋 Setup cancelled.\n', 'yellow'));
    rl.close();
    return;
  }
  
  // Run setup steps
  const steps = [
    checkPrerequisites,
    installDependencies,
    setupEnvironment,
    checkDatabase,
    setupPM2,
    startApplication
  ];
  
  for (const step of steps) {
    const success = await step();
    if (!success && step === checkPrerequisites) {
      console.log(c('\n❌ Setup cannot continue without required dependencies.\n', 'red'));
      rl.close();
      return;
    }
  }
  
  await showNextSteps();
  
  rl.close();
}

// Start wizard
main().catch((error) => {
  console.error(c('\n❌ Error:', 'red'), error.message);
  rl.close();
  process.exit(1);
});
