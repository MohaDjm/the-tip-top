const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with full test data...')

  // Hash passwords
  const clientPassword = await bcrypt.hash('TestPassword123!', 12)
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12)

  // Create gains first
  const gains = []
  
  // Check and create gains individually
  const gainData = [
    {
      name: 'Infuseur à thé',
      description: 'Infuseur à thé en acier inoxydable',
      value: 39.00,
      quantity: 100,
      remainingQuantity: 85
    },
    {
      name: 'Boîte de 100g thé détox ou infusion',
      description: 'Thé détox bio premium',
      value: 49.00,
      quantity: 200,
      remainingQuantity: 170
    },
    {
      name: 'Boîte de 100g thé signature',
      description: 'Thé signature de la maison',
      value: 59.00,
      quantity: 150,
      remainingQuantity: 120
    },
    {
      name: 'Coffret découverte 39€',
      description: 'Coffret découverte avec 3 thés',
      value: 39.00,
      quantity: 80,
      remainingQuantity: 65
    },
    {
      name: 'Coffret découverte 69€',
      description: 'Coffret découverte premium avec 5 thés',
      value: 69.00,
      quantity: 50,
      remainingQuantity: 40
    }
  ]

  for (const data of gainData) {
    const existingGain = await prisma.gain.findFirst({
      where: { name: data.name }
    })
    
    if (!existingGain) {
      const gain = await prisma.gain.create({ data })
      gains.push(gain)
    } else {
      gains.push(existingGain)
    }
  }

  // Create test users
  const testUser = await prisma.user.upsert({
    where: { email: 'test@thetiptop.fr' },
    update: {},
    create: {
      email: 'test@thetiptop.fr',
      password: clientPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      dateOfBirth: new Date('1990-05-15'),
      phone: '+33123456789',
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      role: 'CLIENT',
      emailVerified: true,
    },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@thetiptop.fr' },
    update: {},
    create: {
      email: 'admin@thetiptop.fr',
      password: adminPassword,
      firstName: 'Marie',
      lastName: 'Martin',
      dateOfBirth: new Date('1985-03-20'),
      phone: '+33987654321',
      address: '456 Avenue des Champs',
      city: 'Lyon',
      postalCode: '69001',
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  // Create additional test users
  const users = []
  for (let i = 1; i <= 10; i++) {
    const email = `user${i}@example.com`
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          email,
          password: clientPassword,
          firstName: `User${i}`,
          lastName: `Test`,
          dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          phone: `+3312345678${i}`,
          address: `${i} Rue Test`,
          city: 'Paris',
          postalCode: '75001',
          role: 'CLIENT',
          emailVerified: true,
        }
      })
      users.push(user)
    } else {
      users.push(existingUser)
    }
  }

  // Create codes in batches for better performance
  const codes = []
  const batchSize = 1000
  const totalCodes = 500000
  console.log('🎫 Generating 500,000 codes in batches... This may take a few minutes.')
  
  for (let batch = 0; batch < Math.ceil(totalCodes / batchSize); batch++) {
    const batchCodes = []
    const startIndex = batch * batchSize + 1
    const endIndex = Math.min((batch + 1) * batchSize, totalCodes)
    
    for (let i = startIndex; i <= endIndex; i++) {
      const codeValue = `TEST${i.toString().padStart(7, '0')}`
      batchCodes.push({
        code: codeValue,
        gainId: gains[Math.floor(Math.random() * gains.length)].id,
        isUsed: Math.random() < 0.3, // 30% des codes sont utilisés
      })
    }
    
    // Insert batch
    const createdCodes = await prisma.code.createMany({
      data: batchCodes,
      skipDuplicates: true
    })
    
    console.log(`✅ Batch ${batch + 1}/${Math.ceil(totalCodes / batchSize)} completed (${endIndex} codes)`)
    
    // Get created codes for participations
    const batchResults = await prisma.code.findMany({
      where: {
        code: {
          in: batchCodes.map(c => c.code)
        }
      }
    })
    codes.push(...batchResults)
  }

  // Create participations for used codes
  const usedCodes = codes.filter(code => code.isUsed)
  for (const code of usedCodes.slice(0, 50)) { // Limiter à 50 participations
    const randomUser = users[Math.floor(Math.random() * users.length)]
    
    // Vérifier si une participation existe déjà pour ce code
    const existingParticipation = await prisma.participation.findUnique({
      where: { codeId: code.id }
    })
    
    if (!existingParticipation) {
      await prisma.participation.create({
        data: {
          userId: randomUser.id,
          codeId: code.id,
          gainId: code.gainId,
          participationDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Dans les 30 derniers jours
          isClaimed: Math.random() < 0.6, // 60% des participations sont réclamées
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser'
        }
      })
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👥 Users: ${users.length + 2} (including admin and test user)`)
  console.log(`🎁 Gains: ${gains.length}`)
  console.log(`🎫 Codes: ${codes.length}`)
  console.log(`🎯 Participations: ${usedCodes.slice(0, 50).length}`)
  console.log('\n🔑 Login credentials:')
  console.log('   test@thetiptop.fr / TestPassword123!')
  console.log('   admin@thetiptop.fr / AdminPassword123!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
