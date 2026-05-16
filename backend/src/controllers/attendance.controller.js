// src/controllers/attendance.controller.js
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { employeeId, from, to, status } = req.query;
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to)   where.date.lte = new Date(to);
  }
  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where, skip, take: limit,
      orderBy: { date: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
    }),
    prisma.attendance.count({ where }),
  ]);
  ApiResponse.paginated(res, attendance.map(a => ({
    ...a,
    hoursWorked: a.hoursWorked ? Number(a.hoursWorked) : null,
    overtime:    a.overtime ? Number(a.overtime) : null,
  })), buildPagination(page, limit, total));
});

exports.create = asyncHandler(async (req, res) => {
  const data = req.validatedBody;
  const record = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: data.employeeId, date: new Date(data.date) } },
    create: { ...data, date: new Date(data.date) },
    update: { ...data, date: new Date(data.date) },
  });
  ApiResponse.created(res, record, 'Attendance recorded.');
});

exports.summary = asyncHandler(async (req, res) => {
  const { employeeId, month } = req.query;
  if (!employeeId) return ApiResponse.validationError(res, [{ field: 'employeeId', message: 'Required' }]);
  const date = month ? new Date(month + '-01') : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const records = await prisma.attendance.groupBy({
    by: ['status'],
    where: { employeeId, date: { gte: start, lte: end } },
    _count: { status: true },
  });
  const summary = records.reduce((acc, r) => {
    acc[r.status] = r._count.status;
    return acc;
  }, {});
  ApiResponse.success(res, summary);
});
