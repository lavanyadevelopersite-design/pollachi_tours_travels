export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',

  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',

  PERMISSIONS_VIEW: 'permissions.view',

  BRANCHES_VIEW: 'branches.view',
  BRANCHES_CREATE: 'branches.create',
  BRANCHES_EDIT: 'branches.edit',
  BRANCHES_DELETE: 'branches.delete',

  DESTINATIONS_VIEW: 'destinations.view',
  DESTINATIONS_CREATE: 'destinations.create',
  DESTINATIONS_EDIT: 'destinations.edit',
  DESTINATIONS_DELETE: 'destinations.delete',

  PACKAGES_VIEW: 'packages.view',
  PACKAGES_CREATE: 'packages.create',
  PACKAGES_EDIT: 'packages.edit',
  PACKAGES_DELETE: 'packages.delete',

  HOTELS_VIEW: 'hotels.view',
  HOTELS_CREATE: 'hotels.create',
  HOTELS_EDIT: 'hotels.edit',
  HOTELS_DELETE: 'hotels.delete',

  VEHICLES_VIEW: 'vehicles.view',
  VEHICLES_CREATE: 'vehicles.create',
  VEHICLES_EDIT: 'vehicles.edit',
  VEHICLES_DELETE: 'vehicles.delete',

  SUPPLIERS_VIEW: 'suppliers.view',
  SUPPLIERS_CREATE: 'suppliers.create',
  SUPPLIERS_EDIT: 'suppliers.edit',
  SUPPLIERS_DELETE: 'suppliers.delete',

  LEAD_STATUSES_VIEW: 'lead_statuses.view',
  LEAD_STATUSES_CREATE: 'lead_statuses.create',
  LEAD_STATUSES_EDIT: 'lead_statuses.edit',
  LEAD_STATUSES_DELETE: 'lead_statuses.delete',

  LEAD_SOURCE_TYPES_VIEW: 'lead_source_types.view',
  LEAD_SOURCE_TYPES_CREATE: 'lead_source_types.create',
  LEAD_SOURCE_TYPES_EDIT: 'lead_source_types.edit',
  LEAD_SOURCE_TYPES_DELETE: 'lead_source_types.delete',

  PACKAGE_TERMS_VIEW: 'package_terms.view',
  PACKAGE_TERMS_CREATE: 'package_terms.create',
  PACKAGE_TERMS_EDIT: 'package_terms.edit',
  PACKAGE_TERMS_DELETE: 'package_terms.delete',
  INCLUSION_EXCLUSIONS_VIEW: 'inclusion_exclusions.view',
  INCLUSION_EXCLUSIONS_CREATE: 'inclusion_exclusions.create',
  INCLUSION_EXCLUSIONS_EDIT: 'inclusion_exclusions.edit',
  INCLUSION_EXCLUSIONS_DELETE: 'inclusion_exclusions.delete',

  CURRENCIES_VIEW: 'currencies.view',
  CURRENCIES_CREATE: 'currencies.create',
  CURRENCIES_EDIT: 'currencies.edit',
  CURRENCIES_DELETE: 'currencies.delete',

  COUNTRIES_VIEW: 'countries.view',
  COUNTRIES_CREATE: 'countries.create',
  COUNTRIES_EDIT: 'countries.edit',
  COUNTRIES_DELETE: 'countries.delete',

  STATES_VIEW: 'states.view',
  STATES_CREATE: 'states.create',
  STATES_EDIT: 'states.edit',
  STATES_DELETE: 'states.delete',

  CITIES_VIEW: 'cities.view',
  CITIES_CREATE: 'cities.create',
  CITIES_EDIT: 'cities.edit',
  CITIES_DELETE: 'cities.delete',

  PAYMENT_MODES_VIEW: 'payment_modes.view',
  PAYMENT_MODES_CREATE: 'payment_modes.create',
  PAYMENT_MODES_EDIT: 'payment_modes.edit',
  PAYMENT_MODES_DELETE: 'payment_modes.delete',

  TAXES_VIEW: 'taxes.view',
  TAXES_CREATE: 'taxes.create',
  TAXES_EDIT: 'taxes.edit',
  TAXES_DELETE: 'taxes.delete',

  SEASON_PRICING_VIEW: 'season_pricing.view',
  SEASON_PRICING_CREATE: 'season_pricing.create',
  SEASON_PRICING_EDIT: 'season_pricing.edit',
  SEASON_PRICING_DELETE: 'season_pricing.delete',

  EXPENSES_TYPES_VIEW: 'expenses_types.view',
  EXPENSES_TYPES_CREATE: 'expenses_types.create',
  EXPENSES_TYPES_EDIT: 'expenses_types.edit',
  EXPENSES_TYPES_DELETE: 'expenses_types.delete',

  DEPARTMENTS_VIEW: 'departments.view',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_EDIT: 'departments.edit',
  DEPARTMENTS_DELETE: 'departments.delete',

  DESIGNATIONS_VIEW: 'designations.view',
  DESIGNATIONS_CREATE: 'designations.create',
  DESIGNATIONS_EDIT: 'designations.edit',
  DESIGNATIONS_DELETE: 'designations.delete',

  DRIVERS_VIEW: 'drivers.view',
  DRIVERS_CREATE: 'drivers.create',
  DRIVERS_EDIT: 'drivers.edit',
  DRIVERS_DELETE: 'drivers.delete',

  GUIDES_VIEW: 'guides.view',
  GUIDES_CREATE: 'guides.create',
  GUIDES_EDIT: 'guides.edit',
  GUIDES_DELETE: 'guides.delete',

  LEADS_VIEW: 'leads.view',
  LEADS_CREATE: 'leads.create',
  LEADS_EDIT: 'leads.edit',
  LEADS_DELETE: 'leads.delete',

  ENQUIRIES_VIEW: 'enquiries.view',
  ENQUIRIES_CREATE: 'enquiries.create',
  ENQUIRIES_EDIT: 'enquiries.edit',
  ENQUIRIES_DELETE: 'enquiries.delete',

  FOLLOW_UPS_VIEW: 'follow_ups.view',
  FOLLOW_UPS_CREATE: 'follow_ups.create',
  FOLLOW_UPS_EDIT: 'follow_ups.edit',
  FOLLOW_UPS_DELETE: 'follow_ups.delete',

  QUOTATIONS_VIEW: 'quotations.view',
  QUOTATIONS_CREATE: 'quotations.create',
  QUOTATIONS_EDIT: 'quotations.edit',
  QUOTATIONS_DELETE: 'quotations.delete',

  BOOKINGS_VIEW: 'bookings.view',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_EDIT: 'bookings.edit',
  BOOKINGS_DELETE: 'bookings.delete',

  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_DELETE: 'invoices.delete',

  RECEIPTS_VIEW: 'receipts.view',
  RECEIPTS_CREATE: 'receipts.create',
  RECEIPTS_EDIT: 'receipts.edit',
  RECEIPTS_DELETE: 'receipts.delete',

  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_EDIT: 'expenses.edit',
  EXPENSES_DELETE: 'expenses.delete',

  REFUNDS_VIEW: 'refunds.view',
  REFUNDS_CREATE: 'refunds.create',
  REFUNDS_EDIT: 'refunds.edit',
  REFUNDS_DELETE: 'refunds.delete',

  FEEDBACK_VIEW: 'feedback.view',
  FEEDBACK_CREATE: 'feedback.create',
  FEEDBACK_EDIT: 'feedback.edit',
  FEEDBACK_DELETE: 'feedback.delete',

  ITINERARIES_VIEW: 'itineraries.view',
  ITINERARIES_CREATE: 'itineraries.create',
  ITINERARIES_EDIT: 'itineraries.edit',
  ITINERARIES_DELETE: 'itineraries.delete',

  REPORTS_VIEW: 'reports.view',

  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_CREATE: 'notifications.create',
  NOTIFICATIONS_EDIT: 'notifications.edit',
  NOTIFICATIONS_DELETE: 'notifications.delete',

  AUDIT_LOGS_VIEW: 'audit_logs.view',

  LOGIN_HISTORY_VIEW: 'login_history.view',

  CALENDAR_VIEW: 'calendar.view',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
};

export const hasPermission = (userPermissions = [], permission) => {
  if (!permission) return true;
  if (!userPermissions?.length) return false;
  if (userPermissions.includes('*') || userPermissions.includes('admin')) return true;
  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }
  return userPermissions.includes(permission);
};

export const hasAllPermissions = (userPermissions = [], permissions = []) => {
  if (!permissions.length) return true;
  if (userPermissions.includes('*') || userPermissions.includes('admin')) return true;
  return permissions.every((p) => userPermissions.includes(p));
};
