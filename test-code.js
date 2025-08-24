const crypto = require('crypto');

// Générer quelques codes d'exemple comme dans le script
console.log('=== Codes d\'exemple générés ===');
for(let i = 0; i < 5; i++) {
  const code = crypto.randomBytes(5).toString('hex').toUpperCase();
  console.log(`Code ${i+1}: "${code}" (${code.length} caractères)`);
  console.log(`  Regex test: ${/^[A-Z0-9]{10}$/.test(code)}`);
  console.log(`  Contient seulement 0-9,A-F: ${/^[0-9A-F]{10}$/.test(code)}`);
  console.log('');
}

// Tester différents formats
console.log('=== Tests de validation ===');
const testCodes = [
  'ABC1234567',  // 10 chars alphanumériques
  'ABCDEF1234',  // 10 chars hexadécimaux
  'abc1234567',  // minuscules
  'ABC123456',   // 9 chars
  'ABC12345678', // 11 chars
  '1234567890',  // que des chiffres
  'ABCDEFGHIJ'   // que des lettres
];

testCodes.forEach(code => {
  console.log(`"${code}" (${code.length} chars) -> ${/^[A-Z0-9]{10}$/.test(code) ? '✅ VALIDE' : '❌ INVALIDE'}`);
});
