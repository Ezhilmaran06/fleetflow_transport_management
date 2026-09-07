/**
 * Standard API Response Handlers
 */

const successResponse = (res, { data = null, message = 'Operation successful', metadata = null, statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(metadata ? { metadata } : {})
  });
};

const errorResponse = (res, { message = 'An error occurred', statusCode = 500, errorCode = 'SERVER_ERROR', details = null }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details: details || {}
  });
};

module.exports = {
  successResponse,
  errorResponse
};
