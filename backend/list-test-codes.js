const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listTestCodes() {
  try {
    console.log('🎯 Codes de test disponibles pour Thé Tip Top\n');
    
    // Récupérer 5 codes de chaque type de gain
    const gains = await prisma.gain.findMany();
    
    for (const gain of gains) {
      console.log(`📦 ${gain.name} (${gain.value}€)`);
      console.log(`   Description: ${gain.description}`);
      
      const codes = await prisma.code.findMany({
        where: {
          gainId: gain.id,
          isUsed: false
        },
        take: 5,
        select: {
          code: true
        }
      });
      
      console.log(`   Codes disponibles: ${codes.map(c => c.code).join(', ')}`);
      console.log('');
    }
    
    // Statistiques globales
    const stats = await prisma.code.groupBy({
      by: ['isUsed'],
      _count: {
        id: true
      }
    });
    
    console.log('📊 Statistiques globales:');
    stats.forEach(stat => {
      console.log(`   ${stat.isUsed ? 'Codes utilisés' : 'Codes disponibles'}: ${stat._count.id}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listTestCodes();
