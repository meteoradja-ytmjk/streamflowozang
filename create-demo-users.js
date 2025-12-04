require('dotenv').config();
const User = require('./models/User');
const { db } = require('./db/database');

async function createDemoUsers() {
  try {
    console.log('🚀 Creating demo users...\n');

    // Check if users already exist
    const existingUsers = await User.findAll();
    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  Users already exist in database.');
      console.log('   Run reset-database-fresh.js first if you want to start fresh.\n');
      
      console.log('📋 Existing users:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.user_role}) - Max Streams: ${user.max_streams === -1 ? 'Unlimited' : user.max_streams}`);
      });
      
      process.exit(0);
    }

    // Create Admin User
    console.log('👤 Creating Admin User...');
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      avatar_path: null,
      user_role: 'admin',
      status: 'active',
      max_streams: -1 // Unlimited streams for admin
    });
    console.log('✅ Admin created successfully');
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);
    console.log(`   Max Streams: Unlimited\n`);

    // Create Regular User
    console.log('👤 Creating Regular User...');
    const user = await User.create({
      username: 'user',
      password: 'user123',
      avatar_path: null,
      user_role: 'user',
      status: 'active',
      max_streams: 2 // Limited to 2 concurrent streams
    });
    console.log('✅ User created successfully');
    console.log(`   Username: user`);
    console.log(`   Password: user123`);
    console.log(`   Role: user`);
    console.log(`   Max Streams: 2\n`);

    console.log('🎉 Demo users created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   ┌─────────────────────────────────────┐');
    console.log('   │ ADMIN ACCOUNT                       │');
    console.log('   ├─────────────────────────────────────┤');
    console.log('   │ Username: admin                     │');
    console.log('   │ Password: admin123                  │');
    console.log('   │ Max Streams: Unlimited              │');
    console.log('   └─────────────────────────────────────┘');
    console.log('');
    console.log('   ┌─────────────────────────────────────┐');
    console.log('   │ USER ACCOUNT                        │');
    console.log('   ├─────────────────────────────────────┤');
    console.log('   │ Username: user                      │');
    console.log('   │ Password: user123                   │');
    console.log('   │ Max Streams: 2                      │');
    console.log('   └─────────────────────────────────────┘');
    console.log('');
    console.log('💡 Admin can:');
    console.log('   - Create unlimited streams');
    console.log('   - Manage all users');
    console.log('   - Set stream limits for each user');
    console.log('   - Delete users');
    console.log('');
    console.log('💡 Regular user can:');
    console.log('   - Create up to 2 concurrent streams');
    console.log('   - Manage their own content');
    console.log('');
    console.log('🌐 Access the application at: http://localhost:7575');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
