const { Op } = require('sequelize');
const { Enquiry, Destination, EnquiryVehicleAssignment, Vehicle, Driver, User } = require('../models');
const dayjs = require('dayjs');
const whatsappTemplateService = require('./whatsappTemplate.service');
const wasender = require('./wasender.service');
const masterService = require('./master.service');
const logger = require('../config/logger');
const { normalizeWhatsAppPhone, isValidWhatsAppPhone } = require('../utils/phone.util');

const DEFAULT_ITINERARY_WHATSAPP_TEMPLATE = `Dear {{Customer}}

Greetings from {{company_name}}!

We are happy to share your travel itinerary for your upcoming trip.

Destination: {{destination}}
Travel Dates: {{from_date}} to {{to_date}}
Travellers: {{travellers}}

Your detailed itinerary includes the day-wise travel plan, destinations, activities, and other trip details.

Kindly review the itinerary and let us know if you need any changes or customization. We will be happy to assist you.

Thank you for choosing {{company_name}}!

Contact us: {{company_phone}}`;

const normalizeEnquiry = (enquiry = {}) => {
  if (enquiry?.toJSON) return enquiry.toJSON();
  return enquiry || {};
};

const loadEnquiryForWhatsApp = async (enquiryId) => {
  if (!enquiryId) return null;
  const row = await Enquiry.findByPk(enquiryId, {
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'phone',
      'email',
      'travel_from',
      'travel_to',
      'travel_from_destination',
      'travel_to_destination',
      'adults',
      'children',
      'infants',
      'service_required',
      'enquiry_type',
      'budget',
    ],
    include: [{ model: Destination, as: 'destination', attributes: ['id', 'name'] }],
  });
  return row ? normalizeEnquiry(row) : null;
};

const resolveCustomerPhone = (enquiry = {}) => {
  const data = normalizeEnquiry(enquiry);
  const phone = String(data.phone || '').trim();
  if (!phone || !isValidWhatsAppPhone(phone)) return null;
  return normalizeWhatsAppPhone(phone);
};

const resolveDriverPhone = (driver = {}) => {
  const data = driver?.toJSON ? driver.toJSON() : driver || {};
  const phone = String(data.phone || '').trim();
  if (!phone || !isValidWhatsAppPhone(phone)) return null;
  return normalizeWhatsAppPhone(phone);
};

const buildDriverPortalLoginLink = (enquiry = {}, assignment = {}) => {
  const base = String(
    process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173'
  ).replace(/\/$/, '');
  const data = normalizeEnquiry(enquiry);
  const enquiryKey = data.enquiry_code || data.id;
  const params = new URLSearchParams();
  if (enquiryKey) params.set('enquiry', enquiryKey);
  if (assignment?.id) params.set('trip', assignment.id);
  return `${base}/driver/login?${params.toString()}`;
};

const loadVehicleAssignments = async (enquiryId) => {
  if (!enquiryId) return [];
  return EnquiryVehicleAssignment.findAll({
    where: { enquiry_id: enquiryId },
    include: [
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'name', 'code', 'type', 'registration_number'],
      },
    ],
    order: [['id', 'ASC']],
  });
};

const formatVehicleNameType = (vehicle = {}) => {
  const name = String(vehicle?.name || vehicle?.code || '').trim();
  const type = String(vehicle?.type || '').trim();
  if (name && type) return `${name} (${type})`;
  return name || type || '—';
};

const formatVehicleSummary = (assignments = []) => {
  if (!assignments.length) return '—';
  return assignments
    .map((row) => {
      const vehicle = row.vehicle;
      const nameType = formatVehicleNameType(vehicle);
      const number = vehicle?.registration_number || '';
      return [nameType, number].filter(Boolean).join(' - ') || 'Vehicle';
    })
    .join(', ');
};

const formatTravelDates = (enquiry = {}) => {
  const start = enquiry.travel_from || enquiry.travel_start_date || enquiry.start_date;
  const end = enquiry.travel_to || enquiry.travel_end_date || enquiry.end_date;
  if (start && end) return `${start} to ${end}`;
  return start || end || '—';
};

const normalizePlaceholderKey = (key = '') =>
  String(key).trim().toLowerCase().replace(/[\s-]+/g, '_');

