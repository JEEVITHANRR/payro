// src/routes/attendance.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../validations/schemas');
const { createAttendanceSchema } = require('../validations/schemas');
router.use(authenticate);
router.get('/',         ctrl.list);
router.get('/summary',  ctrl.summary);
router.post('/',        validate(createAttendanceSchema), ctrl.create);
module.exports = router;
