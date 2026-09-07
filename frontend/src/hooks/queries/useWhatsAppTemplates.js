import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import whatsappTemplateService from '../../services/whatsappTemplate.service';

export const useWhatsAppTemplateRows = () =>
  useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const { data } = await whatsappTemplateService.list();
      const rows = data?.data ?? data;
      return Array.isArray(rows) ? rows : [];
    },
  });

export const useWhatsAppTemplateMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });

  return {
    create: useMutation({
      mutationFn: (payload) => whatsappTemplateService.create(payload),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Template added successfully', { variant: 'success' });
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Save failed', { variant: 'error' }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...payload }) => whatsappTemplateService.update(id, payload),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Template updated successfully', { variant: 'success' });
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Update failed', { variant: 'error' }),
    }),
    remove: useMutation({
      mutationFn: (id) => whatsappTemplateService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Template deleted', { variant: 'success' });
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Delete failed', { variant: 'error' }),
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, is_active }) => whatsappTemplateService.updateStatus(id, is_active),
      onSuccess: (_data, variables) => {
        invalidate();
        enqueueSnackbar(
          variables.is_active ? 'Template activated' : 'Template deactivated',
          { variant: 'success' }
        );
      },
      onError: (err) =>
        enqueueSnackbar(err?.response?.data?.message || 'Status update failed', {
          variant: 'error',
        }),
    }),
  };
};
