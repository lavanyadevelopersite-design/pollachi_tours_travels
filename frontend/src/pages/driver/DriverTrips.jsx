import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
  ButtonBase,
} from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocalTaxiOutlinedIcon from '@mui/icons-material/LocalTaxiOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import driverPortalService from '../../services/driverPortal.service';
import { formatRouteLabel } from '../../utils/formatters';
import OwnershipTag from '../../components/common/OwnershipTag';

const statusColor = (trip) => {
  if (trip.is_closed) return 'default';
  if (trip.trip_status === 'trip_ongoing') return 'success';
  if (trip.trip_status === 'on_the_way' || trip.trip_status === 'customer_place_reached') {
    return 'warning';
  }
  return 'info';
};

function TripCard({ trip, onOpen }) {
  return (
    <ButtonBase
      onClick={() => onOpen(trip.id)}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 3,
        bgcolor: '#fff',
        border: '1px solid rgba(28,35,47,0.08)',
        boxShadow: '0 8px 24px rgba(28,35,47,0.06)',
        p: 2,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:active': { transform: 'scale(0.99)' },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {trip.enquiry_code || 'Trip'}
            </Typography>
            <Chip
              size="small"
              label={trip.trip_status_label || 'Assigned'}
              color={statusColor(trip)}
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.75 }} noWrap>
            {trip.customer_name || 'Customer'}
          </Typography>

          <Stack spacing={0.6} sx={{ mt: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PlaceOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {formatRouteLabel(
                  trip.pickup_location,
                  trip.drop_location,
                  `${trip.pickup_location || 'Pickup TBA'} - ${trip.drop_location || 'Drop TBA'}`
                )}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {dayjs(trip.start_date).format('DD MMM YYYY')}
                {trip.end_date && trip.end_date !== trip.start_date
                  ? ` – ${dayjs(trip.end_date).format('DD MMM YYYY')}`
                  : ''}
              </Typography>
            </Stack>
            {trip.vehicle && (
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocalTaxiOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {trip.vehicle.name}
                    {trip.vehicle.registration_number
                      ? ` · ${trip.vehicle.registration_number}`
                      : ''}
                  </Typography>
                  <Box sx={{ mt: 0.35 }}>
                    <OwnershipTag record={trip.vehicle} />
                  </Box>
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
        <ChevronRightIcon sx={{ color: 'text.disabled', mt: 0.5 }} />
      </Stack>
    </ButtonBase>
  );
}

export default function DriverTrips() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enquiryFilter = searchParams.get('enquiry') || '';
  const shareCode = searchParams.get('c') || '';
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!shareCode) return;
    let cancelled = false;
    driverPortalService
      .getTripByShareCode(shareCode)
      .then((res) => {
        if (cancelled) return;
        const trip = res.data?.data || res.data;
        if (trip?.id) navigate(`/driver/trips/${trip.id}`, { replace: true });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [shareCode, navigate]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['driver-trips', enquiryFilter || 'all'],
    queryFn: async () => {
      const res = await driverPortalService.listTrips(
        enquiryFilter ? { enquiry: enquiryFilter } : undefined
      );
      return res.data?.data || res.data;
    },
    refetchInterval: 60000,
  });

  const trips = data?.trips || [];
  const filtered = useMemo(() => {
    if (tab === 1) return trips.filter((t) => t.is_ongoing);
    if (tab === 2) return trips.filter((t) => t.is_closed);
    return trips;
  }, [trips, tab]);

  if (isLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading your trips...
        </Typography>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Chip label="Retry" onClick={() => refetch()} clickable size="small" color="error" />
        }
      >
        {error?.response?.data?.message || 'Could not load trips'}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
          My Trips
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Ongoing and assigned trips with enquiry details
          {isFetching ? ' · refreshing…' : ''}
        </Typography>
        {enquiryFilter && (
          <Chip
            sx={{ mt: 1, fontWeight: 700 }}
            color="primary"
            label={`Enquiry filter: ${enquiryFilter}`}
            onDelete={() => navigate('/driver/trips')}
          />
        )}
      </Box>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Chip label={`All ${data?.counts?.total || 0}`} variant={tab === 0 ? 'filled' : 'outlined'} />
        <Chip
          color="warning"
          label={`Ongoing ${data?.counts?.ongoing || 0}`}
          variant={tab === 1 ? 'filled' : 'outlined'}
        />
        <Chip
          label={`Closed ${data?.counts?.closed || 0}`}
          variant={tab === 2 ? 'filled' : 'outlined'}
        />
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          minHeight: 44,
          border: '1px solid rgba(28,35,47,0.08)',
          '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700 },
        }}
      >
        <Tab label="All" />
        <Tab label="Ongoing" />
        <Tab label="Closed" />
      </Tabs>

      {filtered.length === 0 ? (
        <Alert severity="info">No trips in this list right now.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onOpen={(id) => navigate(`/driver/trips/${id}`)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
