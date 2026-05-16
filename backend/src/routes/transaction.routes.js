// src/routes/transaction.routes.js
const router = require('express').Router();
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireMinRole } = require('../middleware/auth');

router.use(authenticate);

// List transactions
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, type, employeeId, payrollRunId, from, to } = req.query;
  const where = {};
  if (status)       where.status       = status;
  if (type)         where.type         = type;
  if (employeeId)   where.employeeId   = employeeId;
  if (payrollRunId) where.payrollRunId = payrollRunId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true } },
        payrollRun: { select: { name: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const formatted = transactions.map(t => ({
    ...t,
    amount: Number(t.amount),
    exchangeRate: t.exchangeRate ? Number(t.exchangeRate) : null,
  }));

  ApiResponse.paginated(res, formatted, buildPagination(page, limit, total));
}));

// Get single transaction
router.get('/:id', asyncHandler(async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: {
      employee: { select: { firstName: true, lastName: true, employeeId: true } },
      payrollRun: { select: { name: true, periodStart: true, periodEnd: true } },
    },
  });
  if (!tx) return ApiResponse.notFound(res, 'Transaction');
  ApiResponse.success(res, { ...tx, amount: Number(tx.amount) });
}));

// Transaction summary / aggregates
router.get('/summary/totals', requireMinRole('HR_MANAGER'), asyncHandler(async (req, res) => {
  const { from, to, organizationId } = req.query;
  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const [byStatus, byType, grandTotal] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['status'],
      where,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  ApiResponse.success(res, {
    grandTotal: {
      amount: Number(grandTotal._sum.amount || 0),
      count:  grandTotal._count.id,
    },
    byStatus: byStatus.map(s => ({ status: s.status, amount: Number(s._sum.amount || 0), count: s._count.id })),
    byType:   byType.map(t => ({ type: t.type, amount: Number(t._sum.amount || 0), count: t._count.id })),
  });
}));

module.exports = router;
