import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  await prisma.jobCardItem.deleteMany({ where: { job_card: { job_card_number: 'JC-999' } } });
  await prisma.jobCard.deleteMany({ where: { job_card_number: 'JC-999' } });
  console.log('Cleaned test JC-999 successfully');
  await prisma.$disconnect();
}

clean();
