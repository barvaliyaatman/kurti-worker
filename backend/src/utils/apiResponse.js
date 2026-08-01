export class ApiResponse {
  static success({ res, statusCode = 200, message = 'Success', data }) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error({ res, statusCode = 500, message = 'Internal Server Error', error }) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error || null,
    });
  }
}
