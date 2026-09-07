import { useQuery, useQueryClient } from '@tanstack/react-query';
import { brandingService } from '../../services/common.service';

export const BRANDING_QUERY_KEY = ['branding'];

export const useBranding = (options = {}) =>
  useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: async () => {
      const { data } = await brandingService.get();
      return data?.data || { company_name: null, company_logo: null };
    },
    staleTime: 60_000,
    retry: false,
    ...options,
  });

export const useInvalidateBranding = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: BRANDING_QUERY_KEY });
};
