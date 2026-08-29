import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import quotationService from '../../services/quotation.service';
import { useSnackbar } from 'notistack';

export const useEnquiryQuotations = (enquiryId) =>
  useQuery({
    queryKey: ['quotations', 'enquiry', enquiryId],
    queryFn: async () => {
      const { data } = await quotationService.listByEnquiry(enquiryId);
      return data?.data || [];
    },
    enabled: !!enquiryId,
  });

export const useQuotationByEnquiryItinerary = (enquiryId, itineraryId, enabled = true) =>
  useQuery({
    queryKey: ['quotations', 'enquiry', enquiryId, 'itinerary', itineraryId],
    queryFn: async () => {
      const { data } = await quotationService.getByEnquiryItinerary(enquiryId, itineraryId);
      return data?.data || null;
    },
    enabled: !!enquiryId && !!itineraryId && enabled,
  });

export const useStandaloneQuotation = (enquiryId, enabled = true) =>
  useQuery({
    queryKey: ['quotations', 'enquiry', enquiryId, 'standalone'],
    queryFn: async () => {
      const { data } = await quotationService.getStandalone(enquiryId);
      return data?.data || null;
    },
    enabled: !!enquiryId && enabled,
  });

export const useQuotationUpsert = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload) =>
      payload?.itinerary_id
        ? quotationService.upsertForItinerary(payload)
        : quotationService.upsertForEnquiry(payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      if (vars?.enquiry_id) {
        queryClient.invalidateQueries({ queryKey: ['quotations', 'enquiry', vars.enquiry_id] });
      }
      enqueueSnackbar('Quotation saved', { variant: 'success' });
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.message || 'Failed to save quotation', {
        variant: 'error',
      }),
  });
};

export { useQuotations, useQuotationMutation } from './useBookings';
