const http = require('http');

// D'abord, créons un utilisateur admin et obtenons un token
function createAdminAndTest() {
  // 1. Créer un utilisateur admin
  const adminData = JSON.stringify({
    email: 'admin@test.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'Test',
    dateOfBirth: '1990-01-01',
    phone: '0123456789',
    address: '123 Test Street',
    city: 'Paris',
    postalCode: '75001',
    role: 'ADMIN'
  });

  const registerOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(adminData)
    }
  };

  console.log('🔧 Création d\'un utilisateur admin...');
  
  const registerReq = http.request(registerOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📝 Inscription: Status ${res.statusCode}`);
      console.log(`📝 Response: ${data}`);
      
      // 2. Se connecter pour obtenir le token
      loginAdmin();
    });
  });

  registerReq.on('error', (err) => {
    console.log('❌ Erreur inscription:', err.message);
    // Essayer de se connecter quand même au cas où l'admin existe déjà
    loginAdmin();
  });

  registerReq.write(adminData);
  registerReq.end();
}

function loginAdmin() {
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

  console.log('🔐 Connexion admin...');
  
  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`🔐 Connexion: Status ${res.statusCode}`);
      console.log(`🔐 Response: ${data}`);
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          const token = response.token;
          console.log('✅ Token obtenu, test des stats...');
          testAdminStats(token);
        } catch (e) {
          console.log('❌ Erreur parsing token:', e.message);
        }
      } else {
        console.log('❌ Échec de connexion');
      }
    });
  });

  loginReq.on('error', (err) => {
    console.log('❌ Erreur connexion:', err.message);
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

  console.log('📊 Test endpoint /api/admin/stats...');
  
  const statsReq = http.request(statsOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== RÉSULTAT TEST ADMIN STATS ===');
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: L\'endpoint /api/admin/stats fonctionne !');
      } else {
        console.log('❌ ERREUR: L\'endpoint retourne encore une erreur');
      }
    });
  });

  statsReq.on('error', (err) => {
    console.log('❌ Erreur test stats:', err.message);
  });

  statsReq.end();
}

// Démarrer le test
createAdminAndTest();
