import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import bookingService from '../../services/booking.service';
import quotationService from '../../services/quotation.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { useSnackbar } from 'notistack';

const makeCrud = (key, service, label) => {
  const useList = (params) =>
    useQuery({
      queryKey: [key, params],
      queryFn: async () => {
        const { data } = await service.list(params);
        return normalizeListResponse(data);
      },
    });

  const useMutations = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [key] });

    return {
      create: useMutation({
        mutationFn: (p) => service.create(p),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar(`${label} created`, { variant: 'success' });
        },
        onError: (e) =>
          enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
      }),
      update: useMutation({
        mutationFn: ({ id, ...p }) => service.update(id, p),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar(`${label} updated`, { variant: 'success' });
        },
        onError: (e) =>
          enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
      }),
      remove: useMutation({
        mutationFn: (id) => service.remove(id),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar(`${label} deleted`, { variant: 'success' });
        },
        onError: (e) =>
          enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
      }),
    };
  };

  return { useList, useMutations };
};

const bookings = makeCrud('bookings', bookingService, 'Booking');
const quotations = makeCrud('quotations', quotationService, 'Quotation');

export const useBookings = bookings.useList;
export const useBookingMutation = bookings.useMutations;
export const useQuotations = quotations.useList;
export const useQuotationMutation = quotations.useMutations;
