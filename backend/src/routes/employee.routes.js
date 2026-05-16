// src/routes/employee.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/employee.controller');
const { authenticate, requireMinRole } = require('../middleware/auth');
const { validate } = require('../validations/schemas');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/auditMiddleware');

router.use(authenticate);

router.get('/',            ctrl.list);
router.get('/stats',       ctrl.stats);
router.get('/promotions',  ctrl.promotions);
router.get('/:id/insights', ctrl.getInsights);
router.get('/:id',         ctrl.getById);

router.post('/',
  requireMinRole('HR_MANAGER'),
  validate(createEmployeeSchema),
  auditLog('CREATE', 'Employee'),
  ctrl.create
);

router.patch('/:id',
  requireMinRole('HR_MANAGER'),
  validate(updateEmployeeSchema),
  auditLog('UPDATE', 'Employee'),
  ctrl.update
);

router.delete('/:id',
  requireMinRole('ADMIN'),
  auditLog('DELETE', 'Employee'),
  ctrl.remove
);

module.exports = router;
