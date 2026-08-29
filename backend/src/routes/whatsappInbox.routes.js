const express = require('express');
const whatsappInboxController = require('../controllers/whatsappInbox.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/status', authorize('enquiries.view'), whatsappInboxController.getStatus);
router.get('/conversations', authorize('enquiries.view'), whatsappInboxController.listConversations);
router.post('/conversations/start', authorize('enquiries.edit'), whatsappInboxController.startConversation);
router.get('/conversations/:id/messages', authorize('enquiries.view'), whatsappInboxController.getMessages);
router.post('/conversations/:id/read', authorize('enquiries.view'), whatsappInboxController.markRead);
router.post('/conversations/:id/messages', authorize('enquiries.edit'), whatsappInboxController.sendMessage);
router.post('/sync', authorize('enquiries.view'), whatsappInboxController.syncInbox);

module.exports = router;
