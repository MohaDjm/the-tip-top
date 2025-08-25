const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testClaimEndpoint() {
  try {
    console.log('🧪 Test direct de l\'endpoint claim...\n')
    
    // 1. Trouver un code non utilisé
    const availableCode = await prisma.code.findFirst({
      where: { isUsed: false },
      include: { gain: true }
    })
    
    if (!availableCode) {
      console.log('❌ Aucun code disponible pour le test')
      return
    }
    
    console.log(`✅ Code de test trouvé: ${availableCode.code}`)
    console.log(`   Gain: ${availableCode.gain.name}`)
    
    // 2. Trouver un utilisateur pour le test
    const testUser = await prisma.user.findFirst({
      where: { role: 'CLIENT' }
    })
    
    if (!testUser) {
      console.log('❌ Aucun utilisateur trouvé pour le test')
      return
    }
    
    console.log(`✅ Utilisateur de test: ${testUser.email}`)
    
    // 3. Simuler la logique de l'endpoint claim
    console.log('\n🔄 Simulation de la transaction...')
    
    try {
      const participation = await prisma.$transaction(async (tx) => {
        console.log('📝 Marquage du code comme utilisé...')
        await tx.code.update({
          where: { id: availableCode.id },
          data: { isUsed: true }
        })
        
        console.log('🎟️ Création de la participation...')
        const newParticipation = await tx.participation.create({
          data: {
            userId: testUser.id,
            codeId: availableCode.id,
            gainId: availableCode.gainId,
            ipAddress: '127.0.0.1',
            userAgent: 'Test Script'
          },
          include: { gain: true }
        })
        
        console.log('📦 Décrémentation du stock de gains...')
        await tx.gain.update({
          where: { id: availableCode.gainId },
          data: { remainingQuantity: { decrement: 1 } }
        })
        
        return newParticipation
      })
      
      console.log('✅ Transaction réussie!')
      console.log(`   Participation ID: ${participation.id}`)
      console.log(`   Gain: ${participation.gain.name}`)
      
      // 4. Vérifier l'éligibilité
      const eligibleCount = await prisma.user.count({
        where: {
          participations: {
            some: {}
          }
        }
      })
      
      console.log(`\n📊 Participants éligibles: ${eligibleCount}`)
      
    } catch (transactionError) {
      console.error('❌ ERREUR dans la transaction:', transactionError)
      console.error('❌ Stack trace:', transactionError.stack)
      
      // Vérifier l'état des données
      const codeStatus = await prisma.code.findUnique({
        where: { id: availableCode.id }
      })
      console.log('📊 État du code après erreur:', {
        isUsed: codeStatus?.isUsed,
        id: codeStatus?.id
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testClaimEndpoint()
