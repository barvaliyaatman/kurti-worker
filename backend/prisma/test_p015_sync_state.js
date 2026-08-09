import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runFinalActionVerificationTest() {
  console.log('🧪 Starting Final UI & Action Safety Verification Tests...\n');

  let testCompany;

  try {
    // 1. Setup Test Company with skipCutting = true, skipBundle = false
    testCompany = await prisma.company.upsert({
      where: { company_code: 'TEST-UI-CO' },
      update: {},
      create: {
        company_code: 'TEST-UI-CO',
        company_name: 'UI Test Factory',
        owner_name: 'UI Owner',
        phone: '9555544444',
        email: 'uiowner@test.com',
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
    // TEST 1: Job Card BEFORE Create Bundle
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 1: Job Card BEFORE Create Bundle ---');
    const settings = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStage = getInitialJobCardStage(settings);

    const jc = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-UI-001-${Date.now()}`,
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

    const actionBefore = getJobCardPrimaryAction(settings, jc);

    if (jc.status === 'READY_FOR_BUNDLE' && actionBefore.label === 'Create Bundle' && actionBefore.actionKey === 'SEND_TO_BUNDLE') {
      console.log('✅ TEST 1 PASSED: Un-activated Job Card returns action [Create Bundle].');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Action: ${JSON.stringify(actionBefore)}`);
    }

    // Verify NOT visible in assignment queue
    const assignmentQueueBefore = await prisma.jobCard.findMany({
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

    if (assignmentQueueBefore.length === 0) {
      console.log('✅ TEST 1 PASSED: Job Card is NOT VISIBLE in Work Assignment Management.');
    } else {
      throw new Error('❌ TEST 1 FAILED! Job Card prematurely returned in assignment queue.');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Execute Create Bundle & Check Post-Activation Actions
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Job Card AFTER Create Bundle ---');
    const updatedJC = await ensureBundlesGeneratedForJobCard(jc.id);

    const actionAfter = getJobCardPrimaryAction(settings, updatedJC);

    if (actionAfter.label === 'Open Assignment Workspace' && actionAfter.actionKey === 'ASSIGN_WORK') {
      console.log('✅ TEST 2 PASSED: Activated Job Card returns action [Open Assignment Workspace].');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Action: ${JSON.stringify(actionAfter)}`);
    }

    if (actionAfter.label !== 'Create Bundle' && actionAfter.label !== 'Send to Bundle') {
      console.log('✅ TEST 2 PASSED: [Create Bundle] and [Send to Bundle] are strictly ABSENT for activated Job Cards.');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Action label erroneously contains bundle creation: ${actionAfter.label}`);
    }

    // Verify NOW visible in assignment queue
    const assignmentQueueAfter = await prisma.jobCard.findMany({
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

    if (assignmentQueueAfter.length === 1 && assignmentQueueAfter[0].bundles.length === 4) {
      console.log('✅ TEST 2 PASSED: Job Card IS NOW VISIBLE in Work Assignment Management with 4 active bundles.');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Assignment count: ${assignmentQueueAfter.length}`);
    }

    // Cleanup
    await prisma.bundle.deleteMany({ where: { company_id: testCompany.id } });
    await prisma.jobCardItem.deleteMany({ where: { job_card: { company_id: testCompany.id } } });
    await prisma.jobCard.deleteMany({ where: { company_id: testCompany.id } });

    console.log('\n🎉 ALL ACTION SAFETY & ASSIGNMENT VISIBILITY TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFinalActionVerificationTest();
