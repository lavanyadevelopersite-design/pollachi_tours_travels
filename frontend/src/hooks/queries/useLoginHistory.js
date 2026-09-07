import { useQuery } from '@tanstack/react-query';
import loginHistoryService from '../../services/loginHistory.service';
import { normalizeListResponse } from '../../utils/apiParams';

export const useLoginHistory = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['login-history', params],
    queryFn: async () => {
      const { data } = await loginHistoryService.list(params);
      return normalizeListResponse(data);
    },
    ...options,
  });

export const useLoginHistorySummary = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['login-history-summary', params],
    queryFn: async () => {
      const { data } = await loginHistoryService.summary(params);
      return data?.data || data;
    },
    ...options,
  });

export const useLoginHistoryUserReport = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['login-history-user-report', params],
    queryFn: async () => {
      const { data } = await loginHistoryService.userReport(params);
      return data?.data || data;
    },
    enabled: Boolean(params.user_id && params.user_id !== 'all'),
    ...options,
  });
