const fetch = require('node-fetch');

async function testEmailWithCorrectPassword() {
  try {
    console.log('Testing email functionality with correct app password...');
    
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
      console.log('✅ Password reset email sent successfully:', data.message);
    } else {
      console.log('❌ Password reset failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

testEmailWithCorrectPassword(); 