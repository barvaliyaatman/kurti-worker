import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Middleware enforcing company-specific production workflow rules on backend API routes.
 * Rejects requests to skipped workflow stages with 400 Bad Request.
 */
export const requireWorkflowStage = (stage) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const companyId = req.user.company_id;
      if (!companyId) return next();

      const settings = await prisma.productionWorkflowSettings.findUnique({
        where: { company_id: companyId },
      });

      if (settings) {
        if (stage === 'cutting' && settings.skip_cutting) {
          return ApiResponse.error({
            res,
            statusCode: 400,
            message: 'Cutting stage is disabled for your company workflow configuration.',
          });
        }
        if (stage === 'bundle' && settings.skip_bundle) {
          return ApiResponse.error({
            res,
            statusCode: 400,
            message: 'Bundle stage is disabled for your company workflow configuration.',
          });
        }
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
