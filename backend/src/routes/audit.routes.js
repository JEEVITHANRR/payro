// src/routes/audit.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/audit.controller');
const { authenticate, requireMinRole } = require('../middleware/auth');
router.use(authenticate, requireMinRole('AUDITOR'));
router.get('/',     ctrl.list);
router.get('/:id',  ctrl.getById);
module.exports = router;
