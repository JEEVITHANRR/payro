// src/utils/apiResponse.js — Standardized API response helpers
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res, message = 'Internal server error', statusCode = 500, errors = null) {
    const body = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
  }

  static validationError(res, errors) {
    return this.error(res, 'Validation failed', 422, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} not found`, 404);
  }

  static conflict(res, message = 'Resource already exists') {
    return this.error(res, message, 409);
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }
}

// Pagination helper
function buildPagination(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

function getPaginationParams(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { ApiResponse, buildPagination, getPaginationParams };
