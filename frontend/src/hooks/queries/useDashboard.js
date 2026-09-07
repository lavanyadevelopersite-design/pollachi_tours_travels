import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboard.service';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const unwrapArray = (res) => {
  const payload = unwrap(res);
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) return payload.data;
  return [];
};

const safeQuery = (queryKey, fn) =>
  useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return unwrap(await fn());
      } catch {
        return null;
      }
    },
    retry: false,
  });

export const useDashboardStats = () =>
  safeQuery(['dashboard', 'stats'], () => dashboardService.getStats());

export const useRevenueChart = (params) =>
  safeQuery(['dashboard', 'revenue', params], () => dashboardService.getRevenueChart(params));

export const useBookingStatusChart = () =>
  safeQuery(['dashboard', 'booking-status'], async () => unwrapArray(await dashboardService.getBookingStatus()));

export const useLeadSourceChart = () =>
  safeQuery(['dashboard', 'lead-sources'], () => dashboardService.getLeadSources());

export const useTopPackages = () =>
  safeQuery(['dashboard', 'top-packages'], async () => unwrapArray(await dashboardService.getTopPackages()));

export const useTopDestinations = () =>
  safeQuery(['dashboard', 'top-destinations'], async () =>
    unwrapArray(await dashboardService.getTopDestinations())
  );

export const useUpcomingTours = () =>
  safeQuery(['dashboard', 'upcoming-tours'], async () => unwrapArray(await dashboardService.getUpcomingTours()));

export const usePendingFollowUps = () =>
  safeQuery(['dashboard', 'pending-follow-ups'], async () =>
    unwrapArray(await dashboardService.getPendingFollowUps())
  );

export const useTodayFollowUps = () =>
  safeQuery(['dashboard', 'today-follow-ups'], async () =>
    unwrapArray(await dashboardService.getTodayFollowUps())
  );

export const useRecentActivities = () =>
  safeQuery(['dashboard', 'activities'], async () => unwrapArray(await dashboardService.getRecentActivities()));

export const useBranchPerformance = () =>
  safeQuery(['dashboard', 'branch-performance'], () => dashboardService.getBranchPerformance());

export const useSalesReps = () =>
  safeQuery(['dashboard', 'sales-reps'], async () => unwrapArray(await dashboardService.getSalesReps()));

export const useTopLeadSources = () =>
  safeQuery(['dashboard', 'top-lead-sources'], async () =>
    unwrapArray(await dashboardService.getTopLeadSources())
  );

export const useProfitLossTrend = (params) =>
  safeQuery(['dashboard', 'profit-loss-trend', params], () => dashboardService.getProfitLossTrend(params));

export const usePaymentCollection = () =>
  safeQuery(['dashboard', 'payment-collection'], () => dashboardService.getPaymentCollection());
