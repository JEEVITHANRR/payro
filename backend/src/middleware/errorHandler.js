// src/middleware/errorHandler.js — Centralized error handling
const { logger } = require('../utils/logger');
const { ApiResponse } = require('../utils/apiResponse');

class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message    = err.message || 'Internal Server Error';
  let errors     = err.errors || null;

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.join(', ') || 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related record not found.';
  } else if (err.code === 'P2016') {
    statusCode = 404;
    message = 'Record not found.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path}`, {
      statusCode,
      message,
      stack: err.stack,
      requestId: req.requestId,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} ${statusCode}: ${message}`);
  }

  ApiResponse.error(res, message, statusCode, errors);
}

function notFoundHandler(req, res) {
  ApiResponse.error(res, `Route ${req.method} ${req.path} not found`, 404);
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFoundHandler, AppError, asyncHandler };
