import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getEmployeeWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            bundle: {
              include: {
                job_card: true,
              },
            },
            history: true,
          },
          orderBy: { created_at: 'desc' },
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

    const { assertCompanyOwnership } = await import('../middleware/tenancy.middleware.js');
    if (!assertCompanyOwnership(employee, req.user)) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    // Filter active assignments (ASSIGNED, IN_PROGRESS)
    const activeAssignments = employee.assignments.filter((a) =>
      ['ASSIGNED', 'IN_PROGRESS'].includes(a.status)
    );

    // Filter completed assignments
    const completedAssignments = employee.assignments.filter((a) =>
      ['COMPLETED', 'SALARY_PENDING'].includes(a.status)
    );

    // Current Working Bundle info
    const currentAssignment = activeAssignments[0] || null;
    const currentWorkingBundle = currentAssignment
      ? {
          bundle_number: currentAssignment.bundle?.bundle_number,
          job_card_number: currentAssignment.bundle?.job_card?.job_card_number,
          design_code: currentAssignment.bundle?.job_card?.design_code,
          color: currentAssignment.bundle?.color,
          size: currentAssignment.bundle?.size,
          stitching_rate: currentAssignment.stitching_rate,
        }
      : null;

    // Piece calculations
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const pendingPieces = activeAssignments.reduce(
      (sum, a) => sum + Math.max(0, a.assigned_sets - a.completed_sets),
      0
    );

    const totalCompletedPieces = employee.assignments.reduce(
      (sum, a) => sum + (a.completed_sets || 0),
      0
    );

    const todayCompletedPieces = employee.assignments
      .filter((a) => new Date(a.updated_at) >= startOfToday)
      .reduce((sum, a) => sum + (a.completed_sets || 0), 0);

    const monthCompletedPieces = employee.assignments
      .filter((a) => new Date(a.updated_at) >= startOfMonth)
      .reduce((sum, a) => sum + (a.completed_sets || 0), 0);

    // Financial calculations
    const grossSalary = employee.assignments.reduce(
      (sum, a) => sum + (a.completed_sets || 0) * (a.stitching_rate || 110.0),
      0
    );

    const advanceBalance = employee.advances.reduce((sum, adv) => sum + adv.amount, 0);
    const totalPaymentsPaid = employee.payments.reduce((sum, p) => sum + p.amount, 0);

    const netPayable = Math.max(0, grossSalary - advanceBalance - totalPaymentsPaid);

    // Generate chronological activity timeline
    const timelineEvents = [];

    // Profile Created Event
    timelineEvents.push({
      id: `evt-emp-${employee.id}`,
      type: 'EMPLOYEE_CREATED',
      title: 'Employee Profile Created',
      description: `${employee.employee_name} (${employee.employee_code}) joined factory workforce.`,
      timestamp: employee.created_at,
      badge: 'Profile',
    });

    // Assignment & Completion Events
    employee.assignments.forEach((asgn) => {
      timelineEvents.push({
        id: `evt-asgn-${asgn.id}`,
        type: 'BUNDLE_ASSIGNED',
        title: `Assigned Bundle ${asgn.bundle?.bundle_number}`,
        description: `Assigned ${asgn.assigned_sets} sets of Design ${asgn.bundle?.job_card?.design_code} (${asgn.bundle?.color} ${asgn.bundle?.size}) at ₹${asgn.stitching_rate}/Pcs.`,
        timestamp: asgn.created_at,
        badge: 'Assignment',
      });

      if (asgn.status === 'COMPLETED' || asgn.status === 'SALARY_PENDING') {
        timelineEvents.push({
          id: `evt-comp-${asgn.id}`,
          type: 'WORK_COMPLETED',
          title: `Completed Bundle ${asgn.bundle?.bundle_number}`,
          description: `Completed all ${asgn.completed_sets} sets. Earned ₹${(asgn.completed_sets * asgn.stitching_rate).toFixed(2)}.`,
          timestamp: asgn.updated_at,
          badge: 'Completed Work',
        });
      }
    });

    // Advance Events
    employee.advances.forEach((adv) => {
      timelineEvents.push({
        id: `evt-adv-${adv.id}`,
        type: 'ADVANCE_GIVEN',
        title: `Advance Given: ₹${adv.amount.toFixed(2)}`,
        description: `Reason: ${adv.reason || 'Salary advance'} (Issued by ${adv.created_by}).`,
        timestamp: adv.advance_date,
        badge: 'Advance',
      });
    });

    // Payment Events
    employee.payments.forEach((pmt) => {
      timelineEvents.push({
        id: `evt-pmt-${pmt.id}`,
        type: 'SALARY_PAID',
        title: `Salary Paid: ₹${pmt.amount.toFixed(2)}`,
        description: `Mode: ${pmt.payment_mode} (Ref: ${pmt.reference_no || 'N/A'}).`,
        timestamp: pmt.payment_date,
        badge: 'Payment',
      });
    });

    timelineEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee workspace overview retrieved successfully.',
      data: {
        employee,
        current_working_bundle: currentWorkingBundle,
        summary: {
          active_bundles_count: activeAssignments.length,
          completed_bundles_count: completedAssignments.length,
          pending_pieces: pendingPieces,
          completed_pieces: totalCompletedPieces,
          today_completed_pieces: todayCompletedPieces,
          month_completed_pieces: monthCompletedPieces,
          gross_salary: grossSalary,
          advance_balance: advanceBalance,
          total_paid_salary: totalPaymentsPaid,
          net_payable: netPayable,
        },
        active_assignments: activeAssignments,
        completed_assignments: completedAssignments,
        advances: employee.advances,
        payments: employee.payments,
        timeline: timelineEvents.slice(0, 20),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentWork = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignments = await prisma.assignment.findMany({
      where: {
        employee_id: id,
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
      },
      orderBy: { created_at: 'desc' },
      include: {
        bundle: {
          include: { job_card: true },
        },
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee active current work retrieved successfully.',
      data: { assignments },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCompletedWork = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignments = await prisma.assignment.findMany({
      where: {
        employee_id: id,
        status: { in: ['COMPLETED', 'SALARY_PENDING'] },
      },
      orderBy: { updated_at: 'desc' },
      include: {
        bundle: {
          include: { job_card: true },
        },
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee completed work retrieved successfully.',
      data: { assignments },
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeSalary = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { status: { in: ['COMPLETED', 'SALARY_PENDING'] } },
          include: { bundle: { include: { job_card: true } } },
        },
        advances: true,
        payments: true,
      },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const { assertCompanyOwnership } = await import('../middleware/tenancy.middleware.js');
    if (!assertCompanyOwnership(employee, req.user)) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const totalCompletedPieces = employee.assignments.reduce((sum, a) => sum + a.completed_sets, 0);
    const grossSalary = employee.assignments.reduce((sum, a) => sum + a.completed_sets * a.stitching_rate, 0);
    const totalAdvances = employee.advances.reduce((sum, a) => sum + a.amount, 0);
    const totalPayments = employee.payments.reduce((sum, p) => sum + p.amount, 0);
    const netPayable = Math.max(0, grossSalary - totalAdvances - totalPayments);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee salary breakdown retrieved successfully.',
      data: {
        employee_code: employee.employee_code,
        employee_name: employee.employee_name,
        completed_pieces: totalCompletedPieces,
        gross_salary: grossSalary,
        total_advances: totalAdvances,
        total_payments: totalPayments,
        net_payable: netPayable,
        completed_assignments: employee.assignments,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeAdvances = async (req, res, next) => {
  try {
    const { id } = req.params;

    const advances = await prisma.employeeAdvance.findMany({
      where: { employee_id: id },
      orderBy: { advance_date: 'desc' },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee advances list retrieved successfully.',
      data: { advances },
    });
  } catch (error) {
    return next(error);
  }
};

export const createEmployeeAdvance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const advanceAmount = parseFloat(amount);
    if (!advanceAmount || advanceAmount <= 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Please enter a valid advance loan amount greater than zero.',
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const { assertCompanyOwnership } = await import('../middleware/tenancy.middleware.js');
    if (!assertCompanyOwnership(employee, req.user)) {
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
        created_by: req.user?.full_name || 'Factory Owner',
      },
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

export const getEmployeePayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payments = await prisma.employeePayment.findMany({
      where: { employee_id: id },
      orderBy: { payment_date: 'desc' },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee payments list retrieved successfully.',
      data: { payments },
    });
  } catch (error) {
    return next(error);
  }
};

export const createEmployeePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, payment_mode, reference_no } = req.body;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Please enter a valid payment amount greater than zero.',
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const { assertCompanyOwnership } = await import('../middleware/tenancy.middleware.js');
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
        created_by: req.user?.full_name || 'Factory Owner',
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

export const getEmployeeTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { bundle: { include: { job_card: true } } },
        },
        advances: true,
        payments: true,
      },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const { assertCompanyOwnership } = await import('../middleware/tenancy.middleware.js');
    if (!assertCompanyOwnership(employee, req.user)) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const timelineEvents = [];

    timelineEvents.push({
      id: `evt-emp-${employee.id}`,
      type: 'EMPLOYEE_CREATED',
      title: 'Employee Profile Created',
      description: `${employee.employee_name} (${employee.employee_code}) joined factory workforce.`,
      timestamp: employee.created_at,
      badge: 'Profile',
    });

    employee.assignments.forEach((asgn) => {
      timelineEvents.push({
        id: `evt-asgn-${asgn.id}`,
        type: 'BUNDLE_ASSIGNED',
        title: `Assigned Bundle ${asgn.bundle?.bundle_number}`,
        description: `Assigned ${asgn.assigned_sets} sets of Design ${asgn.bundle?.job_card?.design_code} (${asgn.bundle?.color} ${asgn.bundle?.size}) at ₹${asgn.stitching_rate}/Pcs.`,
        timestamp: asgn.created_at,
        badge: 'Assignment',
      });

      if (asgn.status === 'COMPLETED' || asgn.status === 'SALARY_PENDING') {
        timelineEvents.push({
          id: `evt-comp-${asgn.id}`,
          type: 'WORK_COMPLETED',
          title: `Completed Bundle ${asgn.bundle?.bundle_number}`,
          description: `Completed all ${asgn.completed_sets} sets. Earned ₹${(asgn.completed_sets * asgn.stitching_rate).toFixed(2)}.`,
          timestamp: asgn.updated_at,
          badge: 'Completed Work',
        });
      }
    });

    employee.advances.forEach((adv) => {
      timelineEvents.push({
        id: `evt-adv-${adv.id}`,
        type: 'ADVANCE_GIVEN',
        title: `Advance Given: ₹${adv.amount.toFixed(2)}`,
        description: `Reason: ${adv.reason || 'Salary advance'}.`,
        timestamp: adv.advance_date,
        badge: 'Advance',
      });
    });

    employee.payments.forEach((pmt) => {
      timelineEvents.push({
        id: `evt-pmt-${pmt.id}`,
        type: 'SALARY_PAID',
        title: `Salary Paid: ₹${pmt.amount.toFixed(2)}`,
        description: `Mode: ${pmt.payment_mode}.`,
        timestamp: pmt.payment_date,
        badge: 'Payment',
      });
    });

    timelineEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee timeline retrieved successfully.',
      data: { timeline: timelineEvents },
    });
  } catch (error) {
    return next(error);
  }
};
