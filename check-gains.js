const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getGainNames() {
  try {
    const gains = await prisma.gain.findMany({
      select: { name: true, value: true },
      orderBy: { value: 'asc' }
    });
    
    console.log('=== NOMS EXACTS DES GAINS DANS LA BDD ===');
    gains.forEach((gain, index) => {
      console.log(`${index}: "${gain.name}" (${gain.value}€)`);
    });
    
    console.log('\n=== TABLEAU PRIZES FRONTEND ACTUEL ===');
    console.log('0: "Infuseur à thé" (8€)');
    console.log('1: "Boîte de 100g thé détox" (12€)');
    console.log('2: "Boîte de 100g thé signature" (18€)');
    console.log('3: "Coffret découverte 39€" (39€)');
    console.log('4: "Coffret découverte 69€" (69€)');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erreur:', error);
  }
}

getGainNames();
