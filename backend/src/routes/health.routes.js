const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 */
router.get('/', healthController.health);

module.exports = router;
