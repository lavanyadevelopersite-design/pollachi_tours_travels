const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/stats', authorize('dashboard.view'), dashboardController.stats);
router.get('/revenue-chart', authorize('dashboard.view'), dashboardController.revenueChart);
router.get('/booking-status', authorize('dashboard.view'), dashboardController.bookingStatus);
router.get('/lead-sources', authorize('dashboard.view'), dashboardController.leadSources);
router.get('/top-packages', authorize('dashboard.view'), dashboardController.topPackages);
router.get('/top-destinations', authorize('dashboard.view'), dashboardController.topDestinations);
router.get('/upcoming-tours', authorize('dashboard.view'), dashboardController.upcomingTours);
router.get('/pending-follow-ups', authorize('dashboard.view'), dashboardController.pendingFollowUps);
router.get('/today-follow-ups', authorize('dashboard.view'), dashboardController.todayFollowUps);
router.get('/recent-activities', authorize('dashboard.view'), dashboardController.recentActivities);
router.get('/branch-performance', authorize('dashboard.view'), dashboardController.branchPerformance);
router.get('/sales-reps', authorize('dashboard.view'), dashboardController.salesReps);
router.get('/top-lead-sources', authorize('dashboard.view'), dashboardController.topLeadSources);
router.get('/profit-loss-trend', authorize('dashboard.view'), dashboardController.profitLossTrend);
router.get('/payment-collection', authorize('dashboard.view'), dashboardController.paymentCollection);

module.exports = router;
