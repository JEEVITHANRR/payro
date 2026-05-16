// src/config/redis.js — Redis client with graceful degradation
const Redis = require('ioredis');
const { logger } = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;

function createRedisClient() {
  // Support REDIS_URL (Railway provides this) or individual host/port/password
  const redisUrl = process.env.REDIS_URL;

  const opts = redisUrl
    ? { lazyConnect: true, maxRetriesPerRequest: 3, enableReadyCheck: true }
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 10) {
            logger.error('Redis: max retries reached');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
        enableReadyCheck: true,
      };

  const client = redisUrl ? new Redis(redisUrl, opts) : new Redis(opts);

  client.on('connect', () => logger.info('Redis: connecting...'));
  client.on('ready', () => {
    logger.info('Redis: ready');
    redisAvailable = true;
  });
  client.on('error', (err) => {
    logger.error('Redis error:', err.message);
    redisAvailable = false;
  });
  client.on('close', () => {
    logger.warn('Redis: connection closed');
    redisAvailable = false;
  });
  client.on('reconnecting', () => logger.info('Redis: reconnecting...'));

  return client;
}

async function connectRedis() {
  try {
    redisClient = createRedisClient();
    if (redisClient.status === 'wait') {
      await redisClient.connect();
    }
    // Wait for ready with a timeout
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger.warn('Redis: connection timeout — running without cache');
        redisAvailable = false;
        resolve();
      }, 5000);

      if (redisClient.status === 'ready') {
        clearTimeout(timeout);
        redisAvailable = true;
        resolve();
        return;
      }

      redisClient.once('ready', () => {
        clearTimeout(timeout);
        redisAvailable = true;
        resolve();
      });
      redisClient.once('error', () => {
        clearTimeout(timeout);
        redisAvailable = false;
        resolve(); // Don't reject — allow app to start without Redis
      });
    });
  } catch (err) {
    logger.warn('Redis: failed to connect — running without cache:', err.message);
    redisAvailable = false;
  }
  return redisClient;
}

function getRedis() {
  if (!redisClient || !redisAvailable) return null;
  return redisClient;
}

// ─── Cache helpers (graceful when Redis unavailable) ──────────
async function cacheGet(key) {
  try {
    const client = getRedis();
    if (!client) return null;
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    const client = getRedis();
    if (!client) return;
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn('Cache set failed:', err.message);
  }
}

async function cacheDel(key) {
  try {
    const client = getRedis();
    if (!client) return;
    await client.del(key);
  } catch (err) {
    logger.warn('Cache del failed:', err.message);
  }
}

async function cacheDelPattern(pattern) {
  try {
    const client = getRedis();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch (err) {
    logger.warn('Cache del pattern failed:', err.message);
  }
}

// ─── Rate limit store helper ───────────────────────────────────
async function incrementRateLimit(key, windowMs) {
  const client = getRedis();
  if (!client) return 1; // Allow through if Redis unavailable
  const ttl = Math.ceil(windowMs / 1000);
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, ttl);
  return count;
}

module.exports = {
  connectRedis,
  getRedis,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  incrementRateLimit,
};
