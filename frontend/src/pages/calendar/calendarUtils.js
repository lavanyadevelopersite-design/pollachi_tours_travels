import dayjs from 'dayjs';

export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const BOOKING_PALETTE = [
  { bg: '#ceead6', color: '#137333' },
  { bg: '#d2e3fc', color: '#174ea6' },
  { bg: '#fde0c3', color: '#b06000' },
  { bg: '#cbf0f8', color: '#007b83' },
];

export const FOLLOW_UP_STYLE = { bg: '#e8d5f9', color: '#6b21a8' };
export const VEHICLE_STYLE = { bg: '#fde0c3', color: '#b06000' };

export const TODAY_BLUE = '#1a73e8';

const KIND_ORDER = { booking: 0, vehicle: 1, follow_up: 2 };

export function dateOnly(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function buildMonthGrid(monthDate) {
  const monthStart = monthDate.startOf('month');
  const start = monthStart.subtract(monthStart.day(), 'day');
  const monthEnd = monthDate.endOf('month');
  const end = monthEnd.add(6 - monthEnd.day(), 'day');
  const days = [];
  let cursor = start;
  while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return days;
}

export function bookingColor(id) {
  const key = String(id || '');
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return BOOKING_PALETTE[hash % BOOKING_PALETTE.length];
}

export function eventStyle(event) {
  if (event?.kind === 'follow_up') return FOLLOW_UP_STYLE;
  if (event?.kind === 'vehicle') return VEHICLE_STYLE;
  return bookingColor(event?.id || event?.bookingId);
}

export function eventsForDate(dateStr, events = []) {
  return events
    .filter((event) => {
      if (event.kind === 'booking' || event.kind === 'vehicle') {
        const start = dateOnly(event.date);
        const end = dateOnly(event.endDate || event.date);
        return start && dateStr >= start && dateStr <= end;
      }
      return dateOnly(event.date) === dateStr;
    })
    .sort((a, b) => {
      const kindCmp = (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9);
      if (kindCmp !== 0) return kindCmp;
      return String(a.time || '').localeCompare(String(b.time || ''));
    });
}

export function formatRange(start, end) {
  if (!start) return '—';
  const from = dayjs(start);
  const to = end ? dayjs(end) : from;
  if (!from.isValid()) return '—';
  if (!end || from.isSame(to, 'day')) return from.format('DD MMM YYYY');
  if (from.year() === to.year() && from.month() === to.month()) {
    return `${from.format('DD')} – ${to.format('DD MMM YYYY')}`;
  }
  if (from.year() === to.year()) {
    return `${from.format('DD MMM')} – ${to.format('DD MMM YYYY')}`;
  }
  return `${from.format('DD MMM YYYY')} – ${to.format('DD MMM YYYY')}`;
}

export function guestsLabel(adults, children) {
  const parts = [];
  if (adults) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (children) parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  return parts.join(' · ') || null;
}

export function pillTimeLabel(event, dateStr) {
  if (event.kind === 'follow_up') return event.time || 'All day';
  if (event.date && event.endDate && event.date !== event.endDate) {
    if (dateStr === event.date) return 'Starts';
    if (dateStr === event.endDate) return 'Ends';
    return event.kind === 'vehicle' ? 'On trip' : 'On tour';
  }
  return event.kind === 'vehicle' ? 'Vehicle' : 'All day';
}

const CLOSED_STATUSES = new Set(['completed', 'cancelled', 'trip_closed']);

function normalizeLeadStatus(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isClosedLeadStatus(label) {
  const name = normalizeLeadStatus(label);
  if (!name) return false;
  return name.includes('completed') || name === 'feedback';
}

export function isOpenCalendarEvent(event) {
  if (event?.kind !== 'vehicle' && event?.kind !== 'booking') return true;
  if (isClosedLeadStatus(event.leadStatus)) return false;
  if (CLOSED_STATUSES.has(String(event.status || '').toLowerCase())) return false;
  return true;
}
