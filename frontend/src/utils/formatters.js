import dayjs from 'dayjs';

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN').format(Number(value));
};

export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '—';
  return dayjs(date).format(format);
};

/** Inclusive days / nights from travel dates, e.g. 2Days-1Night */
export const formatTripDuration = (fromDate, toDate) => {
  if (!fromDate || !toDate) return '';
  const start = dayjs(fromDate).startOf('day');
  const end = dayjs(toDate).startOf('day');
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return '';
  const days = end.diff(start, 'day') + 1;
  const nights = Math.max(days - 1, 0);
  const dayLabel = days === 1 ? 'Day' : 'Days';
  const nightLabel = nights === 1 ? 'Night' : 'Nights';
  return `${days}${dayLabel}-${nights}${nightLabel}`;
};

/** First city from a Google Places-style address (text before the first comma). */
export const mainCityName = (place) => {
  if (place == null) return '';
  const text = String(place).trim();
  if (!text || text === '—' || text === '-') return '';
  return text.split(',')[0].trim();
};

/** Route as "Pollachi - Erode" from full place names or an existing "A → B" string. */
export const formatRouteLabel = (from, to, empty = '—') => {
  const fromText = from == null ? '' : String(from).trim();
  const toText = to == null ? '' : String(to).trim();

  if (!toText && /→|->/.test(fromText)) {
    const [left, ...rest] = fromText.split(/\s*(?:→|->)\s*/);
    return formatRouteLabel(left, rest.join(' → '), empty);
  }

  const fromCity = mainCityName(fromText);
  const toCity = mainCityName(toText);
  if (fromCity && toCity) {
    if (fromCity.toLowerCase() === toCity.toLowerCase()) return fromCity;
    return `${fromCity} - ${toCity}`;
  }
  return fromCity || toCity || empty;
};

export const formatDateTime = (date) => formatDate(date, 'DD MMM YYYY, hh:mm A');

export const formatRelative = (date) => {
  if (!date) return '—';
  const d = dayjs(date);
  const now = dayjs();
  const diffMin = now.diff(d, 'minute');
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = now.diff(d, 'hour');
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = now.diff(d, 'day');
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
};

export const formatPhone = (phone) => {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
};

export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}…` : str;
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
};
