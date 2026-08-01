import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

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
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Batch 1: Core counts (5 queries)
  const [totalEmployees, activeJobCards, readyForCutting, cuttingInProgress, cuttingCompleted] =
    await Promise.all([
      prisma.employee.count({ where: { is_deleted: false } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: { not: 'CUTTING_COMPLETED' } } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: 'READY_FOR_CUTTING' } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_IN_PROGRESS' } }),
      prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_COMPLETED' } }),
    ]);

  // Batch 2: Bundle counts + salary aggregations (5 queries)
  const [totalBundles, pendingBundles, completedBundles, allPaymentsThisMonth, allAdvancesThisMonth] =
    await Promise.all([
      prisma.bundle.count({ where: { is_deleted: false } }),
      prisma.bundle.count({ where: { is_deleted: false, status: 'READY_FOR_ASSIGNMENT' } }),
      prisma.bundle.count({ where: { is_deleted: false, status: 'COMPLETED' } }),
      prisma.employeePayment.aggregate({
        _sum: { amount: true },
        where: { payment_date: { gte: startOfMonth } },
      }),
      prisma.employeeAdvance.aggregate({
        _sum: { amount: true },
        where: { advance_date: { gte: startOfMonth } },
      }),
    ]);

  // Batch 3: Tables + Charts (5 queries)
  const [recentJobCards, recentPayments, recentNotifications, jobCardStatusCounts, salaryTotals] =
    await Promise.all([
      prisma.jobCard.findMany({
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true, job_card_number: true, design_code: true, total_quantity: true,
          priority: true, status: true, due_date: true, created_at: true,
        },
      }),
      prisma.employeePayment.findMany({
        orderBy: { payment_date: 'desc' },
        take: 5,
        include: { employee: { select: { employee_name: true, employee_code: true } } },
      }),
      prisma.notification.findMany({
        where: { user_role: { in: ['ALL', 'OWNER'] } },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.jobCard.groupBy({
        by: ['status'],
        where: { is_deleted: false },
        _count: { id: true },
      }),
      // Total salary paid (all time)
      prisma.employeePayment.aggregate({ _sum: { amount: true } }),
    ]);

  // Compute gross earned from assignments (sequential – single query)
  const grossData = await prisma.assignment.aggregate({
    _sum: { completed_sets: true },
    where: { is_deleted: false, completed_sets: { gt: 0 } },
  });

  // Get avg rate for gross estimate
  const avgRate = await prisma.assignment.aggregate({
    _avg: { stitching_rate: true },
    where: { is_deleted: false, completed_sets: { gt: 0 } },
  });

  const totalGrossEarned = (grossData._sum.completed_sets || 0) * (avgRate._avg.stitching_rate || 110);
  const totalAdvanceAll = await prisma.employeeAdvance.aggregate({ _sum: { amount: true } });
  const totalPaid = salaryTotals._sum.amount || 0;
  const totalAdvGiven = totalAdvanceAll._sum.amount || 0;
  const pendingSalary = Math.max(0, totalGrossEarned - totalAdvGiven - totalPaid);

  // Monthly production data (sequential to avoid connection pool)
  const monthlyProduction = await getMonthlyProductionData();
  const salaryTrend = await getMonthlySalaryTrend();

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
    },
  });
}

// ─────────────────────────────────────────────────────────────
// MANAGER DASHBOARD – Daily production management
// ─────────────────────────────────────────────────────────────
async function getManagerDashboard(req, res) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Batch 1: Metrics (5 queries)
  const [cuttingCompletedCards, bundlesWaiting, activeAssignments, completedToday, pendingWork] =
    await Promise.all([
      prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_COMPLETED' } }),
      prisma.bundle.count({ where: { is_deleted: false, status: 'READY_FOR_ASSIGNMENT' } }),
      prisma.assignment.count({
        where: { is_deleted: false, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
      }),
      prisma.assignment.count({
        where: {
          is_deleted: false, status: 'COMPLETED',
          updated_at: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.assignment.count({
        where: { is_deleted: false, status: { in: ['ASSIGNED', 'IN_PROGRESS', 'SALARY_PENDING'] } },
      }),
    ]);

  // Batch 2: Salary + Tables (4 queries)
  const [todaysSalaryPaid, todaysAssignments, recentlyCompletedBundles, workersWithPendingWork] =
    await Promise.all([
      prisma.employeePayment.aggregate({
        _sum: { amount: true },
        where: { payment_date: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.assignment.findMany({
        where: { is_deleted: false, created_at: { gte: todayStart, lte: todayEnd } },
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
        where: { is_deleted: false, status: 'COMPLETED' },
        orderBy: { updated_at: 'desc' },
        take: 5,
        include: { job_card: { select: { job_card_number: true, design_code: true } } },
      }),
      prisma.assignment.findMany({
        where: { is_deleted: false, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
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
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Batch 1: Counts (4 queries)
  const [readyForCutting, cuttingInProgress, completedToday, pendingCutting] = await Promise.all([
    prisma.jobCard.count({ where: { is_deleted: false, status: 'READY_FOR_CUTTING' } }),
    prisma.jobCard.count({ where: { is_deleted: false, status: 'CUTTING_IN_PROGRESS' } }),
    prisma.jobCard.count({
      where: {
        is_deleted: false, status: 'CUTTING_COMPLETED',
        updated_at: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.jobCard.count({
      where: { is_deleted: false, status: { in: ['READY_FOR_CUTTING', 'CUTTING_IN_PROGRESS'] } },
    }),
  ]);

  // Batch 2: Tables (2 queries)
  const [readyJobCards, recentlyCompletedCutting] = await Promise.all([
    prisma.jobCard.findMany({
      where: { is_deleted: false, status: 'READY_FOR_CUTTING' },
      orderBy: [{ priority: 'desc' }, { due_date: 'asc' }],
      take: 10,
      select: {
        id: true, job_card_number: true, design_code: true, components: true,
        total_quantity: true, priority: true, due_date: true, created_at: true,
      },
    }),
    prisma.jobCard.findMany({
      where: { is_deleted: false, status: 'CUTTING_COMPLETED' },
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
// HELPER: Monthly production data (last 6 months) – sequential
// ─────────────────────────────────────────────────────────────
async function getMonthlyProductionData() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const label = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const [completedPieces, jobCardsCreated] = await Promise.all([
      prisma.assignment.aggregate({
        _sum: { completed_sets: true },
        where: {
          is_deleted: false,
          status: { in: ['COMPLETED', 'SALARY_PENDING'] },
          updated_at: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.jobCard.count({
        where: { is_deleted: false, created_at: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

    months.push({
      month: label,
      completedPieces: completedPieces._sum.completed_sets || 0,
      jobCardsCreated,
    });
  }

  return months;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Monthly salary trend (last 6 months) – sequential
// ─────────────────────────────────────────────────────────────
async function getMonthlySalaryTrend() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const label = monthStart.toLocaleDateString('en-US', { month: 'short' });

    const [paid, advanced] = await Promise.all([
      prisma.employeePayment.aggregate({
        _sum: { amount: true },
        where: { payment_date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.employeeAdvance.aggregate({
        _sum: { amount: true },
        where: { advance_date: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

    months.push({
      month: label,
      paid: paid._sum.amount || 0,
      advanced: advanced._sum.amount || 0,
    });
  }

  return months;
}
