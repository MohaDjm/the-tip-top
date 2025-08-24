const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@thetiptop.fr',
        password: 'TestPassword123!'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
