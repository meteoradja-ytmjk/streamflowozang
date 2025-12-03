#!/usr/bin/env node

/**
 * StreamFlow CLI - Interactive Command Line Interface
 * Memudahkan pengelolaan aplikasi StreamFlow
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.clear();
  console.log(colorize('╔════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║           StreamFlow CLI - Management Tool            ║', 'cyan'));
  console.log(colorize('║                    Version 2.3.0                      ║', 'cyan'));
  console.log(colorize('╚════════════════════════════════════════════════════════╝', 'cyan'));
  console.log('');
}

function printMenu() {
  console.log(colorize('📋 Main Menu:', 'bright'));
  console.log('');
  console.log(colorize('  Admin Management:', 'yellow'));
  console.log('  1. Reset Admin Password');
  console.log('  2. Reset Database (Delete All Users)');
  console.log('  3. Activate All Users');
  console.log('  4. Create New Admin');
  console.log('');
  console.log(colorize('  Diagnostics:', 'yellow'));
  console.log('  5. Check Database Status');
  console.log('  6. Fix Setup Account Issues');
  console.log('  7. Fix Signup Issues');
  console.log('  8. System Health Check');
  console.log('');
  console.log(colorize('  Application:', 'yellow'));
  console.log('  9. Start Application');
  console.log('  10. Stop Application');
  console.log('  11. Restart Application');
  console.log('  12. View Logs');
  console.log('');
  console.log(colorize('  Git & GitHub:', 'yellow'));
  console.log('  13. Push to GitHub');
  console.log('  14. Pull from GitHub');
  console.log('  15. View Git Status');
  console.log('');
  console.log(colorize('  Documentation:', 'yellow'));
  console.log('  16. View Documentation Index');
  console.log('  17. Open Admin Guide');
  console.log('  18. Open Troubleshooting Guide');
  console.log('');
  console.log('  0. Exit');
  console.log('');
}

function executeCommand(command, description) {
  try {
    console.log(colorize(`\n🔄 ${description}...`, 'cyan'));
    const output = execSync(command, { encoding: 'utf-8', stdio: 'inherit' });
    console.log(colorize('\n✅ Success!', 'green'));
    return true;
  } catch (error) {
    console.log(colorize('\n❌ Error occurred!', 'red'));
    console.log(error.message);
    return false;
  }
}

function pause() {
  return new Promise((resolve) => {
    rl.question(colorize('\nPress Enter to continue...', 'yellow'), () => {
      resolve();
    });
  });
}

async function handleChoice(choice) {
  printHeader();
  
  switch(choice) {
    case '1':
      console.log(colorize('🔐 Reset Admin Password\n', 'bright'));
      executeCommand('node quick-reset-admin.js', 'Resetting admin password');
      await pause();
      break;
      
    case '2':
      console.log(colorize('🗑️  Reset Database (Delete All Users)\n', 'bright'));
      console.log(colorize('⚠️  WARNING: This will delete ALL users!', 'red'));
      const confirm = await new Promise((resolve) => {
        rl.question(colorize('\nType "YES" to confirm: ', 'yellow'), (answer) => {
          resolve(answer);
        });
      });
      
      if (confirm === 'YES') {
        executeCommand('node reset-database-fresh.js', 'Resetting database');
      } else {
        console.log(colorize('\n❌ Cancelled', 'yellow'));
      }
      await pause();
      break;
      
    case '3':
      console.log(colorize('✅ Activate All Users\n', 'bright'));
      executeCommand('node activate-all-users.js', 'Activating all users');
      await pause();
      break;
      
    case '4':
      console.log(colorize('👤 Create New Admin\n', 'bright'));
      executeCommand('node create-admin.js', 'Creating new admin');
      await pause();
      break;
      
    case '5':
      console.log(colorize('💾 Check Database Status\n', 'bright'));
      executeCommand('node check-db.js', 'Checking database');
      await pause();
      break;
      
    case '6':
      console.log(colorize('🔧 Fix Setup Account Issues\n', 'bright'));
      executeCommand('node fix-setup-account.js', 'Diagnosing setup account');
      await pause();
      break;
      
    case '7':
      console.log(colorize('🔧 Fix Signup Issues\n', 'bright'));
      executeCommand('node fix-signup.js', 'Fixing signup issues');
      await pause();
      break;
      
    case '8':
      console.log(colorize('🏥 System Health Check\n', 'bright'));
      executeCommand('node health-check.js', 'Running health check');
      await pause();
      break;
      
    case '9':
      console.log(colorize('🚀 Start Application\n', 'bright'));
      executeCommand('pm2 start ecosystem.config.js', 'Starting application');
      await pause();
      break;
      
    case '10':
      console.log(colorize('🛑 Stop Application\n', 'bright'));
      executeCommand('pm2 stop streamflow', 'Stopping application');
      await pause();
      break;
      
    case '11':
      console.log(colorize('🔄 Restart Application\n', 'bright'));
      executeCommand('pm2 restart streamflow', 'Restarting application');
      await pause();
      break;
      
    case '12':
      console.log(colorize('📋 View Logs\n', 'bright'));
      executeCommand('pm2 logs streamflow --lines 50', 'Fetching logs');
      await pause();
      break;
      
    case '13':
      console.log(colorize('📤 Push to GitHub\n', 'bright'));
      const message = await new Promise((resolve) => {
        rl.question(colorize('Commit message (or Enter for default): ', 'yellow'), (answer) => {
          resolve(answer || `Update: ${new Date().toISOString()}`);
        });
      });
      
      executeCommand('git add -A', 'Adding files');
      executeCommand(`git commit -m "${message}"`, 'Committing changes');
      executeCommand('git push origin main', 'Pushing to GitHub');
      await pause();
      break;
      
    case '14':
      console.log(colorize('📥 Pull from GitHub\n', 'bright'));
      executeCommand('git pull origin main', 'Pulling from GitHub');
      await pause();
      break;
      
    case '15':
      console.log(colorize('📊 Git Status\n', 'bright'));
      executeCommand('git status', 'Checking git status');
      await pause();
      break;
      
    case '16':
      console.log(colorize('📚 Documentation Index\n', 'bright'));
      if (fs.existsSync('DOCS_INDEX.md')) {
        const content = fs.readFileSync('DOCS_INDEX.md', 'utf-8');
        console.log(content.substring(0, 1000) + '...\n');
        console.log(colorize('See DOCS_INDEX.md for complete index', 'cyan'));
      } else {
        console.log(colorize('DOCS_INDEX.md not found', 'red'));
      }
      await pause();
      break;
      
    case '17':
      console.log(colorize('📖 Admin Guide\n', 'bright'));
      if (fs.existsSync('ADMIN_GUIDE.md')) {
        console.log(colorize('Opening ADMIN_GUIDE.md...', 'cyan'));
        console.log(colorize('File location: ./ADMIN_GUIDE.md', 'yellow'));
      } else {
        console.log(colorize('ADMIN_GUIDE.md not found', 'red'));
      }
      await pause();
      break;
      
    case '18':
      console.log(colorize('🔧 Troubleshooting Guide\n', 'bright'));
      if (fs.existsSync('TROUBLESHOOTING.md')) {
        console.log(colorize('Opening TROUBLESHOOTING.md...', 'cyan'));
        console.log(colorize('File location: ./TROUBLESHOOTING.md', 'yellow'));
      } else {
        console.log(colorize('TROUBLESHOOTING.md not found', 'red'));
      }
      await pause();
      break;
      
    case '0':
      console.log(colorize('\n👋 Goodbye!\n', 'green'));
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log(colorize('\n❌ Invalid choice!', 'red'));
      await pause();
  }
}

async function main() {
  while (true) {
    printHeader();
    printMenu();
    
    const choice = await new Promise((resolve) => {
      rl.question(colorize('Select option (0-18): ', 'bright'), (answer) => {
        resolve(answer.trim());
      });
    });
    
    await handleChoice(choice);
  }
}

// Start CLI
console.log(colorize('\n🚀 Starting StreamFlow CLI...\n', 'cyan'));
setTimeout(() => {
  main().catch((error) => {
    console.error(colorize('\n❌ Error:', 'red'), error.message);
    rl.close();
    process.exit(1);
  });
}, 500);
