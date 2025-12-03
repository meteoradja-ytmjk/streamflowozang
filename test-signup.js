#!/usr/bin/env node

/**
 * Test Signup Functionality
 * Creates a test user to verify signup works
 */

const User = require('./models/User');

console.log('🧪 Test Signup Functionality\n');
console.log('='.repeat(50));

async function testSignup() {
  try {
    const testUsername = `testuser_${Date.now()}`;
    const testPassword = 'Test123456';

    console.log('\n1️⃣ Creating test user...\n');
    console.log(`   Username: ${testUsername}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: member`);
    console.log(`   Status: inactive`);

    const newUser = await User.create({
      username: testUsername,
      password: testPassword,
      avatar_path: null,
      user_role: 'member',
      status: 'inactive',
      max_streams: -1
    });

    console.log('\n✅ Test user created successfully!\n');
    console.log('   User ID:', newUser.id);
    console.log('   Username:', newUser.username);
    console.log('   Role:', newUser.user_role);
    console.log('   Status:', newUser.status);

    console.log('\n2️⃣ Verifying user in database...\n');

    const foundUser = await User.findByUsername(testUsername);
    if (foundUser) {
      console.log('✅ User found in database');
      console.log('   ID:', foundUser.id);
      console.log('   Username:', foundUser.username);
      console.log('   Role:', foundUser.user_role);
      console.log('   Status:', foundUser.status);
      console.log('   Max Streams:', foundUser.max_streams);
    } else {
      console.log('❌ User not found in database');
    }

    console.log('\n3️⃣ Cleaning up test user...\n');
    
    await User.delete(foundUser.id);
    console.log('✅ Test user deleted');

    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 Signup test PASSED!\n');
    console.log('✅ Signup functionality is working correctly');
    console.log('   You can now create accounts via /signup');
    console.log('\n' + '='.repeat(50));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Signup test FAILED!\n');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    console.log('\n💡 Try running: node fix-signup.js');
    process.exit(1);
  }
}

testSignup();
