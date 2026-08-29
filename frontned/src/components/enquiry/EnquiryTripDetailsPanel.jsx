import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import DirectionsBusFilledOutlinedIcon from '@mui/icons-material/DirectionsBusFilledOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import { useEnquiryVehicleAssignments } from '../../hooks/queries/useEnquiry';
import { formatDateTime, getInitials } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/constants';
import OwnershipTag from '../common/OwnershipTag';

const ACCENT = '#f97316';

const TRIP_STATUS_META = {
  on_the_way: {
    label: 'On the way',
    color: '#0284c7',
    bg: '#e0f2fe',
  },
  customer_place_reached: {
    label: 'Customer place reached',
    color: '#d97706',
    bg: '#fef3c7',
  },
  trip_ongoing: {
    label: 'Trip ongoing',
    color: '#059669',
    bg: '#d1fae5',
  },
  trip_closed: {
    label: 'Trip closed',
    color: '#475569',
    bg: '#e2e8f0',
  },
};

function formatKm(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString('en-IN')} KM`;
}

function vehicleLabel(vehicle) {
  if (!vehicle) return '—';
  const parts = [vehicle.name, vehicle.registration_number].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

function isCompletedLeadStatus(label) {
  const name = String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return name.includes('completed') || name === 'feedback';
}

function isTripVisible(assignment, enquiry) {
  if (isCompletedLeadStatus(enquiry?.leadStatus?.lead_status)) return false;
  const status = String(assignment?.status || '').toLowerCase();
  const tripStatus = String(assignment?.trip_status || '').toLowerCase();
  if (status === 'cancelled') return false;
  const history = assignment?.trip_status_history;
  const statusLogs = assignment?.status_logs;
  const hasHistory =
    (Array.isArray(history) && history.length > 0) ||
    (Array.isArray(statusLogs) && statusLogs.length > 0);
  return status === 'on_trip' || Boolean(tripStatus) || hasHistory;
}

function TripStatusBadge({ tripStatus }) {
  const meta = TRIP_STATUS_META[tripStatus] || {
    label: tripStatus ? String(tripStatus).replace(/_/g, ' ') : 'Assigned',
    color: '#2563eb',
    bg: '#dbeafe',
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        py: 0.85,
        borderRadius: 999,
        bgcolor: meta.bg,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: meta.color,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 14,
          color: meta.color,
          lineHeight: 1.2,
        }}
      >
        {meta.label}
      </Typography>
    </Box>
  );
}

function buildStatusTimeline(trip) {
  const fromLogs = Array.isArray(trip?.status_logs) ? trip.status_logs : [];
  const fromHistory = Array.isArray(trip?.trip_status_history) ? trip.trip_status_history : [];
  const history = fromLogs.length ? fromLogs : fromHistory;

  if (history.length) {
    return history.map((entry, index) => ({
      key: `${entry.status}-${entry.at}-${index}`,
      status: entry.status,
      label:
        entry.label ||
        TRIP_STATUS_META[entry.status]?.label ||
        String(entry.status || '').replace(/_/g, ' '),
      at: entry.at,
    }));
  }
  if (trip?.trip_status) {
    return [
      {
        key: trip.trip_status,
        status: trip.trip_status,
        label: TRIP_STATUS_META[trip.trip_status]?.label || trip.trip_status,
        at: trip.status_updated_at || trip.updated_at || trip.updatedAt,
      },
    ];
  }
  return [];
}

function TripStatusTimeline({ trip }) {
  const timeline = buildStatusTimeline(trip);
  if (!timeline.length) return null;

  return (
    <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 0, sm: 0.5 } }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: '#94a3b8',
          fontWeight: 800,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          mb: 1.25,
        }}
      >
        Status update history
      </Typography>
      <Box
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${alpha('#0f172a', 0.08)}`,
          bgcolor: '#f8fafc',
          px: 2,
          py: 1.5,
        }}
      >
        <Stack spacing={0}>
          {timeline.map((entry, index) => {
            const meta = TRIP_STATUS_META[entry.status] || {
              label: entry.label,
              color: '#64748b',
              bg: '#e2e8f0',
            };
            const isLast = index === timeline.length - 1;

            return (
              <Stack
                key={entry.key}
                direction="row"
                spacing={1.5}
                sx={{ py: 1.25, minHeight: 56 }}
              >
                <Stack alignItems="center" sx={{ width: 18, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: meta.color,
                      boxShadow: `0 0 0 4px ${alpha(meta.color, 0.18)}`,
                      mt: 0.35,
                    }}
                  />
                  {!isLast && (
                    <Box
                      sx={{
                        width: 2,
                        flex: 1,
                        minHeight: 24,
                        bgcolor: alpha('#0f172a', 0.1),
                        mt: 0.5,
                      }}
                    />
                  )}
                </Stack>
                <Box sx={{ minWidth: 0, flex: 1, pb: isLast ? 0 : 0.5 }}>
                  <Typography fontWeight={800} fontSize={14} color="#0f172a">
                    {entry.label}
                  </Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.35 }}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {formatDateTime(entry.at)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

function KmPhotoViewDialog({ open, title, imageUrl, onClose }) {
  const src = resolveMediaUrl(imageUrl);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 800,
        }}
      >
        {title}
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {src ? (
          <Box
            component="img"
            src={src}
            alt={title}
            sx={{
              width: '100%',
              maxHeight: '75vh',
              objectFit: 'contain',
              borderRadius: 2,
              border: `1px solid ${alpha('#0f172a', 0.08)}`,
              bgcolor: '#f8fafc',
            }}
          />
        ) : (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No image available
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PersonCard({ name, role, avatarSrc, initials, actionIcon, onAction, ownership }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
      <Avatar
        src={avatarSrc || undefined}
        sx={{
          width: 56,
          height: 56,
          fontWeight: 800,
          fontSize: 18,
          bgcolor: role === 'Customer' ? '#ffedd5' : '#e0e7ff',
          color: role === 'Customer' ? '#ea580c' : '#4338ca',
        }}
      >
        {initials}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontWeight={800} fontSize={16} color="#0f172a" noWrap>
          {name || '—'}
        </Typography>
        {ownership ? (
          <Box sx={{ mt: 0.4 }}>
            <OwnershipTag type={ownership} />
          </Box>
        ) : null}
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.25 }}>
          {role}
        </Typography>
      </Box>
      {actionIcon && (
        <IconButton
          size="small"
          onClick={onAction}
          disabled={!onAction}
          sx={{
            border: '1px solid',
            borderColor: alpha('#0f172a', 0.12),
            color: '#64748b',
            width: 36,
            height: 36,
          }}
        >
          {actionIcon}
        </IconButton>
      )}
    </Stack>
  );
}

function StatRow({ icon, iconBg, iconColor, label, value, extra, last }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        py: 1.75,
        borderBottom: last ? 'none' : `1px solid ${alpha('#0f172a', 0.06)}`,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: iconBg,
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, pt: 0.15 }}>
        <Typography fontWeight={800} fontSize={14} color="#0f172a" sx={{ mb: 0.15 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: value === '—' ? '#94a3b8' : '#334155',
            fontWeight: 600,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
        {extra ? <Box sx={{ mt: 0.5 }}>{extra}</Box> : null}
      </Box>
    </Stack>
  );
}

