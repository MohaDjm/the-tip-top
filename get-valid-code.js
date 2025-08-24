const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getValidCode() {
  try {
    // Récupérer un code non utilisé
    const code = await prisma.code.findFirst({
      where: { isUsed: false },
      include: { gain: true }
    });

    if (code) {
      console.log('=== CODE VALIDE POUR TEST ===');
      console.log(`Code: ${code.code}`);
      console.log(`Longueur: ${code.code.length} caractères`);
      console.log(`Gain: ${code.gain.name}`);
      console.log(`Valeur: ${code.gain.value}€`);
      console.log(`Regex test: ${/^[A-Z0-9]{10}$/.test(code.code) ? '✅ VALIDE' : '❌ INVALIDE'}`);
      console.log('');
      console.log('Copiez ce code pour tester la roue des gains:');
      console.log(`"${code.code}"`);
    } else {
      console.log('Aucun code disponible dans la base de données');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getValidCode();
