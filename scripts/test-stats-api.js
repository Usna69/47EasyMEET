const fetch = require('node-fetch');

async function testStatsAPI() {
  try {
    console.log('Testing stats API...');
    
    // Test stats API
    const response = await fetch('http://localhost:3000/api/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Stats API successful:', data);
    } else {
      console.log('❌ Stats API failed:', data);
    }
  } catch (error) {
    console.error('Error testing stats API:', error);
  }
}

testStatsAPI(); 