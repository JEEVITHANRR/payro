// src/config/jwt.js — JWT token helpers
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('./database');
const { logger } = require('../utils/logger');

const ACCESS_TOKEN_SECRET  = process.env.JWT_ACCESS_SECRET  || 'changeme-access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'changeme-refresh-secret';
const ACCESS_TOKEN_EXPIRY  = process.env.JWT_ACCESS_EXPIRY  || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'payro-api',
    audience: 'payro-client',
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'payro-api',
    audience: 'payro-client',
    jwtid: uuidv4(),
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET, {
    issuer: 'payro-api',
    audience: 'payro-client',
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET, {
    issuer: 'payro-api',
    audience: 'payro-client',
  });
}

async function saveRefreshToken(userId, token, ipAddress, userAgent) {
  const decoded = verifyRefreshToken(token);
  const expiresAt = new Date(decoded.exp * 1000);

  return prisma.refreshToken.create({
    data: { token, userId, expiresAt, ipAddress, userAgent },
  });
}

async function revokeRefreshToken(token) {
  try {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  } catch (err) {
    logger.warn('Failed to revoke refresh token:', err.message);
  }
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
}

async function isRefreshTokenValid(token) {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record) return false;
  if (record.isRevoked) return false;
  if (record.expiresAt < new Date()) return false;
  return true;
}

function generateTokenPair(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ sub: user.id });
  return { accessToken, refreshToken };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  saveRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  isRefreshTokenValid,
};
