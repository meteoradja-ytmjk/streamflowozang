require('dotenv').config();
const readline = require('readline');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetUserPassword() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║          StreamFlow - Admin Reset User Password                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');

    // List all users
    const users = await User.findAll();
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in database.');
      rl.close();
      process.exit(1);
    }

    console.log('📋 Available Users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.user_role}) - Status: ${user.status}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Ask for username
    const username = await question('Enter username to reset password: ');
    
    if (!username || username.trim() === '') {
      console.log('❌ Username cannot be empty.');
      rl.close();
      process.exit(1);
    }

    // Find user
    const user = await User.findByUsername(username.trim());
    
    if (!user) {
      console.log(`❌ User "${username}" not found.`);
      rl.close();
      process.exit(1);
    }

    console.log('');
    console.log('✅ User found:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.user_role}`);
    console.log(`   Status: ${user.status}`);
    console.log('');

    // Ask for new password
    const newPassword = await question('Enter new password (min 6 characters): ');
    
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long.');
      rl.close();
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question('Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match.');
      rl.close();
      process.exit(1);
    }

    // Confirm action
    console.log('');
    const confirm = await question(`⚠️  Are you sure you want to reset password for "${user.username}"? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Password reset cancelled.');
      rl.close();
      process.exit(0);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update(user.id, { password: hashedPassword });

    console.log('');
    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('📋 New Credentials:');
    console.log('   ┌─────────────────────────────────────┐');
    console.log(`   │ Username: ${user.username.padEnd(25)} │`);
    console.log(`   │ Password: ${newPassword.padEnd(25)} │`);
    console.log('   └─────────────────────────────────────┘');
    console.log('');
    console.log('💡 User can now login with the new password.');
    console.log('');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    rl.close();
    process.exit(1);
  }
}

resetUserPassword();
