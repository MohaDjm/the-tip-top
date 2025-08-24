"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function createTestUser() {
    try {
        console.log('🔧 Creating test user account...\n');
        // Hash password for security
        const hashedPassword = await bcrypt_1.default.hash('TestPassword123!', 12);
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
        console.log('\n👤 User Details:');
        console.log(`   ID: ${testUser.id}`);
        console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Role: ${testUser.role}`);
        console.log(`   Email Verified: ${testUser.emailVerified ? '✅' : '❌'}`);
        console.log(`   Created: ${testUser.createdAt.toLocaleString()}`);
        console.log('\n🔑 Login Credentials:');
        console.log(`   Email: test@thetiptop.fr`);
        console.log(`   Password: TestPassword123!`);
        // Also create an admin test user
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@thetiptop.fr',
                password: await bcrypt_1.default.hash('AdminPassword123!', 12),
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
        console.log('\n👑 Admin user also created:');
        console.log(`   Email: admin@thetiptop.fr`);
        console.log(`   Password: AdminPassword123!`);
        console.log(`   Role: ${adminUser.role}`);
        // Show updated database stats
        const userCount = await prisma.user.count();
        console.log(`\n📊 Total users in database: ${userCount}`);
    }
    catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️  Test users already exist in the database.');
            console.log('\n🔑 Existing Login Credentials:');
            console.log(`   Client: test@thetiptop.fr / TestPassword123!`);
            console.log(`   Admin: admin@thetiptop.fr / AdminPassword123!`);
        }
        else {
            console.error('❌ Error creating test user:', error);
        }
    }
    finally {
        await prisma.$disconnect();
    }
}
createTestUser();
//# sourceMappingURL=createTestUser.js.map