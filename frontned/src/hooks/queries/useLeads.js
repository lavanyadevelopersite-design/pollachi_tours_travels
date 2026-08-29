import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import leadService from '../../services/lead.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { useSnackbar } from 'notistack';

export const useLeads = (params) =>
  useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const { data } = await leadService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useLead = (id) =>
  useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      const { data } = await leadService.get(id);
      return data?.data || data;
    },
    enabled: !!id,
  });

export const useLeadMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['leads'] });

  return {
    create: useMutation({
      mutationFn: (payload) => leadService.create(payload),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Lead created successfully', { variant: 'success' });
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Failed to create lead', { variant: 'error' }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...payload }) => leadService.update(id, payload),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Lead updated successfully', { variant: 'success' });
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Failed to update lead', { variant: 'error' }),
    }),
    remove: useMutation({
      mutationFn: (id) => leadService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Lead deleted successfully', { variant: 'success' });
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Failed to delete lead', { variant: 'error' }),
    }),
  };
};
