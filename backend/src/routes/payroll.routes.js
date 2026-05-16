// src/routes/payroll.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/payroll.controller');
const { authenticate, requireMinRole, requireRoles } = require('../middleware/auth');
const { validate } = require('../validations/schemas');
const { createPayrollSchema, updatePayrollStatusSchema, payrollEntrySchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/auditMiddleware');

router.use(authenticate);

router.get('/',                            ctrl.list);
router.get('/:id',                         ctrl.getById);
router.get('/:id/departments',             ctrl.departmentSummary);

router.post('/',
  requireMinRole('PAYROLL_MANAGER'),
  validate(createPayrollSchema),
  auditLog('CREATE', 'PayrollRun'),
  ctrl.create
);

router.post('/:id/generate-entries',
  requireMinRole('PAYROLL_MANAGER'),
  ctrl.generateEntries
);

router.post('/:id/submit',
  requireMinRole('PAYROLL_MANAGER'),
  ctrl.submitForApproval
);

router.post('/:id/approve',
  requireRoles('CFO', 'ADMIN', 'SUPER_ADMIN'),
  auditLog('APPROVE', 'PayrollRun'),
  ctrl.approve
);

router.post('/:id/process',
  requireRoles('CFO', 'ADMIN', 'SUPER_ADMIN'),
  auditLog('RUN_PAYROLL', 'PayrollRun'),
  ctrl.process
);

router.patch('/:id/status',
  requireMinRole('PAYROLL_MANAGER'),
  validate(updatePayrollStatusSchema),
  ctrl.updateStatus
);

module.exports = router;
