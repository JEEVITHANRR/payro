// src/jobs/payrollProcessor.js — Background payroll processing engine
const { prisma } = require('../config/database');
const { cacheDelPattern } = require('../config/redis');
const { logger } = require('../utils/logger');

/**
 * Processes a payroll run:
 * 1. Validate all entries
 * 2. Create transaction records per employee
 * 3. Mark entries as RELEASED
 * 4. Update payroll run to RELEASED
 * 5. Emit socket events
 * 6. Create audit log + notifications
 */
async function processPayrollJob({ payrollRunId, userId, io }) {
  logger.info(`[PayrollJob] Starting processing for run: ${payrollRunId}`);

  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        entries: {
          include: { employee: true },
        },
      },
    });

    if (!run) throw new Error(`PayrollRun ${payrollRunId} not found`);
    if (run.status !== 'PROCESSING') throw new Error(`Run is not in PROCESSING state`);

    // Process entries in batches of 50
    const BATCH_SIZE = 50;
    const entries    = run.entries;
    const batches    = [];

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      batches.push(entries.slice(i, i + BATCH_SIZE));
    }

    let processed = 0;
    let failed    = 0;

    for (const batch of batches) {
      await prisma.$transaction(async (tx) => {
        for (const entry of batch) {
          try {
            // Create disbursement transaction
            await tx.transaction.create({
              data: {
                payrollRunId: run.id,
                employeeId:   entry.employeeId,
                type:         'SALARY',
                status:       'COMPLETED',
                amount:       entry.netPay,
                currency:     entry.currency || run.currency,
                description:  `Salary — ${run.name}`,
                processedAt:  new Date(),
                metadata: {
                  baseSalary:  Number(entry.baseSalary),
                  grossPay:    Number(entry.grossPay),
                  taxWithheld: Number(entry.taxWithheld),
                  bonuses:     Number(entry.bonuses),
                  deductions:  Number(entry.deductions),
                  period:      `${run.periodStart.toISOString().slice(0,7)}`,
                },
              },
            });

            // Create tax transaction
            if (Number(entry.taxWithheld) > 0) {
              await tx.transaction.create({
                data: {
                  payrollRunId: run.id,
                  employeeId:   entry.employeeId,
                  type:         'TAX_PAYMENT',
                  status:       'COMPLETED',
                  amount:       entry.taxWithheld,
                  currency:     entry.currency || run.currency,
                  description:  `Tax Withholding — ${run.name}`,
                  processedAt:  new Date(),
                },
              });
            }

            // Update entry status
            await tx.payrollEntry.update({
              where: { id: entry.id },
              data:  { status: 'RELEASED', processedAt: new Date() },
            });

            processed++;
          } catch (entryErr) {
            logger.error(`[PayrollJob] Failed to process entry ${entry.id}:`, entryErr.message);
            failed++;
          }
        }
      });

      // Emit progress update via socket
      if (io) {
        io.to(`payroll:${payrollRunId}`).emit('payroll:progress', {
          payrollRunId,
          processed,
          total:    entries.length,
          failed,
          pct:      Math.round((processed / entries.length) * 100),
        });
      }

      // Small delay between batches to avoid DB overload
      await new Promise(r => setTimeout(r, 50));
    }

    // Mark payroll run as RELEASED
    await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status:      'RELEASED',
        processedAt: new Date(),
      },
    });

    // Update department budgetUsed values
    const entryGroups = await prisma.payrollEntry.groupBy({
      by:    ['departmentId'],
      where: { payrollRunId },
      _sum:  { grossPay: true },
    });

    for (const group of entryGroups) {
      await prisma.department.update({
        where: { id: group.departmentId },
        data:  { budgetUsed: { increment: Number(group._sum.grossPay || 0) } },
      });
    }

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          actorId:  userId,
          action:   'RUN_PAYROLL',
          entity:   'PayrollRun',
          entityId: payrollRunId,
          metadata: {
            processed,
            failed,
            totalNet: Number(run.totalNet),
          },
        },
      });
    }

    // Notify all users
    const adminUsers = await prisma.user.findMany({
      where:  { role: { in: ['CFO', 'ADMIN', 'SUPER_ADMIN', 'PAYROLL_MANAGER'] }, isActive: true },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: adminUsers.map(u => ({
        userId:  u.id,
        type:    'PAYROLL_RELEASED',
        title:   'Payroll Released ✓',
        message: `${run.name} has been successfully released. ${processed} employees paid. Total: $${Number(run.totalNet).toLocaleString()}.`,
        data:    { payrollRunId, processed, failed },
      })),
    });

    // Emit final socket events
    if (io) {
      io.to('org:all').emit('payroll:released', {
        payrollRunId,
        name:      run.name,
        processed,
        failed,
        totalNet:  Number(run.totalNet),
        timestamp: new Date().toISOString(),
      });
      io.to('dashboard:live').emit('dashboard:refresh');
    }

    // Clear caches
    await cacheDelPattern('dashboard:*');
    await cacheDelPattern('analytics:*');

    logger.info(`[PayrollJob] ✅ Completed — ${processed} processed, ${failed} failed`);
    return { success: true, processed, failed };

  } catch (err) {
    logger.error('[PayrollJob] ❌ Fatal error:', err);

    await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status:        'FAILED',
        failureReason: err.message,
      },
    }).catch(() => {});

    if (io) {
      io.to(`payroll:${payrollRunId}`).emit('payroll:failed', {
        payrollRunId,
        error: err.message,
      });
    }

    throw err;
  }
}

module.exports = { processPayrollJob };
