const express = require('express');
const auditController = require('../controllers/audit.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('audit_logs.view'), auditController.list);
router.get('/:id', authorize('audit_logs.view'), auditController.getById);

module.exports = router;
