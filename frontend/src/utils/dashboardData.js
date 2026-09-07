import { publicAssetUrl, resolveMediaUrl } from './constants';

const PIPELINE_GROUPS = [
  { title: 'New', color: '#0ea5e9', match: (name) => /^new(\s|$)/i.test(name) || /^new enquiry/i.test(name) },
  { title: 'Proposal Sent', color: '#f59e0b', match: (name) => /proposal\s*(sent|send)/i.test(name) },
  { title: 'Follow Up', color: '#f97316', match: (name) => /follow/i.test(name) },
  { title: 'Confirmed', color: '#14b8a6', match: (name) => /confirmed/i.test(name) && !/proposal/i.test(name) },
];

export function buildEnquiryDashboardCards(pipeline = {}, todayIso) {
  const statuses = Array.isArray(pipeline.statuses) ? pipeline.statuses : [];
  const grouped = PIPELINE_GROUPS.map((group) => {
    const matches = statuses.filter((status) => group.match(String(status.name || '')));
    return {
      key: group.title,
      title: group.title,
      count: matches.reduce((sum, status) => sum + Number(status.count || 0), 0),
      statusId: matches.length === 1 ? matches[0].id : '',
      badge: group.title,
      color: group.color,
    };
  });

  const today = todayIso || new Date().toISOString().slice(0, 10);

  return [
    {
      key: 'today',
      title: "Today's Queries",
      count: Number(pipeline.todayQueries || 0),
      viewAllTo: `/enquiry?from=${today}&to=${today}`,
      actionTo: '/enquiry/create',
      actionLabel: 'Add New',
      color: '#22c55e',
    },
    {
      key: 'total',
      title: 'Total Queries',
      count: Number(pipeline.totalQueries || 0),
      viewAllTo: '/enquiry',
      color: '#64748b',
    },
    ...grouped.map((card) => ({
      ...card,
      viewAllTo: card.statusId ? `/enquiry?lead_status_id=${card.statusId}` : '/enquiry',
    })),
  ];
}

export const dashboardGlassCardSx = {
  bgcolor: 'rgba(255, 255, 255, 0.52)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 4px 24px rgba(21, 34, 56, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.65)',
};

export const dashboardGlassCardLightSx = {
  bgcolor: 'rgba(255, 255, 255, 0.22)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  boxShadow: 'none',
  border: '1px solid rgba(255, 255, 255, 0.4)',
};

export const DEMO_DASHBOARD_STATS = {
  bookings: 1248,
  customers: 842,
  revenue: 2845600,
  upcomingTours: 18,
  bookingsTrend: 18.5,
  customersTrend: 12.3,
  revenueTrend: 22.7,
  toursTrend: 5.8,
};

export const DEMO_BOOKING_OVERVIEW = [
  { day: '1 May', bookings: 28, revenue: 820000 },
  { day: '5 May', bookings: 35, revenue: 950000 },
  { day: '10 May', bookings: 42, revenue: 1100000 },
  { day: '15 May', bookings: 38, revenue: 1050000 },
  { day: '20 May', bookings: 52, revenue: 1400000 },
  { day: '25 May', bookings: 48, revenue: 1280000 },
  { day: '31 May', bookings: 55, revenue: 1550000 },
];

export const DEMO_BOOKING_STATUS = [
  { name: 'Confirmed', value: 45 },
  { name: 'Pending', value: 25 },
  { name: 'Cancelled', value: 15 },
  { name: 'Completed', value: 15 },
];

export const DEMO_DESTINATIONS = [
  {
    name: 'Goa',
    bookings: 342,
    image: 'dashboard/goa.svg',
  },
  {
    name: 'Manali',
    bookings: 278,
    image: 'dashboard/manali.svg',
  },
  {
    name: 'Kerala',
    bookings: 215,
    image: 'dashboard/kerala.svg',
  },
  {
    name: 'Thailand',
    bookings: 189,
    image: 'dashboard/thailand.svg',
  },
];

export const BEACH_DECORATION_IMAGE = 'dashboard/beach-decoration.svg';

export const DASHBOARD_SIDE_BACKGROUND = 'dashboard/dashboard-side-background.svg';

const DEFAULT_DESTINATION_IMAGE = 'dashboard/goa.svg';

function getFallbackDestinationImage(name) {
  const key = String(name || '').toLowerCase();
  const match = DEMO_DESTINATIONS.find(
    (dest) => key.includes(dest.name.toLowerCase()) || dest.name.toLowerCase().includes(key)
  );
  return match?.image || DEFAULT_DESTINATION_IMAGE;
}