const buildTemplateVariables = (enquiry = {}, assignments = []) => {
  const data = normalizeEnquiry(enquiry);
  const destination =
    data.travel_to_destination ||
    data.destination?.name ||
    data.to_location ||
    '—';

  const customerName = data.customer_name || data.name || 'Customer';
  const tripId = data.enquiry_code || data.code || String(data.id || '');
  const phone = resolveCustomerPhone(data) || '';
  const email = data.email || '';
  const travelDates = formatTravelDates(data);
  const vehicle = formatVehicleSummary(assignments);

  const values = {
    customer_name: customerName,
    customer: customerName,
    Customer: customerName,
    name: customerName,
    enquiry_code: tripId,
    trip_id: tripId,
    tripid: tripId,
    trip: tripId,
    booking_no: tripId,
    booking_number: tripId,
    booking_id: tripId,
    phone,
    mobile: phone,
    customer_phone: phone,
    email,
    travel_dates: travelDates,
    travel_from: data.travel_from || '',
    travel_to: data.travel_to || '',
    travel_from_destination: data.travel_from_destination || '',
    travel_to_destination: data.travel_to_destination || destination,
    destination,
    vehicle,
    adults: data.adults != null ? String(data.adults) : '',
    children: data.children != null ? String(data.children) : '',
    infants: data.infants != null ? String(data.infants) : '',
    service_required: data.service_required || '',
    enquiry_type: data.enquiry_type || '',
    budget: data.budget != null ? String(data.budget) : '',
    '1': customerName,
    '2': tripId,
    '3': travelDates,
    '4': vehicle,
    '5': destination,
  };

  const lookup = {};
  Object.entries(values).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return { values, lookup };
};

const interpolateTemplateContent = (content, variablePack = {}) => {
  const lookup = variablePack.lookup || {};
  let message = String(content || '');

  message = message.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawKey) => {
    const normalized = normalizePlaceholderKey(rawKey);
    if (Object.prototype.hasOwnProperty.call(lookup, normalized)) {
      return lookup[normalized];
    }
    return match;
  });

  return message.trim();
};

const sendTemplateWhatsApp = async ({
  enquiry,
  templateConfig,
  assignments,
  variablePackOverride = null,
}) => {
  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  const data = normalizeEnquiry(enquiry);
  const phone = resolveCustomerPhone(data);
  if (!phone) {
    return { skipped: true, reason: 'missing_customer_phone' };
  }

  const templateContent = templateConfig?.template_content;
  if (!templateContent) {
    return { skipped: true, reason: 'no_template_content' };
  }

  const variablePack =
    variablePackOverride || buildTemplateVariables(data, assignments);
  const message = interpolateTemplateContent(templateContent, variablePack);

  if (/\{\{[^}]+\}\}/.test(message)) {
    logger.warn('WhatsApp template still has unreplaced placeholders', {
      enquiryId: data.id,
      enquiryCode: data.enquiry_code,
      messagePreview: message.slice(0, 200),
    });
  }

  const result = await wasender.sendTextMessage({
    phoneNumber: phone,
    message,
  });

  if (result.success) {
    logger.info('WhatsApp sent via Wasender to customer', {
      enquiryId: data.id,
      enquiryCode: data.enquiry_code,
      leadStatusId: templateConfig.lead_status_id,
      customerName: variablePack.values.customer_name,
      tripId: variablePack.values.trip_id,
      customerPhone: phone,
      to: result.to,
      messagePreview: message.slice(0, 160),
    });
  } else if (!result.skipped) {
    logger.warn('WhatsApp send did not succeed', {
      enquiryId: data.id,
      customerPhone: phone,
      to: result.to,
      error: result.error,
      reason: result.reason,
    });
  }

  return result;
};

const resolveEnquiryPayload = async (enquiryOrId = {}) => {
  const enquiryId =
    typeof enquiryOrId === 'string' ? enquiryOrId : enquiryOrId?.id;
  if (enquiryId) {
    const fresh = await loadEnquiryForWhatsApp(enquiryId);
    if (fresh) return fresh;
  }
  return normalizeEnquiry(enquiryOrId);
};

const sendForLeadStatusChange = async (enquiry = {}, leadStatus = null) => {
  const status = leadStatus || enquiry.leadStatus;
  if (!status?.lead_status) {
    return { skipped: true, reason: 'missing_lead_status' };
  }

  let templateConfig = await whatsappTemplateService.getByTemplateName(status.lead_status);
  if (!templateConfig && status.id) {
    templateConfig = await whatsappTemplateService.getByLeadStatusId(status.id);
  }
  if (!templateConfig) {
    return { skipped: true, reason: 'no_template_for_status' };
  }

  if (!templateConfig.is_active) {
    return { skipped: true, reason: 'template_inactive' };
  }

  const data = await resolveEnquiryPayload(enquiry);
  const assignments = await loadVehicleAssignments(data.id);
  return sendTemplateWhatsApp({ enquiry: data, templateConfig, assignments });
};

const loadVehicleAssignment = async (assignmentId) => {
  if (!assignmentId) return null;
  const row = await EnquiryVehicleAssignment.findByPk(assignmentId, {
    include: [
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'name', 'code', 'type', 'registration_number'],
      },
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'full_name', 'phone'],
      },
    ],
  });
  return row ? (row.toJSON ? row.toJSON() : row) : null;
};

