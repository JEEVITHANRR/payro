// src/routes/dashboard.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.get('/summary',              ctrl.summary);
router.get('/employee-distribution',ctrl.employeeDistribution);
router.get('/live-activity',        ctrl.liveActivity);
router.get('/kpis',                 ctrl.kpis);
module.exports = router;
