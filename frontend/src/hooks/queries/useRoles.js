import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { roleService } from '../../services/common.service';
import { normalizeListResponse } from '../../utils/apiParams';

export const useRoles = (params = {}) =>
  useQuery({
    queryKey: ['roles', params],
    queryFn: async () => {
      const { data } = await roleService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useRole = (id) =>
  useQuery({
    queryKey: ['roles', id],
    queryFn: async () => {
      const { data } = await roleService.get(id);
      return data?.data || data;
    },
    enabled: !!id,
  });

export const usePermissionsCatalog = () =>
  useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await roleService.permissions();
      const list = data?.data || data || [];
      return Array.isArray(list) ? list : [];
    },
  });

export const useRoleMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    queryClient.invalidateQueries({ queryKey: ['permissions'] });
  };

  const create = useMutation({
    mutationFn: (payload) => roleService.create(payload),
    onSuccess: () => {
      invalidate();
      enqueueSnackbar('Role created successfully', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to create role', { variant: 'error' });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => roleService.update(id, payload),
    onSuccess: () => {
      invalidate();
      enqueueSnackbar('Role updated successfully', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to update role', { variant: 'error' });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => roleService.remove(id),
    onSuccess: () => {
      invalidate();
      enqueueSnackbar('Role deleted successfully', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to delete role', { variant: 'error' });
    },
  });

  return { create, update, remove };
};
