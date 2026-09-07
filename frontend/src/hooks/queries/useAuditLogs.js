import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/common.service';
import { normalizeListResponse } from '../../utils/apiParams';

export const useAuditLogs = (params = {}) =>
  useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const { data } = await auditService.list(params);
      return normalizeListResponse(data);
    },
  });
