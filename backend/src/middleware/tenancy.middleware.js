import { ApiResponse } from '../utils/apiResponse.js';

/**
 * requireCompany – middleware that ensures the authenticated user belongs to a company.
 * SUPER_ADMIN users are exempt and may operate globally.
 * All other roles (OWNER, MANAGER, CUTTING_MASTER) must have a valid company_id.
 */
export const requireCompany = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error({ res, statusCode: 401, message: 'Authentication required.' });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next(); // Super Admin bypasses company scope globally
  }

  if (!req.user.company_id) {
    return ApiResponse.error({
      res,
      statusCode: 403,
      message: 'Your account is not assigned to a company. Please contact a Super Admin.',
    });
  }

  return next();
};

/**
 * getCompanyFilter – returns a Prisma-compatible where clause fragment for company scoping.
 * SUPER_ADMIN returns {} (no filter – sees all companies).
 * All other roles return { company_id: req.user.company_id }.
 */
export const getCompanyFilter = (user) => {
  if (user.role === 'SUPER_ADMIN') return {};
  return { company_id: user.company_id };
};

/**
 * assertCompanyOwnership – verifies a record belongs to the logged-in user's company.
 * Throws/returns false if ownership check fails.
 * SUPER_ADMIN always passes.
 */
export const assertCompanyOwnership = (record, user) => {
  if (user.role === 'SUPER_ADMIN') return true;
  return record.company_id === user.company_id;
};
