// src/controllers/analytics.controller.js — Charts and report data
const { prisma } = require('../config/database');
const { ApiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { cacheGet, cacheSet } = require('../config/redis');

// ─── Payroll trend (12-month) ─────────────────────────────────────
exports.payrollTrend = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `analytics:payroll-trend:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const runs = await prisma.payrollRun.findMany({
    where: {
      organizationId: orgId,
      periodStart: { gte: twelveMonthsAgo },
      status: { in: ['RELEASED', 'PROCESSING'] },
    },
    select: {
      periodStart:  true,
      totalNet:     true,
      totalGross:   true,
      totalTax:     true,
      employeeCount:true,
    },
    orderBy: { periodStart: 'asc' },
  });

  const trend = runs.map(r => ({
    period:        r.periodStart.toISOString().slice(0, 7),
    totalNet:      Number(r.totalNet),
    totalGross:    Number(r.totalGross),
    totalTax:      Number(r.totalTax),
    employeeCount: r.employeeCount,
  }));

  await cacheSet(cacheKey, trend, 3600);
  ApiResponse.success(res, trend);
});

// ─── Department budget breakdown ──────────────────────────────────
exports.budgetBreakdown = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `analytics:budget:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const departments = await prisma.department.findMany({
    where: { organizationId: orgId, isActive: true },
    select: {
      name:            true,
      code:            true,
      budgetAllocated: true,
      budgetUsed:      true,
      headcount:       true,
    },
  });

  const breakdown = departments.map(d => ({
    name:             d.name,
    code:             d.code,
    allocated:        Number(d.budgetAllocated),
    used:             Number(d.budgetUsed),
    remaining:        Number(d.budgetAllocated) - Number(d.budgetUsed),
    utilizationPct:   Number(d.budgetAllocated) > 0
      ? Math.round((Number(d.budgetUsed) / Number(d.budgetAllocated)) * 100)
      : 0,
    headcount:        d.headcount,
  }));

  await cacheSet(cacheKey, breakdown, 600);
  ApiResponse.success(res, breakdown);
});

// ─── Headcount growth over time ───────────────────────────────────
exports.headcountTrend = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `analytics:headcount:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  // Build monthly snapshots for last 12 months
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }

  const trend = await Promise.all(months.map(async (monthDate) => {
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    const count = await prisma.employee.count({
      where: {
        organizationId: orgId,
        hireDate: { lte: nextMonth },
        OR: [
          { deletedAt: null },
          { deletedAt: { gt: monthDate } },
        ],
      },
    });
    return {
      period: monthDate.toISOString().slice(0, 7),
      count,
    };
  }));

  await cacheSet(cacheKey, trend, 3600);
  ApiResponse.success(res, trend);
});

// ─── Compensation analysis ────────────────────────────────────────
exports.compensationAnalysis = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `analytics:compensation:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const [byDept, overallStats] = await Promise.all([
    prisma.employee.groupBy({
      by: ['departmentId'],
      where: { organizationId: orgId, deletedAt: null, status: 'ACTIVE' },
      _avg: { baseSalary: true },
      _min: { baseSalary: true },
      _max: { baseSalary: true },
      _count: { id: true },
    }),
    prisma.employee.aggregate({
      where: { organizationId: orgId, deletedAt: null, status: 'ACTIVE' },
      _avg: { baseSalary: true },
      _min: { baseSalary: true },
      _max: { baseSalary: true },
      _sum: { baseSalary: true },
    }),
  ]);

  const deptIds = byDept.map(d => d.departmentId);
  const depts = await prisma.department.findMany({
    where: { id: { in: deptIds } },
    select: { id: true, name: true },
  });
  const deptMap = depts.reduce((m, d) => { m[d.id] = d.name; return m; }, {});

  const result = {
    overall: {
      avg:   Math.round(Number(overallStats._avg.baseSalary || 0)),
      min:   Number(overallStats._min.baseSalary || 0),
      max:   Number(overallStats._max.baseSalary || 0),
      total: Number(overallStats._sum.baseSalary || 0),
    },
    byDepartment: byDept.map(d => ({
      department: deptMap[d.departmentId] || 'Unknown',
      avg:        Math.round(Number(d._avg.baseSalary || 0)),
      min:        Number(d._min.baseSalary || 0),
      max:        Number(d._max.baseSalary || 0),
      headcount:  d._count.id,
    })),
  };

  await cacheSet(cacheKey, result, 1800);
  ApiResponse.success(res, result);
});

// ─── Tax liability trend ──────────────────────────────────────────
exports.taxTrend = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `analytics:tax-trend:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const runs = await prisma.payrollRun.findMany({
    where: { organizationId: orgId, status: { in: ['RELEASED', 'PROCESSING'] } },
    select: { periodStart: true, totalTax: true },
    orderBy: { periodStart: 'asc' },
    take: 12,
  });

  const trend = runs.map(r => ({
    period:   r.periodStart.toISOString().slice(0, 7),
    taxAmount: Number(r.totalTax),
  }));

  await cacheSet(cacheKey, trend, 3600);
  ApiResponse.success(res, trend);
});

// ─── Export report (returns structured data for PDF generation) ───
exports.exportReport = asyncHandler(async (req, res) => {
  const { type = 'MONTHLY', period, organizationId = 'org-techflow-001' } = req.query;

  const run = await prisma.payrollRun.findFirst({
    where: { organizationId, status: 'RELEASED' },
    orderBy: { createdAt: 'desc' },
    include: {
      entries: {
        include: {
          employee: { select: { firstName: true, lastName: true, title: true, employeeId: true } },
          department: { select: { name: true } },
        },
      },
    },
  });

  if (!run) {
    return ApiResponse.success(res, { message: 'No released payroll found for export.' });
  }

  const report = {
    generatedAt:  new Date().toISOString(),
    reportType:   type,
    organization: 'TechFlow Technologies Inc.',
    period:       run.name,
    summary: {
      totalGross:      Number(run.totalGross),
      totalNet:        Number(run.totalNet),
      totalTax:        Number(run.totalTax),
      totalDeductions: Number(run.totalDeductions),
      employeeCount:   run.employeeCount,
    },
    entries: run.entries.map(e => ({
      employeeId:  e.employee.employeeId,
      name:        `${e.employee.firstName} ${e.employee.lastName}`,
      title:       e.employee.title,
      department:  e.department.name,
      baseSalary:  Number(e.baseSalary),
      grossPay:    Number(e.grossSalary),
      netPay:      Number(e.netSalary),
      taxWithheld: Number(e.taxAmount),
      bonuses:     Number(e.bonuses),
      deductions:  Number(e.deductions),
    })),
  };

  ApiResponse.success(res, report, 'Report generated successfully.');
});
