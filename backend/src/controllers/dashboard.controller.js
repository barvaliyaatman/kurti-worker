import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCompanyFilter } from '../middleware/tenancy.middleware.js';

/**
 * GET /api/dashboard
 * Returns role-specific dashboard data with real database queries.
 */
export const getDashboardData = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || 'OWNER').toUpperCase();

    if (userRole === 'CUTTING_MASTER') {
      return getCuttingMasterDashboard(req, res);
    }

    if (userRole === 'MANAGER') {
      return getManagerDashboard(req, res);
    }

    return getOwnerDashboard(req, res);
  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// OWNER DASHBOARD – Full factory overview & business monitoring
// ─────────────────────────────────────────────────────────────
async function getOwnerDashboard(req, res) {
  const companyFilter = getCompanyFilter(req.user);
  const companyId = req.user.company_id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Batch 1: Core counts (5 queries) – scoped to company
  const [totalEmployees, activeJobCards, readyForCutting, cuttingInProgress, cuttingCompleted] =
    await Promise.all([
      prisma.employee.count({ where: { is_deleted: false, ...companyFilter } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: { not: 'CUTTING_COMPLETED' }, ...companyFilter } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: 'READY_FOR_CUTTING', ...companyFilter } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_IN_PROGRESS', ...companyFilter } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_COMPLETED', ...companyFilter } }),
    ]);

  // Batch 2: Bundle counts + salary aggregations (5 queries) – scoped to company
  const [totalBundles, pendingBundles, completedBundles, allPaymentsThisMonth, allAdvancesThisMonth] =
    await Promise.all([
      prisma.bundle.count({ where: { is_deleted: false, ...companyFilter } }),
      prisma.bundle.count({ where: { is_deleted: false, status: 'READY_FOR_ASSIGNMENT', ...companyFilter } }),
      prisma.bundle.count({ where: { is_deleted: false, status: 'COMPLETED', ...companyFilter } }),
      prisma.employeePayment.aggregate({
        _sum: { amount: true },
        where: { payment_date: { gte: startOfMonth }, ...companyFilter },
      }),
      prisma.employeeAdvance.aggregate({
        _sum: { amount: true },
        where: { advance_date: { gte: startOfMonth }, ...companyFilter },
      }),
    ]);

  // Batch 3: Tables + Charts + User counts – scoped to company
  const [recentJobCards, recentPayments, recentNotifications, jobCardStatusCounts, salaryTotals, totalAdvanceAll, totalManagers, totalCuttingMasters, recentUsers] =
    await Promise.all([
      prisma.jobCard.findMany({
        where: { is_deleted: false, ...companyFilter },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true, job_card_number: true, design_code: true, total_quantity: true,
          priority: true, status: true, due_date: true, created_at: true,
        },
      }),
      prisma.employeePayment.findMany({
        where: companyFilter,
        orderBy: { payment_date: 'desc' },
        take: 5,
        include: { employee: { select: { employee_name: true, employee_code: true } } },
      }),
      prisma.notification.findMany({
        where: { user_role: { in: ['ALL', 'OWNER'] }, ...companyFilter },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.jobCard.groupBy({
        by: ['status'],
        where: { is_deleted: false, ...companyFilter },
        _count: { id: true },
      }),
      // Total salary paid (all time, company-scoped)
      prisma.employeePayment.aggregate({ _sum: { amount: true }, where: companyFilter }),
      // Total advances (all time, company-scoped)
      prisma.employeeAdvance.aggregate({ _sum: { amount: true }, where: companyFilter }),
      // User management counts for company
      prisma.user.count({ where: { role: 'MANAGER', is_deleted: false, company_id: companyId || null } }),
      prisma.user.count({ where: { role: 'CUTTING_MASTER', is_deleted: false, company_id: companyId || null } }),
      prisma.user.findMany({
        where: { role: { in: ['MANAGER', 'CUTTING_MASTER'] }, is_deleted: false, company_id: companyId || null },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: { id: true, full_name: true, email: true, role: true, status: true, created_at: true },
      }),
    ]);

  // Batch 4: grossStats, monthlyProduction, salaryTrend in parallel – scoped to company
  const [grossStats, monthlyProduction, salaryTrend] = await Promise.all([
    prisma.assignment.aggregate({
      _sum: { completed_sets: true },
      _avg: { stitching_rate: true },
      where: { is_deleted: false, completed_sets: { gt: 0 }, ...companyFilter },
    }),
    getMonthlyProductionData(companyFilter),
    getMonthlySalaryTrend(companyFilter),
  ]);

  const totalGrossEarned = (grossStats._sum.completed_sets || 0) * (grossStats._avg.stitching_rate || 110);
  const totalPaid = salaryTotals._sum.amount || 0;
  const totalAdvGiven = totalAdvanceAll._sum.amount || 0;
  const pendingSalary = Math.max(0, totalGrossEarned - totalAdvGiven - totalPaid);

  return ApiResponse.success({
    res,
    statusCode: 200,
    message: 'Owner dashboard retrieved successfully.',
    data: {
      role: 'OWNER',
      metrics: {
        totalEmployees,
        activeJobCards,
        readyForCutting,
        cuttingInProgress,
        cuttingCompleted,
        totalBundles,
        pendingBundles,
        completedBundles,
        totalSalaryThisMonth: allPaymentsThisMonth._sum.amount || 0,
        totalAdvanceThisMonth: allAdvancesThisMonth._sum.amount || 0,
        totalSalaryPaid: totalPaid,
        pendingSalary,
        totalManagers,
        totalCuttingMasters,
      },
      charts: {
        jobCardStatusDistribution: jobCardStatusCounts.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        monthlyProduction,
        salaryTrend,
      },
      recentJobCards,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        employee_name: p.employee?.employee_name || 'Unknown',
        employee_code: p.employee?.employee_code || '',
        amount: p.amount,
        payment_mode: p.payment_mode,
        reference_no: p.reference_no,
        payment_date: p.payment_date,
      })),
      recentNotifications,
      recentUsers,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// MANAGER DASHBOARD – Daily production management
// ─────────────────────────────────────────────────────────────
async function getManagerDashboard(req, res) {
  const companyFilter = getCompanyFilter(req.user);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Batch 1: Metrics (5 queries) – scoped to company
  const [cuttingCompletedCards, bundlesWaiting, activeAssignments, completedToday, pendingWork] =
    await Promise.all([
      prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_COMPLETED', ...companyFilter } }),
      prisma.bundle.count({ where: { is_deleted: false, status: 'READY_FOR_ASSIGNMENT', ...companyFilter } }),
      prisma.assignment.count({
        where: { is_deleted: false, status: { in: ['ASSIGNED', 'IN_PROGRESS'] }, ...companyFilter },
      }),
      prisma.assignment.count({
        where: {
          is_deleted: false, status: 'COMPLETED',
          updated_at: { gte: todayStart, lte: todayEnd },
          ...companyFilter,
        },
      }),
      prisma.assignment.count({
        where: { is_deleted: false, status: { in: ['ASSIGNED', 'IN_PROGRESS', 'SALARY_PENDING'] }, ...companyFilter },
      }),
    ]);

  // Batch 2: Salary + Tables (4 queries) – scoped to company
  const [todaysSalaryPaid, todaysAssignments, recentlyCompletedBundles, workersWithPendingWork] =
    await Promise.all([
      prisma.employeePayment.aggregate({
        _sum: { amount: true },
        where: { payment_date: { gte: todayStart, lte: todayEnd }, ...companyFilter },
      }),
      prisma.assignment.findMany({
        where: { is_deleted: false, created_at: { gte: todayStart, lte: todayEnd }, ...companyFilter },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: {
          employee: { select: { employee_name: true, employee_code: true } },
          bundle: {
            select: {
              bundle_number: true, color: true, size: true,
              job_card: { select: { job_card_number: true, design_code: true } },
            },
          },
        },
      }),
      prisma.bundle.findMany({
        where: { is_deleted: false, status: 'COMPLETED', ...companyFilter },
        orderBy: { updated_at: 'desc' },
        take: 5,
        include: { job_card: { select: { job_card_number: true, design_code: true } } },
      }),
      prisma.assignment.findMany({
        where: { is_deleted: false, status: { in: ['ASSIGNED', 'IN_PROGRESS'] }, ...companyFilter },
        orderBy: { created_at: 'asc' },
        take: 10,
        include: {
          employee: { select: { employee_name: true, employee_code: true } },
          bundle: {
            select: {
              bundle_number: true, color: true, size: true,
              job_card: { select: { job_card_number: true } },
            },
          },
        },
      }),
    ]);

  return ApiResponse.success({
    res,
    statusCode: 200,
    message: 'Manager dashboard retrieved successfully.',
    data: {
      role: 'MANAGER',
      metrics: {
        cuttingCompletedCards,
        bundlesWaiting,
        activeAssignments,
        completedToday,
        pendingWork,
        todaysSalaryPaid: todaysSalaryPaid._sum.amount || 0,
      },
      todaysAssignments: todaysAssignments.map((a) => ({
        id: a.id,
        employee_name: a.employee?.employee_name || 'N/A',
        employee_code: a.employee?.employee_code || '',
        bundle_number: a.bundle?.bundle_number || '',
        job_card_number: a.bundle?.job_card?.job_card_number || '',
        design_code: a.bundle?.job_card?.design_code || '',
        color: a.bundle?.color || '',
        size: a.bundle?.size || '',
        assigned_sets: a.assigned_sets,
        completed_sets: a.completed_sets,
        status: a.status,
        created_at: a.created_at,
      })),
      recentlyCompletedBundles: recentlyCompletedBundles.map((b) => ({
        id: b.id,
        bundle_number: b.bundle_number,
        job_card_number: b.job_card?.job_card_number || '',
        design_code: b.job_card?.design_code || '',
        color: b.color,
        size: b.size,
        total_sets: b.total_sets,
        completed_sets: b.completed_sets,
        updated_at: b.updated_at,
      })),
      workersWithPendingWork: workersWithPendingWork.map((a) => ({
        id: a.id,
        employee_name: a.employee?.employee_name || 'N/A',
        employee_code: a.employee?.employee_code || '',
        bundle_number: a.bundle?.bundle_number || '',
        job_card_number: a.bundle?.job_card?.job_card_number || '',
        color: a.bundle?.color || '',
        size: a.bundle?.size || '',
        assigned_sets: a.assigned_sets,
        completed_sets: a.completed_sets,
        pending_sets: a.assigned_sets - a.completed_sets,
        status: a.status,
      })),
    },
  });
}

// ─────────────────────────────────────────────────────────────
// CUTTING MASTER DASHBOARD – Daily cutting operations
// ─────────────────────────────────────────────────────────────
async function getCuttingMasterDashboard(req, res) {
  const companyFilter = getCompanyFilter(req.user);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Batch 1: Counts (4 queries) – scoped to company
  const [readyForCutting, cuttingInProgress, completedToday, pendingCutting] = await Promise.all([
    prisma.jobCard.count({ where: { is_deleted: false, status: 'READY_FOR_CUTTING', ...companyFilter } }),
    prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_IN_PROGRESS', ...companyFilter } }),
    prisma.jobCard.count({
      where: {
        is_deleted: false, status: 'CUTTING_COMPLETED',
        updated_at: { gte: todayStart, lte: todayEnd },
        ...companyFilter,
      },
    }),
    prisma.jobCard.count({
      where: { is_deleted: false, status: { in: ['READY_FOR_CUTTING', 'CUTTING_IN_PROGRESS'] }, ...companyFilter },
    }),
  ]);

  // Batch 2: Tables (2 queries) – scoped to company
  const [readyJobCards, recentlyCompletedCutting] = await Promise.all([
    prisma.jobCard.findMany({
      where: { is_deleted: false, status: 'READY_FOR_CUTTING', ...companyFilter },
      orderBy: [{ priority: 'desc' }, { due_date: 'asc' }],
      take: 10,
      select: {
        id: true, job_card_number: true, design_code: true, components: true,
        total_quantity: true, priority: true, due_date: true, created_at: true,
      },
    }),
    prisma.jobCard.findMany({
      where: { is_deleted: false, status: 'CUTTING_COMPLETED', ...companyFilter },
      orderBy: { updated_at: 'desc' },
      take: 5,
      select: {
        id: true, job_card_number: true, design_code: true,
        total_quantity: true, priority: true, updated_at: true,
      },
    }),
  ]);

  return ApiResponse.success({
    res,
    statusCode: 200,
    message: 'Cutting Master dashboard retrieved successfully.',
    data: {
      role: 'CUTTING_MASTER',
      metrics: { readyForCutting, cuttingInProgress, completedToday, pendingCutting },
      readyJobCards,
      recentlyCompletedCutting,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// HELPER: Monthly production data (last 6 months) – scoped to company
// ─────────────────────────────────────────────────────────────
async function getMonthlyProductionData(companyFilter = {}) {
  const months = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

  // Fetch all assignments completed in the range in one query
  const assignments = await prisma.assignment.findMany({
    where: {
      is_deleted: false,
      status: { in: ['COMPLETED', 'SALARY_PENDING'] },
      updated_at: { gte: sixMonthsAgo },
      ...companyFilter,
    },
    select: { completed_sets: true, updated_at: true }
  });

  const jobCards = await prisma.jobCard.findMany({
    where: {
      is_deleted: false,
      created_at: { gte: sixMonthsAgo },
      ...companyFilter,
    },
    select: { created_at: true }
  });

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const label = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const completedPieces = assignments
      .filter(a => a.updated_at >= monthStart && a.updated_at <= monthEnd)
      .reduce((sum, a) => sum + (a.completed_sets || 0), 0);

    const jobCardsCreated = jobCards
      .filter(jc => jc.created_at >= monthStart && jc.created_at <= monthEnd)
      .length;

    months.push({
      month: label,
      completedPieces,
      jobCardsCreated,
    });
  }

  return months;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Monthly salary trend (last 6 months) – in-memory aggregation
// ─────────────────────────────────────────────────────────────
async function getMonthlySalaryTrend(companyFilter = {}) {
  const months = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

  const payments = await prisma.employeePayment.findMany({
    where: { payment_date: { gte: sixMonthsAgo }, ...companyFilter },
    select: { amount: true, payment_date: true }
  });

  const advances = await prisma.employeeAdvance.findMany({
    where: { advance_date: { gte: sixMonthsAgo }, ...companyFilter },
    select: { amount: true, advance_date: true }
  });

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const label = monthStart.toLocaleDateString('en-US', { month: 'short' });

    const paid = payments
      .filter(p => p.payment_date >= monthStart && p.payment_date <= monthEnd)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const advanced = advances
      .filter(a => a.advance_date >= monthStart && a.advance_date <= monthEnd)
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    months.push({
      month: label,
      paid,
      advanced,
    });
  }

  return months;
}
