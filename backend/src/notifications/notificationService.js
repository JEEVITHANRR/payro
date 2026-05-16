// src/notifications/notificationService.js — Multi-channel notification service
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Create an in-app notification and optionally emit via Socket.IO
 */
async function createNotification({ userId, type, title, message, data = null, io = null }) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, data },
    });

    // Real-time push via socket if io provided
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', {
        id:        notification.id,
        type:      notification.type,
        title:     notification.title,
        message:   notification.message,
        data:      notification.data,
        createdAt: notification.createdAt,
      });

      // Update unread count
      const unread = await prisma.notification.count({
        where: { userId, isRead: false, deletedAt: null },
      });
      io.to(`user:${userId}`).emit('notifications:unread_count', { count: unread });
    }

    return notification;
  } catch (err) {
    logger.error('[NotificationService] Failed to create notification:', err.message);
  }
}

/**
 * Broadcast a notification to multiple users
 */
async function broadcastNotification({ userIds, type, title, message, data = null, io = null }) {
  try {
    await prisma.notification.createMany({
      data: userIds.map(userId => ({ userId, type, title, message, data })),
    });

    if (io) {
      for (const userId of userIds) {
        io.to(`user:${userId}`).emit('notification:new', { type, title, message, data });
      }
    }
  } catch (err) {
    logger.error('[NotificationService] Broadcast failed:', err.message);
  }
}

/**
 * Notify all users of a given role
 */
async function notifyRole({ role, type, title, message, data = null, io = null }) {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });
  const userIds = users.map(u => u.id);
  if (userIds.length > 0) {
    await broadcastNotification({ userIds, type, title, message, data, io });
    if (io) io.to(`role:${role}`).emit('notification:new', { type, title, message, data });
  }
}

/**
 * Send email notification (stub — wire up nodemailer for production)
 */
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_HOST) {
    logger.warn(`[Email] SMTP not configured. Would send: "${subject}" to ${to}`);
    return;
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from:    process.env.SMTP_FROM || '"Payro" <noreply@payro.io>',
      to,
      subject,
      html,
      text,
    });
    logger.info(`[Email] Sent: "${subject}" → ${to}`);
  } catch (err) {
    logger.error('[Email] Send failed:', err.message);
  }
}

/**
 * Payroll released email template
 */
async function sendPayrollReleasedEmail(employee, payrollEntry, payrollRun) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6750a4; padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #cfbcff; margin: 0; font-size: 24px;">Payro</h1>
      </div>
      <div style="background: #141218; padding: 32px; border-radius: 0 0 12px 12px; color: #e6e0e9;">
        <h2>Salary Disbursement Confirmation</h2>
        <p>Dear ${employee.firstName},</p>
        <p>Your salary for <strong>${payrollRun.name}</strong> has been released.</p>
        <div style="background: #211f24; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p><strong>Gross Pay:</strong> $${Number(payrollEntry.grossPay).toLocaleString()}</p>
          <p><strong>Tax Withheld:</strong> $${Number(payrollEntry.taxWithheld).toLocaleString()}</p>
          <p><strong>Net Pay:</strong> $${Number(payrollEntry.netPay).toLocaleString()}</p>
        </div>
        <p style="color: #948e9c; font-size: 12px;">
          This is an automated message from Payro. Please do not reply.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to:      employee.email,
    subject: `Payro: Your ${payrollRun.name} salary has been released`,
    html,
    text:    `Your net pay of $${Number(payrollEntry.netPay).toLocaleString()} for ${payrollRun.name} has been released.`,
  });
}

module.exports = {
  createNotification,
  broadcastNotification,
  notifyRole,
  sendEmail,
  sendPayrollReleasedEmail,
};
