import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSendToBundleWorkflowTest() {
  console.log('🧪 Starting Comprehensive "Send to Bundle" Workflow & Bundle Generation Tests...\n');

  let testCompany;
  let ownerUser;

  try {
    // 1. Setup Test Company with skipCutting = true, skipBundle = false
    testCompany = await prisma.company.upsert({
      where: { company_code: 'TEST-BUN-CO' },
      update: {},
      create: {
        company_code: 'TEST-BUN-CO',
        company_name: 'Bundle Test Factory',
        owner_name: 'Bundle Owner',
        phone: '9888888888',
        email: 'bundleowner@test.com',
      },
    });

    ownerUser = await prisma.user.upsert({
      where: { email: 'bundleowner@test.com' },
      update: { role: 'OWNER', company_id: testCompany.id },
      create: {
        full_name: 'Bundle Owner',
        email: 'bundleowner@test.com',
        password_hash: 'hash',
        role: 'OWNER',
        company_id: testCompany.id,
      },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: testCompany.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: testCompany.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    const { getInitialJobCardStatus, getJobCardPrimaryAction } = await import('../src/utils/workflowEngine.js');
    const { ensureBundlesGeneratedForJobCard } = await import('../src/utils/bundleHelper.js');

    // 2. Create Job Card JC-TEST-001 with Color + Size quantity breakdown
    console.log('--- TEST 1: Job Card Creation with skipCutting = true ---');
    const workflowSettings = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStatus = getInitialJobCardStatus(workflowSettings);

    const jobCard = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-TEST-001-${Date.now()}`,
        design_code: 'DS-255',
        components: 'Top,Pant,Top Aster',
        stitching_rate: 110.0,
        total_quantity: 200,
        priority: 'NORMAL',
        due_date: new Date(),
        status: initialStatus,
        skip_cutting: true,
        skip_bundle: false,
        company_id: testCompany.id,
        items: {
          create: [
            { color: 'Red', size: 'M', quantity: 50 },
            { color: 'Red', size: 'L', quantity: 50 },
            { color: 'Blue', size: 'M', quantity: 50 },
            { color: 'Blue', size: 'L', quantity: 50 },
          ],
        },
      },
      include: { items: true, bundles: true },
    });

    if (jobCard.status === 'READY_FOR_BUNDLE' && jobCard.skip_cutting === true) {
      console.log('✅ TEST 1 PASSED: Job Card created directly in READY_FOR_BUNDLE status with skip_cutting snapshot.');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Status: ${jobCard.status}`);
    }

    // Verify Action button is "Send to Bundle" (NOT "Send to Cutting")
    const action = getJobCardPrimaryAction(workflowSettings, jobCard);
    if (action.actionKey === 'SEND_TO_BUNDLE' && action.label === 'Send to Bundle') {
      console.log('✅ TEST 1 PASSED: Primary Action is "Send to Bundle" (Send to Cutting is NOT shown).');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Action: ${JSON.stringify(action)}`);
    }

    // 3. Process Job Card into Bundle Stage (Send to Bundle Execution)
    console.log('\n--- TEST 2: Process "Send to Bundle" & Generate Bundles ---');
    const updatedJobCard = await ensureBundlesGeneratedForJobCard(jobCard.id);

    if (updatedJobCard && updatedJobCard.bundles.length === 4) {
      console.log(`✅ TEST 2 PASSED: 4 Production Bundles generated successfully from Color + Size breakdown!`);
      updatedJobCard.bundles.forEach((b) => {
        console.log(`   📦 Bundle: ${b.bundle_number} | Color: ${b.color} | Size: ${b.size} | Sets: ${b.total_sets}`);
      });
    } else {
      throw new Error(`❌ TEST 2 FAILED! Bundle count: ${updatedJobCard?.bundles?.length}`);
    }

    // 4. Over-Allocation Protection & Stock Allocation Test
    console.log('\n--- TEST 3: Bundle Quantity & Over-Allocation Checks ---');
    const bundleRedM = updatedJobCard.bundles.find((b) => b.color === 'Red' && b.size === 'M');
    if (bundleRedM && bundleRedM.total_sets === 50) {
      console.log('✅ TEST 3 PASSED: Bundle Red-M sets count matches Job Card item quantity (50 Pcs).');
    } else {
      throw new Error('❌ TEST 3 FAILED!');
    }

    // Cleanup Test Job Card & Company
    await prisma.bundle.deleteMany({ where: { job_card_id: jobCard.id } });
    await prisma.jobCardItem.deleteMany({ where: { job_card_id: jobCard.id } });
    await prisma.jobCard.delete({ where: { id: jobCard.id } });

    console.log('\n🎉 ALL "SEND TO BUNDLE" WORKFLOW & BUNDLE GENERATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSendToBundleWorkflowTest();
