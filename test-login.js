const axios = require('axios');

async function testLogin() {
  console.log('\n==============================================');
  console.log('   TESTING LOGIN');
  console.log('==============================================\n');
  
  const baseURL = 'http://localhost:7575';
  const username = 'admin';
  const password = 'admin123';
  
  try {
    // First, get the login page to get cookies
    console.log('1️⃣  Getting login page...');
    const loginPageResponse = await axios.get(`${baseURL}/login`, {
      maxRedirects: 0,
      validateStatus: (status) => status < 400
    });
    
    console.log(`   Status: ${loginPageResponse.status}`);
    
    // Extract cookies
    const cookies = loginPageResponse.headers['set-cookie'];
    let cookieHeader = '';
    if (cookies) {
      cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    }
    
    // Try to login
    console.log('\n2️⃣  Attempting login...');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    
    const loginResponse = await axios.post(
      `${baseURL}/login`,
      `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookieHeader
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );
    
    console.log(`   Response Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 302 || loginResponse.status === 301) {
      const redirectLocation = loginResponse.headers.location;
      console.log(`   Redirect to: ${redirectLocation}`);
      
      if (redirectLocation === '/dashboard' || redirectLocation.includes('dashboard')) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('\n==============================================');
        console.log('   LOGIN TEST PASSED');
        console.log('==============================================');
        console.log('You can now login with:');
        console.log(`URL: ${baseURL}/login`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log('==============================================\n');
      } else {
        console.log('\n⚠️  Login redirected but not to dashboard');
        console.log('   This might indicate an issue');
      }
    } else {
      console.log('\n❌ LOGIN FAILED');
      console.log('   Expected redirect (302), got:', loginResponse.status);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('\n❌ LOGIN FAILED');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.statusText}`);
      
      if (error.response.status === 302 || error.response.status === 301) {
        const redirectLocation = error.response.headers.location;
        console.log(`   Redirect to: ${redirectLocation}`);
        
        if (redirectLocation === '/dashboard' || redirectLocation.includes('dashboard')) {
          console.log('\n✅ LOGIN SUCCESSFUL! (via redirect)');
          console.log('\n==============================================');
          console.log('   LOGIN TEST PASSED');
          console.log('==============================================');
          console.log('You can now login with:');
          console.log(`URL: ${baseURL}/login`);
          console.log(`Username: ${username}`);
          console.log(`Password: ${password}`);
          console.log('==============================================\n');
          return;
        }
      }
      
      if (error.response.data) {
        console.log('   Response:', error.response.data.substring(0, 200));
      }
    } else if (error.request) {
      console.log('\n❌ NO RESPONSE FROM SERVER');
      console.log('   Make sure the application is running on port 7575');
    } else {
      console.log('\n❌ ERROR:', error.message);
    }
  }
}

testLogin();
