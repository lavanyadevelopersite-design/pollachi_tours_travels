import { Box, Stack, Typography } from '@mui/material';
import { getEventTypeMeta } from './EventCard';
import { timeToMinutes, toAmPmTime } from '../../utils/timeFormat';

/**
 * Animated vertical day timeline for events.
 */
export default function DayTimeline({ events = [] }) {
  const sorted = [...events].sort((a, b) => {
    if (a.event_time || b.event_time) return timeToMinutes(a.event_time) - timeToMinutes(b.event_time);
    return (a.display_order || 0) - (b.display_order || 0);
  });

  if (!sorted.length) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">No events yet. Add your first event to build the timeline.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: { xs: 2, sm: 3 }, py: 1 }}>
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 18, sm: 26 },
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #2196f3, #64b5f6, rgba(33,150,243,0.15))',
        }}
      />
      <Stack spacing={0}>
        {sorted.map((event, index) => {
          const { Icon, label } = getEventTypeMeta(event.event_type);
          return (
            <Box
              key={event.id || index}
              sx={{
                position: 'relative',
                pb: 3,
                animation: `tlIn 320ms ease ${index * 40}ms both`,
                '@keyframes tlIn': {
                  from: { opacity: 0, transform: 'translateY(8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 6, sm: 14 },
                  top: 6,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                  border: '3px solid',
                  borderColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(33,150,243,0.35)',
                  zIndex: 1,
                }}
              >
                <Icon sx={{ fontSize: 12, color: 'primary.main' }} />
              </Box>
              <Box sx={{ ml: { xs: 5, sm: 6 } }}>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  {event.event_time ? toAmPmTime(event.event_time) : 'Anytime'} · {label}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {event.name}
                </Typography>
                {event.description && (
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                )}
                {index < sorted.length - 1 && (
                  <Typography
                    sx={{ color: 'text.disabled', mt: 1, fontSize: 18, lineHeight: 1 }}
                    aria-hidden
                  >
                    ↓
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
