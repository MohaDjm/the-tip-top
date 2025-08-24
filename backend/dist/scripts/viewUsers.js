"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function viewAllUsers() {
    try {
        console.log('🔍 Fetching all users from database...\n');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        participations: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        if (users.length === 0) {
            console.log('❌ No users found in the database.');
            console.log('💡 Users will be created when they register through the frontend.');
        }
        else {
            console.log(`✅ Found ${users.length} user(s):\n`);
            users.forEach((user, index) => {
                console.log(`👤 User ${index + 1}:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Name: ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
                console.log(`   Participations: ${user._count.participations}`);
                console.log(`   Created: ${user.createdAt.toLocaleString()}`);
                console.log(`   Updated: ${user.updatedAt.toLocaleString()}`);
                console.log('   ---');
            });
        }
        // Also show some database stats
        const stats = await Promise.all([
            prisma.user.count(),
            prisma.code.count(),
            prisma.gain.count(),
            prisma.participation.count(),
            prisma.socialAccount.count()
        ]);
        console.log('\n📊 Database Statistics:');
        console.log(`   Users: ${stats[0]}`);
        console.log(`   Codes: ${stats[1]}`);
        console.log(`   Gains: ${stats[2]}`);
        console.log(`   Participations: ${stats[3]}`);
        console.log(`   Social Accounts: ${stats[4]}`);
    }
    catch (error) {
        console.error('❌ Error fetching users:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
viewAllUsers();
//# sourceMappingURL=viewUsers.js.map