const buildVehicleDriverAssignedVariables = async (enquiry = {}, assignment = {}) => {
  const basePack = buildTemplateVariables(enquiry, assignment ? [assignment] : []);
  const branding = await masterService.getBranding();
  const data = normalizeEnquiry(enquiry);
  const vehicle = assignment?.vehicle || {};
  const driver = assignment?.driver || {};
  const tripDate = data.travel_from || assignment?.start_date || '';
  const destination =
    data.travel_to_destination ||
    assignment?.drop_location ||
    data.destination?.name ||
    '—';
  const vehicleNameType = formatVehicleNameType(vehicle);

  const extraValues = {
    trip_date: formatDisplayDate(tripDate),
    trip_to_destination: destination,
    to_destination: destination,
    destination,
    vehicle_number: vehicle.registration_number || vehicle.code || '—',
    vehicle_type: vehicleNameType,
    vehicle_name: vehicle.name || vehicle.code || '—',
    vehicle_name_type: vehicleNameType,
    vehicle: [vehicleNameType, vehicle.registration_number].filter(Boolean).join(' - ') || '—',
    driver_name: driver.full_name || '—',
    driver_mobile: driver.phone || '—',
    driver_phone: driver.phone || '—',
    driver_contact: driver.phone || '—',
    company_name: branding.company_name || 'Pollachi Tours and Travels',
    pickup_location:
      data.travel_from_destination || assignment?.pickup_location || '—',
    pickup_id: data.enquiry_code || data.code || String(data.id || ''),
  };

  const lookup = { ...(basePack.lookup || {}) };
  Object.entries(extraValues).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return {
    values: { ...basePack.values, ...extraValues },
    lookup,
  };
};

const sendVehicleDriverAssignedWhatsApp = async ({ enquiry, assignment }) => {
  const templateConfig = await whatsappTemplateService.getByTemplateName('Vehicle_driver_assigned');
  if (!templateConfig?.template_content) {
    return { skipped: true, reason: 'no_vehicle_driver_assigned_template' };
  }
  if (!templateConfig.is_active) {
    return { skipped: true, reason: 'template_inactive' };
  }

  const data = await resolveEnquiryPayload(enquiry);
  const assignmentData =
    assignment?.vehicle || assignment?.driver
      ? assignment
      : await loadVehicleAssignment(assignment?.id);
  const variablePack = await buildVehicleDriverAssignedVariables(data, assignmentData || {});

  return sendTemplateWhatsApp({
    enquiry: data,
    templateConfig,
    assignments: assignmentData ? [assignmentData] : [],
    variablePackOverride: variablePack,
  });
};

const buildDriverLoginCredentialsVariables = async ({
  enquiry = {},
  assignment = {},
  credentials = {},
  loginLink = '',
}) => {
  const branding = await masterService.getBranding();
  const data = normalizeEnquiry(enquiry);
  const vehicle = assignment?.vehicle || {};
  const driver = assignment?.driver || {};
  const vehicleNameType = formatVehicleNameType(vehicle);
  const vehicleNumber =
    [vehicleNameType, vehicle.registration_number].filter(Boolean).join(' - ') || '—';

  const startDate = assignment?.start_date || data.travel_from || '';
  const endDate = assignment?.end_date || data.travel_to || '';
  const tripDate =
    [formatDisplayDate(startDate), formatDisplayDate(endDate)]
      .filter((value) => value !== '—')
      .join(' to ') || '—';

  const pickupLocation =
    data.travel_from_destination || assignment?.pickup_location || '—';
  const destination =
    data.travel_to_destination ||
    assignment?.drop_location ||
    data.destination?.name ||
    '—';
  const tripId = data.enquiry_code || data.code || String(data.id || '');
  const username = credentials.username || driver.phone || driver.email || '—';
  const password = credentials.password || '—';
  const driverName = driver.full_name || credentials.driver_name || 'Driver';
  const customerName = data.customer_name || '—';
  const companyName = branding.company_name || 'Pollachi Tours and Travels';
  const link = loginLink || buildDriverPortalLoginLink(data, assignment);

  const values = {
    driver_name: driverName,
    username,
    password,
    login_link: link,
    login_url: link,
    trip_id: tripId,
    enquiry_code: tripId,
    customer_name: customerName,
    date: tripDate,
    trip_date: tripDate,
    travel_dates: tripDate,
    pickup_location: pickupLocation,
    destination,
    to_destination: destination,
    vehicle_number: vehicleNumber,
    vehicle: vehicleNumber,
    company_name: companyName,
  };

  const lookup = {};
  Object.entries(values).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return { values, lookup };
};

const sendDriverLoginCredentialsWhatsApp = async ({
  enquiryId,
  assignmentId,
  username,
  password,
  loginLink,
}) => {
  const templateConfig = await whatsappTemplateService.getByTemplateName('driver_login_credentials');
  if (!templateConfig?.template_content) {
    return { skipped: true, reason: 'no_driver_login_credentials_template' };
  }
  if (!templateConfig.is_active) {
    return { skipped: true, reason: 'template_inactive' };
  }

  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  const assignment = await loadVehicleAssignment(assignmentId);
  if (!assignment || String(assignment.enquiry_id) !== String(enquiryId)) {
    return { skipped: true, reason: 'assignment_not_found' };
  }

  const enquiry = await resolveEnquiryPayload(enquiryId);
  const driver = assignment.driver || {};
  const phone = resolveDriverPhone(driver);
  if (!phone) {
    return { skipped: true, reason: 'missing_driver_phone' };
  }

  const portalUsername = String(username || '').trim();
  const portalPassword = String(password || '').trim();
  if (!portalUsername || !portalPassword) {
    return { skipped: true, reason: 'missing_credentials' };
  }

  const resolvedLink = loginLink || buildDriverPortalLoginLink(enquiry, assignment);
  const variablePack = await buildDriverLoginCredentialsVariables({
    enquiry,
    assignment,
    credentials: {
      username: portalUsername,
      password: portalPassword,
      driver_name: driver.full_name,
    },
    loginLink: resolvedLink,
  });
  const message = interpolateTemplateContent(templateConfig.template_content, variablePack);

  if (/\{\{[^}]+\}\}/.test(message)) {
    logger.warn('Driver login WhatsApp template still has unreplaced placeholders', {
      enquiryId,
      assignmentId,
      messagePreview: message.slice(0, 200),
    });
  }

  const result = await wasender.sendTextMessage({
    phoneNumber: phone,
    message,
  });

  if (result.success) {
    logger.info('Driver login credentials WhatsApp sent', {
      enquiryId,
      assignmentId,
      driverId: driver.id,
      driverPhone: phone,
      to: result.to,
      messagePreview: message.slice(0, 160),
    });
    return {
      success: true,
      delivery: 'wasender',
      phone,
      message,
      to: result.to,
    };
  }

  if (!result.skipped) {
    logger.warn('Driver login credentials WhatsApp send failed', {
      enquiryId,
      assignmentId,
      driverPhone: phone,
      error: result.error,
      reason: result.reason,
    });
  }

  return {
    skipped: true,
    reason: result.reason || 'wasender_failed',
    error: result.error || 'Failed to send WhatsApp message',
    phone,
  };
};

const sendBookingConfirmedWhatsApp = async (enquiry = {}, leadStatus = null) => {
  const status = leadStatus || enquiry.leadStatus;
  let templateConfig = null;

  if (status?.lead_status) {
    templateConfig = await whatsappTemplateService.getByTemplateName(status.lead_status);
  }
  if (!templateConfig && status?.id) {
    templateConfig = await whatsappTemplateService.getByLeadStatusId(status.id);
  }
  if (!templateConfig) {
    templateConfig = await whatsappTemplateService.getByLeadStatusName('Booking Confirmed');
  }

  if (!templateConfig?.is_active || !templateConfig.template_content) {
    return { skipped: true, reason: 'no_active_booking_confirmed_template' };
  }

  const data = await resolveEnquiryPayload(enquiry);
  const assignments = await loadVehicleAssignments(data.id);
  return sendTemplateWhatsApp({ enquiry: data, templateConfig, assignments });
};

const formatDisplayDate = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const resolveCompanyPhone = async () => {
  const branding = await masterService.getBranding();
  let phone = String(branding.company_phone || '').trim();
  if (phone) return phone;

  const userRow = await User.findOne({
    where: {
      phone: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
      },
    },
    attributes: ['phone'],
    order: [['updated_at', 'DESC']],
  });
  phone = String(userRow?.phone || '').trim();
  if (phone) return phone;

  const email = String(branding.company_email || '').trim();
  if (email) return email;
  return '';
};

const pickTravellerCount = (primary, fallback) => {
  if (primary != null && primary !== '') {
    const primaryNum = Number(primary);
    if (Number.isFinite(primaryNum)) return primaryNum;
  }
  if (fallback != null && fallback !== '') {
    const fallbackNum = Number(fallback);
    if (Number.isFinite(fallbackNum)) return fallbackNum;
  }
  return 0;
};

