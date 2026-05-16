// src/routes/department.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/department.controller');
const { authenticate, requireMinRole } = require('../middleware/auth');
const { validate } = require('../validations/schemas');
const { createDepartmentSchema } = require('../validations/schemas');
router.use(authenticate);
router.get('/',     ctrl.list);
router.get('/:id',  ctrl.getById);
router.post('/',    requireMinRole('EMPLOYEE'), validate(createDepartmentSchema), ctrl.create);
router.patch('/:id',requireMinRole('HR_MANAGER'), ctrl.update);
router.delete('/:id',requireMinRole('ADMIN'), ctrl.remove);
module.exports = router;
