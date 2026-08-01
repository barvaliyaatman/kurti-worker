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

async function check() {
  console.log('🔍 Testing Supabase Pooler AWS regions for project ileekciwzfsqlnkfqxji...');

  for (const region of regions) {
    const poolerUrl = `postgresql://postgres.ileekciwzfsqlnkfqxji:Atman%402904V@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    console.log(`Testing region [${region}]...`);

    const client = new PrismaClient({
      datasources: {
        db: {
          url: poolerUrl
        }
      }
    });

    try {
      await client.$connect();
      console.log(`🎉 SUCCESS! Connected to Supabase Pooler in region: ${region}`);
      console.log(`DATABASE_URL="postgresql://postgres.ileekciwzfsqlnkfqxji:Atman%402904V@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true"`);
      await client.$disconnect();
      return region;
    } catch (err) {
      console.log(`❌ Region [${region}] failed: ${err.message.split('\n')[0]}`);
      await client.$disconnect();
    }
  }
  console.log('⚠️ None of the pooler regions succeeded.');
}

check();
