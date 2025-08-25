const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugGains() {
  try {
    console.log('=== ANALYSE DES GAINS ET CODES ===\n');
    
    // Récupérer tous les gains
    const gains = await prisma.gain.findMany({
      include: {
        _count: {
          select: { participations: true }
        }
      }
    });

    for (const gain of gains) {
      console.log(`--- ${gain.name} (${gain.value}€) ---`);
      console.log(`ID: ${gain.id}`);
      console.log(`Quantité totale: ${gain.quantity}`);
      console.log(`Quantité restante: ${gain.remainingQuantity}`);
      console.log(`Participations: ${gain._count.participations}`);
      
      // Compter les codes
      const totalCodes = await prisma.code.count({ where: { gainId: gain.id } });
      const usedCodes = await prisma.code.count({ where: { gainId: gain.id, isUsed: true } });
      const unusedCodes = totalCodes - usedCodes;
      
      console.log(`Total codes: ${totalCodes}`);
      console.log(`Codes utilisés: ${usedCodes}`);
      console.log(`Codes non utilisés: ${unusedCodes}`);
      
      // Calculer le pourcentage
      const percentage = totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0;
      console.log(`Pourcentage utilisé: ${percentage.toFixed(1)}%`);
      
      // Vérifier quelques codes utilisés
      if (usedCodes > 0) {
        const sampleUsedCodes = await prisma.code.findMany({
          where: { gainId: gain.id, isUsed: true },
          take: 3,
          select: { code: true, isUsed: true, usedAt: true }
        });
        console.log('Exemples de codes utilisés:', sampleUsedCodes);
      }
      
      console.log(''); // Ligne vide
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGains();
