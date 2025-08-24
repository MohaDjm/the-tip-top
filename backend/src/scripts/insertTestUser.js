const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function insertTestUser() {
  try {
    console.log('🔧 Creating test user directly in database...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@thetiptop.fr',
        password: hashedPassword,
        firstName: 'Jean',
        lastName: 'Dupont',
        dateOfBirth: new Date('1990-05-15'),
        phone: '+33123456789',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        role: 'CLIENT',
        emailVerified: true
      }
    });

    console.log('✅ Test user created successfully!');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   Created: ${testUser.createdAt}`);

    // Create admin user too
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@thetiptop.fr',
        password: await bcrypt.hash('AdminPassword123!', 12),
        firstName: 'Marie',
        lastName: 'Martin',
        dateOfBirth: new Date('1985-03-20'),
        phone: '+33987654321',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69001',
        role: 'ADMIN',
        emailVerified: true
      }
    });

    console.log('\n👑 Admin user created:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   Client: test@thetiptop.fr / TestPassword123!');
    console.log('   Admin: admin@thetiptop.fr / AdminPassword123!');

    const userCount = await prisma.user.count();
    console.log(`\n📊 Total users: ${userCount}`);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Users already exist. Using existing accounts:');
      console.log('   Client: test@thetiptop.fr / TestPassword123!');
      console.log('   Admin: admin@thetiptop.fr / AdminPassword123!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

insertTestUser();
