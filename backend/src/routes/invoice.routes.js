const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('invoices.view'), invoiceController.list);
router.get('/:id', authorize('invoices.view'), invoiceController.getById);
router.post('/', authorize('invoices.create'), invoiceController.create);
router.put('/:id', authorize('invoices.edit'), invoiceController.update);
router.delete('/:id', authorize('invoices.delete'), invoiceController.remove);

module.exports = router;
