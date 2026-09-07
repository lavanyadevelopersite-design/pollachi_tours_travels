import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '../../services/user.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { useSnackbar } from 'notistack';

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const fieldError = data?.errors?.[0]?.message;
  if (fieldError) return fieldError;
  return data?.message || fallback;
};

export const useUsers = (params) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await userService.list(params);
      return normalizeListResponse(data);
    },
  });

export const useUser = (id) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data } = await userService.get(id);
      return data?.data || data;
    },
    enabled: !!id,
  });

export const useUserMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (payload) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      enqueueSnackbar('User created successfully', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getApiErrorMessage(err, 'Failed to create user'), { variant: 'error' });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => userService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getApiErrorMessage(err, 'Failed to update user'), { variant: 'error' });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to delete user', { variant: 'error' });
    },
  });

  return { create, update, remove };
};
