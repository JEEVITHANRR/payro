// src/controllers/department.controller.js
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { organizationId } = req.query;
  const where = { isActive: true, deletedAt: null };
  if (organizationId) where.organizationId = organizationId;

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where, skip, take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { employees: { where: { deletedAt: null } } } },
      },
    }),
    prisma.department.count({ where }),
  ]);

  const formatted = departments.map(d => ({
    ...d,
    budgetAllocated:  Number(d.budgetAllocated),
    budgetUsed:       Number(d.budgetUsed),
    employeeCount:    d._count.employees,
    utilizationPct:   Number(d.budgetAllocated) > 0
      ? Math.round((Number(d.budgetUsed) / Number(d.budgetAllocated)) * 100)
      : 0,
  }));

  ApiResponse.paginated(res, formatted, buildPagination(page, limit, total));
});

exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dept = await prisma.department.findFirst({
    where: { id, deletedAt: null },
    include: {
      employees: {
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { id: true, firstName: true, lastName: true, title: true, avatarUrl: true },
        take: 10,
      },
    },
  });
  if (!dept) throw new AppError('Department not found.', 404);
  ApiResponse.success(res, {
    ...dept,
    budgetAllocated: Number(dept.budgetAllocated),
    budgetUsed:      Number(dept.budgetUsed),
  });
});

exports.create = asyncHandler(async (req, res) => {
  const data = req.validatedBody;
  const dept = await prisma.department.create({ data });
  ApiResponse.created(res, dept, 'Department created.');
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dept = await prisma.department.update({
    where: { id },
    data: req.validatedBody,
  });
  ApiResponse.success(res, dept, 'Department updated.');
});

exports.remove = asyncHandler(async (req, res) => {
  await prisma.department.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date(), isActive: false },
  });
  ApiResponse.success(res, null, 'Department removed.');
});
