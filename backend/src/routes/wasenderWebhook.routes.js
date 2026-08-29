const express = require('express');
const whatsappInboxController = require('../controllers/whatsappInbox.controller');

const router = express.Router();

router.post('/webhook', whatsappInboxController.webhook);

module.exports = router;
