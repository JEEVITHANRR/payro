// src/controllers/ai.controller.js — AI insights engine
const { prisma } = require('../config/database');
const { ApiResponse, buildPagination, getPaginationParams } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');
const { generateInsights } = require('../ai/insightsEngine');

// ─── List AI insights ─────────────────────────────────────────────
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { type, severity, isActive, organizationId } = req.query;

  const where = {};
  if (type)           where.type           = type;
  if (severity)       where.severity       = severity;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (organizationId) where.organizationId = organizationId;

  const [insights, total] = await Promise.all([
    prisma.aIInsight.findMany({
      where, skip, take: limit,
      orderBy: [{ severity: 'desc' }, { confidence: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.aIInsight.count({ where }),
  ]);

  const formatted = insights.map(i => ({
    ...i,
    confidence:     Number(i.confidence),
    potentialSaving: Number(i.potentialSaving || 0),
  }));

  ApiResponse.paginated(res, formatted, buildPagination(page, limit, total));
});

// ─── Get top insight (for dashboard) ─────────────────────────────
exports.topInsight = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `ai:top:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const insight = await prisma.aIInsight.findFirst({
    where: { organizationId: orgId, isActive: true, isApplied: false },
    orderBy: [{ severity: 'desc' }, { confidence: 'desc' }],
  });

  const formatted = insight ? {
    ...insight,
    confidence:      Number(insight.confidence),
    potentialSaving: Number(insight.potentialSaving || 0),
  } : null;

  await cacheSet(cacheKey, formatted, 300);
  ApiResponse.success(res, formatted);
});

// ─── Apply insight ────────────────────────────────────────────────
exports.applyInsight = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const insight = await prisma.aIInsight.findUnique({ where: { id } });
  if (!insight) throw new AppError('Insight not found.', 404);
  if (insight.isApplied) throw new AppError('Insight already applied.', 400);

  const updated = await prisma.aIInsight.update({
    where: { id },
    data: {
      isApplied: true,
      appliedAt: new Date(),
      appliedBy: req.user.id,
    },
  });

  await cacheDel(`ai:top:${insight.organizationId}`);

  // Notify all admin users
  const admins = await prisma.user.findMany({
    where: { role: { in: ['CFO', 'ADMIN', 'PAYROLL_MANAGER'] }, isActive: true },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: admins.map(a => ({
      userId:  a.id,
      type:    'AI_INSIGHT',
      title:   'AI Recommendation Applied',
      message: `"${insight.title}" has been applied by ${req.user.firstName} ${req.user.lastName}.`,
      data:    { insightId: id },
    })),
  });

  ApiResponse.success(res, updated, 'AI insight applied successfully.');
});

// ─── Dismiss insight ──────────────────────────────────────────────
exports.dismiss = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.aIInsight.update({
    where: { id },
    data: { isActive: false },
  });
  ApiResponse.success(res, null, 'Insight dismissed.');
});

// ─── Trigger insight generation ───────────────────────────────────
exports.generateInsights = asyncHandler(async (req, res) => {
  const { organizationId } = req.body;
  const org = organizationId || 'org-techflow-001';

  // Run analysis async
  setImmediate(() => generateInsights(org).catch(console.error));

  ApiResponse.success(res, null, 'AI insight generation triggered. Results will appear shortly.');
});

// ─── Fraud detection results ──────────────────────────────────────
exports.fraudDetection = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || 'org-techflow-001';
  const cacheKey = `ai:fraud:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const [anomalies, cleared] = await Promise.all([
    prisma.aIInsight.findMany({
      where: { organizationId: orgId, type: 'ANOMALY_DETECTION', isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.transaction.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const result = {
    scannedToday:     14202,
    anomaliesFound:   anomalies.length,
    clearedBatches:   cleared,
    anomalies:        anomalies.map(a => ({
      id:       a.id,
      message:  a.message,
      severity: a.severity,
      metadata: a.metadata,
      createdAt: a.createdAt,
    })),
  };

  await cacheSet(cacheKey, result, 60);
  ApiResponse.success(res, result);
});

// ─── Salary predictions ───────────────────────────────────────────
exports.salaryPredictions = asyncHandler(async (req, res) => {
  const cacheKey = 'ai:salary-predictions';
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const predictions = [
    { role: 'Mid-Level Dev',   minSalary: 142000, maxSalary: 165000, quarter: 'Q4 2024', trend: 'up', growthPct: 8.2 },
    { role: 'Product Lead',    minSalary: 185000, maxSalary: 210000, quarter: 'Q4 2024', trend: 'up', growthPct: 6.5 },
    { role: 'Senior Designer', minSalary: 130000, maxSalary: 155000, quarter: 'Q4 2024', trend: 'stable', growthPct: 2.1 },
    { role: 'Data Scientist',  minSalary: 160000, maxSalary: 195000, quarter: 'Q4 2024', trend: 'up', growthPct: 11.0 },
    { role: 'DevOps Lead',     minSalary: 155000, maxSalary: 180000, quarter: 'Q4 2024', trend: 'up', growthPct: 7.8 },
  ];

  const chartData = [
    { quarter: 'Q1 2024', avgSalary: 138000 },
    { quarter: 'Q2 2024', avgSalary: 142000 },
    { quarter: 'Q3 2024', avgSalary: 147000 },
    { quarter: 'Q4 2024', avgSalary: 153000, predicted: true },
  ];

  const result = { predictions, chartData };
  await cacheSet(cacheKey, result, 3600);
  ApiResponse.success(res, result);
});
