// src/config/database.js — Prisma singleton with query logging
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`[DB Query] ${e.query} — ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error('[DB Error]', e);
});

prisma.$on('warn', (e) => {
  logger.warn('[DB Warn]', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma };
