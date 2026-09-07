const logger = require('../config/logger');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Validation error';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate entry';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = 'CORS policy: origin not allowed';
  }

  if (!(err instanceof AppError) || statusCode >= 500) {
    logger.error('%s %s - %s', req.method, req.originalUrl, err.stack || err.message);
  } else {
    logger.warn('%s %s - %s', req.method, req.originalUrl, message);
  }

  const hideDetails =
    process.env.NODE_ENV === 'production' && statusCode >= 500 && !(err instanceof AppError);
  const response = ApiResponse.error(hideDetails ? 'Internal server error' : message, errors);

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res) => {
  res.status(404).json(ApiResponse.error(`Route ${req.originalUrl} not found`));
};

module.exports = { errorHandler, notFoundHandler };
