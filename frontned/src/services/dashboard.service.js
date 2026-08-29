import api from './api';

const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenueChart: (params) => api.get('/dashboard/revenue-chart', { params }),
  getBookingStatus: () => api.get('/dashboard/booking-status'),
  getLeadSources: () => api.get('/dashboard/lead-sources'),
  getTopPackages: () => api.get('/dashboard/top-packages'),
  getUpcomingTours: () => api.get('/dashboard/upcoming-tours'),
  getPendingFollowUps: () => api.get('/dashboard/pending-follow-ups'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
  getBranchPerformance: () => api.get('/dashboard/branch-performance'),
  getSalesReps: () => api.get('/dashboard/sales-reps'),
  getTopLeadSources: () => api.get('/dashboard/top-lead-sources'),
  getProfitLossTrend: (params) => api.get('/dashboard/profit-loss-trend', { params }),
};

export default dashboardService;
