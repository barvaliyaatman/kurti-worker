import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.url} - ${statusCode} ${message}`, {
    stack: err.stack,
  });

  return ApiResponse.error({
    res,
    statusCode,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
