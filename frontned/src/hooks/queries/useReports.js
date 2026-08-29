import { useQuery } from '@tanstack/react-query';
import reportService from '../../services/report.service';
import { normalizeListResponse } from '../../utils/apiParams';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export const useProfitLossReport = (params) =>
  useQuery({
    queryKey: ['reports', 'profit-loss', params],
    queryFn: async () => unwrap(await reportService.profitAndLoss(params)),
  });

const usePagedReport = (key, fetcher, params) =>
  useQuery({
    queryKey: ['reports', key, params],
    queryFn: async () => {
      const { data } = await fetcher(params);
      return {
        ...normalizeListResponse(data),
        summary: data?.pagination?.summary || data?.summary || null,
        from: data?.from,
        to: data?.to,
      };
    },
  });

export const useEnquiryReport = (params) => usePagedReport('enquiries', reportService.enquiries, params);
export const useExpenseReport = (params) => usePagedReport('expenses', reportService.expenses, params);
export const useCustomerReport = (params) => usePagedReport('customers', reportService.customers, params);
export const useVehicleReport = (params) => usePagedReport('vehicles', reportService.vehicles, params);
export const useDriverReport = (params) => usePagedReport('drivers', reportService.drivers, params);
export const useFollowUpReport = (params) => usePagedReport('follow-ups', reportService.followUps, params);
export const useAttendanceReport = (params) => usePagedReport('attendance', reportService.attendance, params);
