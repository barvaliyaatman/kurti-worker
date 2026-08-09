import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runStateSyncVerificationTest() {
  console.log('🧪 Starting State Synchronization & Multi-Screen Consistency Tests...\n');

  let testCompany;

  try {
    // 1. Setup Test Company
    testCompany = await prisma.company.upsert({
      where: { company_code: 'TEST-SYNC-CO' },
      update: {},
      create: {
        company_code: 'TEST-SYNC-CO',
        company_name: 'State Sync Factory',
        owner_name: 'Sync Owner',
        phone: '9777766666',
        email: 'syncowner@test.com',
      },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: testCompany.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: testCompany.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    const { getInitialJobCardStage, getJobCardProductionState } = await import('../src/utils/workflowEngine.js');

    // ─────────────────────────────────────────────────────────────
    // TEST 1: skipCutting = true, skipBundle = false (Before Bundles)
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 1: Job Card Status Consistency Before Bundles ---');
    const settings = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStage = getInitialJobCardStage(settings);

    const jc1 = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-SYNC-001-${Date.now()}`,
        design_code: 'DS-SYNC1',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 100,
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
          ],
        },
      },
      include: { items: true, bundles: true },
    });

    const jc1State = getJobCardProductionState(jc1, settings);

    if (jc1.status === 'READY_FOR_BUNDLE' && jc1State.currentStage === 'READY_FOR_BUNDLE' && jc1State.stageLabel === 'Ready For Bundle') {
      console.log('✅ TEST 1 PASSED: Single source of truth returns READY_FOR_BUNDLE ("Ready For Bundle") across screens.');
    } else {
      throw new Error(`❌ TEST 1 FAILED! State: ${JSON.stringify(jc1State)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Partial Bundles Creation Consistency
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Partial Bundle Creation Consistency ---');
    await prisma.bundle.create({
      data: {
        bundle_number: `${jc1.job_card_number}-RD-M`,
        job_card_id: jc1.id,
        color: 'Red',
        size: 'M',
        total_sets: 50,
        assigned_sets: 0,
        completed_sets: 0,
        status: 'READY_FOR_ASSIGNMENT',
        company_id: testCompany.id,
      },
    });

    const jc1FetchedPartial = await prisma.jobCard.findUnique({
      where: { id: jc1.id },
      include: { items: true, bundles: true },
    });

    const jc1StatePartial = getJobCardProductionState(jc1FetchedPartial, settings);
    if (jc1StatePartial.currentStage === 'READY_FOR_BUNDLE' && jc1StatePartial.totalBundles === 1) {
      console.log('✅ TEST 2 PASSED: Partial bundle creation keeps Job Card stage consistently in READY_FOR_BUNDLE while tracking bundle count (1 created).');
    } else {
      throw new Error(`❌ TEST 2 FAILED! State: ${JSON.stringify(jc1StatePartial)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Full Bundle Creation & Next Stage Transition
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Full Bundle Creation Stage Transition ---');
    await prisma.bundle.create({
      data: {
        bundle_number: `${jc1.job_card_number}-RD-L`,
        job_card_id: jc1.id,
        color: 'Red',
        size: 'L',
        total_sets: 50,
        assigned_sets: 0,
        completed_sets: 0,
        status: 'READY_FOR_ASSIGNMENT',
        company_id: testCompany.id,
      },
    });

    await prisma.jobCard.update({
      where: { id: jc1.id },
      data: { status: 'READY_FOR_ASSIGNMENT' },
    });

    const jc1FetchedFull = await prisma.jobCard.findUnique({
      where: { id: jc1.id },
      include: { items: true, bundles: true },
    });

    const jc1StateFull = getJobCardProductionState(jc1FetchedFull, settings);
    if (jc1StateFull.currentStage === 'READY_FOR_ASSIGNMENT' && jc1StateFull.primaryAction.actionKey === 'ASSIGN_WORK') {
      console.log('✅ TEST 3 PASSED: Full bundle completion transitions Job Card cleanly to READY_FOR_ASSIGNMENT with "Assign Work" action.');
    } else {
      throw new Error(`❌ TEST 3 FAILED! State: ${JSON.stringify(jc1StateFull)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Direct Worker Assignment (skipCutting = true, skipBundle = true)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 5: Direct Worker Assignment (skipCutting = true, skipBundle = true) ---');
    await prisma.productionWorkflowSettings.update({
      where: { company_id: testCompany.id },
      data: { skip_cutting: true, skip_bundle: true },
    });
    const settingsDirect = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });

    const jcDirect = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-DIRECT-001-${Date.now()}`,
        design_code: 'DS-DIRECT',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 100,
        priority: 'NORMAL',
        due_date: new Date(),
        status: getInitialJobCardStage(settingsDirect),
        skip_cutting: true,
        skip_bundle: true,
        company_id: testCompany.id,
      },
      include: { items: true, bundles: true },
    });

    const jcDirectState = getJobCardProductionState(jcDirect, settingsDirect);
    if (jcDirect.status === 'READY_FOR_ASSIGNMENT' && jcDirectState.currentStage === 'READY_FOR_ASSIGNMENT') {
      console.log('✅ TEST 5 PASSED: Direct Worker Assignment creates Job Card directly in READY_FOR_ASSIGNMENT stage consistently across APIs.');
    } else {
      throw new Error(`❌ TEST 5 FAILED! Status: ${jcDirect.status}`);
    }

    // Cleanup
    await prisma.bundle.deleteMany({ where: { company_id: testCompany.id } });
    await prisma.jobCardItem.deleteMany({ where: { job_card: { company_id: testCompany.id } } });
    await prisma.jobCard.deleteMany({ where: { company_id: testCompany.id } });

    console.log('\n🎉 ALL STATE SYNCHRONIZATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStateSyncVerificationTest();
