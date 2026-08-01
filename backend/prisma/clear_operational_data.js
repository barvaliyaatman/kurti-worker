import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('🧹 Clearing all operational data from database (Preserving Users table)...');

  try {
    // Delete in reverse dependency order
    const deletedHistory = await prisma.assignmentHistory.deleteMany({});
    console.log(`- Deleted AssignmentHistory: ${deletedHistory.count} records`);

    const deletedAssignments = await prisma.assignment.deleteMany({});
    console.log(`- Deleted Assignments: ${deletedAssignments.count} records`);

    const deletedAdvances = await prisma.employeeAdvance.deleteMany({});
    console.log(`- Deleted EmployeeAdvances: ${deletedAdvances.count} records`);

    const deletedPayments = await prisma.employeePayment.deleteMany({});
    console.log(`- Deleted EmployeePayments: ${deletedPayments.count} records`);

    const deletedBundles = await prisma.bundle.deleteMany({});
    console.log(`- Deleted Bundles: ${deletedBundles.count} records`);

    const deletedCutting = await prisma.cuttingProgress.deleteMany({});
    console.log(`- Deleted CuttingProgress: ${deletedCutting.count} records`);

    const deletedItems = await prisma.jobCardItem.deleteMany({});
    console.log(`- Deleted JobCardItems: ${deletedItems.count} records`);

    const deletedJobCards = await prisma.jobCard.deleteMany({});
    console.log(`- Deleted JobCards: ${deletedJobCards.count} records`);

    const deletedEmployees = await prisma.employee.deleteMany({});
    console.log(`- Deleted Employees: ${deletedEmployees.count} records`);

    const usersCount = await prisma.user.count();
    console.log(`\n✅ Database cleaned! Users table preserved with ${usersCount} active users.`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
