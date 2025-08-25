const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkGainNames() {
  try {
    console.log('🔍 Vérification des noms de gains dans la base de données...\n')
    
    const gains = await prisma.gain.findMany({
      orderBy: { quantity: 'desc' }
    })
    
    console.log('📊 Gains dans la base de données:')
    gains.forEach((gain, index) => {
      console.log(`${index + 1}. "${gain.name}" (${gain.quantity} codes, ${gain.remainingQuantity} restants)`)
    })
    
    console.log('\n🎨 Gains dans PrizeWheel.tsx:')
    const frontendPrizes = [
      'Infuseur à thé',
      'Boîte de 100g thé détox',
      'Boîte de 100g thé signature',
      'Coffret découverte 39€',
      'Coffret découverte 69€'
    ]
    
    frontendPrizes.forEach((name, index) => {
      console.log(`${index + 1}. "${name}"`)
    })
    
    console.log('\n🔍 Comparaison:')
    gains.forEach(gain => {
      const match = frontendPrizes.find(fp => fp === gain.name)
      if (match) {
        console.log(`✅ "${gain.name}" - MATCH`)
      } else {
        console.log(`❌ "${gain.name}" - PAS DE MATCH`)
        // Chercher des correspondances partielles
        const partialMatch = frontendPrizes.find(fp => 
          fp.toLowerCase().includes(gain.name.toLowerCase()) || 
          gain.name.toLowerCase().includes(fp.toLowerCase())
        )
        if (partialMatch) {
          console.log(`   🔍 Correspondance partielle possible: "${partialMatch}"`)
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGainNames()
