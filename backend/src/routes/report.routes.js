const express = require('express');
const reportController = require('../controllers/report.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/sales', authorize('reports.view'), reportController.sales);
router.get('/lead-conversion', authorize('reports.view'), reportController.leadConversion);
router.get('/financial', authorize('reports.view'), reportController.financial);
router.get('/profit-loss', authorize('reports.view'), reportController.profitAndLoss);
router.get('/enquiries', authorize('reports.view'), reportController.enquiries);
router.get('/expenses', authorize('reports.view'), reportController.expenses);
router.get('/customers', authorize('reports.view'), reportController.customers);
router.get('/vehicles', authorize('reports.view'), reportController.vehicles);
router.get('/drivers', authorize('reports.view'), reportController.drivers);
router.get('/follow-ups', authorize('reports.view'), reportController.followUps);
router.get('/attendance', authorize('reports.view'), reportController.attendance);

module.exports = router;
