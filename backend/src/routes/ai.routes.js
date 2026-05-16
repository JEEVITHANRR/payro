// src/routes/ai.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/ai.controller');
const { authenticate, requireMinRole } = require('../middleware/auth');
router.use(authenticate);
router.get('/',                     ctrl.list);
router.get('/top',                  ctrl.topInsight);
router.get('/fraud-detection',      ctrl.fraudDetection);
router.get('/salary-predictions',   ctrl.salaryPredictions);
router.post('/generate',            requireMinRole('ADMIN'), ctrl.generateInsights);
router.post('/:id/apply',           requireMinRole('PAYROLL_MANAGER'), ctrl.applyInsight);
router.post('/:id/dismiss',         ctrl.dismiss);
module.exports = router;
