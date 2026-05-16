// src/middleware/auditMiddleware.js — Auto audit log injection
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

function auditLog(action, entity, getEntityId = null) {
  return async (req, res, next) => {
    // Run after response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (req.user && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            const entityId = typeof getEntityId === 'function'
              ? getEntityId(req, res, body)
              : (req.params.id || body?.data?.id || null);

            await prisma.auditLog.create({
              data: {
                actorId:   req.user.id,
                action,
                entity,
                entityId:  entityId?.toString() || null,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata:  {
                  method: req.method,
                  path:   req.path,
                  query:  req.query,
                },
              },
            });
          } catch (err) {
            logger.warn('Audit log write failed:', err.message);
          }
        });
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { auditLog };
