import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import enquiryService from '../../services/enquiry.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { useSnackbar } from 'notistack';

export const useEnquiries = (params) =>
  useQuery({
    queryKey: ['enquiries', params],
    queryFn: async () => {
      const { data } = await enquiryService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useEnquiry = (id) =>
  useQuery({
    queryKey: ['enquiries', id],
    queryFn: async () => {
      const { data } = await enquiryService.get(id);
      return data?.data ?? data;
    },
    enabled: !!id,
  });

export const useEnquiryMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['enquiries'] });

  return {
    create: useMutation({
      mutationFn: (p) => enquiryService.create(p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Enquiry created', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    update: useMutation({
      mutationFn: ({ id, ...p }) => enquiryService.update(id, p),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Enquiry updated', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    remove: useMutation({
      mutationFn: (id) => enquiryService.remove(id),
      onSuccess: () => {
        invalidate();
        enqueueSnackbar('Enquiry deleted', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    convert: useMutation({
      mutationFn: (id) => enquiryService.convert(id),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        enqueueSnackbar('Converted to lead', { variant: 'success' });
      },
      onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, ...payload }) => enquiryService.updateStatus(id, payload),
      onSuccess: (response) => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ['enquiry-vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['enquiry-assignable-resources'] });
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
        const payload = response?.data?.data ?? response?.data ?? {};
        const whatsapp = payload?.whatsapp;
        if (whatsapp?.success) {
          enqueueSnackbar('Status updated and invoice shared on WhatsApp', { variant: 'success' });
        } else if (whatsapp?.skipped) {
          enqueueSnackbar('Status updated (invoice WhatsApp not sent — check template or customer phone)', {
            variant: 'warning',
          });
        } else {
          enqueueSnackbar('Status updated', { variant: 'success' });
        }
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to update status', {
          variant: 'error',
        }),
    }),
    addNote: useMutation({
      mutationFn: ({ id, note }) => enquiryService.addNote(id, { note }),
      onSuccess: (_data, vars) => {
        queryClient.invalidateQueries({ queryKey: ['enquiry-notes', vars.id] });
        queryClient.invalidateQueries({ queryKey: ['enquiry-history', vars.id] });
        queryClient.invalidateQueries({ queryKey: ['enquiries', vars.id] });
        enqueueSnackbar('Note added', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to add note', { variant: 'error' }),
    }),
  };
};

export const useEnquiryNotes = (id) =>
  useQuery({
    queryKey: ['enquiry-notes', id],
    queryFn: async () => {
      const { data } = await enquiryService.listNotes(id);
      return data?.data ?? data ?? [];
    },
    enabled: !!id,
  });

export const useEnquiryHistory = (id) =>
  useQuery({
    queryKey: ['enquiry-history', id],
    queryFn: async () => {
      const { data } = await enquiryService.getHistory(id);
      return data?.data ?? data ?? [];
    },
    enabled: !!id,
  });

export const useEnquiryVehicleAssignments = (id, options = {}) =>
  useQuery({
    queryKey: ['enquiry-vehicles', id],
    queryFn: async () => {
      const { data } = await enquiryService.listVehicleAssignments(id);
      const rows = data?.data ?? data;
      return Array.isArray(rows) ? rows : [];
    },
    enabled: !!id,
    ...options,
  });

export const useAssignableResources = (enabled = true) =>
  useQuery({
    queryKey: ['enquiry-assignable-resources'],
    queryFn: async () => {
      const { data } = await enquiryService.getAssignableResources();
      const payload = data?.data ?? data ?? {};
      return {
        vehicles: Array.isArray(payload.vehicles) ? payload.vehicles : [],
        drivers: Array.isArray(payload.drivers) ? payload.drivers : [],
      };
    },
    enabled,
  });

export const useMonthlyTrips = (params, enabled = true) =>
  useQuery({
    queryKey: ['monthly-trips', params],
    queryFn: async () => {
      const { data } = await enquiryService.getMonthlyTrips(params);
      return data?.data ?? data;
    },
    enabled: Boolean(enabled && (params?.vehicle_id || params?.driver_id)),
  });

export const useAssignedTrips = (params, enabled = true) =>
  useQuery({
    queryKey: ['assigned-trips', params],
    queryFn: async () => {
      const { data } = await enquiryService.getAssignedTrips(params);
      return data?.data ?? data;
    },
    enabled: Boolean(enabled && (params?.vehicle_id || params?.driver_id)),
  });

export const useEnquiryVehicleMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidate = (enquiryId) => {
    queryClient.invalidateQueries({ queryKey: ['enquiry-vehicles', enquiryId] });
    queryClient.invalidateQueries({ queryKey: ['enquiry-assignable-resources'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-trips'] });
  };

  return {
    create: useMutation({
      mutationFn: ({ id, ...payload }) => enquiryService.addVehicleAssignment(id, payload),
      onSuccess: (response, vars) => {
        invalidate(vars.id);
        const payload = response?.data?.data ?? response?.data ?? {};
        const whatsapp = payload?.whatsapp;
        if (whatsapp?.success) {
          enqueueSnackbar('Vehicle assigned and WhatsApp sent to customer', { variant: 'success' });
        } else if (whatsapp?.skipped) {
          enqueueSnackbar('Vehicle assigned (WhatsApp not sent — check template or customer phone)', {
            variant: 'warning',
          });
        } else {
          enqueueSnackbar('Vehicle & driver assigned', { variant: 'success' });
        }
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to assign vehicle', {
          variant: 'error',
        }),
    }),
    update: useMutation({
      mutationFn: ({ id, subId, ...payload }) =>
        enquiryService.updateVehicleAssignment(id, subId, payload),
      onSuccess: (_data, vars) => {
        invalidate(vars.id);
        enqueueSnackbar('Assignment updated', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to update assignment', {
          variant: 'error',
        }),
    }),
    remove: useMutation({
      mutationFn: ({ id, subId }) => enquiryService.removeVehicleAssignment(id, subId),
      onSuccess: (_data, vars) => {
        invalidate(vars.id);
        enqueueSnackbar('Assignment removed', { variant: 'success' });
      },
      onError: (e) =>
        enqueueSnackbar(e?.response?.data?.message || 'Failed to remove assignment', {
          variant: 'error',
        }),
    }),
  };
};

export const usePublicEnquiryMasters = () =>
  useQuery({
    queryKey: ['public-enquiry-masters'],
    queryFn: async () => {
      const { data } = await enquiryService.publicMasters();
      return data?.data ?? data;
    },
  });

export const usePublicStates = (countryId) =>
  useQuery({
    queryKey: ['public-enquiry-states', countryId],
    queryFn: async () => {
      const { data } = await enquiryService.publicStates(countryId);
      return data?.data ?? data ?? [];
    },
    enabled: !!countryId,
  });

export const usePublicCities = (stateId) =>
  useQuery({
    queryKey: ['public-enquiry-cities', stateId],
    queryFn: async () => {
      const { data } = await enquiryService.publicCities(stateId);
      return data?.data ?? data ?? [];
    },
    enabled: !!stateId,
  });
