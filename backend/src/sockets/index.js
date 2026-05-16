// src/sockets/index.js — Socket.IO real-time engine
const { Server } = require('socket.io');
const { verifyAccessToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

function initSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin:      (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
      credentials: true,
      methods:     ['GET', 'POST'],
    },
    transports:  ['websocket', 'polling'],
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // ─── JWT auth middleware for sockets ────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Authentication required.'));

      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      });

      if (!user) return next(new Error('User not found.'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token.'));
    }
  });

  // ─── Connection handler ──────────────────────────────────────────
  io.on('connection', async (socket) => {
    const user = socket.user;
    logger.info(`Socket connected: ${user.firstName} ${user.lastName} [${user.role}] — ${socket.id}`);

    // Join rooms
    socket.join(`user:${user.id}`);          // personal room
    socket.join(`role:${user.role}`);         // role-based room
    socket.join('org:all');                   // org-wide broadcasts

    // Update session
    await prisma.session.upsert({
      where:  { id: socket.id },
      create: {
        id:        socket.id,
        userId:    user.id,
        socketId:  socket.id,
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'],
        isOnline:  true,
        lastSeen:  new Date(),
      },
      update: { isOnline: true, lastSeen: new Date(), socketId: socket.id },
    }).catch(() => {});

    // Emit online status to org
    io.to('org:all').emit('user:online', {
      userId:    user.id,
      name:      `${user.firstName} ${user.lastName}`,
      role:      user.role,
      timestamp: new Date().toISOString(),
    });

    // Send unread notification count on connect
    const unread = await prisma.notification.count({
      where: { userId: user.id, isRead: false, deletedAt: null },
    }).catch(() => 0);
    socket.emit('notifications:unread_count', { count: unread });

    // ─── Event handlers ──────────────────────────────────────────

    // Client requests live dashboard refresh
    socket.on('dashboard:subscribe', () => {
      socket.join('dashboard:live');
      logger.debug(`${user.id} subscribed to dashboard:live`);
    });

    socket.on('dashboard:unsubscribe', () => {
      socket.leave('dashboard:live');
    });

    // Mark notification read via socket
    socket.on('notification:read', async ({ notificationId }) => {
      try {
        await prisma.notification.updateMany({
          where: { id: notificationId, userId: user.id },
          data:  { isRead: true, readAt: new Date() },
        });
        const unread = await prisma.notification.count({
          where: { userId: user.id, isRead: false, deletedAt: null },
        });
        socket.emit('notifications:unread_count', { count: unread });
      } catch {}
    });

    // Typing / activity indicators
    socket.on('activity:ping', () => {
      prisma.session.updateMany({
        where: { socketId: socket.id },
        data:  { lastSeen: new Date() },
      }).catch(() => {});
    });

    // Payroll room
    socket.on('payroll:subscribe', ({ payrollRunId }) => {
      socket.join(`payroll:${payrollRunId}`);
    });

    // ─── Disconnect ──────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${user.id} — ${reason}`);

      await prisma.session.updateMany({
        where: { socketId: socket.id },
        data:  { isOnline: false, lastSeen: new Date() },
      }).catch(() => {});

      // Check if user has other active sockets before marking offline
      const otherSockets = await io.in(`user:${user.id}`).fetchSockets();
      if (otherSockets.length === 0) {
        io.to('org:all').emit('user:offline', {
          userId:    user.id,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // ─── Global emitter helpers (used by controllers) ────────────────
  io.emitPayrollUpdate = (payrollRunId, data) => {
    io.to(`payroll:${payrollRunId}`).emit('payroll:updated', data);
    io.to('dashboard:live').emit('dashboard:refresh');
  };

  io.emitNotification = (userId, notification) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
  };

  io.emitAIInsight = (insight) => {
    io.to('org:all').emit('ai:new_insight', insight);
  };

  io.emitActivityLog = (log) => {
    io.to('dashboard:live').emit('activity:new', log);
  };

  logger.info('✅ Socket.IO initialized');
  return io;
}

module.exports = { initSocketIO };
