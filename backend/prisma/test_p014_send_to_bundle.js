import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSendToBundleWorkflowTest() {
  console.log('🧪 Starting Comprehensive Initial Stage & Workflow Snapshot Tests...\n');

  let testCompany;

  try {
    // 1. Setup Test Company with skipCutting = true, skipBundle = false
    testCompany = await prisma.company.upsert({
      where: { company_code: 'TEST-STAGE-CO' },
      update: {},
      create: {
        company_code: 'TEST-STAGE-CO',
        company_name: 'Stage Test Factory',
        owner_name: 'Stage Owner',
        phone: '9999988888',
        email: 'stageowner@test.com',
      },
    });

    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: testCompany.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: testCompany.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    const { getInitialJobCardStage, getJobCardPrimaryAction } = await import('../src/utils/workflowEngine.js');
    const { ensureBundlesGeneratedForJobCard } = await import('../src/utils/bundleHelper.js');

    // ─────────────────────────────────────────────────────────────
    // TEST 1: skipCutting = ON, skipBundle = OFF
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 1: skipCutting = ON, skipBundle = OFF ---');
    const settingsCase1 = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStageCase1 = getInitialJobCardStage(settingsCase1);

    const jc1 = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-001-${Date.now()}`,
        design_code: 'DS-001',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 100,
        priority: 'NORMAL',
        due_date: new Date(),
        status: initialStageCase1,
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
    });

    if (jc1.status === 'READY_FOR_BUNDLE') {
      console.log('✅ TEST 1 PASSED: JC-001 created directly with DB status READY_FOR_BUNDLE.');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Status: ${jc1.status}`);
    }

    const actionCase1 = getJobCardPrimaryAction(settingsCase1, jc1);
    if (actionCase1.actionKey === 'OPEN_BUNDLE' && actionCase1.label === 'Create Bundle') {
      console.log('✅ TEST 1 PASSED: Action is "Create Bundle" opening workspace directly (No duplicate Send to Bundle transition).');
    } else {
      throw new Error(`❌ TEST 1 FAILED! Action: ${JSON.stringify(actionCase1)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: skipCutting = OFF, skipBundle = OFF
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: skipCutting = OFF, skipBundle = OFF ---');
    await prisma.productionWorkflowSettings.update({
      where: { company_id: testCompany.id },
      data: { skip_cutting: false, skip_bundle: false },
    });
    const settingsCase2 = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStageCase2 = getInitialJobCardStage(settingsCase2);

    const jc2 = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-002-${Date.now()}`,
        design_code: 'DS-002',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 100,
        priority: 'NORMAL',
        due_date: new Date(),
        status: initialStageCase2,
        skip_cutting: false,
        skip_bundle: false,
        company_id: testCompany.id,
      },
    });

    if (jc2.status === 'READY_FOR_CUTTING') {
      console.log('✅ TEST 2 PASSED: JC-002 created with DB status READY_FOR_CUTTING.');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Status: ${jc2.status}`);
    }

    const actionCase2 = getJobCardPrimaryAction(settingsCase2, jc2);
    if (actionCase2.actionKey === 'SEND_TO_CUTTING' && actionCase2.label === 'Send to Cutting') {
      console.log('✅ TEST 2 PASSED: Action is "Send to Cutting".');
    } else {
      throw new Error(`❌ TEST 2 FAILED! Action: ${JSON.stringify(actionCase2)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: skipCutting = ON, skipBundle = ON
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: skipCutting = ON, skipBundle = ON ---');
    await prisma.productionWorkflowSettings.update({
      where: { company_id: testCompany.id },
      data: { skip_cutting: true, skip_bundle: true, direct_worker_assignment: true },
    });
    const settingsCase3 = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });
    const initialStageCase3 = getInitialJobCardStage(settingsCase3);

    const jc3 = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-003-${Date.now()}`,
        design_code: 'DS-003',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 100,
        priority: 'NORMAL',
        due_date: new Date(),
        status: initialStageCase3,
        skip_cutting: true,
        skip_bundle: true,
        company_id: testCompany.id,
      },
    });

    if (jc3.status === 'READY_FOR_ASSIGNMENT') {
      console.log('✅ TEST 3 PASSED: JC-003 created with DB status READY_FOR_ASSIGNMENT.');
    } else {
      throw new Error(`❌ TEST 3 FAILED! Status: ${jc3.status}`);
    }

    const actionCase3 = getJobCardPrimaryAction(settingsCase3, jc3);
    if (actionCase3.actionKey === 'ASSIGN_WORK' && actionCase3.label === 'Assign Work') {
      console.log('✅ TEST 3 PASSED: Action is "Assign Work" (No Cutting, No Bundle).');
    } else {
      throw new Error(`❌ TEST 3 FAILED! Action: ${JSON.stringify(actionCase3)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Workflow Snapshot Persistence & New Job Card Differentiation
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 4: Workflow Snapshot Persistence ---');
    // Change company settings to skipCutting = false, skipBundle = false
    await prisma.productionWorkflowSettings.update({
      where: { company_id: testCompany.id },
      data: { skip_cutting: false, skip_bundle: false },
    });
    const settingsNewDefault = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: testCompany.id } });

    // Existing JC-001 was created when skipCutting = true. Check its action with new company settings
    const jc1Fetched = await prisma.jobCard.findUnique({ where: { id: jc1.id } });
    const actionJC1NewCompanySettings = getJobCardPrimaryAction(settingsNewDefault, jc1Fetched);

    if (jc1Fetched.status === 'READY_FOR_BUNDLE' && actionJC1NewCompanySettings.actionKey === 'OPEN_BUNDLE') {
      console.log('✅ TEST 4 PASSED: Existing JC-001 retained its READY_FOR_BUNDLE status and "Create Bundle" action!');
    } else {
      throw new Error(`❌ TEST 4 FAILED! Status: ${jc1Fetched.status}, Action: ${JSON.stringify(actionJC1NewCompanySettings)}`);
    }

    // New JC-005 created under new company default workflow
    const initialStageJC5 = getInitialJobCardStage(settingsNewDefault);
    const jc5 = await prisma.jobCard.create({
      data: {
        job_card_number: `JC-005-${Date.now()}`,
        design_code: 'DS-005',
        components: 'Top,Pant',
        stitching_rate: 110.0,
        total_quantity: 100,
        priority: 'NORMAL',
        due_date: new Date(),
        status: initialStageJC5,
        skip_cutting: false,
        skip_bundle: false,
        company_id: testCompany.id,
      },
    });

    if (jc5.status === 'READY_FOR_CUTTING') {
      console.log('✅ TEST 4 PASSED: New JC-005 correctly starts in READY_FOR_CUTTING stage under new company default settings.');
    } else {
      throw new Error(`❌ TEST 4 FAILED! JC-005 Status: ${jc5.status}`);
    }

    // Cleanup
    await prisma.jobCardItem.deleteMany({ where: { job_card: { company_id: testCompany.id } } });
    await prisma.jobCard.deleteMany({ where: { company_id: testCompany.id } });

    console.log('\n🎉 ALL INITIAL STAGE & WORKFLOW SNAPSHOT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSendToBundleWorkflowTest();
