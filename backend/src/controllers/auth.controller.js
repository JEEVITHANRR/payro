// src/controllers/auth.controller.js — Full auth lifecycle
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const {
  generateTokenPair,
  saveRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  verifyRefreshToken,
  isRefreshTokenValid,
} = require('../config/jwt');
const { cacheSet, cacheDel } = require('../config/redis');
const { ApiResponse } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const {
  sendEmailVerification,
  sendPasswordReset,
  sendWelcomeEmail,
  sendPasswordChangedNotice,
} = require('../utils/email');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
};

// ─── Helpers ──────────────────────────────────────────────────────
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

function tokenExpiry(hours = 1) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// ─── Register ─────────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, phone } = req.validatedBody;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Email already registered.', 409);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: role || 'EMPLOYEE', phone },
    select: {
      id: true, email: true, role: true,
      firstName: true, lastName: true, createdAt: true,
    },
  });

  // Create email verification token
  const verifyToken = generateSecureToken();
  await prisma.emailVerificationToken.create({
    data: {
      token: verifyToken,
      userId: user.id,
      expiresAt: tokenExpiry(24),
    },
  });

  // Send emails asynchronously (non-blocking)
  sendEmailVerification(user, verifyToken).catch((e) =>
    logger.warn('Welcome email failed:', e.message)
  );
  sendWelcomeEmail(user).catch(() => {});

  logger.info(`New user registered: ${email} [${role || 'EMPLOYEE'}]`);
  ApiResponse.created(res, user, 'Registration successful. Check your email to verify your account.');
});

// ─── Login ────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials.', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        metadata: { success: false, reason: 'wrong_password' },
      },
    }).catch(() => {});
    throw new AppError('Invalid credentials.', 401);
  }

  const { accessToken, refreshToken } = generateTokenPair(user);
  await saveRefreshToken(user.id, refreshToken, req.ip, req.headers['user-agent']);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastLoginIp: req.ip },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { success: true },
    },
  }).catch(() => {});

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  ApiResponse.success(res, {
    accessToken,
    user: {
      id:              user.id,
      email:           user.email,
      role:            user.role,
      firstName:       user.firstName,
      lastName:        user.lastName,
      avatarUrl:       user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
    },
  }, 'Login successful.');
});

// ─── Refresh Token ────────────────────────────────────────────────
exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new AppError('Refresh token required.', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid refresh token.', 401);
  }

  const isValid = await isRefreshTokenValid(token);
  if (!isValid) throw new AppError('Refresh token expired or revoked.', 401);

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true, email: true, role: true,
      firstName: true, lastName: true, isActive: true,
    },
  });
  if (!user || !user.isActive) throw new AppError('User not found.', 401);

  await revokeRefreshToken(token);
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
  await saveRefreshToken(user.id, newRefreshToken, req.ip, req.headers['user-agent']);

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTS);
  ApiResponse.success(res, { accessToken }, 'Token refreshed.');
});

// ─── Logout ───────────────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) await revokeRefreshToken(token);

  if (req.user) await cacheDel(`user:${req.user.id}`);

  await prisma.auditLog.create({
    data: {
      actorId: req.user.id,
      action: 'LOGOUT',
      entity: 'User',
      entityId: req.user.id,
      ipAddress: req.ip,
    },
  }).catch(() => {});

  res.clearCookie('refreshToken');
  ApiResponse.success(res, null, 'Logged out successfully.');
});

// ─── Logout all sessions ──────────────────────────────────────────
exports.logoutAll = asyncHandler(async (req, res) => {
  await revokeAllUserTokens(req.user.id);
  await cacheDel(`user:${req.user.id}`);
  res.clearCookie('refreshToken');
  ApiResponse.success(res, null, 'All sessions terminated.');
});

// ─── Get current user ─────────────────────────────────────────────
exports.me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, role: true,
      firstName: true, lastName: true,
      avatarUrl: true, phone: true,
      isEmailVerified: true, lastLoginAt: true,
      createdAt: true,
      employee: {
        select: {
          id: true, employeeId: true,
          title: true, departmentId: true,
          department: { select: { name: true } },
        },
      },
    },
  });
  ApiResponse.success(res, user);
});

// ─── Change password ──────────────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedBody;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect.', 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash },
  });

  await revokeAllUserTokens(req.user.id);
  await cacheDel(`user:${req.user.id}`);
  res.clearCookie('refreshToken');

  sendPasswordChangedNotice(user).catch(() => {});
  ApiResponse.success(res, null, 'Password changed. Please log in again.');
});

// ─── Forgot Password ──────────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validatedBody;

  // Always respond with same message to prevent email enumeration
  const successMsg = 'If that email is registered, a reset link has been sent.';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return ApiResponse.success(res, null, successMsg);
  }

  // Invalidate any existing tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = generateSecureToken();
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: tokenExpiry(1), // 1 hour
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      metadata: { step: 'requested' },
    },
  }).catch(() => {});

  sendPasswordReset(user, token).catch((e) =>
    logger.warn('Password reset email failed:', e.message)
  );

  ApiResponse.success(res, null, successMsg);
});

// ─── Reset Password ───────────────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.validatedBody;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) throw new AppError('Invalid or expired reset token.', 400);
  if (record.usedAt) throw new AppError('Reset token already used.', 400);
  if (record.expiresAt < new Date()) throw new AppError('Reset token has expired.', 400);

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // Revoke all sessions
  await revokeAllUserTokens(record.userId);
  await cacheDel(`user:${record.userId}`);

  await prisma.auditLog.create({
    data: {
      actorId: record.userId,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: record.userId,
      ipAddress: req.ip,
      metadata: { step: 'completed' },
    },
  }).catch(() => {});

  sendPasswordChangedNotice(record.user).catch(() => {});
  ApiResponse.success(res, null, 'Password reset successful. Please log in with your new password.');
});

// ─── Send Email Verification ──────────────────────────────────────
exports.sendVerification = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified.', 400);
  }

  // Invalidate old tokens
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = generateSecureToken();
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: tokenExpiry(24),
    },
  });

  await sendEmailVerification(user, token);
  ApiResponse.success(res, null, 'Verification email sent.');
});

// ─── Verify Email ─────────────────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError('Verification token required.', 400);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) throw new AppError('Invalid verification token.', 400);
  if (record.usedAt) throw new AppError('Token already used.', 400);
  if (record.expiresAt < new Date()) throw new AppError('Verification token expired. Please request a new one.', 400);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await cacheDel(`user:${record.userId}`);

  await prisma.auditLog.create({
    data: {
      actorId: record.userId,
      action: 'VERIFY_EMAIL',
      entity: 'User',
      entityId: record.userId,
      ipAddress: req.ip,
      metadata: { verified: true },
    },
  }).catch(() => {});

  ApiResponse.success(res, null, 'Email verified successfully.');
});

// ─── Update Profile ───────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatarUrl } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName  && { lastName }),
      ...(phone     && { phone }),
      ...(avatarUrl && { avatarUrl }),
    },
    select: {
      id: true, email: true, role: true,
      firstName: true, lastName: true,
      avatarUrl: true, phone: true,
      isEmailVerified: true,
    },
  });

  await cacheDel(`user:${req.user.id}`);
  ApiResponse.success(res, user, 'Profile updated.');
});
