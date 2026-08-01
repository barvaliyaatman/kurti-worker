import { ApiResponse } from '../utils/apiResponse.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error({
        res,
        statusCode: 401,
        message: 'Unauthorized access.',
      });
    }

    // Super Admin has global access to all platform resources
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error({
        res,
        statusCode: 403,
        message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource.`,
      });
    }

    return next();
  };
};
