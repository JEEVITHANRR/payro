// src/routes/notification.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.get('/',             ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/read-all',   ctrl.markAllRead);
router.patch('/:id/read',   ctrl.markRead);
router.delete('/:id',       ctrl.remove);
module.exports = router;
