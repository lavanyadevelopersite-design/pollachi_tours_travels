import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import itineraryService from '../../services/itinerary.service';
import {
  expenseService,
  followUpService,
  invoiceService,
  paymentService,
} from '../../services/common.service';
import notificationService from '../../services/notification.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { useSnackbar } from 'notistack';

export const useItineraries = (params) =>
  useQuery({
    queryKey: ['itineraries', params],
    queryFn: async () => {
      const { data } = await itineraryService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useItinerary = (id) =>
  useQuery({
    queryKey: ['itineraries', id],
    queryFn: async () => {
      const { data } = await itineraryService.get(id);
      return data?.data || data;
    },
    enabled: !!id,
  });

export const useItineraryMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const invalidate = (id) => {
    queryClient.invalidateQueries({ queryKey: ['itineraries'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['itineraries', id] });
  };

  return {
    create: useMutation({
      mutationFn: (p) => itineraryService.create(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Itinerary created', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    generate: useMutation({
      mutationFn: (p) => itineraryService.generate(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Itinerary generated', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...p }) => itineraryService.update(id, p),
      onSuccess: (_d, vars) => {
        invalidate(vars?.id);
        enqueueSnackbar('Itinerary updated', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    remove: useMutation({
      mutationFn: (id) => itineraryService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Itinerary deleted', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    updateDay: useMutation({
      mutationFn: ({ id, dayId, ...p }) => itineraryService.updateDay(id, dayId, p),
      onSuccess: (_d, vars) => invalidate(vars?.id),
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed to save day', { variant: 'error' }),
    }),
    createEvent: useMutation({
      mutationFn: ({ id, dayId, ...p }) => itineraryService.createEvent(id, dayId, p),
      onSuccess: (_d, vars) => {
        invalidate(vars?.id);
        enqueueSnackbar('Event added', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    updateEvent: useMutation({
      mutationFn: ({ id, eventId, ...p }) => itineraryService.updateEvent(id, eventId, p),
      onSuccess: (_d, vars) => invalidate(vars?.id),
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    deleteEvent: useMutation({
      mutationFn: ({ id, eventId }) => itineraryService.deleteEvent(id, eventId),
      onSuccess: (_d, vars) => {
        invalidate(vars?.id);
        enqueueSnackbar('Event deleted', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    reorderEvents: useMutation({
      mutationFn: ({ id, dayId, orderedIds }) =>
        itineraryService.reorderEvents(id, dayId, orderedIds),
      onSuccess: (_d, vars) => invalidate(vars?.id),
    }),
    assignEnquiry: useMutation({
      mutationFn: ({ id, enquiryId }) => itineraryService.assignEnquiry(id, enquiryId),
      onSuccess: (_d, vars) => {
        invalidate(vars?.id);
        queryClient.invalidateQueries({ queryKey: ['enquiries'] });
        enqueueSnackbar('Itinerary added', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to add itinerary', {
          variant: 'error',
        }),
    }),
    unassignEnquiry: useMutation({
      mutationFn: (id) => itineraryService.unassignEnquiry(id),
      onSuccess: (_d, id) => {
        invalidate(id);
        queryClient.invalidateQueries({ queryKey: ['enquiries'] });
        enqueueSnackbar('Itinerary removed', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to remove itinerary', {
          variant: 'error',
        }),
    }),
    confirm: useMutation({
      mutationFn: (id) => itineraryService.confirm(id),
      onSuccess: (_d, id) => {
        invalidate(id);
        queryClient.invalidateQueries({ queryKey: ['enquiries'] });
        enqueueSnackbar('Itinerary confirmed', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to confirm itinerary', {
          variant: 'error',
        }),
    }),
    sendWhatsApp: useMutation({
      mutationFn: (id) => itineraryService.sendWhatsApp(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['enquiry-whatsapp-messages'] });
        enqueueSnackbar('Itinerary preview link sent to customer on WhatsApp', {
          variant: 'success',
        });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to send itinerary on WhatsApp', {
          variant: 'error',
        }),
    }),
  };
};

export const useFollowUps = (params) =>
  useQuery({
    queryKey: ['follow-ups', params],
    queryFn: async () => {
      const { data } = await followUpService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useFollowUpMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['follow-ups'] });

  return {
    create: useMutation({
      mutationFn: (p) => followUpService.create(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Follow-up created', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...p }) => followUpService.update(id, p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Follow-up updated', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    remove: useMutation({
      mutationFn: (id) => followUpService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Follow-up deleted', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
  };
};

export const usePayments = (params) =>
  useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await paymentService.list(params);
      return normalizeListResponse(data);
    },
    enabled: params?.enquiry_id !== undefined ? !!params.enquiry_id : true,
  });

export const usePaymentMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['payments'] });

  return {
    create: useMutation({
      mutationFn: (p) => paymentService.create(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Payment saved', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to save payment', {
          variant: 'error',
        }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }) => paymentService.update(id, data),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Payment updated', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to update payment', {
          variant: 'error',
        }),
    }),
    remove: useMutation({
      mutationFn: (id) => paymentService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Payment deleted', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to delete payment', {
          variant: 'error',
        }),
    }),
  };
};

export const useInvoices = (params) =>
  useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data } = await invoiceService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useInvoiceMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['invoices'] });

  return {
    create: useMutation({
      mutationFn: (p) => invoiceService.create(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Invoice created', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...p }) => invoiceService.update(id, p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Invoice updated', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    remove: useMutation({
      mutationFn: (id) => invoiceService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Invoice deleted', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
  };
};

export const useExpenses = (params) =>
  useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const { data } = await expenseService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useExpenseCategories = () =>
  useQuery({
    queryKey: ['expenseCategories'],
    queryFn: async () => {
      const { data } = await expenseService.categories();
      return data?.data || data || [];
    },
  });

export const useExpenseMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['expenses'] });

  return {
    create: useMutation({
      mutationFn: (p) => expenseService.create(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Expense created', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to create expense', {
          variant: 'error',
        }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...p }) => expenseService.update(id, p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Expense updated', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to update expense', {
          variant: 'error',
        }),
    }),
    remove: useMutation({
      mutationFn: (id) => expenseService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Expense deleted', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to delete expense', {
          variant: 'error',
        }),
    }),
  };
};

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const { data } = await notificationService.unreadCount();
        return data?.data?.count ?? data?.count ?? 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 60000,
    retry: false,
  });

export const useNotifications = (params) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      try {
        const { data } = await notificationService.list(params);
        return normalizeListResponse(data);
      } catch {
        return { rows: [], pagination: { total: 0, page: 1, limit: 10 } };
      }
    },
    retry: false,
  });
