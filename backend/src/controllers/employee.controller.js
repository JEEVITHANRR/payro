// src/controllers/employee.controller.js
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../config/redis');

// ─── List employees ───────────────────────────────────────────────
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const {
    search, status, departmentId, employmentType,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const where = { deletedAt: null };

  if (search) {
    where.OR = [
      { firstName:  { contains: search, mode: 'insensitive' } },
      { lastName:   { contains: search, mode: 'insensitive' } },
      { email:      { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } },
      { title:      { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status)         where.status         = status;
  if (departmentId)   where.departmentId   = departmentId;
  if (employmentType) where.employmentType = employmentType;

  const validSortFields = ['firstName', 'lastName', 'hireDate', 'baseSalary', 'createdAt', 'status'];
  const orderBy = validSortFields.includes(sortBy)
    ? { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' }
    : { createdAt: 'desc' };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where, skip, take: limit,
      orderBy,
      select: {
        id: true, employeeId: true, firstName: true, lastName: true,
        email: true, title: true, status: true,
        employmentType: true, hireDate: true, baseSalary: true,
        targetSalary: true, currency: true, avatarUrl: true,
        promotedAt: true,
        department: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  ApiResponse.paginated(res, employees, buildPagination(page, limit, total));
});

// ─── Get single employee ──────────────────────────────────────────
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `employee:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const employee = await prisma.employee.findFirst({
    where: { id, deletedAt: null },
    include: {
      department:  { select: { id: true, name: true, code: true } },
      manager:     { select: { id: true, firstName: true, lastName: true, title: true } },
      user:        { select: { id: true, email: true, role: true, lastLoginAt: true } },
      payrollEntries: {
        orderBy: { createdAt: 'desc' }, take: 3,
        include: { payrollRun: { select: { name: true, periodStart: true, status: true } } },
      },
      attendance: {
        orderBy: { date: 'desc' }, take: 30,
        select: { date: true, status: true, hoursWorked: true },
      },
    },
  });

  if (!employee) throw new AppError('Employee not found.', 404);
  await cacheSet(cacheKey, employee, 120);
  ApiResponse.success(res, employee);
});

// ─── Create employee ──────────────────────────────────────────────
exports.create = asyncHandler(async (req, res) => {
  const data = req.validatedBody;

  // Generate employee ID
  const count = await prisma.employee.count();
  const employeeId = `PAY-${String(count + 1000 + count).padStart(4, '0')}`;

  const employee = await prisma.employee.create({
    data: { ...data, employeeId, hireDate: new Date(data.hireDate) },
    include: {
      department: { select: { id: true, name: true } },
    },
  });

  // Update department headcount
  await prisma.department.update({
    where: { id: data.departmentId },
    data: { headcount: { increment: 1 } },
  });

  await cacheDelPattern('employees:*');

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to('org:all').emit('employee:created', {
      id: employee.id, name: `${employee.firstName} ${employee.lastName}`,
      title: employee.title, department: employee.department?.name,
    });
  }

  ApiResponse.created(res, employee, 'Employee created successfully.');
});

// ─── Update employee ──────────────────────────────────────────────
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validatedBody;

  const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Employee not found.', 404);

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...data,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
    },
    include: {
      department: { select: { id: true, name: true } },
    },
  });

  await cacheDel(`employee:${id}`);

  ApiResponse.success(res, updated, 'Employee updated successfully.');
});

// ─── Soft delete employee ─────────────────────────────────────────
exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Employee not found.', 404);

  await prisma.employee.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: 'TERMINATED',
    },
  });

  await prisma.department.update({
    where: { id: existing.departmentId },
    data: { headcount: { decrement: 1 } },
  });

  await cacheDel(`employee:${id}`);

  ApiResponse.success(res, null, 'Employee removed successfully.');
});

// ─── Employee stats ───────────────────────────────────────────────
exports.stats = asyncHandler(async (req, res) => {
  const cacheKey = 'employee:stats';
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const [total, byStatus, byDept, recentHires] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.employee.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true },
    }),
    prisma.employee.groupBy({
      by: ['departmentId'],
      where: { deletedAt: null },
      _count: { departmentId: true },
    }),
    prisma.employee.findMany({
      where: {
        deletedAt: null,
        hireDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { hireDate: 'desc' },
      take: 5,
      select: { id: true, firstName: true, lastName: true, title: true, hireDate: true },
    }),
  ]);

  const stats = { total, byStatus, byDept, recentHires };
  await cacheSet(cacheKey, stats, 300);
  ApiResponse.success(res, stats);
});

// ─── Promotions (recent) ──────────────────────────────────────────
exports.promotions = asyncHandler(async (req, res) => {
  const promoted = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      promotedAt: { not: null, gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { promotedAt: 'desc' },
    take: 10,
    select: {
      id: true, firstName: true, lastName: true, title: true,
      avatarUrl: true, promotedAt: true, yearsOfService: true,
      department: { select: { name: true } },
    },
  });
  ApiResponse.success(res, promoted);
});
// ─── Employee Performance Insights (AI-Powered) ────────────────────
exports.getInsights = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      attendance: { take: 30, orderBy: { date: 'desc' } },
      payrollEntries: { take: 12, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!employee) throw new AppError('Employee not found.', 404);

  // Simple heuristic-based performance AI
  const attendanceRate = employee.attendance.length > 0 
    ? (employee.attendance.filter(a => a.status === 'PRESENT').length / employee.attendance.length) * 100
    : 100;
  
  const tenureMonths = Math.floor((new Date() - new Date(employee.hireDate)) / (1000 * 60 * 60 * 24 * 30.44));
  
  const salaryComp = employee.baseSalary ? (Number(employee.baseSalary) / 120000) * 100 : 0; // Relative to market mean 120k

  const insights = {
    performanceScore: Math.min(100, Math.round(attendanceRate * 0.4 + (tenureMonths > 12 ? 30 : 10) + (salaryComp > 90 ? 30 : 10))),
    reliabilityIndex: attendanceRate.toFixed(1) + '%',
    tenureAssessment: tenureMonths > 24 ? 'LEGACY' : tenureMonths > 12 ? 'ESTABLISHED' : 'ONBOARDING',
    marketCompetitiveness: salaryComp > 110 ? 'PREMIUM' : salaryComp > 90 ? 'OPTIMAL' : 'BELOW_PAR',
    recommendations: [
      attendanceRate < 90 ? 'Review attendance consistency.' : 'Maintain high reliability.',
      salaryComp < 90 ? 'Review compensation against market standards.' : 'Compensation is competitive.',
      tenureMonths > 12 && !employee.promotedAt ? 'Assess for potential promotion or growth role.' : 'Focus on current role excellence.'
    ]
  };

  ApiResponse.success(res, insights);
});
