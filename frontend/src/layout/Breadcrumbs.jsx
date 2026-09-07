import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const LABEL_MAP = {
  dashboard: 'Dashboard',
  users: 'Users',
  roles: 'Roles',
  leads: 'Leads',
  enquiries: 'Enquiries',
  'follow-ups': 'Follow-ups',
  itineraries: 'Itineraries',
  quotations: 'Quotations',
  bookings: 'Bookings',
  invoices: 'Invoices',
  receipts: 'Receipts',
  expenses: 'Expenses',
  refunds: 'Refunds',
  feedback: 'Feedback',
  calendar: 'Calendar',
  'whatsapp-templates': 'WhatsApp Templates',
  reports: 'Reports',
  'profit-loss': 'Profit and Loss',
  customers: 'Customers',
  attendance: 'User Attendance',
  settings: 'Settings',
  notifications: 'Notifications',
  'audit-logs': 'Audit Logs',
  masters: 'Masters',
  branches: 'Branches',
  destinations: 'Destinations',
  packages: 'Packages',
  hotels: 'Hotels',
  vehicles: 'Vehicles',
  suppliers: 'Vendor',
  departments: 'Departments',
  designations: 'Designation',
  create: 'Add',
  new: 'Add',
  edit: 'Edit',
  generate: 'Generate',
};

export default function Breadcrumbs() {
  const location = useLocation();

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts
      .map((part, index) => {
        if (/^\d+$/.test(part) && parts[index - 1] === 'edit') return null;
        return {
          label: LABEL_MAP[part] || part.replace(/-/g, ' '),
          to: `/${parts.slice(0, index + 1).join('/')}`,
        };
      })
      .filter(Boolean)
      .map((crumb, index, list) => ({
        ...crumb,
        isLast: index === list.length - 1,
      }));
  }, [location.pathname]);

  if (!crumbs.length) return null;

  if (location.pathname === '/dashboard') return null;
  if (location.pathname.includes('/view/')) return null;

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}
    >
      <Link
        component={RouterLink}
        to="/dashboard"
        underline="hover"
        color="text.secondary"
        variant="body2"
      >
        Home
      </Link>
      {crumbs.map((crumb) =>
        crumb.isLast ? (
          <Typography
            key={crumb.to}
            color="text.primary"
            variant="body2"
            fontWeight={500}
            textTransform="capitalize"
          >
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.to}
            component={RouterLink}
            to={crumb.to}
            underline="hover"
            color="text.secondary"
            variant="body2"
            textTransform="capitalize"
          >
            {crumb.label}
          </Link>
        )
      )}
    </MuiBreadcrumbs>
  );
}
