// src/controllers/audit.controller.js
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { action, entity, actorId, from, to } = req.query;

  const where = {};
  if (action)  where.action = action;
  if (entity)  where.entity = entity;
  if (actorId) where.actorId = actorId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { firstName: true, lastName: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  ApiResponse.paginated(res, logs, buildPagination(page, limit, total));
});

exports.getById = asyncHandler(async (req, res) => {
  const log = await prisma.auditLog.findUnique({
    where: { id: req.params.id },
    include: { actor: true },
  });
  if (!log) return ApiResponse.notFound(res, 'Audit log');
  ApiResponse.success(res, log);
});