const buildItineraryVariables = async ({ enquiry = {}, itinerary = {}, shareUrl = '' }) => {
  const enquiryData = normalizeEnquiry(enquiry);
  const adults = pickTravellerCount(enquiryData.adults, itinerary.adults);
  const children = pickTravellerCount(enquiryData.children, itinerary.children);
  const destination =
    itinerary.destination?.name ||
    itinerary.title ||
    enquiryData.travel_to_destination ||
    '—';
  const fromDate = itinerary.from_date || enquiryData.travel_from || '';
  const toDate = itinerary.to_date || enquiryData.travel_to || '';
  const branding = await masterService.getBranding();
  const companyPhone = (await resolveCompanyPhone()) || '';

  const values = {
    customer_name: enquiryData.customer_name || 'Customer',
    customer: enquiryData.customer_name || 'Customer',
    Customer: enquiryData.customer_name || 'Customer',
    Cusotmer: enquiryData.customer_name || 'Customer',
    company_name: branding.company_name || 'Pollachi Tours and Travels',
    company_phone: companyPhone,
    destination,
    destination_name: destination,
    from_date: formatDisplayDate(fromDate),
    to_date: formatDisplayDate(toDate),
    travel_dates: [formatDisplayDate(fromDate), formatDisplayDate(toDate)].filter((d) => d !== '—').join(' to ') || '—',
    travellers: `Adults (${adults}), Children (${children})`,
    adults: String(adults),
    children: String(children),
    itinerary_link: shareUrl,
    itinerary_url: shareUrl,
    view_itinerary_link: shareUrl,
    itinerary_link_label: 'Show itinerary',
  };

  const lookup = {};
  Object.entries(values).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return { values, lookup };
};

const buildItineraryMessage = async ({ enquiry = {}, itinerary = {}, shareUrl = '' }) => {
  const phone = resolveCustomerPhone(enquiry);
  if (!phone) {
    return { skipped: true, reason: 'missing_customer_phone' };
  }

  const variablePack = await buildItineraryVariables({ enquiry, itinerary, shareUrl });
  const message = interpolateTemplateContent(DEFAULT_ITINERARY_WHATSAPP_TEMPLATE, variablePack);
  const fullMessage = shareUrl
    ? `${message}\n\n👉 *Show itinerary*\n${shareUrl}`
    : message;

  return {
    phone,
    message,
    fullMessage,
    shareUrl,
    customerName: variablePack.values.customer_name,
    companyPhone: variablePack.values.company_phone,
  };
};

const sendItineraryWhatsApp = async ({ enquiry = {}, itinerary = {}, shareUrl = '' }) => {
  const prepared = await buildItineraryMessage({ enquiry, itinerary, shareUrl });
  if (prepared.skipped) return prepared;

  const { phone, message, fullMessage, customerName, shareUrl: link } = prepared;

  if (!link) {
    return { skipped: true, reason: 'missing_itinerary_link' };
  }

  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  const result = await wasender.sendItineraryLinkMessage({
    phoneNumber: phone,
    message,
    linkUrl: link,
    linkLabel: 'Show itinerary',
  });

  if (result.skipped) {
    return {
      skipped: true,
      reason: result.reason || 'wasender_failed',
      error: result.error,
      phone,
      shareUrl: link,
    };
  }

  if (result.success) {
    logger.info('Itinerary preview link sent via Wasender', {
      enquiryId: enquiry.id,
      itineraryId: itinerary.id,
      customerName,
      customerPhone: phone,
      shareUrl: link,
      to: result.to,
      mode: result.mode,
    });
    return {
      success: true,
      delivery: 'wasender',
      attachment: 'link',
      phone,
      message: result.fullMessage || fullMessage,
      shareUrl: link,
      to: result.to,
    };
  }

  logger.warn('Wasender itinerary link send failed', { error: result.error, to: result.to });
  return {
    skipped: true,
    reason: 'wasender_failed',
    error: result.error || result.reason || 'Failed to send WhatsApp message',
    phone,
    shareUrl: link,
  };
};

const buildPaymentReceiptVariables = async (payment = {}) => {
  const enquiry = normalizeEnquiry(payment.enquiry || {});
  const basePack = buildTemplateVariables(enquiry, []);
  const branding = await masterService.getBranding();
  const companyPhone = (await resolveCompanyPhone()) || '';
  const paidAmount = Number(payment.advance_amount) || 0;

  const extraValues = {
    customer_name: enquiry.customer_name || 'Customer',
    customer: enquiry.customer_name || 'Customer',
    Customer: enquiry.customer_name || 'Customer',
    receipt_number: payment.payment_code || '—',
    payment_date: formatDisplayDate(payment.payment_date),
    paid_amount: paidAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    payment_mode: payment.payment_mode || '—',
    trip_id: enquiry.enquiry_code || String(enquiry.id || ''),
    company_name: branding.company_name || 'Pollachi Tours and Travels',
    company_mobile: companyPhone || '—',
    company_phone: companyPhone || '—',
  };

  const lookup = { ...(basePack.lookup || {}) };
  Object.entries(extraValues).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return {
    values: { ...basePack.values, ...extraValues },
    lookup,
  };
};

