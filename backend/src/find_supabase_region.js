import { PrismaClient } from '@prisma/client';

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'us-east-1',
  'us-west-1',
  'eu-west-1',
  'eu-central-1',
  'ap-northeast-1',
  'sa-east-1',
  'ca-central-1',
  'me-south-1',
  'af-south-1'
];

async function findRegion() {
  console.log('🔍 Testing Supabase Pooler port 5432 across AWS regions...');

  for (const region of regions) {
    const url = `postgresql://postgres.ileekciwzfsqlnkfqxji:Atman%402904V@aws-0-${region}.pooler.supabase.com:5432/postgres`;
    console.log(`Checking region: ${region}...`);

    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    });

    try {
      await prisma.$connect();
      console.log(`\n🎉 MATCH FOUND! Region: [${region}]`);
      console.log(`DATABASE_URL="${url}"`);
      await prisma.$disconnect();
      return region;
    } catch (err) {
      const msg = err.message.split('\n')[0];
      if (msg.includes('Password authentication failed')) {
        console.log(`🎉 MATCH FOUND (Region is ${region}) but Password needs verification: ${msg}`);
        await prisma.$disconnect();
        return region;
      } else {
        console.log(`  -> ${region} result: ${msg}`);
      }
      await prisma.$disconnect();
    }
  }
  console.log('⚠️ Region scan finished.');
}

findRegion();
