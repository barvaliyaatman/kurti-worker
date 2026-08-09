import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runDeterministicPerJobCardActivationTest() {
  console.log('🧪 Starting Per-Job-Card Bundle Activation & Assignment Filtering Tests...\n');

  let testCompany;

  try {
    // Setup Test Company
    testCompany = await prisma.company.upsert({
      where: { company_code: 'TEST-PER-JC-CO' },
      update: {},
      create: {
        company_code: 'TEST-PER-JC-CO',
        company_name: 'Per JC Test Factory',
        owner_name: 'Per JC Owner',
        phone: '9444433333',
        email: 'perjc@test.com',
      },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: testCompany.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: testCompany.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    const { getInitialJobCardStage, getJobCardPrimaryAction } = await import('../src/utils/workflowEngine.js');
    const { ensureBundlesGeneratedForJobCard } = await import('../src/utils/bundleHelper.js');

    const settings = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStage = getInitialJobCardStage(settings);

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Create JC-A, JC-B, JC-C (Initial State)
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 1: Initial State (JC-A, JC-B, JC-C created in READY_FOR_BUNDLE) ---');
    const createCardData = (num) => ({
      job_card_number: `JC-PER-${num}-${Date.now()}`,
      design_code: `DS-${num}`,
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
    });

    const jcA = await prisma.jobCard.create({ data: createCardData('A'), include: { items: true, bundles: true } });
    const jcB = await prisma.jobCard.create({ data: createCardData('B'), include: { items: true, bundles: true } });
    const jcC = await prisma.jobCard.create({ data: createCardData('C'), include: { items: true, bundles: true } });

    // Verify all show action [Create Bundle]
    const actionA = getJobCardPrimaryAction(settings, jcA);
    const actionB = getJobCardPrimaryAction(settings, jcB);
    const actionC = getJobCardPrimaryAction(settings, jcC);

    if (actionA.label === 'Create Bundle' && actionB.label === 'Create Bundle' && actionC.label === 'Create Bundle') {
      console.log('✅ TEST 1 PASSED: JC-A, JC-B, JC-C all show action [Create Bundle].');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Actions: A=${actionA.label}, B=${actionB.label}, C=${actionC.label}`);
    }

    // Verify Work Assignment queue is EMPTY
    const assignmentQueueInitial = await prisma.jobCard.findMany({
      where: {
        company_id: testCompany.id,
        is_deleted: false,
        OR: [
          { bundles: { some: {} } },
          { AND: [{ skip_bundle: true }, { status: 'READY_FOR_ASSIGNMENT' }] },
        ],
      },
    });

    if (assignmentQueueInitial.length === 0) {
      console.log('✅ TEST 1 PASSED: Work Assignment Queue is EMPTY before any bundle creation.');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Assignment queue returned ${assignmentQueueInitial.length} items.`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Click Create Bundle ONLY on JC-A
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Click Create Bundle ONLY on JC-A ---');
    const updatedJCA = await ensureBundlesGeneratedForJobCard(jcA.id);

    // Re-fetch JC-B and JC-C to ensure they remain untouched
    const jcBAfterA = await prisma.jobCard.findUnique({ where: { id: jcB.id }, include: { bundles: true } });
    const jcCAfterA = await prisma.jobCard.findUnique({ where: { id: jcC.id }, include: { bundles: true } });

    const actionAAfter = getJobCardPrimaryAction(settings, updatedJCA);
    const actionBAfter = getJobCardPrimaryAction(settings, jcBAfterA);
    const actionCAfter = getJobCardPrimaryAction(settings, jcCAfterA);

    if (actionAAfter.label !== 'Create Bundle' && actionBAfter.label === 'Create Bundle' && actionCAfter.label === 'Create Bundle') {
      console.log('✅ TEST 2 PASSED: JC-A [Create Bundle] button is gone; JC-B and JC-C retain [Create Bundle] button.');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Actions after JC-A activation: A=${actionAAfter.label}, B=${actionBAfter.label}, C=${actionCAfter.label}`);
    }

    // Verify Assignment Queue returns ONLY JC-A
    const assignmentQueueAfterA = await prisma.jobCard.findMany({
      where: {
        company_id: testCompany.id,
        is_deleted: false,
        OR: [
          { bundles: { some: {} } },
          { AND: [{ skip_bundle: true }, { status: 'READY_FOR_ASSIGNMENT' }] },
        ],
      },
    });

    if (assignmentQueueAfterA.length === 1 && assignmentQueueAfterA[0].id === jcA.id) {
      console.log('✅ TEST 2 PASSED: Work Assignment Queue returns JC-A ONLY. JC-B and JC-C are NOT visible.');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Queue items returned: ${assignmentQueueAfterA.map(j => j.job_card_number)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Browser Refresh Simulation (Persistence)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Browser Refresh / Re-fetch Persistence ---');
    const jcAFetchedRefreshed = await prisma.jobCard.findUnique({ where: { id: jcA.id }, include: { bundles: true } });
    const actionARefreshed = getJobCardPrimaryAction(settings, jcAFetchedRefreshed);

    if (actionARefreshed.label !== 'Create Bundle') {
      console.log(`✅ TEST 3 PASSED: State persisted in DB! JC-A action is [${actionARefreshed.label}] (Create Bundle does NOT return after refresh).`);
    } else {
      throw new Error('❌ TEST 3 FAILED! Create Bundle returned after refresh.');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Click Create Bundle for JC-B
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 4: Click Create Bundle for JC-B ---');
    await ensureBundlesGeneratedForJobCard(jcB.id);

    const assignmentQueueAfterB = await prisma.jobCard.findMany({
      where: {
        company_id: testCompany.id,
        is_deleted: false,
        OR: [
          { bundles: { some: {} } },
          { AND: [{ skip_bundle: true }, { status: 'READY_FOR_ASSIGNMENT' }] },
        ],
      },
    });

    const returnedIds = assignmentQueueAfterB.map((j) => j.id);
    if (returnedIds.includes(jcA.id) && returnedIds.includes(jcB.id) && !returnedIds.includes(jcC.id)) {
      console.log('✅ TEST 4 PASSED: Work Assignment Queue now shows JC-A and JC-B. JC-C STILL DOES NOT APPEAR.');
    } else {
      throw new Error(`❌ TEST 4 FAILED! Returned IDs: ${returnedIds}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Duplicate Creation Backend Protection for JC-A
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 5: Duplicate Creation Rejection for JC-A ---');
    const duplicateJC = await ensureBundlesGeneratedForJobCard(jcA.id);
    if (duplicateJC.bundles.length === 2) {
      console.log('✅ TEST 5 PASSED: Backend safely rejected duplicate bundle generation; bundle count remains 2.');
    } else {
      throw new Error(`❌ TEST 5 FAILED! Duplicate bundles created: ${duplicateJC.bundles.length}`);
    }

    // Cleanup
    await prisma.bundle.deleteMany({ where: { company_id: testCompany.id } });
    await prisma.jobCardItem.deleteMany({ where: { job_card: { company_id: testCompany.id } } });
    await prisma.jobCard.deleteMany({ where: { company_id: testCompany.id } });

    console.log('\n🎉 ALL PER-JOB-CARD BUNDLE ACTIVATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDeterministicPerJobCardActivationTest();
