import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import userTablePreferenceService from '../../services/userTablePreference.service';
import { useAuthStore } from '../../store/authStore';

const normalizeHiddenColumns = (value) => {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed.map((v) => String(v || '').trim()).filter(Boolean))];
};

export const useTableColumnPreference = (tableKey) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const query = useQuery({
    queryKey: ['table-preferences', tableKey],
    queryFn: async () => {
      const { data } = await userTablePreferenceService.get(tableKey);
      const payload = data?.data || {};
      return {
        exists: !!payload.exists,
        hidden_columns: normalizeHiddenColumns(payload.hidden_columns),
      };
    },
    enabled: !!tableKey && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const save = useMutation({
    mutationFn: async (hiddenColumns) => {
      const next = normalizeHiddenColumns(hiddenColumns);
      const { data } = await userTablePreferenceService.save(tableKey, next);
      const payload = data?.data || {};
      return {
        exists: true,
        hidden_columns: normalizeHiddenColumns(
          payload.hidden_columns != null ? payload.hidden_columns : next
        ),
      };
    },
    onMutate: async (hiddenColumns) => {
      await queryClient.cancelQueries({ queryKey: ['table-preferences', tableKey] });
      const previous = queryClient.getQueryData(['table-preferences', tableKey]);
      queryClient.setQueryData(['table-preferences', tableKey], {
        exists: true,
        hidden_columns: normalizeHiddenColumns(hiddenColumns),
      });
      return { previous };
    },
    onError: (err, _hiddenColumns, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['table-preferences', tableKey], context.previous);
      }
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save column preferences', {
        variant: 'error',
      });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['table-preferences', tableKey], result);
    },
  });

  return {
    preference: query.data,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    isError: query.isError,
    saveHiddenColumns: save.mutate,
    saveHiddenColumnsAsync: save.mutateAsync,
  };
};
