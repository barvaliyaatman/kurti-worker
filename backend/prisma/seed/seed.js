import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Multi-Company Architecture...');

  // 1. Create Default Company
  const defaultCompany = await prisma.company.upsert({
    where: { company_code: 'COMP-001' },
    update: {
      company_name: 'Kurti Manufacturing Factory',
      owner_name: 'Factory Owner',
      phone: '9876543210',
      email: 'owner@factory.com',
      status: 'ACTIVE',
    },
    create: {
      company_code: 'COMP-001',
      company_name: 'Kurti Manufacturing Factory',
      owner_name: 'Factory Owner',
      phone: '9876543210',
      email: 'owner@factory.com',
      status: 'ACTIVE',
    },
  });
  console.log(`🏢 Seeded/Updated Default Company: ${defaultCompany.company_name} (COMP-001)`);

  // 2. Seed Default Users mapped to Default Company
  const defaultUsers = [
    {
      full_name: 'Factory Owner',
      email: 'owner@factory.com',
      password: 'Owner@123',
      role: 'OWNER',
      company_id: defaultCompany.id,
    },
    {
      full_name: 'Factory Manager',
      email: 'manager@factory.com',
      password: 'Manager@123',
      role: 'MANAGER',
      company_id: defaultCompany.id,
    },
    {
      full_name: 'Cutting Master',
      email: 'cutting@factory.com',
      password: 'Cutting@123',
      role: 'CUTTING_MASTER',
      company_id: defaultCompany.id,
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
        company_id: userRecord.company_id,
      },
      create: {
        full_name: userRecord.full_name,
        email: userRecord.email,
        password_hash: password_hash,
        role: userRecord.role,
        status: 'ACTIVE',
        company_id: userRecord.company_id,
      },
    });

    console.log(`✅ Seeded User: ${user.full_name} (${user.email}) - Role: ${user.role} - Company: COMP-001`);
  }

  // 3. Seed Super Admin User (No company)
  const superAdminPasswordHash = await bcrypt.hash('Super@123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@factory.com' },
    update: {
      full_name: 'System Super Admin',
      role: 'SUPER_ADMIN',
      password_hash: superAdminPasswordHash,
      company_id: null,
    },
    create: {
      full_name: 'System Super Admin',
      email: 'superadmin@factory.com',
      password_hash: superAdminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      company_id: null,
    },
  });
  console.log(`👑 Seeded Super Admin: ${superAdmin.full_name} (${superAdmin.email})`);

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
