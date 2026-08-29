const express = require('express');
const controller = require('../controllers/integration.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/whatsapp', authorize('settings.view'), controller.getWhatsApp);
router.put('/whatsapp', authorize('settings.edit'), controller.saveWhatsApp);
router.post('/whatsapp/connect', authorize('settings.edit'), controller.connectWhatsApp);
router.post('/whatsapp/refresh-qr', authorize('settings.edit'), controller.refreshWhatsAppQr);
router.post('/whatsapp/sync', authorize('settings.view'), controller.syncWhatsAppSession);
router.post('/whatsapp/disconnect', authorize('settings.edit'), controller.disconnectWhatsApp);
router.get('/mail', authorize('settings.view'), controller.getMail);
router.put('/mail', authorize('settings.edit'), controller.saveMail);
router.post('/mail/test', authorize('settings.edit'), controller.testMail);

module.exports = router;