const sendPaymentReceiptWhatsApp = async ({ payment, imageBuffer = null }) => {
  const templateConfig = await whatsappTemplateService.getByTemplateName('payment_Receipt');
  if (!templateConfig?.template_content) {
    return { skipped: true, reason: 'no_payment_receipt_template' };
  }
  if (!templateConfig.is_active) {
    return { skipped: true, reason: 'template_inactive' };
  }

  const enquiry = normalizeEnquiry(payment?.enquiry || {});
  if (!enquiry.id && payment?.enquiry_id) {
    const loaded = await loadEnquiryForWhatsApp(payment.enquiry_id);
    if (loaded) Object.assign(enquiry, loaded);
  }

  const phone = resolveCustomerPhone(enquiry);
  if (!phone) {
    return { skipped: true, reason: 'missing_customer_phone' };
  }

  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    return { skipped: true, reason: 'missing_receipt_image' };
  }

  const variablePack = await buildPaymentReceiptVariables({ ...payment, enquiry });
  const message = interpolateTemplateContent(templateConfig.template_content, variablePack);
  const fileName = `${String(payment.payment_code || 'receipt').replace(/\//g, '-')}.png`;

  const upload = await wasender.uploadMedia(imageBuffer, 'image/png');
  if (!upload.success || !upload.publicUrl) {
    logger.warn('Payment receipt image upload failed', {
      paymentId: payment?.id,
      error: upload.error || upload.reason,
    });
    return {
      skipped: true,
      reason: 'receipt_image_upload_failed',
      error: upload.error || upload.reason || 'Failed to upload receipt image',
    };
  }

  const result = await wasender.sendImageMessage({
    phoneNumber: phone,
    message,
    imageUrl: upload.publicUrl,
    fileName,
  });

  if (result.success) {
    logger.info('Payment receipt WhatsApp sent', {
      paymentId: payment?.id,
      paymentCode: payment?.payment_code,
      enquiryId: enquiry.id,
      customerPhone: phone,
      to: result.to,
      mode: result.mode || 'image',
    });
    return {
      success: true,
      delivery: 'wasender',
      attachment: 'image',
      phone,
      message,
      to: result.to,
      fileName,
    };
  }

  logger.warn('Payment receipt WhatsApp send failed', {
    paymentId: payment?.id,
    error: result.error,
    to: result.to,
  });

  return {
    skipped: true,
    reason: 'wasender_failed',
    error: result.error || 'Failed to send WhatsApp message',
    phone,
  };
};

const buildPublicFeedbackLink = (token) => {
  const base = String(
    process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173'
  ).replace(/\/$/, '');
  return `${base}/feedback/${token}`;
};

const buildCustomerFeedbackVariables = async ({ enquiry = {}, feedbackLink = '' }) => {
  const branding = await masterService.getBranding();
  const data = normalizeEnquiry(enquiry);
  const customerName = data.customer_name || data.name || 'Customer';
  const companyName = branding.company_name || 'Pollachi Tours and Travels';

  const values = {
    customer_name: customerName,
    customer: customerName,
    company_name: companyName,
    feedback_link: feedbackLink,
    feedback_url: feedbackLink,
  };

  const lookup = {};
  Object.entries(values).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return { values, lookup };
};

const sendCustomerFeedbackWhatsApp = async ({ enquiry, feedbackLink }) => {
  const templateConfig = await whatsappTemplateService.getByTemplateName('customer_feedback');
  if (!templateConfig?.template_content) {
    return { skipped: true, reason: 'no_customer_feedback_template' };
  }
  if (!templateConfig.is_active) {
    return { skipped: true, reason: 'template_inactive' };
  }

  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  const data = await resolveEnquiryPayload(enquiry);
  const phone = resolveCustomerPhone(data);
  if (!phone) {
    return { skipped: true, reason: 'missing_customer_phone' };
  }

  const link = String(feedbackLink || '').trim();
  if (!link) {
    return { skipped: true, reason: 'missing_feedback_link' };
  }

  const variablePack = await buildCustomerFeedbackVariables({ enquiry: data, feedbackLink: link });
  const message = interpolateTemplateContent(templateConfig.template_content, variablePack);

  if (/\{\{[^}]+\}\}/.test(message)) {
    logger.warn('Customer feedback WhatsApp template still has unreplaced placeholders', {
      enquiryId: data.id,
      enquiryCode: data.enquiry_code,
      messagePreview: message.slice(0, 200),
    });
  }

  const result = await wasender.sendTextMessage({
    phoneNumber: phone,
    message,
  });

  if (result.success) {
    logger.info('Customer feedback WhatsApp sent', {
      enquiryId: data.id,
      enquiryCode: data.enquiry_code,
      customerPhone: phone,
      to: result.to,
      messagePreview: message.slice(0, 160),
    });
    return {
      success: true,
      delivery: 'wasender',
      phone,
      message,
      to: result.to,
      feedbackLink: link,
    };
  }

  if (!result.skipped) {
    logger.warn('Customer feedback WhatsApp send failed', {
      enquiryId: data.id,
      customerPhone: phone,
      error: result.error,
      reason: result.reason,
    });
  }

  return {
    skipped: true,
    reason: result.reason || 'wasender_failed',
    error: result.error || 'Failed to send WhatsApp message',
    phone,
  };
};

