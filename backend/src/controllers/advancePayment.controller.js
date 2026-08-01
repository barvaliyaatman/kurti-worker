import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createSystemNotification } from '../utils/notificationHelper.js';

export const getAdvancesOverview = async (req, res, next) => {
  try {
    const { search, timeFilter = 'ALL', page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    let dateFilterClause = {};
    if (timeFilter === 'TODAY') {
      dateFilterClause = { advance_date: { gte: startOfToday } };
    } else if (timeFilter === 'THIS_MONTH') {
      dateFilterClause = { advance_date: { gte: startOfMonth } };
    } else if (timeFilter === 'PREVIOUS_MONTH') {
      dateFilterClause = { advance_date: { gte: startOfLastMonth, lte: endOfLastMonth } };
    }

    const advances = await prisma.employeeAdvance.findMany({
      where: dateFilterClause,
      orderBy: { advance_date: 'desc' },
      include: {
        employee: true,
      },
    });

    // Compute Factory-wide Summary Totals
    const allAdvances = await prisma.employeeAdvance.findMany({});
    const allPayments = await prisma.employeePayment.findMany({});
    const allAssignments = await prisma.assignment.findMany({});

    const totalAdvancesAmount = allAdvances.reduce((sum, a) => sum + a.amount, 0);

    const todayAdvancesAmount = allAdvances
      .filter((a) => new Date(a.advance_date) >= startOfToday)
      .reduce((sum, a) => sum + a.amount, 0);

    const monthlyAdvancesAmount = allAdvances
      .filter((a) => new Date(a.advance_date) >= startOfMonth)
      .reduce((sum, a) => sum + a.amount, 0);

    const totalGrossSalary = allAssignments.reduce(
      (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
      0
    );

    const totalPaidAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const netSalary = Math.max(0, totalGrossSalary - totalAdvancesAmount);
    const pendingSalary = Math.max(0, netSalary - totalPaidAmount);

    const formattedAdvances = advances.map((adv, index) => {
      const advNum = `ADV-${String(advances.length - index).padStart(4, '0')}`;
      return {
        id: adv.id,
        advance_number: advNum,
        employee_id: adv.employee_id,
        employee_code: adv.employee?.employee_code || '—',
        employee_name: adv.employee?.employee_name || '—',
        phone: adv.employee?.phone || '—',
        amount: adv.amount,
        reason: adv.reason || 'Salary advance',
        approved_by: adv.created_by || 'Factory Manager',
        advance_date: adv.advance_date,
        status: 'APPROVED',
      };
    });

    // Search Filter
    let filtered = formattedAdvances;
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.employee_name.toLowerCase().includes(term) ||
          a.employee_code.toLowerCase().includes(term) ||
          a.advance_number.toLowerCase().includes(term) ||
          a.reason.toLowerCase().includes(term)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee advances overview retrieved successfully.',
      data: {
        summary: {
          total_advances: totalAdvancesAmount,
          today_advances: todayAdvancesAmount,
          monthly_advances: monthlyAdvancesAmount,
          pending_salary: pendingSalary,
          total_salary_paid: totalPaidAmount,
        },
        advances: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createAdvance = async (req, res, next) => {
  try {
    const { employee_id, amount, reason, advance_date } = req.body;

    const advanceAmount = parseFloat(amount);
    if (!advanceAmount || advanceAmount <= 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Please enter a valid advance loan amount greater than zero.',
      });
    }

    if (!employee_id) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Employee selection is required.',
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employee_id },
    });

    if (!employee) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const newAdvance = await prisma.employeeAdvance.create({
      data: {
        employee_id: employee.id,
        amount: advanceAmount,
        reason: reason ? reason.trim() : 'Salary advance',
        advance_date: advance_date ? new Date(advance_date) : new Date(),
        created_by: req.user?.full_name || 'Factory Manager',
      },
      include: { employee: true },
    });

    // Generate System Notification
    await createSystemNotification({
      title: 'Advance Added',
      message: `Advance ₹${advanceAmount.toLocaleString('en-IN')} added for Employee ${employee.employee_name}.`,
      type: 'ADVANCE',
      priority: 'HIGH',
      reference_type: 'EMPLOYEE',
      reference_id: employee.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: `Advance loan of ₹${advanceAmount.toFixed(2)} issued to ${employee.employee_name}.`,
      data: { advance: newAdvance },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdvance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason, advance_date } = req.body;

    const existing = await prisma.employeeAdvance.findUnique({ where: { id } });
    if (!existing) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Advance record not found.',
      });
    }

    const updated = await prisma.employeeAdvance.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(reason && { reason: reason.trim() }),
        ...(advance_date && { advance_date: new Date(advance_date) }),
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Advance record updated successfully.',
      data: { advance: updated },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentsOverview = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const payments = await prisma.employeePayment.findMany({
      orderBy: { payment_date: 'desc' },
      include: { employee: true },
    });

    const formattedPayments = payments.map((pmt, index) => {
      const pmtNum = `PAY-${String(payments.length - index).padStart(4, '0')}`;
      return {
        id: pmt.id,
        payment_number: pmtNum,
        employee_id: pmt.employee_id,
        employee_code: pmt.employee?.employee_code || '—',
        employee_name: pmt.employee?.employee_name || '—',
        amount: pmt.amount,
        payment_mode: pmt.payment_mode || 'CASH',
        reference_no: pmt.reference_no || 'N/A',
        payment_date: pmt.payment_date,
        paid_by: pmt.created_by || 'Factory Manager',
      };
    });

    let filtered = formattedPayments;
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.employee_name.toLowerCase().includes(term) ||
          p.employee_code.toLowerCase().includes(term) ||
          p.payment_number.toLowerCase().includes(term) ||
          p.payment_mode.toLowerCase().includes(term)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Salary payments list retrieved successfully.',
      data: {
        payments: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { employee_id, amount, payment_mode, reference_no, payment_date } = req.body;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Please enter a valid payment amount greater than zero.',
      });
    }

    if (!employee_id) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Employee selection is required.',
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employee_id },
    });

    if (!employee) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const newPayment = await prisma.employeePayment.create({
      data: {
        employee_id: employee.id,
        amount: paymentAmount,
        payment_mode: payment_mode || 'CASH',
        reference_no: reference_no ? reference_no.trim() : null,
        payment_date: payment_date ? new Date(payment_date) : new Date(),
        created_by: req.user?.full_name || 'Factory Manager',
      },
      include: { employee: true },
    });

    // Generate System Notification
    await createSystemNotification({
      title: 'Salary Paid',
      message: `Salary of ₹${paymentAmount.toLocaleString('en-IN')} paid to ${employee.employee_name}.`,
      type: 'SALARY',
      priority: 'HIGH',
      reference_type: 'EMPLOYEE',
      reference_id: employee.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: `Salary payment of ₹${paymentAmount.toFixed(2)} disbursed to ${employee.employee_name}.`,
      data: { payment: newPayment },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await prisma.employeePayment.findMany({
      orderBy: { payment_date: 'desc' },
      include: { employee: true },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Payment audit history log retrieved successfully.',
      data: { history: payments },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdvancePaymentReports = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        advances: true,
        payments: true,
        assignments: true,
      },
    });

    const report = employees.map((emp) => {
      const gross = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
        0
      );
      const advTotal = emp.advances.reduce((sum, a) => sum + a.amount, 0);
      const pmtTotal = emp.payments.reduce((sum, p) => sum + p.amount, 0);
      const net = Math.max(0, gross - advTotal);
      const pending = Math.max(0, net - pmtTotal);

      return {
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        gross_salary: gross,
        total_advances: advTotal,
        net_salary: net,
        total_payments: pmtTotal,
        pending_balance: pending,
      };
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Advance & Payment reports data generated successfully.',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};
