// src/middleware/auth.js — JWT verification + RBAC middleware
const { verifyAccessToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const { cacheGet, cacheSet } = require('../config/redis');
const { ApiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('./errorHandler');

// Role hierarchy
const ROLE_HIERARCHY = {
  SUPER_ADMIN:      100,
  ADMIN:            90,
  CFO:              80,
  PAYROLL_MANAGER:  70,
  HR_MANAGER:       60,
  AUDITOR:          50,
  EMPLOYEE:         10,
};

// ─── Verify JWT ───────────────────────────────────────────────────
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return ApiResponse.unauthorized(res, 'Authentication required.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return ApiResponse.unauthorized(res, err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.');
  }

  // Try cache first
  const cacheKey = `user:${decoded.sub}`;
  let user = await cacheGet(cacheKey);

  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true, email: true, role: true,
        firstName: true, lastName: true,
        avatarUrl: true, isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) return ApiResponse.unauthorized(res, 'User no longer exists.');
    await cacheSet(cacheKey, user, 300); // 5-min cache
  }

  if (!user.isActive) {
    return ApiResponse.unauthorized(res, 'Account has been deactivated.');
  }

  req.user = user;
  req.userId = user.id;
  next();
});

// ─── Require specific roles ───────────────────────────────────────
const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return ApiResponse.unauthorized(res);
  if (roles.includes(req.user.role)) return next();
  return ApiResponse.forbidden(res, `Access requires one of: ${roles.join(', ')}`);
};

// ─── Require minimum role level ───────────────────────────────────
const requireMinRole = (minRole) => (req, res, next) => {
  if (!req.user) return ApiResponse.unauthorized(res);
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const minLevel  = ROLE_HIERARCHY[minRole] || 0;
  if (userLevel >= minLevel) return next();
  return ApiResponse.forbidden(res, 'Insufficient permissions.');
};

// ─── Self or admin ─────────────────────────────────────────────────
const requireSelfOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (!req.user) return ApiResponse.unauthorized(res);
  const isAdmin = ROLE_HIERARCHY[req.user.role] >= ROLE_HIERARCHY['ADMIN'];
  const isSelf  = req.params[paramName] === req.user.id;
  if (isAdmin || isSelf) return next();
  return ApiResponse.forbidden(res, 'You can only access your own resources.');
};

// ─── Optional auth (no error if not authenticated) ────────────────
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    }
  } catch { /* ignore */ }
  next();
});

module.exports = {
  authenticate,
  requireRoles,
  requireMinRole,
  requireSelfOrAdmin,
  optionalAuth,
  ROLE_HIERARCHY,
};
