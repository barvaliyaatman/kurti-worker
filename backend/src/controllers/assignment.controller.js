import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createSystemNotification } from '../utils/notificationHelper.js';
import { getCompanyFilter, assertCompanyOwnership } from '../middleware/tenancy.middleware.js';

export const getAssignments = async (req, res, next) => {
  try {
    const { search, status, employee_id, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...getCompanyFilter(req.user),
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (employee_id && employee_id !== 'ALL') {
      where.employee_id = employee_id;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { bundle: { bundle_number: { contains: term, mode: 'insensitive' } } },
        { bundle: { job_card: { design_code: { contains: term, mode: 'insensitive' } } } },
        { employee: { employee_name: { contains: term, mode: 'insensitive' } } },
        { employee: { employee_code: { contains: term, mode: 'insensitive' } } },
      ];
    }

    let orderBy = { created_at: 'desc' };

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          bundle: {
            include: {
              job_card: true,
            },
          },
          employee: true,
          history: {
            orderBy: { created_at: 'desc' },
          },
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Work assignments retrieved successfully.',
      data: {
        assignments,
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

export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        bundle: {
          include: {
            job_card: true,
          },
        },
        employee: true,
        history: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!assignment) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Assignment not found.' });
    }

    if (!assertCompanyOwnership(assignment, req.user)) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Assignment not found.' });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Assignment details retrieved successfully.',
      data: { assignment },
    });
  } catch (error) {
    return next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { bundle_id, employee_id, remarks } = req.body;

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundle_id },
      include: { 
        job_card: true,
        assignments: {
          where: {
            status: { not: 'CANCELLED' }
          }
        }
      },
    });

    if (!bundle) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Bundle not found.' });
    }

    if (!assertCompanyOwnership(bundle, req.user)) {
      return ApiResponse.error({ res, statusCode: 403, message: 'Bundle does not belong to your company.' });
    }

    if (bundle.assignments && bundle.assignments.length > 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Bundle is already assigned to a worker.',
      });
    }

    const assignedQty = bundle.total_sets;

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

    if (!assertCompanyOwnership(employee, req.user)) {
      return ApiResponse.error({ res, statusCode: 403, message: 'Employee does not belong to your company.' });
    }

    if (employee.status !== 'ACTIVE') {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Employee '${employee.employee_name}' is currently INACTIVE and cannot receive new assignments.`,
      });
    }

    // SNAPSHOT STITCHING RATE FROM JOB CARD
    const stitchingRate = bundle.job_card?.stitching_rate || 110.0;

    const newAssignment = await prisma.assignment.create({
      data: {
        bundle_id: bundle.id,
        employee_id: employee.id,
        assigned_sets: assignedQty,
        completed_sets: 0,
        stitching_rate: stitchingRate,
        status: 'ASSIGNED',
        assigned_by: req.user?.full_name || 'Factory Manager',
        remarks: remarks ? remarks.trim() : null,
        company_id: req.user.company_id || null,
        history: {
          create: {
            action: 'ASSIGNED',
            new_sets: assignedQty,
            performed_by: req.user?.full_name || 'Factory Manager',
            notes: `Assigned ${assignedQty} sets to ${employee.employee_name} at ₹${stitchingRate}/Pcs.`,
          },
        },
      },
      include: {
        bundle: { include: { job_card: true } },
        employee: true,
      },
    });

    // Update bundle assigned sets count
    const updatedAssignedSets = bundle.assigned_sets + assignedQty;
    const newBundleStatus =
      updatedAssignedSets >= bundle.total_sets ? 'IN_ASSIGNMENT' : 'READY_FOR_ASSIGNMENT';

    await prisma.bundle.update({
      where: { id: bundle.id },
      data: {
        assigned_sets: updatedAssignedSets,
        status: newBundleStatus,
      },
    });

    // Generate System Notification
    await createSystemNotification({
      title: 'Bundle Assigned',
      message: `Bundle ${bundle.bundle_number} assigned to ${employee.employee_name}.`,
      type: 'ASSIGNMENT',
      priority: 'MEDIUM',
      reference_type: 'BUNDLE',
      reference_id: bundle.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: `Work assignment created successfully. ${assignedQty} sets assigned to ${employee.employee_name}.`,
      data: { assignment: newAssignment },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_sets, remarks } = req.body;

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
      include: { bundle: true },
    });

    if (!existingAssignment) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Assignment not found.',
      });
    }

    const newAssigned = parseInt(assigned_sets, 10);
    const setsDiff = newAssigned - existingAssignment.assigned_sets;
    const available = existingAssignment.bundle.total_sets - existingAssignment.bundle.assigned_sets;

    if (setsDiff > available) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Cannot increase assigned sets by ${setsDiff}. Only ${available} sets available in bundle.`,
      });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        assigned_sets: newAssigned,
        ...(remarks !== undefined && { remarks: remarks ? remarks.trim() : null }),
        history: {
          create: {
            action: 'EDITED',
            previous_sets: existingAssignment.assigned_sets,
            new_sets: newAssigned,
            performed_by: req.user?.full_name || 'Factory Manager',
            notes: `Updated assigned quantity from ${existingAssignment.assigned_sets} to ${newAssigned} sets.`,
          },
        },
      },
      include: {
        bundle: { include: { job_card: true } },
        employee: true,
      },
    });

    await prisma.bundle.update({
      where: { id: existingAssignment.bundle_id },
      data: {
        assigned_sets: existingAssignment.bundle.assigned_sets + setsDiff,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Assignment updated successfully.',
      data: { assignment: updatedAssignment },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completed_sets, notes } = req.body;

    const existing = await prisma.assignment.findUnique({
      where: { id },
      include: { bundle: true },
    });

    if (!existing) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Assignment record not found.',
      });
    }

    const completedQty = parseInt(completed_sets, 10);
    if (completedQty < 0 || completedQty > existing.assigned_sets) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Completed sets (${completedQty}) cannot exceed assigned sets (${existing.assigned_sets}).`,
      });
    }

    const isFullyDone = completedQty === existing.assigned_sets;
    const newStatus = isFullyDone ? 'COMPLETED' : 'IN_PROGRESS';

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        completed_sets: completedQty,
        status: newStatus,
        history: {
          create: {
            action: isFullyDone ? 'COMPLETED' : 'PROGRESS_UPDATED',
            previous_sets: existing.completed_sets,
            new_sets: completedQty,
            performed_by: req.user?.full_name || 'Factory Manager',
            notes: notes ? notes.trim() : `Updated completed pieces to ${completedQty}/${existing.assigned_sets} sets.`,
          },
        },
      },
      include: {
        bundle: { include: { job_card: true } },
        employee: true,
      },
    });

    // Update parent bundle completed sets count
    const bundleCompletedDiff = completedQty - existing.completed_sets;
    const newBundleCompleted = existing.bundle.completed_sets + bundleCompletedDiff;
    const isBundleFullyCompleted = newBundleCompleted >= existing.bundle.total_sets;

    await prisma.bundle.update({
      where: { id: existing.bundle_id },
      data: {
        completed_sets: newBundleCompleted,
        status: isBundleFullyCompleted ? 'COMPLETED' : existing.bundle.status,
      },
    });

    if (isFullyDone) {
      await createSystemNotification({
        title: 'Bundle Completed',
        message: `Bundle ${existing.bundle.bundle_number} completed.`,
        type: 'BUNDLE',
        priority: 'HIGH',
        reference_type: 'BUNDLE',
        reference_id: existing.bundle_id,
        user_role: 'ALL',
      });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Work progress updated to ${completedQty} completed sets.`,
      data: { assignment: updated },
    });
  } catch (error) {
    return next(error);
  }
};

