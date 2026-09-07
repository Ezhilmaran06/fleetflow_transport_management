const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    return errorResponse(res, {
      message: `Duplicate entry: '${val}' already exists for ${field}.`,
      statusCode: 409,
      errorCode: 'DUPLICATE_KEY',
      details: { field, value: val }
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = {};
    for (let key in err.errors) {
      details[key] = err.errors[key].message;
    }
    return errorResponse(res, {
      message: 'Validation failed on one or more fields',
      statusCode: 422,
      errorCode: 'VALIDATION_ERROR',
      details
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, {
      message: `Invalid format for field '${err.path}'`,
      statusCode: 400,
      errorCode: 'INVALID_ID',
      details: { path: err.path, value: err.value }
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return errorResponse(res, {
      message: `File upload error: ${err.message}`,
      statusCode: 400,
      errorCode: 'FILE_UPLOAD_ERROR'
    });
  }

  // Default server error
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected internal server error occurred' 
    : err.message || 'Server error';

  return errorResponse(res, {
    message,
    statusCode: err.statusCode || 500,
    errorCode: err.errorCode || 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'production' ? null : { stack: err.stack }
  });
};

module.exports = errorHandler;
