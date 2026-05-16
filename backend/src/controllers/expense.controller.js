// src/controllers/expense.controller.js
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, employeeId, from, to } = req.query;
  const where = { deletedAt: null };
  if (status) where.status = status;
  if (employeeId) where.employeeId = employeeId;
  // Non-admins only see own expenses
  const nonAdmin = !['CFO','ADMIN','SUPER_ADMIN','HR_MANAGER','PAYROLL_MANAGER'].includes(req.user.role);
  if (nonAdmin) {
    const emp = await prisma.employee.findFirst({ where: { userId: req.user.id } });
    if (emp) where.employeeId = emp.id;
  }
  if (from || to) {
    where.submittedAt = {};
    if (from) where.submittedAt.gte = new Date(from);
    if (to)   where.submittedAt.lte = new Date(to);
  }
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where, skip, take: limit,
      orderBy: { submittedAt: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
    }),
    prisma.expense.count({ where }),
  ]);
  ApiResponse.paginated(res, expenses.map(e => ({ ...e, amount: Number(e.amount) })), buildPagination(page, limit, total));
});

exports.create = asyncHandler(async (req, res) => {
  const data = req.validatedBody;
  const expense = await prisma.expense.create({ data });
  ApiResponse.created(res, expense, 'Expense submitted.');
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectedReason } = req.validatedBody;
  const expense = await prisma.expense.update({
    where: { id },
    data: { status, rejectedReason, reviewedAt: new Date(), reviewedBy: req.user.id },
  });
  ApiResponse.success(res, expense, 'Expense status updated.');
});

exports.remove = asyncHandler(async (req, res) => {
  await prisma.expense.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  ApiResponse.success(res, null, 'Expense deleted.');
});
