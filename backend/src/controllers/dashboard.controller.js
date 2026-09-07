const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const stats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStats(req.query);
  res.json(ApiResponse.success('Dashboard stats retrieved', data));
});

const revenueChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueChart(req.query);
  res.json(ApiResponse.success('Revenue chart retrieved', data));
});

const bookingStatus = asyncHandler(async (req, res) => {
  const data = await dashboardService.getBookingStatus();
  res.json(ApiResponse.success('Booking status retrieved', data));
});

const leadSources = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLeadSources();
  res.json(ApiResponse.success('Lead sources retrieved', data));
});

const topPackages = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopPackages();
  res.json(ApiResponse.success('Top packages retrieved', data));
});

const topDestinations = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getTopDestinations();
  res.json(ApiResponse.success('Top destinations retrieved', data));
});

const upcomingTours = asyncHandler(async (req, res) => {
  const data = await dashboardService.getUpcomingTours();
  res.json(ApiResponse.success('Upcoming tours retrieved', data));
});

const pendingFollowUps = asyncHandler(async (req, res) => {
  const data = await dashboardService.getPendingFollowUps();
  res.json(ApiResponse.success('Pending follow-ups retrieved', data));
});

const todayFollowUps = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getTodayFollowUps();
  res.json(ApiResponse.success('Today follow-ups retrieved', data));
});

const recentActivities = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentActivities();
  res.json(ApiResponse.success('Recent activities retrieved', data));
});

const branchPerformance = asyncHandler(async (req, res) => {
  const data = await dashboardService.getBranchPerformance();
  res.json(ApiResponse.success('Branch performance retrieved', data));
});

const salesReps = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSalesReps();
  res.json(ApiResponse.success('Sales reps retrieved', data));
});

const topLeadSources = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopLeadSources();
  res.json(ApiResponse.success('Top lead sources retrieved', data));
});

const profitLossTrend = asyncHandler(async (req, res) => {
  const data = await dashboardService.getProfitLossTrend(req.query);
  res.json(ApiResponse.success('Profit and loss trend retrieved', data));
});

const paymentCollection = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getPaymentCollection();
  res.json(ApiResponse.success('Payment collection retrieved', data));
});

module.exports = {
  stats,
  revenueChart,
  bookingStatus,
  leadSources,
  topPackages,
  topDestinations,
  upcomingTours,
  pendingFollowUps,
  todayFollowUps,
  recentActivities,
  branchPerformance,
  salesReps,
  topLeadSources,
  profitLossTrend,
  paymentCollection,
};
