import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runDeterministicBundleFlowTest() {
  console.log('🧪 Starting Comprehensive Job Card → Create Bundle → Assignment Flow Tests...\n');

  let testCompany;

  try {
    // 1. Setup Test Company with skipCutting = true, skipBundle = false
    testCompany = await prisma.company.upsert({
      where: { company_code: 'TEST-FLOW-CO' },
      update: {},
      create: {
        company_code: 'TEST-FLOW-CO',
        company_name: 'Flow Test Factory',
        owner_name: 'Flow Owner',
        phone: '9666655555',
        email: 'flowowner@test.com',
      },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: testCompany.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: testCompany.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    const { getInitialJobCardStage, getJobCardPrimaryAction, getJobCardProductionState } = await import('../src/utils/workflowEngine.js');
    const { ensureBundlesGeneratedForJobCard } = await import('../src/utils/bundleHelper.js');

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Create Job Card (skipCutting = true, skipBundle = false)
    // ─────────────────────────────────────────────────────────────
    console.log('--- STEP 1 & 2: Create Job Card (No Auto Bundle Creation) ---');
    const settings = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStage = getInitialJobCardStage(settings);

    const jc = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-FLOW-001-${Date.now()}`,
        design_code: 'DS-255',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 200,
        priority: 'NORMAL',
        due_date: new Date(),
        status: initialStage,
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

    if (jc.status === 'READY_FOR_BUNDLE' && jc.bundles.length === 0) {
      console.log('✅ STEP 1 PASSED: Job Card created with DB status READY_FOR_BUNDLE and 0 bundles generated.');
    } else {
      throw new Error(`❌ STEP 1 FAILED! Status: ${jc.status}, Bundles count: ${jc.bundles.length}`);
    }

    const actionBeforeCreate = getJobCardPrimaryAction(settings, jc);
    if (actionBeforeCreate.actionKey === 'OPEN_BUNDLE' && actionBeforeCreate.label === 'Create Bundle') {
      console.log('✅ STEP 2 PASSED: Job Card List Action is [Create Bundle].');
    } else {
      throw new Error(`❌ STEP 2 FAILED! Action: ${JSON.stringify(actionBeforeCreate)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Work Assignment Queue Visibility Check BEFORE Create Bundle
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- STEP 3: Work Assignment Queue Visibility BEFORE Bundle Activation ---');
    const visibleInAssignmentBefore = await prisma.jobCard.findMany({
      where: {
        id: jc.id,
        is_deleted: false,
        company_id: testCompany.id,
        OR: [
          { bundles: { some: {} } },
          { AND: [{ skip_bundle: true }, { status: 'READY_FOR_ASSIGNMENT' }] },
        ],
      },
    });

    if (visibleInAssignmentBefore.length === 0) {
      console.log('✅ STEP 3 PASSED: Job Card is NOT VISIBLE in Work Assignment Management before [Create Bundle] is clicked.');
    } else {
      throw new Error('❌ STEP 3 FAILED! Job Card prematurely returned in assignment queue query.');
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Click [Create Bundle] / Execute Bundle Activation
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- STEP 4: Execute [Create Bundle] ---');
    const updatedJC = await ensureBundlesGeneratedForJobCard(jc.id);

    if (updatedJC && updatedJC.status === 'READY_FOR_ASSIGNMENT' && updatedJC.bundles.length === 4) {
      console.log('✅ STEP 4 PASSED: Bundle stage activated! 4 Production Bundles generated, status updated to READY_FOR_ASSIGNMENT.');
    } else {
      throw new Error(`❌ STEP 4 FAILED! Status: ${updatedJC?.status}, Bundles: ${updatedJC?.bundles?.length}`);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Job Card List Action Button AFTER Create Bundle
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- STEP 5: Job Card List Action AFTER Bundle Activation ---');
    const actionAfterCreate = getJobCardPrimaryAction(settings, updatedJC);
    if (actionAfterCreate.actionKey !== 'OPEN_BUNDLE' || actionAfterCreate.label !== 'Create Bundle') {
      console.log(`✅ STEP 5 PASSED: Action button updated from [Create Bundle] to [${actionAfterCreate.label}].`);
    } else {
      throw new Error(`❌ STEP 5 FAILED! Action after activation: ${JSON.stringify(actionAfterCreate)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 6 & 7: Work Assignment Queue Visibility AFTER Create Bundle
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- STEP 6 & 7: Work Assignment Queue Visibility AFTER Bundle Activation ---');
    const visibleInAssignmentAfter = await prisma.jobCard.findMany({
      where: {
        id: jc.id,
        is_deleted: false,
        company_id: testCompany.id,
        OR: [
          { bundles: { some: {} } },
          { AND: [{ skip_bundle: true }, { status: 'READY_FOR_ASSIGNMENT' }] },
        ],
      },
      include: { bundles: true },
    });

    if (visibleInAssignmentAfter.length === 1 && visibleInAssignmentAfter[0].bundles.length === 4) {
      console.log('✅ STEP 6 & 7 PASSED: Job Card IS NOW VISIBLE in Work Assignment Management with 4 active bundles!');
    } else {
      throw new Error(`❌ STEP 6 & 7 FAILED! Assignment count: ${visibleInAssignmentAfter.length}`);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 8: Idempotency Check (Duplicate Click Protection)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- STEP 8: Double-Click / Idempotency Verification ---');
    const duplicateCallJC = await ensureBundlesGeneratedForJobCard(jc.id);

    if (duplicateCallJC.bundles.length === 4) {
      console.log('✅ STEP 8 PASSED: Duplicate transition cleanly rejected; bundle count remains 4 without duplicates.');
    } else {
      throw new Error(`❌ STEP 8 FAILED! Duplicate bundles created: ${duplicateCallJC.bundles.length}`);
    }

    // Cleanup
    await prisma.bundle.deleteMany({ where: { company_id: testCompany.id } });
    await prisma.jobCardItem.deleteMany({ where: { job_card: { company_id: testCompany.id } } });
    await prisma.jobCard.deleteMany({ where: { company_id: testCompany.id } });

    console.log('\n🎉 ALL DETERMINISTIC BUNDLE ACTIVATION FLOW TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDeterministicBundleFlowTest();
