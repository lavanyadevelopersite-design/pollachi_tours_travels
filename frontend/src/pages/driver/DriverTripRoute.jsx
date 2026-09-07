import { Alert, Box, Button, Chip, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import driverPortalService from '../../services/driverPortal.service';
import TripRouteMap from '../../components/driver/TripRouteMap';

const formatDuration = (minutes) => {
  const n = Number(minutes);
  if (!n || Number.isNaN(n)) return '—';
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

const googleMapsDirUrl = (route) => {
  const origin = `${route.from.lat},${route.from.lng}`;
  const destination = `${route.to.lat},${route.to.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
};

export default function DriverTripRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: route, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driver-trip-route', id],
    queryFn: async () => {
      const res = await driverPortalService.getTripRoute(id);
      return res.data?.data || res.data;
    },
    enabled: Boolean(id),
    retry: 1,
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={() => navigate(`/driver/trips/${id}`)} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} noWrap>
            Route map
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {route?.enquiry_code || 'Pickup to drop driving route'}
          </Typography>
        </Box>
      </Stack>

      {isLoading && (
        <Stack alignItems="center" py={8}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Fetching pickup, drop and driving route…
          </Typography>
        </Stack>
      )}

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error?.response?.data?.message || 'Could not load the route map'}
        </Alert>
      )}

      {route && (
        <>
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              p: 2,
              border: '1px solid rgba(28,35,47,0.08)',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
              {route.distance_km != null && (
                <Chip label={`${route.distance_km} km`} color="primary" sx={{ fontWeight: 800 }} />
              )}
              {route.duration_min != null && (
                <Chip label={formatDuration(route.duration_min)} variant="outlined" sx={{ fontWeight: 700 }} />
              )}
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <PlaceOutlinedIcon sx={{ fontSize: 20, color: '#059669', mt: 0.15 }} />
                <Typography variant="body2">
                  <strong>Pickup:</strong> {route.pickup_location || route.from?.label || '—'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <PlaceOutlinedIcon sx={{ fontSize: 20, color: '#dc2626', mt: 0.15 }} />
                <Typography variant="body2">
                  <strong>Drop:</strong> {route.drop_location || route.to?.label || '—'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <TripRouteMap route={route} />

          <Button
            variant="contained"
            size="large"
            href={googleMapsDirUrl(route)}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{
              py: 1.35,
              fontWeight: 800,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '1rem',
              bgcolor: '#128C7E',
              '&:hover': { bgcolor: '#0f766e' },
            }}
          >
            Open turn-by-turn in Google Maps
          </Button>
        </>
      )}
    </Stack>
  );
}
