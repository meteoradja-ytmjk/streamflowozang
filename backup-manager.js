#!/usr/bin/env node

/**
 * Backup Manager
 * Automated backup and restore system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, 'backups');
const DB_PATH = path.join(__dirname, 'db', 'streamflow.db');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '-');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createBackup() {
  console.log('🔄 Creating backup...\n');
  
  const timestamp = getTimestamp();
  const backupName = `backup_${timestamp}`;
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  // Create backup directory
  fs.mkdirSync(backupPath, { recursive: true });
  
  let totalSize = 0;
  
  // Backup database
  if (fs.existsSync(DB_PATH)) {
    console.log('📦 Backing up database...');
    const dbBackupPath = path.join(backupPath, 'streamflow.db');
    fs.copyFileSync(DB_PATH, dbBackupPath);
    const dbSize = fs.statSync(dbBackupPath).size;
    totalSize += dbSize;
    console.log(`   ✅ Database backed up (${formatBytes(dbSize)})`);
  } else {
    console.log('   ⚠️  Database not found');
  }
  
  // Backup .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('📦 Backing up .env...');
    const envBackupPath = path.join(backupPath, '.env');
    fs.copyFileSync(envPath, envBackupPath);
    const envSize = fs.statSync(envBackupPath).size;
    totalSize += envSize;
    console.log(`   ✅ .env backed up (${formatBytes(envSize)})`);
  }
  
  // Backup uploads (optional - can be large)
  if (fs.existsSync(UPLOADS_DIR)) {
    console.log('📦 Backing up uploads...');
    const uploadsBackupPath = path.join(backupPath, 'uploads');
    
    try {
      // Use system copy command for better performance
      if (process.platform === 'win32') {
        execSync(`xcopy "${UPLOADS_DIR}" "${uploadsBackupPath}" /E /I /Q`, { stdio: 'pipe' });
      } else {
        execSync(`cp -r "${UPLOADS_DIR}" "${uploadsBackupPath}"`, { stdio: 'pipe' });
      }
      
      // Calculate uploads size
      const getDirectorySize = (dir) => {
        let size = 0;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            size += getDirectorySize(filePath);
          } else {
            size += stats.size;
          }
        }
        return size;
      };
      
      const uploadsSize = getDirectorySize(uploadsBackupPath);
      totalSize += uploadsSize;
      console.log(`   ✅ Uploads backed up (${formatBytes(uploadsSize)})`);
    } catch (error) {
      console.log(`   ⚠️  Uploads backup failed: ${error.message}`);
    }
  }
  
  // Create backup info file
  const backupInfo = {
    timestamp: new Date().toISOString(),
    name: backupName,
    size: totalSize,
    files: {
      database: fs.existsSync(path.join(backupPath, 'streamflow.db')),
      env: fs.existsSync(path.join(backupPath, '.env')),
      uploads: fs.existsSync(path.join(backupPath, 'uploads'))
    }
  };
  
  fs.writeFileSync(
    path.join(backupPath, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Backup created successfully!');
  console.log('='.repeat(60));
  console.log(`📁 Location: ${backupPath}`);
  console.log(`📊 Total size: ${formatBytes(totalSize)}`);
  console.log(`🕐 Timestamp: ${timestamp}`);
  console.log('='.repeat(60) + '\n');
  
  return backupPath;
}

function listBackups() {
  console.log('📋 Available Backups:\n');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('   No backups found.\n');
    return [];
  }
  
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(name => name.startsWith('backup_'))
    .sort()
    .reverse();
  
  if (backups.length === 0) {
    console.log('   No backups found.\n');
    return [];
  }
  
  backups.forEach((backup, index) => {
    const backupPath = path.join(BACKUP_DIR, backup);
    const infoPath = path.join(backupPath, 'backup-info.json');
    
    console.log(`${index + 1}. ${backup}`);
    
    if (fs.existsSync(infoPath)) {
      const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      console.log(`   📅 Date: ${new Date(info.timestamp).toLocaleString()}`);
      console.log(`   📊 Size: ${formatBytes(info.size)}`);
      console.log(`   📦 Files: DB=${info.files.database ? '✅' : '❌'}, ENV=${info.files.env ? '✅' : '❌'}, Uploads=${info.files.uploads ? '✅' : '❌'}`);
    }
    console.log('');
  });
  
  return backups;
}

function restoreBackup(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  if (!fs.existsSync(backupPath)) {
    console.log('❌ Backup not found!\n');
    return false;
  }
  
  console.log(`🔄 Restoring backup: ${backupName}\n`);
  
  // Restore database
  const dbBackupPath = path.join(backupPath, 'streamflow.db');
  if (fs.existsSync(dbBackupPath)) {
    console.log('📦 Restoring database...');
    
    // Backup current database first
    if (fs.existsSync(DB_PATH)) {
      const currentBackup = DB_PATH + '.before-restore';
      fs.copyFileSync(DB_PATH, currentBackup);
      console.log(`   💾 Current database backed up to: ${currentBackup}`);
    }
    
    fs.copyFileSync(dbBackupPath, DB_PATH);
    console.log('   ✅ Database restored');
  }
  
  // Restore .env
  const envBackupPath = path.join(backupPath, '.env');
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envBackupPath)) {
    console.log('📦 Restoring .env...');
    
    // Backup current .env first
    if (fs.existsSync(envPath)) {
      const currentBackup = envPath + '.before-restore';
      fs.copyFileSync(envPath, currentBackup);
      console.log(`   💾 Current .env backed up to: ${currentBackup}`);
    }
    
    fs.copyFileSync(envBackupPath, envPath);
    console.log('   ✅ .env restored');
  }
  
  // Restore uploads
  const uploadsBackupPath = path.join(backupPath, 'uploads');
  if (fs.existsSync(uploadsBackupPath)) {
    console.log('📦 Restoring uploads...');
    
    try {
      // Backup current uploads first
      if (fs.existsSync(UPLOADS_DIR)) {
        const currentBackup = UPLOADS_DIR + '.before-restore';
        if (process.platform === 'win32') {
          execSync(`xcopy "${UPLOADS_DIR}" "${currentBackup}" /E /I /Q`, { stdio: 'pipe' });
        } else {
          execSync(`cp -r "${UPLOADS_DIR}" "${currentBackup}"`, { stdio: 'pipe' });
        }
        console.log(`   💾 Current uploads backed up to: ${currentBackup}`);
      }
      
      // Restore uploads
      if (process.platform === 'win32') {
        execSync(`xcopy "${uploadsBackupPath}" "${UPLOADS_DIR}" /E /I /Q /Y`, { stdio: 'pipe' });
      } else {
        execSync(`cp -r "${uploadsBackupPath}"/* "${UPLOADS_DIR}"/`, { stdio: 'pipe' });
      }
      
      console.log('   ✅ Uploads restored');
    } catch (error) {
      console.log(`   ⚠️  Uploads restore failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Restore completed!');
  console.log('='.repeat(60));
  console.log('⚠️  Please restart the application:');
  console.log('   pm2 restart streamflow');
  console.log('   or: npm start');
  console.log('='.repeat(60) + '\n');
  
  return true;
}

function deleteBackup(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  if (!fs.existsSync(backupPath)) {
    console.log('❌ Backup not found!\n');
    return false;
  }
  
  console.log(`🗑️  Deleting backup: ${backupName}\n`);
  
  // Delete directory recursively
  fs.rmSync(backupPath, { recursive: true, force: true });
  
  console.log('✅ Backup deleted!\n');
  return true;
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

console.log('🔧 StreamFlow Backup Manager\n');
console.log('='.repeat(60) + '\n');

switch (command) {
  case 'create':
  case 'backup':
    createBackup();
    break;
    
  case 'list':
  case 'ls':
    listBackups();
    break;
    
  case 'restore':
    const backupToRestore = args[1];
    if (!backupToRestore) {
      console.log('❌ Please specify backup name\n');
      console.log('Usage: node backup-manager.js restore <backup-name>\n');
      const backups = listBackups();
      if (backups.length > 0) {
        console.log('Available backups listed above.\n');
      }
    } else {
      restoreBackup(backupToRestore);
    }
    break;
    
  case 'delete':
  case 'rm':
    const backupToDelete = args[1];
    if (!backupToDelete) {
      console.log('❌ Please specify backup name\n');
      console.log('Usage: node backup-manager.js delete <backup-name>\n');
      listBackups();
    } else {
      deleteBackup(backupToDelete);
    }
    break;
    
  default:
    console.log('Usage:');
    console.log('  node backup-manager.js create          - Create new backup');
    console.log('  node backup-manager.js list            - List all backups');
    console.log('  node backup-manager.js restore <name>  - Restore backup');
    console.log('  node backup-manager.js delete <name>   - Delete backup');
    console.log('');
    console.log('Examples:');
    console.log('  node backup-manager.js create');
    console.log('  node backup-manager.js list');
    console.log('  node backup-manager.js restore backup_2024-12-04_10-30-00');
    console.log('');
}
