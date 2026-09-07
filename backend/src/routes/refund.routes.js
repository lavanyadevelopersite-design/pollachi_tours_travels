const express = require('express');
const refundController = require('../controllers/refund.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('refunds.view'), refundController.list);
router.get('/:id', authorize('refunds.view'), refundController.getById);
router.post('/', authorize('refunds.create'), refundController.create);
router.put('/:id', authorize('refunds.edit'), refundController.update);
router.delete('/:id', authorize('refunds.delete'), refundController.remove);

module.exports = router;
