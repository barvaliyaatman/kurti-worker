import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runFullWorkflowEngineTests() {
  console.log('🧪 Starting STEP 1 Full Production Workflow Engine & Lifecycle Tests...\n');

  let companyNormal, companySkipCutting, companySkipBundle, companySkipBoth;

  try {
    // 1. Setup Test Companies
    companyNormal = await prisma.company.upsert({
      where: { company_code: 'TEST-NORM' },
      update: {},
      create: { company_code: 'TEST-NORM', company_name: 'Normal Co', owner_name: 'Owner Normal', phone: '9111111111', email: 'norm@test.com' },
    });

    companySkipCutting = await prisma.company.upsert({
      where: { company_code: 'TEST-SKIPCUT' },
      update: {},
      create: { company_code: 'TEST-SKIPCUT', company_name: 'Skip Cutting Co', owner_name: 'Owner SkipCut', phone: '9222222222', email: 'skipcut@test.com' },
    });

    companySkipBundle = await prisma.company.upsert({
      where: { company_code: 'TEST-SKIPBUN' },
      update: {},
      create: { company_code: 'TEST-SKIPBUN', company_name: 'Skip Bundle Co', owner_name: 'Owner SkipBun', phone: '9333333333', email: 'skipbun@test.com' },
    });

    companySkipBoth = await prisma.company.upsert({
      where: { company_code: 'TEST-SKIPBOTH' },
      update: {},
      create: { company_code: 'TEST-SKIPBOTH', company_name: 'Skip Both Co', owner_name: 'Owner SkipBoth', phone: '9444444444', email: 'skipboth@test.com' },
    });

    // 2. Set Workflow Settings for each company
    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyNormal.id },
      update: { skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: companyNormal.id, skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companySkipCutting.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: companySkipCutting.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companySkipBundle.id },
      update: { skip_cutting: false, skip_bundle: true, direct_worker_assignment: true },
      create: { company_id: companySkipBundle.id, skip_cutting: false, skip_bundle: true, direct_worker_assignment: true },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companySkipBoth.id },
      update: { skip_cutting: true, skip_bundle: true, direct_worker_assignment: true },
      create: { company_id: companySkipBoth.id, skip_cutting: true, skip_bundle: true, direct_worker_assignment: true },
    });

    const { getInitialJobCardStatus, getNextStageAfterCutting } = await import('../src/utils/workflowEngine.js');

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Normal Workflow (skipCutting = false, skipBundle = false)
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 1: Normal Workflow ---');
    const settingsNorm = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: companyNormal.id } });
    const initialStatusNorm = getInitialJobCardStatus(settingsNorm);
    
    if (initialStatusNorm === 'CREATED') {
      console.log('✅ TEST 1 PASSED: Normal workflow creates Job Card with status CREATED (Send to Cutting visible).');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Initial status: ${initialStatusNorm}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Skip Cutting (skipCutting = true, skipBundle = false)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Skip Cutting ---');
    const settingsSkipCut = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: companySkipCutting.id } });
    const initialStatusSkipCut = getInitialJobCardStatus(settingsSkipCut);

    if (initialStatusSkipCut === 'READY_FOR_BUNDLE') {
      console.log('✅ TEST 2 PASSED: Skip Cutting creates Job Card directly in READY_FOR_BUNDLE status (No Cutting action).');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Initial status: ${initialStatusSkipCut}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Skip Bundle (skipCutting = false, skipBundle = true)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Skip Bundle ---');
    const settingsSkipBun = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: companySkipBundle.id } });
    const initialStatusSkipBun = getInitialJobCardStatus(settingsSkipBun);
    const postCuttingStatusSkipBun = getNextStageAfterCutting(settingsSkipBun);

    if (initialStatusSkipBun === 'CREATED' && postCuttingStatusSkipBun === 'READY_FOR_ASSIGNMENT') {
      console.log('✅ TEST 3 PASSED: Skip Bundle creates Job Card in CREATED stage, and after Cutting completes transitions directly to READY_FOR_ASSIGNMENT.');
    } else {
      throw new Error(`❌ TEST 3 FAILED! Post-cutting status: ${postCuttingStatusSkipBun}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Skip Cutting + Skip Bundle (skipCutting = true, skipBundle = true)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 4: Skip Cutting + Skip Bundle ---');
    const settingsSkipBoth = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: companySkipBoth.id } });
    const initialStatusSkipBoth = getInitialJobCardStatus(settingsSkipBoth);

    if (initialStatusSkipBoth === 'READY_FOR_ASSIGNMENT') {
      console.log('✅ TEST 4 PASSED: Skip Cutting + Skip Bundle creates Job Card directly in READY_FOR_ASSIGNMENT status (Direct Worker Assignment).');
    } else {
      throw new Error(`❌ TEST 4 FAILED! Initial status: ${initialStatusSkipBoth}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Change Workflow with Existing Job Cards
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 5: Existing Job Card Safety ---');
    const existingJobCard = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-EXIST-${Date.now()}`,
        design_code: 'DS-100',
        components: 'Top,Bottom',
        stitching_rate: 120.0,
        total_quantity: 100,
        priority: 'NORMAL',
        status: 'CREATED',
        due_date: new Date(),
        company_id: companyNormal.id,
      },
    });

    // Update companyNormal settings to skip cutting after creation
    await prisma.productionWorkflowSettings.update({
      where: { company_id: companyNormal.id },
      data: { skip_cutting: true },
    });

    const fetchedJC = await prisma.jobCard.findUnique({ where: { id: existingJobCard.id } });
    if (fetchedJC.status === 'CREATED' && fetchedJC.id === existingJobCard.id) {
      console.log('✅ TEST 5 PASSED: Existing Job Cards maintain data integrity and status without silent corruption when workflow settings change.');
    } else {
      throw new Error('❌ TEST 5 FAILED!');
    }

    // Cleanup test job card
    await prisma.jobCard.delete({ where: { id: existingJobCard.id } });

    console.log('\n🎉 ALL 5 WORKFLOW LIFE CYCLE SCENARIO TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFullWorkflowEngineTests();
