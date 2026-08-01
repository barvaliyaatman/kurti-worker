import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Date Helper Utility
const getDateBounds = (timeFilter) => {
  const now = new Date();
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  switch (timeFilter) {
    case 'TODAY':
      return { gte: startOfToday, lte: endOfToday };
    case 'YESTERDAY':
      return { gte: startOfYesterday, lte: endOfYesterday };
    case 'THIS_WEEK':
      return { gte: startOfWeek };
    case 'THIS_MONTH':
      return { gte: startOfMonth };
    case 'LAST_MONTH':
      return { gte: startOfLastMonth, lte: endOfLastMonth };
    default:
      return undefined;
  }
};

export const getReportsDashboard = async (req, res, next) => {
  try {
    const { timeFilter = 'ALL' } = req.query;
    const dateQuery = getDateBounds(timeFilter);

    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all raw data for calculations
    const [
      allAssignments,
      allJobCards,
      allBundles,
      allEmployees,
      allAdvances,
      allPayments,
    ] = await Promise.all([
      prisma.assignment.findMany({
        include: { bundle: { include: { job_card: true } } },
      }),
      prisma.jobCard.findMany({
        include: { bundles: true },
      }),
      prisma.bundle.findMany({}),
      prisma.employee.findMany({}),
      prisma.employeeAdvance.findMany({}),
      prisma.employeePayment.findMany({}),
    ]);

    // 1. Today's Production
    const todaysProduction = allAssignments
      .filter((a) => new Date(a.updated_at) >= startOfToday)
      .reduce((sum, a) => sum + (a.completed_sets || 0), 0);

    // 2. Monthly Production
    const monthlyProduction = allAssignments
      .filter((a) => new Date(a.updated_at) >= startOfMonth)
      .reduce((sum, a) => sum + (a.completed_sets || 0), 0);

    // 3 & 4. Job Cards
    const completedJobCards = allJobCards.filter((jc) => jc.status === 'COMPLETED').length;
    const activeJobCards = allJobCards.filter((jc) => jc.status !== 'COMPLETED' && jc.status !== 'CANCELLED').length;

    // 5 & 6. Bundles
    const completedBundles = allBundles.filter((b) => b.status === 'COMPLETED' || b.completed_sets >= b.total_sets).length;
    const activeBundles = allBundles.filter((b) => b.assigned_sets > 0 && (b.completed_sets || 0) < b.total_sets).length;

    // 7. Completed Pieces Total
    const totalCompletedPieces = allAssignments.reduce((sum, a) => sum + (a.completed_sets || 0), 0);

    // 8. Total Active Employees
    const totalEmployees = allEmployees.filter((e) => e.status === 'ACTIVE').length;

    // 9, 10, 11. Financial Metrics
    const totalGrossSalary = allAssignments.reduce(
      (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
      0
    );

    const totalAdvances = allAdvances.reduce((sum, a) => sum + a.amount, 0);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const netSalary = Math.max(0, totalGrossSalary - totalAdvances);
    const pendingSalary = Math.max(0, netSalary - totalPaid);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Reports dashboard analytics retrieved successfully.',
      data: {
        summary: {
          todays_production: todaysProduction,
          monthly_production: monthlyProduction,
          completed_job_cards: completedJobCards,
          active_job_cards: activeJobCards,
          completed_bundles: completedBundles,
          active_bundles: activeBundles,
          completed_pieces: totalCompletedPieces,
          total_employees: totalEmployees,
          pending_salary: pendingSalary,
          salary_paid: totalPaid,
          total_advances: totalAdvances,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductionReport = async (req, res, next) => {
  try {
    const { timeFilter = 'ALL', search } = req.query;
    const dateQuery = getDateBounds(timeFilter);

    const assignments = await prisma.assignment.findMany({
      where: dateQuery ? { updated_at: dateQuery } : {},
      include: {
        bundle: { include: { job_card: true } },
        employee: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    const jobCards = await prisma.jobCard.findMany({
      include: { bundles: true },
    });

    const completedPieces = assignments.reduce((sum, a) => sum + (a.completed_sets || 0), 0);
    const pendingPieces = assignments.reduce(
      (sum, a) => sum + Math.max(0, a.assigned_sets - a.completed_sets),
      0
    );

    const now = new Date();
    const completedJobCardsCount = jobCards.filter((jc) => jc.status === 'COMPLETED').length;
    const pendingJobCardsCount = jobCards.filter((jc) => jc.status !== 'COMPLETED').length;
    const overdueJobCardsCount = jobCards.filter(
      (jc) => jc.status !== 'COMPLETED' && jc.due_date && new Date(jc.due_date) < now
    ).length;

    const formattedReport = assignments.map((a) => ({
      id: a.id,
      bundle_number: a.bundle?.bundle_number,
      job_card_number: a.bundle?.job_card?.job_card_number,
      design_code: a.bundle?.job_card?.design_code,
      color: a.bundle?.color,
      size: a.bundle?.size,
      worker_name: a.employee?.employee_name,
      assigned_sets: a.assigned_sets,
      completed_sets: a.completed_sets,
      stitching_rate: a.stitching_rate,
      earned_amount: (a.completed_sets || 0) * a.stitching_rate,
      updated_at: a.updated_at,
      status: a.status,
    }));

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Production analytics report retrieved successfully.',
      data: {
        metrics: {
          completed_pieces: completedPieces,
          pending_pieces: pendingPieces,
          completed_job_cards: completedJobCardsCount,
          pending_job_cards: pendingJobCardsCount,
          overdue_job_cards: overdueJobCardsCount,
        },
        records: formattedReport,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeReport = async (req, res, next) => {
  try {
    const { search } = req.query;

    const employees = await prisma.employee.findMany({
      include: {
        assignments: {
          include: { bundle: { include: { job_card: true } } },
        },
        advances: true,
        payments: true,
      },
      orderBy: { employee_code: 'asc' },
    });

    const report = employees.map((emp) => {
      const activeAssignments = emp.assignments.filter((a) =>
        ['ASSIGNED', 'IN_PROGRESS'].includes(a.status)
      );
      const completedAssignments = emp.assignments.filter((a) =>
        ['COMPLETED', 'SALARY_PENDING'].includes(a.status)
      );

      const completedPieces = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0),
        0
      );

      const grossSalary = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
        0
      );

      const advanceTotal = emp.advances.reduce((sum, a) => sum + a.amount, 0);
      const paymentTotal = emp.payments.reduce((sum, p) => sum + p.amount, 0);

      const netSalary = Math.max(0, grossSalary - advanceTotal);
      const pendingSalary = Math.max(0, netSalary - paymentTotal);

      const totalAssignedPieces = emp.assignments.reduce((sum, a) => sum + a.assigned_sets, 0);
      const performancePct = totalAssignedPieces > 0
        ? Math.min(100, Math.round((completedPieces / totalAssignedPieces) * 100))
        : 100;

      return {
        id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        phone: emp.phone,
        status: emp.status,
        completed_pieces: completedPieces,
        completed_bundles: completedAssignments.length,
        current_bundles: activeAssignments.length,
        gross_salary: grossSalary,
        advance: advanceTotal,
        pending_salary: pendingSalary,
        performance_percentage: performancePct,
      };
    });

    let filtered = report;
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.employee_name.toLowerCase().includes(term) ||
          e.employee_code.toLowerCase().includes(term)
      );
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee performance report retrieved successfully.',
      data: { records: filtered },
    });
  } catch (error) {
    return next(error);
  }
};

export const getJobCardReport = async (req, res, next) => {
  try {
    const { search } = req.query;

    const jobCards = await prisma.jobCard.findMany({
      include: { bundles: true },
      orderBy: { created_at: 'desc' },
    });

    const report = jobCards.map((jc) => {
      const totalBundles = jc.bundles.length;
      const completedBundles = jc.bundles.filter(
        (b) => b.status === 'COMPLETED' || b.completed_sets >= b.total_sets
      ).length;

      const completionPct = totalBundles > 0
        ? Math.round((completedBundles / totalBundles) * 100)
        : 0;

      return {
        id: jc.id,
        job_card_number: jc.job_card_number,
        design_code: jc.design_code,
        stitching_rate: jc.stitching_rate,
        total_quantity: jc.total_quantity,
        priority: jc.priority,
        status: jc.status,
        total_bundles: totalBundles,
        completed_bundles: completedBundles,
        completion_percentage: completionPct,
        created_at: jc.created_at,
        due_date: jc.due_date,
        completed_date: jc.status === 'COMPLETED' ? jc.updated_at : null,
      };
    });

    let filtered = report;
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (jc) =>
          jc.job_card_number.toLowerCase().includes(term) ||
          jc.design_code.toLowerCase().includes(term)
      );
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Job Card analytics report retrieved successfully.',
      data: { records: filtered },
    });
  } catch (error) {
    return next(error);
  }
};

export const getBundleReport = async (req, res, next) => {
  try {
    const { search } = req.query;

    const bundles = await prisma.bundle.findMany({
      include: {
        job_card: true,
        assignments: {
          include: { employee: true },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { bundle_number: 'asc' },
    });

    const report = bundles.map((b) => {
      const activeAsgn = b.assignments[0] || null;
      const remaining = Math.max(0, b.total_sets - (b.assigned_sets || 0));

      return {
        id: b.id,
        bundle_number: b.bundle_number,
        job_card_number: b.job_card?.job_card_number,
        design_code: b.job_card?.design_code,
        color: b.color,
        size: b.size,
        assigned_worker: activeAsgn?.employee?.employee_name || 'Unassigned',
        total_sets: b.total_sets,
        assigned_sets: b.assigned_sets,
        completed_sets: b.completed_sets,
        pending_sets: remaining,
        status: b.status,
      };
    });

    let filtered = report;
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bundle_number.toLowerCase().includes(term) ||
          b.design_code.toLowerCase().includes(term) ||
          b.color.toLowerCase().includes(term) ||
          b.assigned_worker.toLowerCase().includes(term)
      );
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Bundle progress report retrieved successfully.',
      data: { records: filtered },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSalaryReport = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        assignments: true,
        advances: true,
        payments: true,
      },
      orderBy: { employee_code: 'asc' },
    });

    const report = employees.map((emp) => {
      const completedPieces = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0),
        0
      );
      const grossSalary = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
        0
      );
      const advanceTotal = emp.advances.reduce((sum, a) => sum + a.amount, 0);
      const paymentTotal = emp.payments.reduce((sum, p) => sum + p.amount, 0);
      const netSalary = Math.max(0, grossSalary - advanceTotal);
      const pendingSalary = Math.max(0, netSalary - paymentTotal);

      return {
        id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        completed_pieces: completedPieces,
        gross_salary: grossSalary,
        advance: advanceTotal,
        net_salary: netSalary,
        paid: paymentTotal,
        pending: pendingSalary,
      };
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Salary ledger report retrieved successfully.',
      data: { records: report },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdvanceReport = async (req, res, next) => {
  try {
    const advances = await prisma.employeeAdvance.findMany({
      include: { employee: true },
      orderBy: { advance_date: 'desc' },
    });

    const report = advances.map((a, idx) => ({
      id: a.id,
      advance_number: `ADV-${String(advances.length - idx).padStart(4, '0')}`,
      employee_code: a.employee?.employee_code,
      employee_name: a.employee?.employee_name,
      amount: a.amount,
      reason: a.reason,
      advance_date: a.advance_date,
      created_by: a.created_by,
    }));

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Advance loans report retrieved successfully.',
      data: { records: report },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentReport = async (req, res, next) => {
  try {
    const payments = await prisma.employeePayment.findMany({
      include: { employee: true },
      orderBy: { payment_date: 'desc' },
    });

    const report = payments.map((p, idx) => ({
      id: p.id,
      payment_number: `PAY-${String(payments.length - idx).padStart(4, '0')}`,
      employee_code: p.employee?.employee_code,
      employee_name: p.employee?.employee_name,
      amount: p.amount,
      payment_mode: p.payment_mode,
      reference_no: p.reference_no || 'N/A',
      payment_date: p.payment_date,
      paid_by: p.created_by,
    }));

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Disbursed payments report retrieved successfully.',
      data: { records: report },
    });
  } catch (error) {
    return next(error);
  }
};
