import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Real Factory Architecture...');

  // Seed Default Users
  const defaultUsers = [
    {
      full_name: 'Factory Owner',
      email: 'owner@factory.com',
      password: 'Owner@123',
      role: 'OWNER',
    },
    {
      full_name: 'Factory Manager',
      email: 'manager@factory.com',
      password: 'Manager@123',
      role: 'MANAGER',
    },
    {
      full_name: 'Cutting Master',
      email: 'cutting@factory.com',
      password: 'Cutting@123',
      role: 'CUTTING_MASTER',
    },
  ];

  for (const userRecord of defaultUsers) {
    const password_hash = await bcrypt.hash(userRecord.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userRecord.email },
      update: {
        full_name: userRecord.full_name,
        role: userRecord.role,
        password_hash: password_hash,
      },
      create: {
        full_name: userRecord.full_name,
        email: userRecord.email,
        password_hash: password_hash,
        role: userRecord.role,
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Seeded User: ${user.full_name} (${user.email}) - Role: ${user.role}`);
  }
  console.log('🌱 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