const formatWhatsAppAmount = (value) => {
  const num = Math.round(Number(value) || 0);
  return num.toLocaleString('en-IN');
};

const buildTripCompletedVariables = async ({
  enquiry = {},
  invoiceContext = {},
  assignments = [],
}) => {
  const branding = await masterService.getBranding();
  const data = normalizeEnquiry(enquiry);
  const assignment = assignments[0] || {};
  const vehicle = assignment?.vehicle || {};
  const vehicleNameType = formatVehicleNameType(vehicle);
  const vehicleNumber =
    [vehicleNameType, vehicle.registration_number].filter(Boolean).join(' - ') || '—';

  const startDate =
    invoiceContext.trip_from ||
    data.travel_from ||
    assignment?.start_date ||
    '';
  const endDate =
    invoiceContext.trip_to || data.travel_to || assignment?.end_date || '';
  const tripDate =
    [formatDisplayDate(startDate), formatDisplayDate(endDate)]
      .filter((value) => value !== '—')
      .join(' to ') || '—';

  const pickupLocation =
    data.travel_from_destination || assignment?.pickup_location || '—';
  const destination =
    data.travel_to_destination ||
    assignment?.drop_location ||
    data.destination?.name ||
    '—';

  const customerName = data.customer_name || 'Customer';
  const companyName = branding.company_name || 'Pollachi Tours and Travels';
  const tripId = data.enquiry_code || data.code || String(data.id || '');
  const invoiceDate = formatDisplayDate(invoiceContext.invoice_date || new Date());
  const totalAmount = formatWhatsAppAmount(invoiceContext.total_amount);
  const paidAmount = formatWhatsAppAmount(invoiceContext.paid_amount);
  const balanceAmount = formatWhatsAppAmount(invoiceContext.balance_amount);

  const values = {
    customer_name: customerName,
    customer: customerName,
    Customer: customerName,
    trip_id: tripId,
    enquiry_code: tripId,
    'trip id': tripId,
    trip_date: tripDate,
    travel_dates: tripDate,
    'trip date': tripDate,
    pickup_location: pickupLocation,
    pickup: pickupLocation,
    destination,
    to_destination: destination,
    vehicle_number: vehicleNumber,
    vehicle: vehicleNumber,
    'vehicle number': vehicleNumber,
    invoice_number: invoiceContext.invoice_number || '—',
    'invoice number': invoiceContext.invoice_number || '—',
    invoice_date: invoiceDate,
    'invoice date': invoiceDate,
    total_amount: totalAmount,
    'total amount': totalAmount,
    paid_amount: paidAmount,
    'paid amount': paidAmount,
    balance_amount: balanceAmount,
    'balance amount': balanceAmount,
    company_name: companyName,
    'company name': companyName,
  };

  const lookup = {};
  Object.entries(values).forEach(([key, value]) => {
    lookup[normalizePlaceholderKey(key)] = value == null ? '' : String(value);
  });

  return { values, lookup };
};

const sendTripCompletedWhatsApp = async ({ enquiry, invoiceContext, imageBuffer }) => {
  const templateConfig = await whatsappTemplateService.getByTemplateName('Trip_completed');
  if (!templateConfig?.template_content) {
    return { skipped: true, reason: 'no_trip_completed_template' };
  }
  if (!templateConfig.is_active) {
    return { skipped: true, reason: 'template_inactive' };
  }

  const data = await resolveEnquiryPayload(enquiry);
  const phone = resolveCustomerPhone(data);
  if (!phone) {
    return { skipped: true, reason: 'missing_customer_phone' };
  }

  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    return { skipped: true, reason: 'missing_invoice_image' };
  }

  const assignments = await loadVehicleAssignments(data.id);
  const variablePack = await buildTripCompletedVariables({
    enquiry: data,
    invoiceContext,
    assignments,
  });
  const message = interpolateTemplateContent(templateConfig.template_content, variablePack);
  const fileName = `${String(invoiceContext.invoice_number || 'invoice').replace(/\//g, '-')}.png`;

  const upload = await wasender.uploadMedia(imageBuffer, 'image/png');
  if (!upload.success || !upload.publicUrl) {
    logger.warn('Trip completed invoice image upload failed', {
      enquiryId: data.id,
      error: upload.error || upload.reason,
    });
    return {
      skipped: true,
      reason: 'invoice_image_upload_failed',
      error: upload.error || upload.reason || 'Failed to upload invoice image',
    };
  }

  const result = await wasender.sendImageMessage({
    phoneNumber: phone,
    message,
    imageUrl: upload.publicUrl,
    fileName,
  });

  if (result.success) {
    logger.info('Trip completed invoice WhatsApp sent', {
      enquiryId: data.id,
      enquiryCode: data.enquiry_code,
      customerPhone: phone,
      to: result.to,
      fileName,
      mode: result.mode || 'image',
    });
    return {
      success: true,
      delivery: 'wasender',
      attachment: 'image',
      phone,
      message,
      to: result.to,
      fileName,
    };
  }

  logger.warn('Trip completed invoice WhatsApp send failed', {
    enquiryId: data.id,
    customerPhone: phone,
    error: result.error,
    to: result.to,
  });

  return {
    skipped: true,
    reason: result.reason || 'wasender_failed',
    error: result.error || 'Failed to send WhatsApp message',
    phone,
  };
};

