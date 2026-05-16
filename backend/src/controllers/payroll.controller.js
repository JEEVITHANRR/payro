// src/controllers/payroll.controller.js — Full payroll run lifecycle
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../config/redis');
const { processPayrollJob } = require('../jobs/payrollProcessor');

// ─── List payroll runs ────────────────────────────────────────────
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, organizationId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const where = { deletedAt: null };
  if (status)         where.status         = status;
  if (organizationId) where.organizationId = organizationId;

  const [runs, total] = await Promise.all([
    prisma.payrollRun.findMany({
      where, skip, take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true, name: true, status: true,
        periodStart: true, periodEnd: true, payDate: true,
        totalGross: true, totalNet: true, totalTax: true,
        totalDeductions: true, employeeCount: true, currency: true,
        approvedById: true, approvedAt: true, processedAt: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.payrollRun.count({ where }),
  ]);

  const formatted = runs.map(r => ({
    ...r,
    totalGross:      Number(r.totalGross),
    totalNet:        Number(r.totalNet),
    totalTax:        Number(r.totalTax),
    totalDeductions: Number(r.totalDeductions),
  }));

  ApiResponse.paginated(res, formatted, buildPagination(page, limit, total));
});

// ─── Get single payroll run ───────────────────────────────────────
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `payroll:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const run = await prisma.payrollRun.findFirst({
    where: { id, deletedAt: null },
    include: {
      entries: {
        include: {
          employee: {
            select: {
              id: true, employeeId: true, firstName: true,
              lastName: true, title: true, avatarUrl: true,
              department: { select: { name: true } },
            },
          },
          department: { select: { name: true } },
        },
        orderBy: { netSalary: 'desc' },
      },
      transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!run) throw new AppError('Payroll run not found.', 404);

  // Serialize decimals
  const serialized = {
    ...run,
    totalGross:      Number(run.totalGross),
    totalNet:        Number(run.totalNet),
    totalTax:        Number(run.totalTax),
    totalDeductions: Number(run.totalDeductions),
    entries: run.entries.map(e => ({
      ...e,
      baseSalary:  Number(e.baseSalary),
      grossSalary: Number(e.grossSalary),
      netSalary:   Number(e.netSalary),
      overtime:    Number(e.overtime),
      bonuses:     Number(e.bonuses),
      deductions:  Number(e.deductions),
      taxAmount:   Number(e.taxAmount),
    })),
  };

  await cacheSet(cacheKey, serialized, 120);
  ApiResponse.success(res, serialized);
});

// ─── Create payroll run ───────────────────────────────────────────
exports.create = asyncHandler(async (req, res) => {
  const data = req.validatedBody;

  // Check for overlapping period
  const overlap = await prisma.payrollRun.findFirst({
    where: {
      organizationId: data.organizationId,
      deletedAt: null,
      status: { notIn: ['CANCELLED', 'FAILED'] },
      AND: [
        { periodStart: { lte: new Date(data.periodEnd) } },
        { periodEnd:   { gte: new Date(data.periodStart) } },
      ],
    },
  });
  if (overlap) throw new AppError(`A payroll run already exists for this period: "${overlap.name}"`, 409);

  const run = await prisma.payrollRun.create({
    data: {
      ...data,
      periodStart: new Date(data.periodStart),
      periodEnd:   new Date(data.periodEnd),
      payDate:     new Date(data.payDate),
      createdBy:   req.user.id,
    },
  });

  await cacheDelPattern('dashboard:*');

  ApiResponse.created(res, run, 'Payroll run created.');
});

// ─── Generate entries for all employees ───────────────────────────
exports.generateEntries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const run = await prisma.payrollRun.findFirst({ where: { id, deletedAt: null } });
  if (!run) throw new AppError('Payroll run not found.', 404);
  if (run.status !== 'DRAFT') throw new AppError('Can only generate entries for DRAFT payroll.', 400);

  const employees = await prisma.employee.findMany({
    where: {
      organizationId: run.organizationId,
      deletedAt: null,
      status: { in: ['ACTIVE', 'ONBOARDING'] },
    },
    select: {
      id: true, departmentId: true, baseSalary: true,
      currency: true, employmentType: true,
    },
  });

  // Calculate entries
  const entries = employees.map(emp => {
    const base       = Number(emp.baseSalary);
    const taxRate    = 0.22; // simplified; real impl uses taxInfo brackets
    const taxAmount  = base * taxRate;
    const netSalary  = base - taxAmount;
    return {
      payrollRunId: id,
      employeeId:   emp.id,
      departmentId: emp.departmentId,
      baseSalary:   base,
      grossSalary:  base,
      netSalary,
      taxAmount,
      taxRate:      0.22,
      overtime:     0,
      bonuses:      0,
      deductions:   0,
    };
  });

  // Upsert entries in batch
  await prisma.$transaction([
    prisma.payrollEntry.deleteMany({ where: { payrollRunId: id } }),
    prisma.payrollEntry.createMany({ data: entries }),
  ]);

  // Recalculate totals
  const totals = entries.reduce(
    (acc, e) => ({
      totalGross:      acc.totalGross + e.grossSalary,
      totalNet:        acc.totalNet + e.netSalary,
      totalTax:        acc.totalTax + e.taxAmount,
      totalDeductions: acc.totalDeductions + e.deductions,
    }),
    { totalGross: 0, totalNet: 0, totalTax: 0, totalDeductions: 0 }
  );

  const updated = await prisma.payrollRun.update({
    where: { id },
    data: { ...totals, employeeCount: employees.length },
  });

  await cacheDel(`payroll:${id}`);
  await cacheDelPattern('dashboard:*');

  ApiResponse.success(res, {
    payrollRun: updated,
    entriesGenerated: entries.length,
  }, 'Payroll entries generated successfully.');
});

// ─── Submit for approval ──────────────────────────────────────────
exports.submitForApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const run = await prisma.payrollRun.findFirst({ where: { id, deletedAt: null } });
  if (!run) throw new AppError('Payroll run not found.', 404);
  if (run.status !== 'DRAFT') throw new AppError('Only DRAFT payrolls can be submitted.', 400);

  const updated = await prisma.payrollRun.update({
    where: { id },
    data: { status: 'PENDING_APPROVAL' },
  });

  // Notify CFO/Admin
  const admins = await prisma.user.findMany({
    where: { role: { in: ['CFO', 'ADMIN', 'SUPER_ADMIN'] }, isActive: true },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: admins.map(a => ({
      userId:  a.id,
      type:    'APPROVAL_REQUIRED',
      title:   'Payroll Awaiting Approval',
      message: `${run.name} has been submitted for approval. Total: $${Number(run.totalNet).toLocaleString()}`,
      data:    { payrollRunId: id },
    })),
  });

  const io = req.app.get('io');
  if (io) io.to('role:CFO').to('role:ADMIN').emit('payroll:approval_required', { run: updated });

  await cacheDel(`payroll:${id}`);
  ApiResponse.success(res, updated, 'Payroll submitted for approval.');
});

// ─── Approve payroll ──────────────────────────────────────────────
exports.approve = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const run = await prisma.payrollRun.findFirst({ where: { id, deletedAt: null } });
  if (!run) throw new AppError('Payroll run not found.', 404);
  if (run.status !== 'PENDING_APPROVAL') throw new AppError('Only PENDING_APPROVAL payrolls can be approved.', 400);

  const updated = await prisma.payrollRun.update({
    where: { id },
    data: {
      status:       'APPROVED',
      approvedById: req.user.id,
      approvedAt:   new Date(),
    },
  });

  await cacheDel(`payroll:${id}`);
  await cacheDelPattern('dashboard:*');
  ApiResponse.success(res, updated, 'Payroll approved.');
});

// ─── Process (release) payroll ────────────────────────────────────
exports.process = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const run = await prisma.payrollRun.findFirst({ where: { id, deletedAt: null } });
  if (!run) throw new AppError('Payroll run not found.', 404);
  if (run.status !== 'APPROVED') throw new AppError('Only APPROVED payrolls can be processed.', 400);

  // Mark as processing immediately
  await prisma.payrollRun.update({ where: { id }, data: { status: 'PROCESSING' } });

  // Emit real-time event
  const io = req.app.get('io');
  if (io) io.to('org:all').emit('payroll:processing', { payrollRunId: id, name: run.name });

  // Queue background job
  await processPayrollJob({ payrollRunId: id, userId: req.user.id, io });

  await cacheDel(`payroll:${id}`);
  ApiResponse.success(res, { payrollRunId: id, status: 'PROCESSING' }, 'Payroll processing initiated.');
});

// ─── Update payroll status ────────────────────────────────────────
exports.updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.validatedBody;

  const updated = await prisma.payrollRun.update({
    where: { id },
    data: { status, notes },
  });

  await cacheDel(`payroll:${id}`);
  await cacheDelPattern('dashboard:*');
  ApiResponse.success(res, updated, 'Status updated.');
});

// ─── Department payroll summary ───────────────────────────────────
exports.departmentSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const summary = await prisma.payrollEntry.groupBy({
    by: ['departmentId'],
    where: { payrollRunId: id },
    _sum: { netSalary: true, grossSalary: true, taxAmount: true },
    _count: { employeeId: true },
  });

  const deptIds = summary.map(s => s.departmentId);
  const depts = await prisma.department.findMany({
    where: { id: { in: deptIds } },
    select: { id: true, name: true },
  });
  const deptMap = depts.reduce((m, d) => { m[d.id] = d.name; return m; }, {});

  const result = summary.map(s => ({
    departmentId:   s.departmentId,
    departmentName: deptMap[s.departmentId] || 'Unknown',
    employeeCount:  s._count.employeeId,
    totalNet:       Number(s._sum.netSalary || 0),
    totalGross:     Number(s._sum.grossSalary || 0),
    totalTax:       Number(s._sum.taxAmount || 0),
  }));

  ApiResponse.success(res, result);
});
