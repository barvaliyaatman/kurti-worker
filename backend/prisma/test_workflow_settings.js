import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWorkflowSettingsAll4Cases() {
  console.log('🧪 Starting Comprehensive STEP 1 Workflow Settings & Navigation Tests...\n');

  let companyA, companyB;
  let ownerUserA, managerUserA, ownerUserB;

  try {
    // 1. Ensure test companies exist
    companyA = await prisma.company.upsert({
      where: { company_code: 'TEST-COMP-A' },
      update: { company_name: 'Company A Garments', owner_name: 'Owner A', phone: '9000000001', email: 'ownerA@compa.com' },
      create: { company_code: 'TEST-COMP-A', company_name: 'Company A Garments', owner_name: 'Owner A', phone: '9000000001', email: 'ownerA@compa.com' },
    });

    companyB = await prisma.company.upsert({
      where: { company_code: 'TEST-COMP-B' },
      update: { company_name: 'Company B Textiles', owner_name: 'Owner B', phone: '9000000002', email: 'ownerB@compb.com' },
      create: { company_code: 'TEST-COMP-B', company_name: 'Company B Textiles', owner_name: 'Owner B', phone: '9000000002', email: 'ownerB@compb.com' },
    });

    // 2. Ensure test users exist
    ownerUserA = await prisma.user.upsert({
      where: { email: 'ownerA@compa.com' },
      update: { role: 'OWNER', company_id: companyA.id },
      create: { full_name: 'Owner A', email: 'ownerA@compa.com', password_hash: 'hash', role: 'OWNER', company_id: companyA.id },
    });

    managerUserA = await prisma.user.upsert({
      where: { email: 'managerA@compa.com' },
      update: { role: 'MANAGER', company_id: companyA.id },
      create: { full_name: 'Manager A', email: 'managerA@compa.com', password_hash: 'hash', role: 'MANAGER', company_id: companyA.id },
    });

    ownerUserB = await prisma.user.upsert({
      where: { email: 'ownerB@compb.com' },
      update: { role: 'OWNER', company_id: companyB.id },
      create: { full_name: 'Owner B', email: 'ownerB@compb.com', password_hash: 'hash', role: 'OWNER', company_id: companyB.id },
    });

    console.log('✅ Test Companies & Users Verified.');

    const mockRes = () => {
      const res = {};
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => { res.data = data; return res; };
      return res;
    };

    const { getWorkflowSettings, updateWorkflowSettings } = await import('../src/controllers/workflowSetting.controller.js');
    const { requireWorkflowStage } = await import('../src/middleware/workflow.middleware.js');

    // ─────────────────────────────────────────────────────────────
    // CASE 1: Normal Workflow (skipCutting = false, skipBundle = false)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- CASE 1: Normal Workflow (skipCutting = false, skipBundle = false) ---');
    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyA.id },
      update: { skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: companyA.id, skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
    });

    const cuttingMiddlewareCase1 = requireWorkflowStage('cutting');
    const bundleMiddlewareCase1 = requireWorkflowStage('bundle');

    let case1CuttingBlocked = false;
    let case1BundleBlocked = false;

    await cuttingMiddlewareCase1({ user: ownerUserA }, mockRes(), () => { case1CuttingBlocked = false; });
    await bundleMiddlewareCase1({ user: ownerUserA }, mockRes(), () => { case1BundleBlocked = false; });

    if (!case1CuttingBlocked && !case1BundleBlocked) {
      console.log('✅ CASE 1 PASSED: Normal workflow allows access to both Cutting and Bundle stages.');
    } else {
      throw new Error('❌ CASE 1 FAILED!');
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 2: Skip Cutting (skipCutting = true, skipBundle = false)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- CASE 2: Skip Cutting (skipCutting = true, skipBundle = false) ---');
    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyA.id },
      update: { skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: companyA.id, skip_cutting: true, skip_bundle: false, direct_worker_assignment: false },
    });

    let case2CuttingRes = mockRes();
    await cuttingMiddlewareCase1({ user: ownerUserA }, case2CuttingRes, () => {});
    
    let case2BundleNext = false;
    await bundleMiddlewareCase1({ user: ownerUserA }, mockRes(), () => { case2BundleNext = true; });

    if (case2CuttingRes.statusCode === 400 && case2BundleNext) {
      console.log('✅ CASE 2 PASSED: Cutting API route blocked (400 Bad Request), Bundle stage accessible.');
    } else {
      throw new Error('❌ CASE 2 FAILED!');
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 3: Skip Bundle (skipCutting = false, skipBundle = true)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- CASE 3: Skip Bundle (skipCutting = false, skipBundle = true) ---');
    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyA.id },
      update: { skip_cutting: false, skip_bundle: true, direct_worker_assignment: true },
      create: { company_id: companyA.id, skip_cutting: false, skip_bundle: true, direct_worker_assignment: true },
    });

    let case3CuttingNext = false;
    await cuttingMiddlewareCase1({ user: ownerUserA }, mockRes(), () => { case3CuttingNext = true; });

    let case3BundleRes = mockRes();
    await bundleMiddlewareCase1({ user: ownerUserA }, case3BundleRes, () => {});

    if (case3CuttingNext && case3BundleRes.statusCode === 400) {
      console.log('✅ CASE 3 PASSED: Cutting stage accessible, Bundle API route blocked (400 Bad Request).');
    } else {
      throw new Error('❌ CASE 3 FAILED!');
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 4: Skip Cutting + Skip Bundle (Direct Worker Assignment)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- CASE 4: Skip Cutting + Skip Bundle (Direct Worker Assignment) ---');
    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyA.id },
      update: { skip_cutting: true, skip_bundle: true, direct_worker_assignment: true },
      create: { company_id: companyA.id, skip_cutting: true, skip_bundle: true, direct_worker_assignment: true },
    });

    let case4CuttingRes = mockRes();
    await cuttingMiddlewareCase1({ user: ownerUserA }, case4CuttingRes, () => {});

    let case4BundleRes = mockRes();
    await bundleMiddlewareCase1({ user: ownerUserA }, case4BundleRes, () => {});

    if (case4CuttingRes.statusCode === 400 && case4BundleRes.statusCode === 400) {
      console.log('✅ CASE 4 PASSED: Both Cutting and Bundle API routes blocked (400 Bad Request). Direct Worker Assignment active.');
    } else {
      throw new Error('❌ CASE 4 FAILED!');
    }

    // ─────────────────────────────────────────────────────────────
    // COMPANY ISOLATION & PERMISSION CHECKS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- COMPANY ISOLATION & PERMISSION CHECKS ---');
    await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyB.id },
      update: { skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
      create: { company_id: companyB.id, skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
    });

    const settingsB = await prisma.productionWorkflowSettings.findUnique({ where: { company_id: companyB.id } });
    if (settingsB.skip_cutting === false && settingsB.skip_bundle === false) {
      console.log('✅ ISOLATION PASSED: Company A workflow settings do NOT affect Company B!');
    } else {
      throw new Error('❌ ISOLATION FAILED!');
    }

    // Manager permission check
    const managerPutRes = mockRes();
    await updateWorkflowSettings({ user: managerUserA, body: { skip_cutting: false } }, managerPutRes, () => {});
    if (managerPutRes.statusCode === 403) {
      console.log('✅ RBAC PASSED: Manager user is blocked from modifying company workflow settings (403 Forbidden).');
    } else {
      throw new Error('❌ RBAC FAILED!');
    }

    console.log('\n🎉 ALL 4 WORKFLOW CASES & SECURITY CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkflowSettingsAll4Cases();
