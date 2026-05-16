// src/routes/analytics.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const { authenticate, requireMinRole } = require('../middleware/auth');
router.use(authenticate);
router.get('/payroll-trend',        ctrl.payrollTrend);
router.get('/budget-breakdown',     ctrl.budgetBreakdown);
router.get('/headcount-trend',      ctrl.headcountTrend);
router.get('/compensation',         ctrl.compensationAnalysis);
router.get('/tax-trend',            ctrl.taxTrend);
router.get('/export',               requireMinRole('HR_MANAGER'), ctrl.exportReport);
module.exports = router;
