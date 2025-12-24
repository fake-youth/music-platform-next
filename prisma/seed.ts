/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Super Admin
    const superPassword = await bcrypt.hash('super123', 12);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'super@music.com' },
        update: {},
        create: {
            email: 'super@music.com',
            password: superPassword,
            role: 'SUPER_ADMIN',
            profile: {
                create: {
                    fullName: 'Super Administrator',
                    gender: 'MALE',
                    bio: 'System Owner'
                }
            }
        }
    });
    console.log('Created Super Admin:', superAdmin.email);

    // 2. Admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@music.com' },
        update: {},
        create: {
            email: 'admin@music.com',
            password: adminPassword,
            role: 'ADMIN',
            profile: {
                create: {
                    fullName: 'Content Manager',
                    gender: 'FEMALE',
                    bio: 'Music Curator'
                }
            }
        }
    });
    console.log('Created Admin:', admin.email);

    // 3. User
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@music.com' },
        update: {},
        create: {
            email: 'user@music.com',
            password: userPassword,
            role: 'USER',
            profile: {
                create: {
                    fullName: 'Demo User',
                    gender: 'OTHER',
                    bio: 'Music Lover'
                }
            }
        }
    });
    console.log('Created User:', user.email);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
