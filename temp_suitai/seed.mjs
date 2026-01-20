import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const SALT_LENGTH = 32;
  const KEY_LENGTH = 64;
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database...');

  try {
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash: hashPassword('admin123'),
        fullName: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('✓ Created admin user:', adminUser.email);

    const regularUser = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        passwordHash: hashPassword('user123'),
        fullName: 'Regular User',
        role: 'USER',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('✓ Created regular user:', regularUser.email);

    const allUsers = await prisma.user.findMany();
    console.log('\nAll users in database:');
    allUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
