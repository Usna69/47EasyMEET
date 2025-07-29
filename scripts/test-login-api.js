const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('Testing login API...');
    
    // Test admin login
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'Adminmeets@nairobi.go.ke',
        password: 'MEETM@st@123'
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

testLoginAPI(); 