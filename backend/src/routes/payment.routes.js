const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authorize } = require('../middleware/rbac.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', authorize('receipts.view', 'enquiries.view'), paymentController.list);
router.get('/:id', authorize('receipts.view', 'enquiries.view'), paymentController.getById);
router.post(
  '/',
  authorize('receipts.create', 'enquiries.edit'),
  upload.single('proof_file'),
  paymentController.create
);
router.post(
  '/:id/share-receipt',
  authorize('receipts.create', 'enquiries.edit'),
  upload.memoryUpload.single('receipt_image'),
  paymentController.shareReceipt
);router.put(
  '/:id',
  authorize('receipts.edit', 'enquiries.edit'),
  upload.single('proof_file'),
  paymentController.update
);
router.delete(
  '/:id',
  authorize('receipts.delete', 'enquiries.edit'),
  paymentController.remove
);

module.exports = router;
