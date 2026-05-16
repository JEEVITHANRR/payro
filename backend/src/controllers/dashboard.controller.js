// src/controllers/dashboard.controller.js — Powers the Executive Dashboard
const { prisma } = require('../config/database');
const { ApiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { cacheGet, cacheSet } = require('../config/redis');

// ─── Main dashboard summary ───────────────────────────────────────
// Feeds: Total Payroll, Budget Utilization, AI Insights, Tax Liability
exports.summary = asyncHandler(async (req, res) => {
  // Get org dynamically — use query param or fallback to first org in DB
  let orgId = req.query.organizationId;
  if (!orgId) {
    const firstOrg = await prisma.organization.findFirst({ select: { id: true } });
    orgId = firstOrg?.id || 'none';
  }
  const cacheKey = `dashboard:summary:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    latestPayroll,
    prevPayroll,
    totalEmployees,
    activeEmployees,
    departmentPayments,
    aiInsight,
    taxLiability,
    recentActivity,
  ] = await Promise.all([
    // Latest payroll run
    prisma.payrollRun.findFirst({
      where: {
        organizationId: orgId,
        deletedAt: null,
        periodStart: { gte: monthStart },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Previous month payroll
    prisma.payrollRun.findFirst({
      where: {
        organizationId: orgId,
        deletedAt: null,
        periodStart: { gte: prevMonthStart, lte: prevMonthEnd },
        status: 'RELEASED',
      },
    }),
    // Total employees
    prisma.employee.count({
      where: { organizationId: orgId, deletedAt: null },
    }),
    // Active employees
    prisma.employee.count({
      where: { organizationId: orgId, deletedAt: null, status: 'ACTIVE' },
    }),
    // Per-department payment status
    prisma.department.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: {
        id: true, name: true, code: true,
        budgetAllocated: true, budgetUsed: true, headcount: true,
      },
    }),
    // Top AI insight
    prisma.aIInsight.findFirst({
      where: { organizationId: orgId, isActive: true },
      orderBy: [{ severity: 'desc' }, { confidence: 'desc' }],
    }),
    // Tax liability (sum of taxAmount this month)
    prisma.payrollEntry.aggregate({
      where: {
        payrollRun: {
          organizationId: orgId,
          periodStart: { gte: monthStart },
        },
      },
      _sum: { taxAmount: true },
    }),
    // Recent system activity (last 10 audit logs)
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        actor: { select: { firstName: true, lastName: true, role: true } },
      },
    }),
  ]);

  // Budget utilization calculation
  const totalBudget = departmentPayments.reduce(
    (s, d) => s + Number(d.budgetAllocated), 0
  );
  const totalUsed = departmentPayments.reduce(
    (s, d) => s + Number(d.budgetUsed), 0
  );
  const budgetUtilizationPct = totalBudget > 0
    ? Math.round((totalUsed / totalBudget) * 1000) / 10
    : 0;

  // Month-over-month change
  const currentTotal = Number(latestPayroll?.totalNet || 0);
  const prevTotal    = Number(prevPayroll?.totalNet || 0);
  const momChange    = prevTotal > 0
    ? Math.round(((currentTotal - prevTotal) / prevTotal) * 1000) / 10
    : 0;

  const summary = {
    period: {
      label:  latestPayroll?.name || `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} Payroll`,
      start:  monthStart.toISOString(),
      end:    monthEnd.toISOString(),
    },
    payroll: {
      totalCost:        currentTotal,
      currency:         latestPayroll?.currency || 'USD',
      status:           latestPayroll?.status || 'DRAFT',
      employeeCount:    latestPayroll?.employeeCount || totalEmployees,
      totalGross:       Number(latestPayroll?.totalGross || 0),
      totalDeductions:  Number(latestPayroll?.totalDeductions || 0),
      totalTax:         Number(latestPayroll?.totalTax || 0),
      momChangePct:     momChange,
      payrollId:        latestPayroll?.id,
    },
    budget: {
      totalAllocated:    totalBudget,
      totalUsed,
      utilizationPct:    budgetUtilizationPct,
    },
    workforce: {
      total:             totalEmployees,
      active:            activeEmployees,
      onboarding:        totalEmployees - activeEmployees,
    },
    departments:         departmentPayments.map(d => ({
      ...d,
      budgetAllocated:   Number(d.budgetAllocated),
      budgetUsed:        Number(d.budgetUsed),
      utilizationPct:    Number(d.budgetAllocated) > 0
        ? Math.round((Number(d.budgetUsed) / Number(d.budgetAllocated)) * 1000) / 10
        : 0,
      status:            Number(d.budgetUsed) >= Number(d.budgetAllocated) ? 'RELEASED' : 'PROCESSING',
    })),
    aiInsight:           aiInsight ? {
      id:               aiInsight.id,
      message:          aiInsight.message,
      confidence:       Number(aiInsight.confidence),
      type:             aiInsight.type,
      severity:         aiInsight.severity,
      potentialSaving:  Number(aiInsight.potentialSaving || 0),
    } : null,
    taxLiability: {
      amount:           Number(taxLiability._sum.taxAmount || 0),
      currency:         'USD',
    },
    recentActivity:      recentActivity.map(log => ({
      id:        log.id,
      time:      log.createdAt,
      action:    log.action,
      entity:    log.entity,
      actor:     `${log.actor.firstName} ${log.actor.lastName}`,
      role:      log.actor.role,
      metadata:  log.metadata,
    })),
  };

  await cacheSet(cacheKey, summary, 60); // 1-min cache for real-time feel
  ApiResponse.success(res, summary);
});

// ─── Employee distribution (bar chart) ────────────────────────────
exports.employeeDistribution = asyncHandler(async (req, res) => {
  let orgId = req.query.organizationId;
  if (!orgId) {
    const firstOrg = await prisma.organization.findFirst({ select: { id: true } });
    orgId = firstOrg?.id || 'none';
  }
  const cacheKey = `dashboard:distribution:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const departments = await prisma.department.findMany({
    where: { organizationId: orgId, deletedAt: null },
    select: {
      id: true, name: true, code: true, headcount: true,
      _count: {
        select: {
          employees: {
            where: { deletedAt: null, employmentType: 'FULL_TIME' },
          },
        },
      },
    },
  });

  const contractors = await prisma.employee.groupBy({
    by: ['departmentId'],
    where: {
      organizationId: orgId,
      deletedAt: null,
      employmentType: 'CONTRACTOR',
    },
    _count: { departmentId: true },
  });

  const contractorMap = contractors.reduce((m, c) => {
    m[c.departmentId] = c._count.departmentId;
    return m;
  }, {});

  const distribution = departments.map(d => ({
    department:  d.name,
    code:        d.code,
    fullTime:    d._count.employees,
    contractors: contractorMap[d.id] || 0,
    total:       d.headcount,
  }));

  await cacheSet(cacheKey, distribution, 300);
  ApiResponse.success(res, distribution);
});

