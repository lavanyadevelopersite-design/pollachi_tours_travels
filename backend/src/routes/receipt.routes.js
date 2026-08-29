const express = require('express');
const receiptController = require('../controllers/receipt.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('receipts.view'), receiptController.list);
router.get('/:id', authorize('receipts.view'), receiptController.getById);
router.post('/', authorize('receipts.create'), receiptController.create);
router.put('/:id', authorize('receipts.edit'), receiptController.update);
router.delete('/:id', authorize('receipts.delete'), receiptController.remove);

module.exports = router;
