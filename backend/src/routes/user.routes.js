// src/routes/user.routes.js
const router = require('express').Router();
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticate, requireMinRole, requireSelfOrAdmin } = require('../middleware/auth');
const { cacheDel } = require('../config/redis');
const bcrypt = require('bcryptjs');

router.use(authenticate);

// List users (admins only)
router.get('/', requireMinRole('HR_MANAGER'), asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { role, search } = req.query;
  const where = { deletedAt: null };
  if (role) where.role = role;
  if (search) where.OR = [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName:  { contains: search, mode: 'insensitive' } },
    { email:     { contains: search, mode: 'insensitive' } },
  ];
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, firstName: true, lastName: true,
        isActive: true, lastLoginAt: true, createdAt: true, avatarUrl: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  ApiResponse.paginated(res, users, buildPagination(page, limit, total));
}));

// Get self profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, role: true, firstName: true, lastName: true,
      avatarUrl: true, phone: true, isEmailVerified: true, lastLoginAt: true,
      createdAt: true,
      employee: { select: { id: true, employeeId: true, title: true,
        department: { select: { name: true } } } },
    },
  });
  ApiResponse.success(res, user);
}));

// Get user by ID
router.get('/:id', requireSelfOrAdmin(), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, email: true, role: true, firstName: true, lastName: true,
      avatarUrl: true, isActive: true, lastLoginAt: true, createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found.', 404);
  ApiResponse.success(res, user);
}));

// Update profile
router.patch('/profile', asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatarUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, avatarUrl },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, avatarUrl: true, role: true,
    },
  });
  await cacheDel(`user:${req.user.id}`);
  ApiResponse.success(res, updated, 'Profile updated.');
}));

// Deactivate user (admin only)
router.patch('/:id/deactivate', requireMinRole('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  await cacheDel(`user:${req.params.id}`);
  ApiResponse.success(res, null, 'User deactivated.');
}));

// Reactivate user (admin only)
router.patch('/:id/activate', requireMinRole('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: true } });
  await cacheDel(`user:${req.params.id}`);
  ApiResponse.success(res, null, 'User activated.');
}));

module.exports = router;
