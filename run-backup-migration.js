#!/usr/bin/env node

/**
 * Run backup tables migration
 * Usage: node run-backup-migration.js
 */

const { runMigration } = require('./db/migrations/add_backup_tables');

console.log('🚀 Starting backup tables migration...\n');

runMigration()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nBackup & Recovery features are now available:');
    console.log('  - Auto backup before stream updates');
    console.log('  - Manual backup creation');
    console.log('  - Restore from backup');
    console.log('  - Export/Import configurations');
    console.log('  - Soft delete (Trash)');
    console.log('  - Restore deleted streams');
    console.log('\nAccess trash at: http://localhost:3000/trash');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
