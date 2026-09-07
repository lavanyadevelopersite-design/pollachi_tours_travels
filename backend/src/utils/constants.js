const MODULES = [
  'users',
  'roles',
  'permissions',
  'branches',
  'destinations',
  'packages',
  'hotels',
  'vehicles',
  'suppliers',
  'lead_statuses',
  'lead_source_types',
  'agents',
  'corporates',
  'package_terms',
  'inclusion_exclusions',
  'currencies',
  'countries',
  'states',
  'cities',
  'payment_modes',
  'taxes',
  'season_pricing',
  'expenses_types',
  'departments',
  'designations',
  'drivers',
  'guides',
  'leads',
  'enquiries',
  'follow_ups',
  'quotations',
  'bookings',
  'invoices',
  'receipts',
  'expenses',
  'refunds',
  'feedback',
  'itineraries',
  'reports',
  'notifications',
  'audit_logs',
  'login_history',
  'calendar',
  'settings',
  'dashboard',
  'driver_trips',
];

const ACTIONS = ['create', 'edit', 'delete', 'approve', 'export', 'print', 'view'];

const DRIVER_TRIP_STATUSES = [
  { value: 'on_the_way', label: 'On the way to customer place', order: 1 },
  { value: 'customer_place_reached', label: 'Customer place reached', order: 2 },
  { value: 'trip_ongoing', label: 'Trip ongoing', order: 3, requiresStartingKm: true },
  { value: 'trip_closed', label: 'Trip closed', order: 4, requiresClosingKm: true },
];

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const ENQUIRY_STATUSES = ['open', 'in_progress', 'quoted', 'booked', 'closed', 'cancelled'];
const ENQUIRY_TYPES = ['client', 'agent', 'corporate'];
const SERVICE_REQUIRED_OPTIONS = [
  'Transport',
  'Hotel',
  'Full Package',
  'Transport + Hotel',
  'Transport + Sightseeing',
  'Hotel + Sightseeing',
  'Flight Booking',
  'Bus Booking',
  'Train Booking',
  'Visa Assistance',
  'Custom Package',
];
const VACATION_TYPE_OPTIONS = [
  'Family Tour',
  'Honeymoon Trip',
  'Friends Trip',
  'Corporate Trip',
  'Adventure Tour',
  'Pilgrimage Tour',
  'Weekend Getaway',
  'Solo Trip',
  'Group Tour',
  'International Tour',
  'Domestic Tour',
];
const FOLLOW_UP_STATUSES = ['pending', 'completed', 'missed', 'cancelled'];
const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
const BOOKING_STATUSES = ['confirmed', 'pending', 'cancelled', 'completed', 'on_hold'];
const INVOICE_STATUSES = ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'];
const REFUND_STATUSES = ['pending', 'approved', 'processed', 'rejected'];
const EXPENSE_STATUSES = ['pending', 'approved', 'rejected', 'paid'];
const NOTIFICATION_TYPES = ['info', 'warning', 'success', 'error', 'reminder'];

module.exports = {
  MODULES,
  ACTIONS,
  DRIVER_TRIP_STATUSES,
  LEAD_STATUSES,
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  SERVICE_REQUIRED_OPTIONS,
  VACATION_TYPE_OPTIONS,
  FOLLOW_UP_STATUSES,
  QUOTATION_STATUSES,
  BOOKING_STATUSES,
  INVOICE_STATUSES,
  REFUND_STATUSES,
  EXPENSE_STATUSES,
  NOTIFICATION_TYPES,
};
