const fetch = require('node-fetch');

async function testAdminPasswordReset() {
  try {
    console.log('Testing admin password reset functionality...');
    
    // Test password reset request for admin user
    const response = await fetch('http://localhost:3000/api/users/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'Adminmeets@nairobi.go.ke'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin password reset request successful:', data.message);
    } else {
      console.log('❌ Admin password reset request failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing admin password reset:', error);
  }
}

testAdminPasswordReset(); 