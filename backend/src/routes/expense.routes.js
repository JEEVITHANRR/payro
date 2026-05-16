// src/routes/expense.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/expense.controller');
const { authenticate, requireMinRole } = require('../middleware/auth');
const { validate } = require('../validations/schemas');
const { createExpenseSchema, updateExpenseStatusSchema } = require('../validations/schemas');
router.use(authenticate);
router.get('/',                   ctrl.list);
router.post('/',                  validate(createExpenseSchema), ctrl.create);
router.patch('/:id/status',       requireMinRole('HR_MANAGER'), validate(updateExpenseStatusSchema), ctrl.updateStatus);
router.delete('/:id',             ctrl.remove);
module.exports = router;
