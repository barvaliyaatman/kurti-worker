import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCompanyFilter, assertCompanyOwnership } from '../middleware/tenancy.middleware.js';

export const getPayrollDashboard = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Fetch all employees for this company with assignments, advances, and payments
    const employees = await prisma.employee.findMany({
      where: {
        is_deleted: false,
        ...getCompanyFilter(req.user),
      },
      orderBy: { employee_code: 'asc' },
      include: {
        assignments: {
          include: {
            bundle: { include: { job_card: true } },
          },
        },
        advances: true,
        payments: true,
      },
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Compute payroll metrics per employee
    const payrollRecords = employees.map((emp) => {
      const completedPieces = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0),
        0
      );

      const grossSalary = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
        0
      );

      const thisMonthEarnings = emp.assignments
        .filter((a) => new Date(a.updated_at) >= startOfMonth)
        .reduce((sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0), 0);

      const totalAdvances = emp.advances.reduce((sum, adv) => sum + adv.amount, 0);
      const totalPayments = emp.payments.reduce((sum, pmt) => sum + pmt.amount, 0);

      const netSalary = Math.max(0, grossSalary - totalAdvances);
      const pendingSalary = Math.max(0, netSalary - totalPayments);

      let paymentStatus = 'PENDING';
      if (pendingSalary === 0 && grossSalary > 0) {
        paymentStatus = 'PAID';
      } else if (totalPayments > 0 && pendingSalary > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        phone: emp.phone,
        joining_date: emp.joining_date,
        status: emp.status,
        completed_pieces: completedPieces,
        gross_salary: grossSalary,
        this_month_earnings: thisMonthEarnings,
        advance: totalAdvances,
        net_salary: netSalary,
        paid: totalPayments,
        pending: pendingSalary,
        payment_status: paymentStatus,
      };
    });

    // Factory-wide Summary Totals
    const factorySummary = {
      total_employees: payrollRecords.length,
      gross_salary: payrollRecords.reduce((sum, r) => sum + r.gross_salary, 0),
      advance_deductions: payrollRecords.reduce((sum, r) => sum + r.advance, 0),
      net_salary: payrollRecords.reduce((sum, r) => sum + r.net_salary, 0),
      paid_amount: payrollRecords.reduce((sum, r) => sum + r.paid, 0),
      pending_salary: payrollRecords.reduce((sum, r) => sum + r.pending, 0),
      this_month_earnings: payrollRecords.reduce((sum, r) => sum + r.this_month_earnings, 0),
    };

    // Client Filter
    let filtered = payrollRecords;

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.payment_status === status.toUpperCase());
    }

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.employee_name.toLowerCase().includes(term) ||
          r.employee_code.toLowerCase().includes(term) ||
          r.phone.includes(term)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Payroll dashboard summary retrieved successfully.',
      data: {
        summary: factorySummary,
        payroll: paginated,
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

export const getEmployeeSalaryDetails = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        assignments: {
          include: {
            bundle: { include: { job_card: true } },
          },
          orderBy: { updated_at: 'desc' },
        },
        advances: {
          orderBy: { advance_date: 'desc' },
        },
        payments: {
          orderBy: { payment_date: 'desc' },
        },
      },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    if (!assertCompanyOwnership(employee, req.user)) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    // Completed bundles list
    const completedBundles = employee.assignments
      .filter((a) => (a.completed_sets || 0) > 0)
      .map((a) => {
        const rate = a.stitching_rate || a.bundle?.job_card?.stitching_rate || 110.0;
        const earned = (a.completed_sets || 0) * rate;
        return {
          id: a.id,
          bundle_number: a.bundle?.bundle_number,
          job_card_number: a.bundle?.job_card?.job_card_number,
          design_code: a.bundle?.job_card?.design_code,
          color: a.bundle?.color,
          size: a.bundle?.size,
          completed_pieces: a.completed_sets,
          stitching_rate: rate,
          earned_amount: earned,
          completed_date: a.updated_at,
          status: a.status,
        };
      });

    const totalCompletedPieces = completedBundles.reduce((sum, b) => sum + b.completed_pieces, 0);
    const grossSalary = completedBundles.reduce((sum, b) => sum + b.earned_amount, 0);

    const totalAdvances = employee.advances.reduce((sum, a) => sum + a.amount, 0);
    const totalPayments = employee.payments.reduce((sum, p) => sum + p.amount, 0);

    const netSalary = Math.max(0, grossSalary - totalAdvances);
    const pendingSalary = Math.max(0, netSalary - totalPayments);

    let paymentStatus = 'PENDING';
    if (pendingSalary === 0 && grossSalary > 0) {
      paymentStatus = 'PAID';
    } else if (totalPayments > 0 && pendingSalary > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee detailed salary workspace retrieved successfully.',
      data: {
        employee: {
          id: employee.id,
          employee_code: employee.employee_code,
          employee_name: employee.employee_name,
          phone: employee.phone,
          joining_date: employee.joining_date,
          status: employee.status,
        },
        summary: {
          completed_pieces: totalCompletedPieces,
          gross_salary: grossSalary,
          total_advances: totalAdvances,
          net_salary: netSalary,
          total_paid: totalPayments,
          pending_salary: pendingSalary,
          payment_status: paymentStatus,
        },
        completed_bundles: completedBundles,
        advances: employee.advances,
        payments: employee.payments,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const disburseSalaryPayment = async (req, res, next) => {
  try {
    const { employee_id, amount, payment_mode, reference_no } = req.body;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Please enter a valid payment amount greater than zero.',
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employee_id },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    if (!assertCompanyOwnership(employee, req.user)) {
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
        created_by: req.user?.full_name || 'Factory Manager',
      },
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

export const getSalaryHistory = async (req, res, next) => {
  try {
    // Optional: month/year filters can be fetched if needed: const { month, year } = req.query;

    const payments = await prisma.employeePayment.findMany({
      orderBy: { payment_date: 'desc' },
      include: { employee: true },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Monthly salary payment history retrieved successfully.',
      data: { history: payments },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPayrollReports = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        assignments: true,
        advances: true,
        payments: true,
      },
    });

    const report = employees.map((emp) => {
      const gross = emp.assignments.reduce(
        (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
        0
      );
      const adv = emp.advances.reduce((sum, a) => sum + a.amount, 0);
      const paid = emp.payments.reduce((sum, p) => sum + p.amount, 0);
      const net = Math.max(0, gross - adv);
      const pending = Math.max(0, net - paid);

      return {
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        gross_salary: gross,
        advance_deduction: adv,
        net_salary: net,
        paid_amount: paid,
        pending_amount: pending,
      };
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Payroll summary report generated successfully.',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};
