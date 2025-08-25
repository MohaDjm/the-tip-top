const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestParticipation() {
  try {
    console.log('🧪 Création d\'une participation de test...')
    
    // Vérifier s'il y a des codes disponibles
    const availableCode = await prisma.code.findFirst({
      where: { isUsed: false },
      include: { gain: true }
    })
    
    if (!availableCode) {
      console.log('❌ Aucun code disponible pour le test')
      return
    }
    
    // Créer un utilisateur de test s'il n'existe pas
    const testEmail = 'participant.test@thetiptop.fr'
    let testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12)
      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Participant',
          lastName: 'Test',
          dateOfBirth: new Date('1990-01-01'),
          phone: '+33123456789',
          address: '123 Rue Test',
          city: 'Paris',
          postalCode: '75001',
          role: 'CLIENT',
          emailVerified: true
        }
      })
      console.log(`✅ Utilisateur test créé: ${testUser.email}`)
    } else {
      console.log(`✅ Utilisateur test existant: ${testUser.email}`)
    }
    
    // Créer une participation
    const participation = await prisma.participation.create({
      data: {
        userId: testUser.id,
        codeId: availableCode.id,
        gainId: availableCode.gainId,
        participationDate: new Date(),
        isClaimed: false,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      }
    })
    
    // Marquer le code comme utilisé
    await prisma.code.update({
      where: { id: availableCode.id },
      data: { isUsed: true }
    })
    
    console.log(`✅ Participation créée:`)
    console.log(`   Code: ${availableCode.code}`)
    console.log(`   Gain: ${availableCode.gain.name}`)
    console.log(`   Utilisateur: ${testUser.firstName} ${testUser.lastName}`)
    
    // Vérifier le nombre de participants éligibles
    const eligibleCount = await prisma.user.count({
      where: {
        participations: {
          some: {}
        }
      }
    })
    
    console.log(`\n📊 Participants éligibles au grand tirage: ${eligibleCount}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestParticipation()