export const completeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.assignment.findUnique({
      where: { id },
      include: { bundle: true },
    });

    if (!existing) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Assignment not found.',
      });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        completed_sets: existing.assigned_sets,
        status: 'COMPLETED',
        history: {
          create: {
            action: 'COMPLETED',
            previous_sets: existing.completed_sets,
            new_sets: existing.assigned_sets,
            performed_by: req.user?.full_name || 'Factory Manager',
            notes: 'Marked 100% completed by Manager.',
          },
        },
      },
      include: {
        bundle: { include: { job_card: true } },
        employee: true,
      },
    });

    // Update parent bundle
    const bundleCompletedDiff = existing.assigned_sets - existing.completed_sets;
    const newBundleCompleted = existing.bundle.completed_sets + bundleCompletedDiff;
    const isBundleFullyCompleted = newBundleCompleted >= existing.bundle.total_sets;

    await prisma.bundle.update({
      where: { id: existing.bundle_id },
      data: {
        completed_sets: newBundleCompleted,
        status: isBundleFullyCompleted ? 'COMPLETED' : existing.bundle.status,
      },
    });

    await createSystemNotification({
      title: 'Bundle Completed',
      message: `Bundle ${existing.bundle.bundle_number} completed.`,
      type: 'BUNDLE',
      priority: 'HIGH',
      reference_type: 'BUNDLE',
      reference_id: existing.bundle_id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Assignment marked as 100% completed.',
      data: { assignment: updated },
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.assignment.findUnique({
      where: { id },
      include: { bundle: true },
    });

    if (!existing) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Assignment not found.',
      });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        history: {
          create: {
            action: 'CANCELLED',
            previous_sets: existing.assigned_sets,
            new_sets: 0,
            performed_by: req.user?.full_name || 'Factory Manager',
            notes: 'Assignment cancelled. Remaining sets restored to bundle.',
          },
        },
      },
    });

    // Restore assigned sets back to bundle queue
    const restoredAssignedSets = Math.max(0, existing.bundle.assigned_sets - existing.assigned_sets);
    await prisma.bundle.update({
      where: { id: existing.bundle_id },
      data: {
        assigned_sets: restoredAssignedSets,
        status: 'READY_FOR_ASSIGNMENT',
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Assignment cancelled cleanly.',
      data: { assignment: updated },
    });
  } catch (error) {
    return next(error);
  }
};
