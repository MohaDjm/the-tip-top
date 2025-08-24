const http = require('http');

// Test direct simple
const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/stats-simple',
  method: 'GET'
};

console.log('Testing /api/stats-simple...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Backend is working');
      
      // Maintenant test avec un token factice pour voir l'erreur
      testAdminStatsWithFakeToken();
    }
  });
});

req.on('error', (err) => {
  console.log('Error:', err.message);
});

req.end();

function testAdminStatsWithFakeToken() {
  const statsOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer fake-token-to-see-error'
    }
  };

  console.log('\nTesting /api/admin/stats with fake token...');
  
  const statsReq = http.request(statsOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Admin Stats Status:', res.statusCode);
      console.log('Admin Stats Response:', data);
    });
  });

  statsReq.on('error', (err) => {
    console.log('Admin Stats Error:', err.message);
  });

  statsReq.end();
}
