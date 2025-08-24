const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@thetiptop.fr' }
    })
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      })
      
      // Test password verification
      const testPassword = 'TestPassword123!'
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log('🔑 Password test result:', isValid)
      
    } else {
      console.log('❌ User not found')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
