// src/routes/health.routes.js — Health & readiness endpoints
const router = require('express').Router();
const { prisma } = require('../config/database');
const { getRedis } = require('../config/redis');
const { asyncHandler } = require('../middleware/errorHandler');

// Liveness probe
router.get('/', (req, res) => {
  res.json({
    status:    'ok',
    service:   'payro-api',
    version:   process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),
    env:       process.env.NODE_ENV,
  });
});

// Readiness probe (checks DB + Redis)
router.get('/ready', asyncHandler(async (req, res) => {
  const checks = { database: false, redis: false };
  let healthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    healthy = false;
    checks.databaseError = err.message;
  }

  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      checks.redis = true;
    } else {
      checks.redis = false;
      checks.redisError = 'Redis not connected (optional)';
    }
  } catch (err) {
    checks.redis = false;
    checks.redisError = err.message;
  }

  res.status(healthy ? 200 : 503).json({
    status:    healthy ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  });
}));

// Deep metrics
router.get('/metrics', asyncHandler(async (req, res) => {
  const [employeeCount, payrollCount, transactionCount] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.payrollRun.count({ where: { deletedAt: null } }),
    prisma.transaction.count(),
  ]);

  const mem = process.memoryUsage();
  res.json({
    timestamp:  new Date().toISOString(),
    uptime:     Math.floor(process.uptime()),
    memory: {
      rss:        `${Math.round(mem.rss / 1024 / 1024)} MB`,
      heapUsed:   `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      heapTotal:  `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
    },
    database: {
      employees:    employeeCount,
      payrollRuns:  payrollCount,
      transactions: transactionCount,
    },
  });
}));

module.exports = router;
