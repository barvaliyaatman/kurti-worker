import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/settings/workflow
 * Retrieve Production Workflow Settings for the authenticated user's company (or specified company for SUPER_ADMIN).
 */
export const getWorkflowSettings = async (req, res, next) => {
  try {
    let companyId = null;

    if (req.user.role === 'SUPER_ADMIN') {
      companyId = req.query.company_id || req.user.company_id;
    } else {
      companyId = req.user.company_id;
    }

    if (!companyId) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Company ID is required to retrieve workflow settings.',
      });
    }

    let settings = await prisma.productionWorkflowSettings.findUnique({
      where: { company_id: companyId },
    });

    // Seed defaults if missing for this company
    if (!settings) {
      settings = await prisma.productionWorkflowSettings.create({
        data: {
          company_id: companyId,
          skip_cutting: false,
          skip_bundle: false,
          direct_worker_assignment: false,
        },
      });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Production workflow settings retrieved successfully.',
      data: { settings },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/settings/workflow
 * Update Production Workflow Settings for the authenticated user's company (or specified company for SUPER_ADMIN).
 * Only OWNER and SUPER_ADMIN roles are allowed to modify settings.
 */
export const updateWorkflowSettings = async (req, res, next) => {
  try {
    // Role check: Only OWNER or SUPER_ADMIN can modify company settings
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OWNER') {
      return ApiResponse.error({
        res,
        statusCode: 403,
        message: 'Forbidden: Only Company Owner or Super Admin can modify production workflow settings.',
      });
    }

    let companyId = null;
    if (req.user.role === 'SUPER_ADMIN') {
      companyId = req.body.company_id || req.query.company_id || req.user.company_id;
    } else {
      // NEVER trust company_id from body for regular users
      companyId = req.user.company_id;
    }

    if (!companyId) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Company ID is required to update workflow settings.',
      });
    }

    const { skip_cutting, skip_bundle, direct_worker_assignment } = req.body;

    let skipCutting = Boolean(skip_cutting);
    let skipBundle = Boolean(skip_bundle);
    let directWorkerAssignment = Boolean(direct_worker_assignment);

    // Clean state validation and normalization rules:
    // If Skip Bundle or Direct Worker Assignment is enabled, direct worker assignment is logically implied and skip_bundle must be active.
    if (skipBundle || directWorkerAssignment) {
      skipBundle = true;
      directWorkerAssignment = true;
    } else {
      skipBundle = false;
      directWorkerAssignment = false;
    }

    const settings = await prisma.productionWorkflowSettings.upsert({
      where: { company_id: companyId },
      update: {
        skip_cutting: skipCutting,
        skip_bundle: skipBundle,
        direct_worker_assignment: directWorkerAssignment,
      },
      create: {
        company_id: companyId,
        skip_cutting: skipCutting,
        skip_bundle: skipBundle,
        direct_worker_assignment: directWorkerAssignment,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Production workflow settings updated successfully.',
      data: { settings },
    });
  } catch (error) {
    return next(error);
  }
};
