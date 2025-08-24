const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test users...')

  // Hash passwords
  const clientPassword = await bcrypt.hash('TestPassword123!', 12)
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12)

  // Create test client user
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

  // Create test admin user
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

  console.log('✅ Test users created:')
  console.log(`👤 Client: ${testUser.email}`)
  console.log(`👑 Admin: ${adminUser.email}`)
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