function TripCard({ trip, enquiry }) {
  const [startingPhotoOpen, setStartingPhotoOpen] = useState(false);
  const updatedAt = trip.status_updated_at || trip.updated_at || trip.updatedAt;
  const customerName = enquiry?.customer_name || '—';
  const driverName = trip.driver?.full_name || '—';
  const driverPhoto = resolveMediaUrl(trip.driver?.photo);
  const driverPhone = trip.driver?.phone;
  const startingKmPhoto = trip.starting_km_photo;

  const leftStats = [
    {
      key: 'vehicle',
      label: 'Vehicle',
      value: vehicleLabel(trip.vehicle),
      extra: trip.vehicle ? <OwnershipTag record={trip.vehicle} /> : null,
      icon: <DirectionsBusFilledOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      key: 'starting',
      label: 'Starting KM',
      value: formatKm(trip.starting_km),
      extra: startingKmPhoto ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Box
            component="img"
            src={resolveMediaUrl(startingKmPhoto)}
            alt="Starting KM screenshot"
            onClick={() => setStartingPhotoOpen(true)}
            sx={{
              width: 44,
              height: 44,
              objectFit: 'cover',
              borderRadius: 1.5,
              border: `1px solid ${alpha('#0f172a', 0.12)}`,
              cursor: 'pointer',
            }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<PhotoOutlinedIcon />}
            onClick={() => setStartingPhotoOpen(true)}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            View screenshot
          </Button>
        </Stack>
      ) : null,
      icon: <PlaceOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: '#ccfbf1',
      iconColor: '#0d9488',
    },
    {
      key: 'total',
      label: 'Total Trip KM',
      value: formatKm(trip.total_km),
      icon: <AltRouteOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      last: true,
    },
  ];

  const rightStats = [
    {
      key: 'closing',
      label: 'Closing KM',
      value: formatKm(trip.closing_km),
      icon: <FlagOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
    },
    {
      key: 'current',
      label: 'Current KM',
      value: formatKm(
        trip.closing_km != null
          ? trip.closing_km
          : trip.starting_km != null && trip.trip_status === 'trip_ongoing'
            ? trip.starting_km
            : null
      ),
      icon: <SpeedOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      last: true,
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: ACCENT,
              color: '#fff',
              boxShadow: '0 8px 18px rgba(249, 115, 22, 0.28)',
            }}
          >
            <RouteOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize={22} color="#0f172a" lineHeight={1.2}>
              Trip Details
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              View trip and driver information
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="center">
          <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Last updated: {formatDateTime(updatedAt)}
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha('#0f172a', 0.08)}`,
          bgcolor: '#fff',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Grid
          container
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.5 },
          }}
        >
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              pr: { md: 2 },
              pb: { xs: 2, md: 0 },
              borderRight: { md: `1px solid ${alpha('#0f172a', 0.08)}` },
              borderBottom: { xs: `1px solid ${alpha('#0f172a', 0.08)}`, md: 'none' },
            }}
          >
            <PersonCard
              name={customerName}
              role="Customer"
              initials={getInitials(customerName)}
              actionIcon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              px: { md: 2 },
              py: { xs: 2, md: 0 },
              borderRight: { md: `1px solid ${alpha('#0f172a', 0.08)}` },
              borderBottom: { xs: `1px solid ${alpha('#0f172a', 0.08)}`, md: 'none' },
            }}
          >
            <PersonCard
              name={driverName}
              role="Driver"
              avatarSrc={driverPhoto}
              initials={getInitials(driverName)}
              ownership={trip.driver ? trip.driver.driver_type || 'own' : undefined}
              actionIcon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}
              onAction={
                driverPhone
                  ? () => {
                      window.open(`tel:${driverPhone}`, '_self');
                    }
                  : undefined
              }
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              pl: { md: 2 },
              pt: { xs: 2, md: 0 },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#94a3b8',
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                Trip Status
              </Typography>
              <TripStatusBadge tripStatus={trip.trip_status} />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: alpha('#0f172a', 0.08) }} />

        <Grid container sx={{ px: { xs: 2, sm: 2.5 }, py: 0.5 }}>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              pr: { md: 3 },
              borderRight: { md: `1px solid ${alpha('#0f172a', 0.06)}` },
            }}
          >
            {leftStats.map((item) => (
              <StatRow key={item.key} {...item} />
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ pl: { md: 3 } }}>
            {rightStats.map((item) => (
              <StatRow key={item.key} {...item} />
            ))}
          </Grid>
        </Grid>

        <TripStatusTimeline trip={trip} />

        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } }}>
          <Box
            sx={{
              borderRadius: 2.5,
              border: `1px solid ${alpha('#059669', 0.22)}`,
              bgcolor: alpha('#059669', 0.06),
              px: 2,
              py: 1.75,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <DescriptionOutlinedIcon sx={{ fontSize: 20, color: '#059669', mt: 0.15 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} fontSize={14} color="#059669" sx={{ mb: 0.35 }}>
                  Driver Notes
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: trip.driver_update_notes ? '#0f172a' : '#64748b',
                    fontWeight: 600,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {trip.driver_update_notes || 'No driver notes'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>

      <KmPhotoViewDialog
        open={startingPhotoOpen}
        title="Starting KM Screenshot"
        imageUrl={startingKmPhoto}
        onClose={() => setStartingPhotoOpen(false)}
      />
    </Box>
  );
}

export default function EnquiryTripDetailsPanel({ enquiry }) {
  const enquiryId = enquiry?.id;
  const { data: assignments = [], isLoading } = useEnquiryVehicleAssignments(enquiryId, {
    refetchInterval: 15000,
  });

  const trips = useMemo(
    () => (assignments || []).filter((row) => isTripVisible(row, enquiry)),
    [assignments, enquiry]
  );

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} sx={{ color: ACCENT }} />
      </Stack>
    );
  }

  if (trips.length === 0) {
    return (
      <Box>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: ACCENT,
              color: '#fff',
            }}
          >
            <RouteOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize={22} color="#0f172a" lineHeight={1.2}>
              Trip Details
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              View trip and driver information
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No ongoing trip details yet. Trip updates from the driver will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} enquiry={enquiry} />
      ))}
    </Stack>
  );
}

export function enquiryHasTripDetails(assignments = [], enquiry) {
  return (assignments || []).some((row) => isTripVisible(row, enquiry));
}
