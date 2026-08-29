import { useQuery } from '@tanstack/react-query';
import { calendarService } from '../../services/common.service';

export const useCalendarEvents = (from, to) =>
  useQuery({
    queryKey: ['calendar', 'events', from, to],
    queryFn: async () => {
      const { data } = await calendarService.events({ from, to });
      const rows = data?.data ?? data;
      return Array.isArray(rows) ? rows : [];
    },
    enabled: Boolean(from && to),
  });
