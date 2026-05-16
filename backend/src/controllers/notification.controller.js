// src/controllers/notification.controller.js
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { isRead } = req.query;
  const where = { userId: req.user.id, deletedAt: null };
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user.id, isRead: false, deletedAt: null } }),
  ]);

  ApiResponse.paginated(res, { notifications, unreadCount }, buildPagination(page, limit, total));
});

exports.markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { isRead: true, readAt: new Date() },
  });
  ApiResponse.success(res, null, 'Notification marked as read.');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  ApiResponse.success(res, null, 'All notifications marked as read.');
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { deletedAt: new Date() },
  });
  ApiResponse.success(res, null, 'Notification deleted.');
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false, deletedAt: null },
  });
  ApiResponse.success(res, { count });
});
