export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Pollachi Tours and Travels';
export const GOOGLE_REVIEW_URL =
  import.meta.env.VITE_GOOGLE_REVIEW_URL || 'https://g.page/r/CSvzO4Aq3ZZ9EAE/review';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

export const publicAssetUrl = (path = '') => {
  const normalized = String(path).replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${normalized}`;
};

export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};
export const SESSION_TIMEOUT_MINUTES = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 30;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tt_access_token',
  REFRESH_TOKEN: 'tt_refresh_token',
  USER: 'tt_user',
  REMEMBER_ME: 'tt_remember_me',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  PER_PAGE_OPTIONS: [10, 25, 50, 100],
};

export const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'converted', label: 'Converted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ENQUIRY_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export const ENQUIRY_TYPES = [
  { value: 'client', label: 'Client' },
  { value: 'agent', label: 'Agent' },
  { value: 'corporate', label: 'Corporate' },
];

export const FOLLOW_UP_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const FOLLOW_UP_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'email', label: 'Email' },
  { value: 'visit', label: 'Visit' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'task', label: 'Task' },
  { value: 'other', label: 'Other' },
];

export const QUOTATION_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export const INVOICE_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partial', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export const EXPENSE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
];

export const PAYMENT_STATUSES = [{ value: 'received', label: 'Received' }];

export const PAYMENT_TYPES = [
  { value: 'advance', label: 'Advance' },
  { value: 'remaining', label: 'Remaining' },
];

export const ITINERARY_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'planned', label: 'Planned' },
  { value: 'generated', label: 'Generated' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'confirmed', label: 'Confirmed' },
];

export const REFUND_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processed', label: 'Processed' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export const RATING_FILTERS = [
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

export const AUDIT_ACTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'edit', label: 'Edit' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'view', label: 'View' },
  { value: 'login', label: 'Login' },
  { value: 'export', label: 'Export' },
  { value: 'approve', label: 'Approve' },
];

export const AUDIT_MODULES = [
  'enquiries',
  'quotations',
  'bookings',
  'invoices',
  'receipts',
  'expenses',
  'leads',
  'follow_ups',
  'users',
  'roles',
  'vehicles',
  'drivers',
  'itineraries',
  'feedback',
].map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const STATUS_COLORS = {
  new: 'info',
  contacted: 'primary',
  qualified: 'secondary',
  proposal: 'warning',
  won: 'success',
  lost: 'error',
  pending: 'warning',
  confirmed: 'success',
  proposed: 'warning',
  generated: 'info',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'error',
  open: 'info',
  quoted: 'warning',
  converted: 'success',
  closed: 'default',
  missed: 'error',
  rescheduled: 'warning',
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'error',
  partial: 'warning',
  paid: 'success',
  overdue: 'error',
  approved: 'success',
  processed: 'info',
  received: 'success',
  on_hold: 'warning',
  active: 'success',
  inactive: 'default',
  deactive: 'error',
};

export const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];
