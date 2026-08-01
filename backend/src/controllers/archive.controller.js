import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Get all soft-deleted records from Trash
 */
export const getArchivedRecords = async (req, res, next) => {
  try {
    // Optional: type can be fetched if needed: const { type } = req.query;

    const jobCards = await prisma.jobCard.findMany({
      where: { is_deleted: true },
      include: {
        items: true,
      },
      orderBy: { deleted_at: 'desc' },
    });

    const employees = await prisma.employee.findMany({
      where: { is_deleted: true },
      orderBy: { deleted_at: 'desc' },
    });

    const bundles = await prisma.bundle.findMany({
      where: { is_deleted: true },
      include: {
        job_card: {
          select: { job_card_number: true, design_code: true },
        },
      },
      orderBy: { deleted_at: 'desc' },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Archived records retrieved successfully.',
      data: {
        jobCards,
        employees,
        bundles,
        totalArchived: jobCards.length + employees.length + bundles.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Restore a soft-deleted record
 */
export const restoreRecord = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    let restoredRecord = null;
    let recordName = id;

    if (type === 'job_card') {
      const existing = await prisma.jobCard.findUnique({ where: { id } });
      if (!existing) {
        return ApiResponse.error({ res, statusCode: 404, message: 'Archived Job Card not found.' });
      }
      recordName = existing.job_card_number;
      restoredRecord = await prisma.jobCard.update({
        where: { id },
        data: { is_deleted: false, deleted_at: null, deleted_by: null },
      });
    } else if (type === 'employee') {
      const existing = await prisma.employee.findUnique({ where: { id } });
      if (!existing) {
        return ApiResponse.error({ res, statusCode: 404, message: 'Archived Employee not found.' });
      }
      recordName = existing.employee_name;
      restoredRecord = await prisma.employee.update({
        where: { id },
        data: { is_deleted: false, deleted_at: null, deleted_by: null },
      });
    } else if (type === 'bundle') {
      const existing = await prisma.bundle.findUnique({ where: { id } });
      if (!existing) {
        return ApiResponse.error({ res, statusCode: 404, message: 'Archived Bundle not found.' });
      }
      recordName = existing.bundle_number;
      restoredRecord = await prisma.bundle.update({
        where: { id },
        data: { is_deleted: false, deleted_at: null, deleted_by: null },
      });
    } else {
      return ApiResponse.error({ res, statusCode: 400, message: 'Invalid record type.' });
    }

    // Log notification
    await prisma.notification.create({
      data: {
        title: `Record Restored: ${recordName}`,
        message: `${type.toUpperCase()} record '${recordName}' was restored from Trash by ${req.user.full_name}.`,
        type: 'RECORD_RESTORED',
        priority: 'MEDIUM',
        reference_type: type.toUpperCase(),
        reference_id: id,
        user_role: 'ALL',
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Record '${recordName}' restored successfully.`,
      data: { restoredRecord },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Permanently delete record (Owner only)
 */
export const permanentDeleteRecord = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    let recordName = id;

    if (type === 'job_card') {
      const existing = await prisma.jobCard.findUnique({ where: { id } });
      if (!existing) {
        return ApiResponse.error({ res, statusCode: 404, message: 'Archived Job Card not found.' });
      }
      recordName = existing.job_card_number;
      await prisma.jobCard.delete({ where: { id } });
    } else if (type === 'employee') {
      const existing = await prisma.employee.findUnique({ where: { id } });
      if (!existing) {
        return ApiResponse.error({ res, statusCode: 404, message: 'Archived Employee not found.' });
      }
      recordName = existing.employee_name;
      await prisma.employee.delete({ where: { id } });
    } else if (type === 'bundle') {
      const existing = await prisma.bundle.findUnique({ where: { id } });
      if (!existing) {
        return ApiResponse.error({ res, statusCode: 404, message: 'Archived Bundle not found.' });
      }
      recordName = existing.bundle_number;
      await prisma.bundle.delete({ where: { id } });
    } else {
      return ApiResponse.error({ res, statusCode: 400, message: 'Invalid record type.' });
    }

    // Log notification
    await prisma.notification.create({
      data: {
        title: `Permanent Delete: ${recordName}`,
        message: `${type.toUpperCase()} record '${recordName}' was permanently purged from database by ${req.user.full_name}.`,
        type: 'RECORD_PURGED',
        priority: 'HIGH',
        reference_type: type.toUpperCase(),
        reference_id: id,
        user_role: 'OWNER',
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Record '${recordName}' permanently purged.`,
    });
  } catch (error) {
    return next(error);
  }
};