export function resolveDestinationImage(item) {
  const raw =
    item?.image ||
    item?.thumbnail ||
    item?.photo ||
    item?.destination?.image ||
    item?.package?.image;

  if (!raw) {
    return publicAssetUrl(getFallbackDestinationImage(item?.name));
  }

  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }

  if (raw.startsWith('/uploads') || raw.startsWith('uploads/')) {
    return resolveMediaUrl(raw);
  }

  return publicAssetUrl(raw);
}

export function normalizeTopDestinations(data) {
  const series = extractChartSeries(data);
  if (!series?.length) {
    return DEMO_DESTINATIONS.map((dest) => ({
      ...dest,
      image: publicAssetUrl(dest.image),
    }));
  }

  return series.map((item) => ({
    name: item.name || item.destination || item.label || 'Destination',
    bookings: Number(item.bookings ?? item.value ?? item.count ?? 0),
    image: resolveDestinationImage(item),
  }));
}

export function mergeDashboardStats(api) {
  if (!api || typeof api !== 'object') return { ...DEMO_DASHBOARD_STATS };

  const pick = (apiVal, demoVal) => {
    if (apiVal === undefined || apiVal === null || apiVal === '') return demoVal;
    if (typeof apiVal === 'number' && apiVal === 0 && demoVal > 0) return demoVal;
    return apiVal;
  };

  return {
    bookings: pick(api.bookings ?? api.total_bookings ?? api.totalBookings, DEMO_DASHBOARD_STATS.bookings),
    customers: pick(api.customers ?? api.total_customers ?? api.totalCustomers, DEMO_DASHBOARD_STATS.customers),
    revenue: pick(api.revenue ?? api.total_revenue ?? api.totalRevenue, DEMO_DASHBOARD_STATS.revenue),
    upcomingTours: pick(api.upcomingTours ?? api.upcoming_tours, DEMO_DASHBOARD_STATS.upcomingTours),
    bookingsTrend: pick(api.bookingsTrend ?? api.bookings_trend, DEMO_DASHBOARD_STATS.bookingsTrend),
    customersTrend: pick(api.customersTrend ?? api.customers_trend, DEMO_DASHBOARD_STATS.customersTrend),
    revenueTrend: pick(api.revenueTrend ?? api.revenue_trend, DEMO_DASHBOARD_STATS.revenueTrend),
    toursTrend: pick(api.toursTrend ?? api.tours_trend, DEMO_DASHBOARD_STATS.toursTrend),
  };
}

export function extractChartSeries(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.series)) return data.series;
  }
  return null;
}

export function normalizeBookingStatus(data) {
  const series = extractChartSeries(data);
  if (!series?.length) return [];

  const mapped = series
    .map((item) => ({
      name: capitalize(item.name || item.status || item.label || 'Unknown'),
      raw: Number(item.value ?? item.count ?? item.total ?? 0),
      color: item.color || item.button_color || null,
    }))
    .filter((item) => Number.isFinite(item.raw) && item.raw > 0);

  if (!mapped.length) return [];

  const total = mapped.reduce((sum, item) => sum + item.raw, 0);
  if (total <= 0) return [];

  const items = mapped.map((item) => ({
    name: item.name,
    count: item.raw,
    color: item.color,
    value: Math.max(1, Math.round((item.raw / total) * 100)),
  }));

  const percentTotal = items.reduce((sum, item) => sum + item.value, 0);
  if (percentTotal !== 100 && items.length) {
    items[items.length - 1].value += 100 - percentTotal;
  }

  return items;
}

export function getBookingStatusTotal(data, fallback = DEMO_DASHBOARD_STATS.bookings) {
  const series = extractChartSeries(data);
  if (!series?.length) return fallback;

  const total = series.reduce(
    (sum, item) => sum + Number(item.value ?? item.count ?? item.total ?? 0),
    0
  );

  return total > 0 ? total : fallback;
}

function withDemoCounts(items) {
  const total = DEMO_DASHBOARD_STATS.bookings;
  return items.map((item) => ({
    ...item,
    count: Math.round((item.value / 100) * total),
  }));
}

export function normalizeChartData(data, fallback) {
  if (!Array.isArray(data) || !data.length) return fallback;
  const normalized = data.map((item) => ({
    day: item.day || item.month || item.label || item.date,
    bookings: Number(item.bookings ?? item.count ?? 0),
    revenue: Number(item.revenue ?? item.amount ?? 0),
  }));
  if (normalized.every((item) => item.bookings === 0 && item.revenue === 0)) return fallback;
  return normalized;
}

function capitalize(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1).replace(/_/g, ' ');
}
