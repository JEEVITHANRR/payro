// src/routes/auth.routes.js — Full authentication routes
const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const {
  validate,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/schemas');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many password reset requests.' },
});

// Public routes
router.post('/register',           authLimiter,          validate(registerSchema),       ctrl.register);
router.post('/login',              authLimiter,          validate(loginSchema),           ctrl.login);
router.post('/refresh',                                                                   ctrl.refreshToken);
router.post('/forgot-password',    passwordResetLimiter, validate(forgotPasswordSchema),  ctrl.forgotPassword);
router.post('/reset-password',     passwordResetLimiter, validate(resetPasswordSchema),   ctrl.resetPassword);
router.post('/verify-email',                                                              ctrl.verifyEmail);

// Protected routes
router.post('/logout',             authenticate, ctrl.logout);
router.post('/logout-all',         authenticate, ctrl.logoutAll);
router.get('/me',                  authenticate, ctrl.me);
router.put('/change-password',     authenticate, validate(changePasswordSchema), ctrl.changePassword);
router.post('/send-verification',  authenticate, ctrl.sendVerification);
router.patch('/profile',           authenticate, ctrl.updateProfile);

module.exports = router;
