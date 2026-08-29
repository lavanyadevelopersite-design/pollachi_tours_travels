import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { useCalendarEvents } from '../../hooks/queries/useCalendar';
import CalendarDayDialog from './CalendarDayDialog';
import {
  TODAY_BLUE,
  WEEKDAYS,
  buildMonthGrid,
  eventStyle,
  eventsForDate,
  isOpenCalendarEvent,
  pillTimeLabel,
} from './calendarUtils';
import OwnershipTag from '../../components/common/OwnershipTag';

const MAX_PILLS = 3;

function EventPill({ event, dateStr }) {
  const style = eventStyle(event);
  return (
    <Box
      title={`${event.title}${event.subtitle ? ` · ${event.subtitle}` : ''}`}
      sx={{
        px: 0.9,
        py: 0.35,
        borderRadius: 1.25,
        bgcolor: style.bg,
        color: style.color,
        lineHeight: 1.2,
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': { filter: 'brightness(0.97)' },
      }}
    >
      <Typography
        component="div"
        sx={{
          fontSize: 11.5,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {event.title}
      </Typography>
      {event.kind === 'vehicle' && (
        <Box sx={{ mt: 0.25 }}>
          <OwnershipTag type={event.vehicleOwnership} sx={{ height: 16, fontSize: 9, px: 0.7 }} />
        </Box>
      )}
      <Typography
        component="div"
        sx={{
          fontSize: 10,
          fontWeight: 600,
          opacity: 0.82,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {pillTimeLabel(event, dateStr)}
      </Typography>
    </Box>
  );
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [kindFilter, setKindFilter] = useState('all');
  const [monthAnchor, setMonthAnchor] = useState(null);

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const from = cursor.startOf('month').format('YYYY-MM-DD');
  const to = cursor.endOf('month').format('YYYY-MM-DD');
  const { data: events = [], isLoading, isError, refetch } = useCalendarEvents(from, to);

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        if (!isOpenCalendarEvent(event)) return false;
        if (kindFilter !== 'all' && event.kind !== kindFilter) return false;
        return true;
      }),
    [events, kindFilter]
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    days.forEach((day) => {
      const key = day.format('YYYY-MM-DD');
      map[key] = eventsForDate(key, visibleEvents);
    });
    return map;
  }, [days, visibleEvents]);

  const selectedKey = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;
  const selectedEvents = selectedKey ? eventsForDate(selectedKey, visibleEvents) : [];

  const monthBookings = visibleEvents.filter((e) => e.kind === 'booking').length;
  const monthVehicles = visibleEvents.filter((e) => e.kind === 'vehicle').length;
  const monthFollowUps = visibleEvents.filter((e) => e.kind === 'follow_up').length;
  const weeks = Math.ceil(days.length / 7);
  const today = dayjs();

  const openDay = (day) => {
    if (day.month() !== cursor.month()) {
      setCursor(day.startOf('month'));
      return;
    }
    setSelectedDate(day.format('YYYY-MM-DD'));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 640, md: 'calc(100vh - 148px)' },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(21,34,56,0.06)',
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, md: 2.5 },
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            sx={{ width: '100%' }}
          >
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setCursor(dayjs().startOf('month'))}
                sx={{
                  height: 36,
                  px: 1.75,
                  borderColor: '#dadce0',
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                Today
              </Button>
              <Tooltip title="Previous month">
                <IconButton
                  size="small"
                  onClick={() => setCursor((d) => d.subtract(1, 'month').startOf('month'))}
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Next month">
                <IconButton
                  size="small"
                  onClick={() => setCursor((d) => d.add(1, 'month').startOf('month'))}
                  aria-label="Next month"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
              <Button
                color="inherit"
                onClick={(e) => setMonthAnchor(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: { xs: 20, md: 22 },
                  color: 'text.primary',
                  px: 1,
                  minWidth: 0,
                }}
              >
                {cursor.format('MMMM YYYY')}
              </Button>
              <Popover
                open={Boolean(monthAnchor)}
                anchorEl={monthAnchor}
                onClose={() => setMonthAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <DateCalendar
                  value={cursor}
                  views={['year', 'month']}
                  openTo="month"
                  onChange={(value) => {
                    if (value) setCursor(value.startOf('month'));
                    setMonthAnchor(null);
                  }}
                />
              </Popover>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="nowrap"
              useFlexGap
              sx={{ ml: 'auto' }}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={kindFilter}
                onChange={(_e, value) => value && setKindFilter(value)}
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    px: 1.5,
                    height: 36,
                    fontWeight: 600,
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="vehicle">Vehicles</ToggleButton>
                <ToggleButton value="follow_up">Follow-ups</ToggleButton>
              </ToggleButtonGroup>
              <Chip
                size="small"
                label="Month"
                sx={{ height: 36, borderRadius: 2, fontWeight: 700, px: 0.5 }}
              />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} mt={1.25} flexWrap="wrap" useFlexGap alignItems="center">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#d2e3fc' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Bookings
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#fde0c3' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Trip vehicles
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#e8d5f9' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Follow-ups
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {monthBookings} booking{monthBookings === 1 ? '' : 's'} · {monthVehicles} vehicle
              {monthVehicles === 1 ? '' : 's'} · {monthFollowUps} follow-up
              {monthFollowUps === 1 ? '' : 's'} in view
            </Typography>
          </Stack>
        </Box>

        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
            sx={{ borderRadius: 0 }}
          >
            Could not load calendar events.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fff',
          }}
        >
          {WEEKDAYS.map((day) => (
            <Typography
              key={day}
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              letterSpacing={0.6}
              sx={{ px: 1.5, py: 1, textAlign: 'left' }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{ position: 'relative', flex: 1, minHeight: weeks * 96 }}>
          {isLoading && (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(255,255,255,0.65)',
                zIndex: 2,
              }}
            >
              <CircularProgress size={32} />
            </Stack>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: `repeat(${weeks}, minmax(96px, 1fr))`,
              height: '100%',
            }}
          >
            {days.map((day) => {
              const key = day.format('YYYY-MM-DD');
              const inMonth = day.month() === cursor.month();
              const isToday = day.isSame(today, 'day');
              const isSelected = selectedKey === key;
              const dayEvents = inMonth ? eventsByDate[key] || [] : [];
              const extra = Math.max(0, dayEvents.length - MAX_PILLS);
              const shown = dayEvents.slice(0, MAX_PILLS);

              return (
                <Box
                  key={key}
                  onClick={() => openDay(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openDay(day);
                    }
                  }}
                  sx={{
                    minHeight: { xs: 96, md: 0 },
                    borderRight: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: '#e8eaed',
                    p: 0.75,
                    cursor: 'pointer',
                    bgcolor: isSelected
                      ? 'rgba(26,115,232,0.08)'
                      : isToday
                        ? 'rgba(26,115,232,0.04)'
                        : '#fff',
                    transition: 'background-color 0.12s ease',
                    '&:hover': {
                      bgcolor: isSelected || isToday ? 'rgba(26,115,232,0.1)' : '#f8fafc',
                    },
                    '&:nth-of-type(7n)': { borderRight: 'none' },
                    outline: 'none',
                    '&:focus-visible': {
                      boxShadow: 'inset 0 0 0 2px rgba(26,115,232,0.45)',
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="flex-end" mb={0.5}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isToday ? TODAY_BLUE : 'transparent',
                        color: isToday ? '#fff' : inMonth ? 'text.primary' : 'text.disabled',
                        fontWeight: isToday ? 700 : 500,
                        fontSize: 13,
                      }}
                    >
                      {day.date()}
                    </Box>
                  </Stack>

                  <Stack spacing={0.45}>
                    {shown.map((event) => (
                      <EventPill key={`${event.kind}-${event.id}`} event={event} dateStr={key} />
                    ))}
                    {extra > 0 && (
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ pl: 0.5, '&:hover': { color: TODAY_BLUE } }}
                      >
                        +{extra} more
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {!isLoading && !visibleEvents.length && !isError && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5, px: 0.5 }}>
          <EventAvailableOutlinedIcon fontSize="small" color="disabled" />
          <Typography variant="body2" color="text.secondary">
            No bookings, trip vehicles, or follow-ups in {cursor.format('MMMM YYYY')}. Click a date
            to confirm.
          </Typography>
        </Stack>
      )}

      <CalendarDayDialog
        open={Boolean(selectedDate)}
        date={selectedDate}
        events={selectedEvents}
        onClose={() => setSelectedDate(null)}
      />
    </Box>
  );
}
