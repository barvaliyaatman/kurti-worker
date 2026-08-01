import { ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Validation Failure',
        error: error.errors,
      });
    }
    return next(error);
  }
};
