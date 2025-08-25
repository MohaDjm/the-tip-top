const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkParticipantEligibility() {
  try {
    console.log('🔍 Vérification de l\'éligibilité des participants...\n')
    
    // 1. Compter tous les utilisateurs avec des participations
    const eligibleParticipants = await prisma.user.count({
      where: {
        participations: {
          some: {}
        }
      }
    })
    
    console.log(`📊 Participants éligibles (requête admin): ${eligibleParticipants}`)
    
    // 2. Lister tous les utilisateurs avec leurs participations
    const usersWithParticipations = await prisma.user.findMany({
      where: {
        participations: {
          some: {}
        }
      },
      include: {
        participations: {
          include: {
            gain: true,
            code: true
          }
        }
      }
    })
    
    console.log(`\n👥 Détail des participants (${usersWithParticipations.length}):\n`)
    
    usersWithParticipations.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`)
      console.log(`   📧 Email vérifié: ${user.emailVerified ? '✅' : '❌'}`)
      console.log(`   🎟️ Participations: ${user.participations.length}`)
      
      user.participations.forEach((participation, pIndex) => {
        console.log(`      ${pIndex + 1}. Code: ${participation.code.code} → ${participation.gain.name}`)
        console.log(`         Date: ${participation.participationDate.toLocaleString('fr-FR')}`)
      })
      console.log('')
    })
    
    // 3. Vérifier s'il y a des codes utilisés sans participation
    const usedCodesWithoutParticipation = await prisma.code.findMany({
      where: {
        isUsed: true,
        participations: {
          none: {}
        }
      }
    })
    
    console.log(`⚠️ Codes utilisés sans participation: ${usedCodesWithoutParticipation.length}`)
    if (usedCodesWithoutParticipation.length > 0) {
      console.log('Codes concernés:')
      usedCodesWithoutParticipation.forEach(code => {
        console.log(`   - ${code.code}`)
      })
    }
    
    // 4. Vérifier s'il y a des participations sans utilisateur
    const participationsWithoutUser = await prisma.participation.findMany({
      where: {
        user: null
      }
    })
    
    console.log(`\n⚠️ Participations sans utilisateur: ${participationsWithoutUser.length}`)
    
    // 5. Statistiques générales
    const totalUsers = await prisma.user.count()
    const totalParticipations = await prisma.participation.count()
    const totalUsedCodes = await prisma.code.count({ where: { isUsed: true } })
    
    console.log(`\n📈 Statistiques générales:`)
    console.log(`   👥 Total utilisateurs: ${totalUsers}`)
    console.log(`   🎟️ Total participations: ${totalParticipations}`)
    console.log(`   🏷️ Total codes utilisés: ${totalUsedCodes}`)
    console.log(`   ✅ Participants éligibles: ${eligibleParticipants}`)
    
    if (totalParticipations !== totalUsedCodes) {
      console.log(`\n❌ PROBLÈME DÉTECTÉ: ${totalUsedCodes} codes utilisés mais ${totalParticipations} participations`)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkParticipantEligibility()