const buildSimpleInvoiceCaption = (enquiry = {}, invoiceContext = {}) => {
  const data = normalizeEnquiry(enquiry);
  const tripId =
    invoiceContext.trip_id ||
    invoiceContext.enquiry_code ||
    data.enquiry_code ||
    String(data.id || '—');
  const cost = formatWhatsAppAmount(
    invoiceContext.grand_total ?? invoiceContext.total_invoice ?? invoiceContext.total_amount
  );
  const from =
    invoiceContext.travel_from_destination || data.travel_from_destination || '—';
  const to = invoiceContext.travel_to_destination || data.travel_to_destination || '—';

  return [
    'This is your invoice copy.',
    '',
    `Your trip id is - ${tripId}`,
    `Cost: ₹ ${cost}`,
    `From: ${from}`,
    `To: ${to}`,
  ].join('\n');
};

const sendInvoiceWhatsApp = async ({ enquiry, invoiceContext = {}, imageBuffer = null }) => {
  const data = await resolveEnquiryPayload(enquiry);
  const phone = resolveCustomerPhone(data);
  if (!phone) {
    return { skipped: true, reason: 'missing_customer_phone' };
  }

  if (!wasender.isEnabled()) {
    return { skipped: true, reason: 'wasender_disabled' };
  }

  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    return { skipped: true, reason: 'missing_invoice_image' };
  }

  const message = buildSimpleInvoiceCaption(data, invoiceContext);
  const fileName = `${String(invoiceContext.invoice_number || data.enquiry_code || 'invoice').replace(/\//g, '-')}.png`;

  const upload = await wasender.uploadMedia(imageBuffer, 'image/png');
  if (!upload.success || !upload.publicUrl) {
    logger.warn('Invoice image upload failed', {
      enquiryId: data.id,
      error: upload.error || upload.reason,
    });
    return {
      skipped: true,
      reason: 'invoice_image_upload_failed',
      error: upload.error || upload.reason || 'Failed to upload invoice image',
    };
  }

  const result = await wasender.sendImageMessage({
    phoneNumber: phone,
    message,
    imageUrl: upload.publicUrl,
    fileName,
  });

  if (result.success) {
    logger.info('Invoice WhatsApp sent to customer', {
      enquiryId: data.id,
      enquiryCode: data.enquiry_code,
      customerPhone: phone,
      to: result.to,
      fileName,
      mode: result.mode || 'image',
    });
    return {
      success: true,
      delivery: 'wasender',
      attachment: 'image',
      phone,
      message,
      to: result.to,
      fileName,
    };
  }

  logger.warn('Invoice WhatsApp send failed', {
    enquiryId: data.id,
    customerPhone: phone,
    error: result.error,
    to: result.to,
  });

  return {
    skipped: true,
    reason: result.reason || 'wasender_failed',
    error: result.error || 'Failed to send WhatsApp message',
    phone,
  };
};

module.exports = {
  sendForLeadStatusChange,
  sendBookingConfirmedWhatsApp,
  sendItineraryWhatsApp,
  sendVehicleDriverAssignedWhatsApp,
  sendDriverLoginCredentialsWhatsApp,
  sendCustomerFeedbackWhatsApp,
  sendTripCompletedWhatsApp,
  sendPaymentReceiptWhatsApp,
  sendInvoiceWhatsApp,
  buildItineraryMessage,
  buildTemplateVariables,
  buildVehicleDriverAssignedVariables,
  buildDriverLoginCredentialsVariables,
  buildCustomerFeedbackVariables,
  buildTripCompletedVariables,
  buildPaymentReceiptVariables,
  interpolateTemplateContent,
  resolveCustomerPhone,
  resolveDriverPhone,
  buildDriverPortalLoginLink,
  buildPublicFeedbackLink,
};
