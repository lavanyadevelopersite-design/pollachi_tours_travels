const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('notifications.view'), notificationController.list);
router.get('/unread-count', authorize('notifications.view'), notificationController.unreadCount);
router.post('/', authorize('notifications.create'), notificationController.create);
router.patch('/read-all', authorize('notifications.edit'), notificationController.markAllRead);
router.patch('/:id/read', authorize('notifications.edit'), notificationController.markRead);
router.delete('/:id', authorize('notifications.delete'), notificationController.remove);

module.exports = router;
