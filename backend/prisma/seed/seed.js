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

  // Seed Default Factory Employees (No Piece Rate!)
  const defaultEmployees = [
    {
      employee_code: 'EMP-0001',
      employee_name: 'Ramesh Patel',
      phone: '9876543210',
      joining_date: new Date('2025-01-15'),
      status: 'ACTIVE',
      notes: 'Master Tailor - Kurti Specialist',
    },
    {
      employee_code: 'EMP-0002',
      employee_name: 'Mahesh Patel',
      phone: '9999999999',
      joining_date: new Date('2025-02-01'),
      status: 'ACTIVE',
      notes: 'Overlock & Finishing Worker',
    },
    {
      employee_code: 'EMP-0003',
      employee_name: 'Jay Patel',
      phone: '8888888888',
      joining_date: new Date('2024-11-10'),
      status: 'INACTIVE',
      notes: 'On Leave - Temporary Deactivated',
    },
  ];

  for (const empRecord of defaultEmployees) {
    const emp = await prisma.employee.upsert({
      where: { employee_code: empRecord.employee_code },
      update: {
        employee_name: empRecord.employee_name,
        phone: empRecord.phone,
        status: empRecord.status,
      },
      create: {
        employee_code: empRecord.employee_code,
        employee_name: empRecord.employee_name,
        phone: empRecord.phone,
        joining_date: empRecord.joining_date,
        status: empRecord.status,
        notes: empRecord.notes,
      },
    });

    console.log(`👷 Seeded Employee (No Piece Rate): ${emp.employee_name} (${emp.employee_code})`);
  }

  // Seed Default Job Cards (With Stitching Rate!)
  const defaultJobCards = [
    {
      job_card_number: 'JC-000001',
      design_code: '2001',
      components: 'Top,Pant,Top Aster,Pant Aster',
      stitching_rate: 110.0,
      total_quantity: 250,
      priority: 'HIGH',
      due_date: new Date('2026-08-15'),
      status: 'READY_FOR_CUTTING',
      remarks: 'Kurti Embroidered 2001 Collection - ₹110/Pcs Stitching Rate',
      created_by: 'Factory Owner',
      items: [
        { color: 'Red', size: 'M', quantity: 50 },
        { color: 'Red', size: 'L', quantity: 50 },
        { color: 'Red', size: 'XL', quantity: 50 },
        { color: 'Blue', size: 'M', quantity: 50 },
        { color: 'Blue', size: 'L', quantity: 50 },
      ],
    },
    {
      job_card_number: 'JC-000002',
      design_code: '2002',
      components: 'Top,Pant,Dupatta',
      stitching_rate: 125.0,
      total_quantity: 180,
      priority: 'NORMAL',
      due_date: new Date('2026-08-20'),
      status: 'CREATED',
      remarks: 'Kurti Designer 2002 Collection - ₹125/Pcs Stitching Rate',
      created_by: 'Factory Owner',
      items: [
        { color: 'Blue', size: 'S', quantity: 30 },
        { color: 'Blue', size: 'M', quantity: 50 },
        { color: 'Blue', size: 'L', quantity: 40 },
        { color: 'Green', size: 'M', quantity: 60 },
      ],
    },
  ];

  for (const jcRecord of defaultJobCards) {
    const existing = await prisma.jobCard.findUnique({
      where: { job_card_number: jcRecord.job_card_number },
    });

    if (!existing) {
      const jc = await prisma.jobCard.create({
        data: {
          job_card_number: jcRecord.job_card_number,
          design_code: jcRecord.design_code,
          components: jcRecord.components,
          stitching_rate: jcRecord.stitching_rate,
          total_quantity: jcRecord.total_quantity,
          priority: jcRecord.priority,
          due_date: jcRecord.due_date,
          status: jcRecord.status,
          remarks: jcRecord.remarks,
          created_by: jcRecord.created_by,
          items: {
            create: jcRecord.items,
          },
        },
      });
      console.log(`📋 Seeded Job Card: ${jc.job_card_number} (${jc.design_code}) - Rate: ₹${jc.stitching_rate}/Pcs`);
    }
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
