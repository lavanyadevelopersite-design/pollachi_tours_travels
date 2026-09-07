import { Box, Grid, Stack, Typography } from '@mui/material';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';

const tiles = [
  { key: 'accommodation', label: 'Accommodation', Icon: HotelOutlinedIcon, color: '#2196f3' },
  { key: 'activity', label: 'Activities', Icon: LocalActivityOutlinedIcon, color: '#22c55e' },
  { key: 'meal', label: 'Meals', Icon: RestaurantOutlinedIcon, color: '#f59e0b' },
  { key: 'transportation', label: 'Transportation', Icon: DirectionsCarOutlinedIcon, color: '#06b6d4' },
  { key: 'total', label: 'Total Events', Icon: EventNoteOutlinedIcon, color: '#152238' },
];

export default function DaySummary({ events = [] }) {
  const counts = {
    accommodation: events.filter((e) => e.event_type === 'accommodation').length,
    activity: events.filter((e) => e.event_type === 'activity' || e.event_type === 'leisure').length,
    meal: events.filter((e) => e.event_type === 'meal').length,
    transportation: events.filter(
      (e) => e.event_type === 'transportation' || e.event_type === 'flight' || e.event_type === 'cruise'
    ).length,
    total: events.length,
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.9)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(21,34,56,0.05)',
      }}
    >
      <Typography variant="subtitle1" fontWeight={800} mb={1.5}>
        Day Summary
      </Typography>
      <Grid container spacing={1.5}>
        {tiles.map(({ key, label, Icon, color }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 2 }}>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: `${color}12`,
                minHeight: 64,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                  {counts[key] || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {label}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
