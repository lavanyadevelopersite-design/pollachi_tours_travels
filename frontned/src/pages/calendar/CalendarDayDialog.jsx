import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import PhoneCallbackOutlinedIcon from '@mui/icons-material/PhoneCallbackOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import dayjs from 'dayjs';
import StatusBadge from '../../components/common/StatusBadge';
import { eventStyle, formatRange, guestsLabel } from './calendarUtils';
import { formatRouteLabel } from '../../utils/formatters';
import OwnershipTag from '../../components/common/OwnershipTag';

function SectionHeader({ icon, label, count, color }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700} letterSpacing={0.2}>
        {label}
      </Typography>
      <Chip
        size="small"
        label={count}
        sx={{
          height: 22,
          fontWeight: 700,
          bgcolor: 'rgba(21,34,56,0.06)',
        }}
      />
    </Stack>
  );
}

function EventCard({ event, dateStr, onOpen }) {
  const style = eventStyle(event);
  const isBooking = event.kind === 'booking';
  const isVehicle = event.kind === 'vehicle';
  const guests = isBooking ? guestsLabel(event.adults, event.children) : null;
  const rangeLabel = isVehicle
    ? dateStr === event.date
      ? ' · Start day'
      : dateStr === event.endDate
        ? ' · End day'
        : ' · On trip'
    : dateStr === event.date
      ? ' · Start day'
      : dateStr === event.endDate
        ? ' · Return day'
        : ' · On tour';

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2.5,
        bgcolor: style.bg,
        border: '1px solid transparent',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(21,34,56,0.08)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} fontSize={14.5} color={style.color} noWrap>
            {event.title}
          </Typography>
          {isVehicle && (
            <Box sx={{ mt: 0.4 }}>
              <OwnershipTag type={event.vehicleOwnership} />
            </Box>
          )}
          <Typography variant="body2" color={style.color} sx={{ opacity: 0.85, mt: 0.25 }} noWrap>
            {event.subtitle}
          </Typography>
        </Box>
        <StatusBadge status={event.status} />
      </Stack>

      <Stack spacing={0.6} mt={1.25} sx={{ color: style.color }}>
        {(isBooking || isVehicle) && (
          <Typography variant="caption" fontWeight={600} display="flex" alignItems="center" gap={0.75}>
            <PlaceOutlinedIcon sx={{ fontSize: 15 }} />
            {formatRange(event.date, event.endDate)}
            {rangeLabel}
          </Typography>
        )}
        {event.kind === 'follow_up' && (
          <Typography variant="caption" fontWeight={600}>
            {event.time || 'All day'}
            {event.followUpType ? ` · ${String(event.followUpType).replace(/_/g, ' ')}` : ''}
          </Typography>
        )}
        {(event.assigneeName || event.driverName) && (
          <Box>
            <Typography variant="caption" display="flex" alignItems="center" gap={0.75}>
              <PersonOutlinedIcon sx={{ fontSize: 15 }} />
              {event.driverName ? `Driver: ${event.driverName}` : `Assigned to ${event.assigneeName}`}
            </Typography>
            {event.driverName ? (
              <Box sx={{ mt: 0.35, ml: 2.75 }}>
                <OwnershipTag type={event.driverType} />
              </Box>
            ) : null}
          </Box>
        )}
        {isVehicle && (event.pickupLocation || event.dropLocation) && (
          <Typography variant="caption">
            {formatRouteLabel(event.pickupLocation, event.dropLocation)}
          </Typography>
        )}
        {guests && (
          <Typography variant="caption">{guests}</Typography>
        )}
        {event.notes && (
          <Typography
            variant="caption"
            display="flex"
            alignItems="flex-start"
            gap={0.75}
            sx={{ opacity: 0.9 }}
          >
            <NotesOutlinedIcon sx={{ fontSize: 15, mt: '1px' }} />
            {event.notes}
          </Typography>
        )}
      </Stack>

      {onOpen && (
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          onClick={onOpen}
          sx={{
            mt: 1.25,
            px: 0,
            minWidth: 0,
            color: style.color,
            fontWeight: 700,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {isBooking ? 'Open booking' : event.enquiryId ? 'Open enquiry' : 'Open follow-up'}
        </Button>
      )}
    </Box>
  );
}

export default function CalendarDayDialog({ open, date, events = [], onClose }) {
  const navigate = useNavigate();
  const day = date ? dayjs(date) : null;

  const bookings = useMemo(() => events.filter((e) => e.kind === 'booking'), [events]);
  const vehicles = useMemo(() => events.filter((e) => e.kind === 'vehicle'), [events]);
  const followUps = useMemo(() => events.filter((e) => e.kind === 'follow_up'), [events]);
  const dateStr = day?.format('YYYY-MM-DD');

  const openEvent = (event) => {
    if (event.kind === 'booking' && event.bookingId) {
      navigate(`/bookings/edit/${event.bookingId}`);
      return;
    }
    if (event.enquiryId) {
      navigate(`/enquiry/view/${event.enquiryId}`);
      return;
    }
    navigate('/follow-ups');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
              {day ? day.format('D MMMM YYYY') : 'Day details'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {day ? day.format('dddd') : ''}
              {events.length
                ? ` · ${events.length} item${events.length === 1 ? '' : 's'}`
                : ' · Nothing scheduled'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close" sx={{ mt: -0.5, mr: -1 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3, pt: 1 }}>
        {!events.length ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
              py: 6,
              borderRadius: 3,
              bgcolor: 'rgba(21,34,56,0.03)',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <EventBusyOutlinedIcon sx={{ fontSize: 42, color: 'text.disabled' }} />
            <Typography fontWeight={700}>Nothing scheduled</Typography>
            <Typography variant="body2" color="text.secondary">
              No bookings, trip vehicles, or follow-ups on this date.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {bookings.length > 0 && (
              <Box>
                <SectionHeader
                  icon={<FlightTakeoffOutlinedIcon fontSize="small" />}
                  label="Bookings allotted"
                  count={bookings.length}
                  color="#174ea6"
                />
                <Stack spacing={1.25}>
                  {bookings.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      dateStr={dateStr}
                      onOpen={() => openEvent(event)}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {bookings.length > 0 && vehicles.length > 0 && <Divider />}

            {vehicles.length > 0 && (
              <Box>
                <SectionHeader
                  icon={<DirectionsCarFilledOutlinedIcon fontSize="small" />}
                  label="Trip vehicles"
                  count={vehicles.length}
                  color="#b06000"
                />
                <Stack spacing={1.25}>
                  {vehicles.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      dateStr={dateStr}
                      onOpen={() => openEvent(event)}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {(bookings.length > 0 || vehicles.length > 0) && followUps.length > 0 && <Divider />}

            {followUps.length > 0 && (
              <Box>
                <SectionHeader
                  icon={<PhoneCallbackOutlinedIcon fontSize="small" />}
                  label="Follow-ups"
                  count={followUps.length}
                  color="#6b21a8"
                />
                <Stack spacing={1.25}>
                  {followUps.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      dateStr={dateStr}
                      onOpen={() => openEvent(event)}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