// ─── Live activity stream ─────────────────────────────────────────
exports.liveActivity = asyncHandler(async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      actor: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } },
    },
  });

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  ApiResponse.success(res, {
    auditLogs: logs.map(log => ({
      id:        log.id,
      createdAt: log.createdAt,
      action:    log.action,
      entity:    log.entity,
      actor:     `${log.actor.firstName} ${log.actor.lastName}`,
      role:      log.actor.role,
      metadata:  log.metadata,
    })),
    notifications,
  });
});

// ─── KPI metrics for quick stats ──────────────────────────────────
exports.kpis = asyncHandler(async (req, res) => {
  let orgId = req.query.organizationId;
  if (!orgId) {
    const firstOrg = await prisma.organization.findFirst({ select: { id: true } });
    orgId = firstOrg?.id || 'none';
  }
  const cacheKey = `dashboard:kpis:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo  = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [newHires, newHiresPrev, totalWorkforce, avgSalary] = await Promise.all([
    prisma.employee.count({
      where: { organizationId: orgId, hireDate: { gte: thirtyDaysAgo }, deletedAt: null },
    }),
    prisma.employee.count({
      where: { organizationId: orgId, hireDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, deletedAt: null },
    }),
    prisma.employee.count({
      where: { organizationId: orgId, deletedAt: null },
    }),
    prisma.employee.aggregate({
      where: { organizationId: orgId, deletedAt: null, status: 'ACTIVE' },
      _avg: { baseSalary: true },
    }),
  ]);

  const growthPct = newHiresPrev > 0
    ? Math.round(((newHires - newHiresPrev) / newHiresPrev) * 100)
    : 0;

  const kpis = {
    totalWorkforce: { value: totalWorkforce, changePct: growthPct },
    avgLongevity:   { value: 3.2, unit: 'years', changePct: 0 },
    avgSalary:      { value: Math.round(Number(avgSalary._avg.baseSalary || 0)), currency: 'USD' },
    retentionRate:  { value: 98, unit: '%' },
  };

  await cacheSet(cacheKey, kpis, 600);
  ApiResponse.success(res, kpis);
});
