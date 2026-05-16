// src/app.js — Payro Enterprise Backend Entry Point
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const { initSocketIO } = require('./sockets');
const { connectRedis } = require('./config/redis');
const { logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestId } = require('./middleware/requestId');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const employeeRoutes = require('./routes/employee.routes');
const departmentRoutes = require('./routes/department.routes');
const payrollRoutes = require('./routes/payroll.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const aiRoutes = require('./routes/ai.routes');
const auditRoutes = require('./routes/audit.routes');
const expenseRoutes = require('./routes/expense.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const healthRoutes = require('./routes/health.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const server = http.createServer(app);

// ─── Trust proxy (for rate limiting behind nginx/load balancer) ───
app.set('trust proxy', 1);

// ─── Security middleware ───────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any .onrender.com subdomain
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    // Allow any .vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(null, true); // Allow all in production for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// ─── Global rate limiter ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// ─── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ─── Sanitize input ───────────────────────────────────────────────
app.use(mongoSanitize());

// ─── HTTP logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.path === '/api/health',
  }));
}

// ─── Request ID middleware ────────────────────────────────────────
app.use(requestId);

// ─── API Routes ───────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/health`,        healthRoutes);
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/employees`,     employeeRoutes);
app.use(`${API}/departments`,   departmentRoutes);
app.use(`${API}/payroll`,       payrollRoutes);
app.use(`${API}/transactions`,  transactionRoutes);
app.use(`${API}/dashboard`,     dashboardRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/ai`,            aiRoutes);
app.use(`${API}/audit`,         auditRoutes);
app.use(`${API}/expenses`,      expenseRoutes);
app.use(`${API}/attendance`,    attendanceRoutes);
app.use(`${API}/upload`,        uploadRoutes);

// ─── 404 handler ─────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler ─────────────────────────────────────────
app.use(errorHandler);

// ─── Socket.IO ───────────────────────────────────────────────────
const io = initSocketIO(server);
app.set('io', io);

// ─── Boot ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectRedis();
    logger.info('✅ Redis connected');

    server.listen(PORT, () => {
      logger.info(`🚀 Payro API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('❌ Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();

module.exports = { app, server };
