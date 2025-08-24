const http = require('http');

// Test direct de l'endpoint stats-simple d'abord
function testSimpleStats() {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/stats-simple',
    method: 'GET'
  };

  console.log('📊 Test /api/stats-simple...');
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Stats simples OK, test avec auth...');
        testWithAuth();
      } else {
        console.log('❌ Problème avec stats simples');
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Erreur:', err.message);
  });

  req.end();
}

function testWithAuth() {
  // Login rapide
  const loginData = JSON.stringify({
    email: 'admin@test.com',
    password: 'Admin123!'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          const token = response.token;
          testAdminStats(token);
        } catch (e) {
          console.log('❌ Parse error:', e.message);
        }
      } else {
        console.log('❌ Login failed:', res.statusCode);
      }
    });
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testAdminStats(token) {
  const statsOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  console.log('📊 Test /api/admin/stats avec auth...');
  
  const statsReq = http.request(statsOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== RÉSULTAT FINAL ===');
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      
      if (res.statusCode === 200) {
        console.log('🎉 SUCCESS: /api/admin/stats fonctionne !');
      } else {
        console.log('❌ ERREUR 500 toujours présente');
      }
    });
  });

  statsReq.end();
}

testSimpleStats();
