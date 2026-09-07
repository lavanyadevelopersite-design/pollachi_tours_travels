import { useQuery } from '@tanstack/react-query';

export function useEntityQuery(key, service, id) {
  return useQuery({
    queryKey: [key, id],
    queryFn: async () => {
      const { data } = await service.get(id);
      return data?.data || data;
    },
    enabled: !!id,
  });
}
