const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanAndGenerate() {
  try {
    console.log('🧹 Nettoyage complet de la base de données...')
    
    // Supprimer tout
    await prisma.participation.deleteMany()
    await prisma.code.deleteMany()
    await prisma.gain.deleteMany()
    
    console.log('✅ Base de données nettoyée')
    
    // Créer les gains avec les quantités exactes
    console.log('🎁 Création des gains...')
    
    const gainsData = [
      { name: 'Infuseur à thé', value: 39.00, quantity: 300000, codes: 300000 },
      { name: 'Boîte de 100g thé détox ou infusion', value: 49.00, quantity: 100000, codes: 100000 },
      { name: 'Boîte de 100g thé signature', value: 59.00, quantity: 50000, codes: 50000 },
      { name: 'Coffret découverte 39€', value: 39.00, quantity: 30000, codes: 30000 },
      { name: 'Coffret découverte 69€', value: 69.00, quantity: 20000, codes: 20000 }
    ]
    
    const createdGains = []
    for (const gainData of gainsData) {
      const gain = await prisma.gain.create({
        data: {
          name: gainData.name,
          description: `${gainData.name} d'une valeur de ${gainData.value}€`,
          value: gainData.value,
          quantity: gainData.quantity,
          remainingQuantity: gainData.quantity
        }
      })
      createdGains.push({ ...gain, codesToGenerate: gainData.codes })
      console.log(`   ✅ ${gainData.name}: ${gainData.codes} codes`)
    }
    
    console.log('🔢 Génération des codes...')
    let totalGenerated = 0
    
    for (const gain of createdGains) {
      console.log(`   📦 Génération de ${gain.codesToGenerate} codes pour "${gain.name}"...`)
      
      const batchSize = 5000
      let generated = 0
      
      for (let i = 0; i < gain.codesToGenerate; i += batchSize) {
        const batch = []
        const end = Math.min(i + batchSize, gain.codesToGenerate)
        
        for (let j = i; j < end; j++) {
          const codeValue = `${(totalGenerated + j + 1).toString().padStart(10, '0')}`
          batch.push({
            code: codeValue,
            gainId: gain.id,
            isUsed: false
          })
        }
        
        await prisma.code.createMany({
          data: batch,
          skipDuplicates: true
        })
        
        generated += batch.length
        console.log(`     ✅ ${generated}/${gain.codesToGenerate} codes générés`)
      }
      
      totalGenerated += gain.codesToGenerate
    }
    
    // Vérification finale
    console.log('🔍 Vérification finale...')
    const finalCount = await prisma.code.count()
    const finalGains = await prisma.gain.findMany({
      include: {
        _count: {
          select: { codes: true }
        }
      },
      orderBy: { value: 'asc' }
    })
    
    console.log('\n📊 Résultats finaux:')
    console.log(`   Total codes: ${finalCount}`)
    
    for (const gain of finalGains) {
      const percentage = ((gain._count.codes / 500000) * 100).toFixed(2)
      console.log(`   ${gain.name}: ${gain._count.codes} codes (${percentage}%)`)
    }
    
    if (finalCount === 500000) {
      console.log('\n🎉 SUCCÈS: Exactement 500,000 codes générés!')
    } else {
      console.log(`\n❌ ERREUR: ${finalCount} codes au lieu de 500,000`)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanAndGenerate()
