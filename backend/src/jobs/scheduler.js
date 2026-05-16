// src/jobs/scheduler.js — Cron-based background jobs
const cron = require('node-cron');
const { prisma } = require('../config/database');
const { cacheDelPattern } = require('../config/redis');
const { generateInsights } = require('../ai/insightsEngine');
const { logger } = require('../utils/logger');

function startScheduler(io) {
  logger.info('⏰ Scheduler starting...');

  // ─── 1. AI Insights generation — every day at 2am ──────────────
  cron.schedule('0 2 * * *', async () => {
    logger.info('[Scheduler] Running daily AI insight generation');
    try {
      const orgs = await prisma.organization.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      for (const org of orgs) {
        const insights = await generateInsights(org.id);
        if (io && insights.length > 0) {
          io.to('org:all').emit('ai:insights_refreshed', { count: insights.length });
        }
      }
    } catch (err) {
      logger.error('[Scheduler] AI insight error:', err.message);
    }
  });

  // ─── 2. Stale refresh token cleanup — every day at 3am ─────────
  cron.schedule('0 3 * * *', async () => {
    logger.info('[Scheduler] Cleaning up expired refresh tokens');
    try {
      const { count } = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });
      logger.info(`[Scheduler] Deleted ${count} stale tokens`);
    } catch (err) {
      logger.error('[Scheduler] Token cleanup error:', err.message);
    }
  });

  // ─── 3. Session cleanup — every hour ────────────────────────────
  cron.schedule('0 * * * *', async () => {
    try {
      const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await prisma.session.deleteMany({
        where: { lastSeen: { lt: staleThreshold }, isOnline: false },
      });
    } catch (err) {
      logger.error('[Scheduler] Session cleanup error:', err.message);
    }
  });

  // ─── 4. Analytics snapshot — every midnight ─────────────────────
  cron.schedule('0 0 * * *', async () => {
    logger.info('[Scheduler] Generating analytics snapshots');
    try {
      const orgs = await prisma.organization.findMany({ where: { isActive: true } });
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM

      for (const org of orgs) {
        const [empCount, totalPayroll] = await Promise.all([
          prisma.employee.count({ where: { organizationId: org.id, deletedAt: null } }),
          prisma.payrollRun.aggregate({
            where: {
              organizationId: org.id,
              status: 'RELEASED',
              periodStart: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
            _sum: { totalNet: true },
          }),
        ]);

        await prisma.analyticsSnapshot.upsert({
          where: {
            organizationId_period_periodType: {
              organizationId: org.id,
              period,
              periodType: 'MONTHLY',
            },
          },
          create: {
            organizationId: org.id,
            period,
            periodType: 'MONTHLY',
            metrics: {
              employeeCount: empCount,
              totalPayroll:  Number(totalPayroll._sum.totalNet || 0),
            },
          },
          update: {
            metrics: {
              employeeCount: empCount,
              totalPayroll:  Number(totalPayroll._sum.totalNet || 0),
            },
          },
        });
      }

      await cacheDelPattern('analytics:*');
      logger.info('[Scheduler] Analytics snapshots complete');
    } catch (err) {
      logger.error('[Scheduler] Snapshot error:', err.message);
    }
  });

  // ─── 5. Cache warm-up — every 5 minutes ─────────────────────────
  cron.schedule('*/5 * * * *', async () => {
    try {
      await cacheDelPattern('dashboard:summary:*');
      // Controllers will re-populate on next request
    } catch {}
  });

  logger.info('✅ All cron jobs scheduled');
}

module.exports = { startScheduler };
