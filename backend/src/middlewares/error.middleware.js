const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Log error
  if (statusCode >= 500) {
    logger.error('Internal Server Error', {
      statusCode,
      message: err.message,
      stack: err.stack,
      url: _req.originalUrl,
      method: _req.method
    });
  } else if (statusCode >= 400) {
    logger.warn('Client Error', {
      statusCode,
      message: err.message,
      url: _req.originalUrl,
      method: _req.method
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};