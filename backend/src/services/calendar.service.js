const { Op } = require('sequelize');
const dayjs = require('dayjs');
const {
  FollowUp,
  Booking,
  Lead,
  Enquiry,
  User,
  Package,
  Destination,
  EnquiryVehicleAssignment,
  Vehicle,
  Driver,
  LeadStatus,
} = require('../models');

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
};

const personName = (user) => {
  if (!user) return '';
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
};

const leadName = (lead) => {
  if (!lead) return '';
  return [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim();
};

const followUpCustomer = (row) =>
  row.enquiry?.customer_name || leadName(row.lead) || '';

const mapFollowUp = (row) => {
  const f = row.toJSON ? row.toJSON() : row;
  const when = dayjs(f.follow_up_date);
  const hasTime = when.isValid() && (when.hour() !== 0 || when.minute() !== 0);
  const customerName = followUpCustomer(f);
  const typeLabel = String(f.type || 'follow-up').replace(/_/g, ' ');

  return {
    id: f.id,
    kind: 'follow_up',
    title: customerName ? `${capitalize(typeLabel)} · ${customerName}` : `Follow-up · ${capitalize(typeLabel)}`,
    subtitle: f.enquiry?.enquiry_code || f.lead?.lead_code || capitalize(typeLabel),
    date: when.isValid() ? when.format('YYYY-MM-DD') : null,
    endDate: when.isValid() ? when.format('YYYY-MM-DD') : null,
    time: hasTime ? when.format('h:mm A') : null,
    status: f.status,
    notes: f.notes || '',
    followUpType: f.type || 'task',
    customerName,
    enquiryId: f.enquiry_id || f.enquiry?.id || null,
    enquiryCode: f.enquiry?.enquiry_code || null,
    leadId: f.lead_id || f.lead?.id || null,
    assigneeName: personName(f.assignee) || null,
  };
};

const mapBooking = (row) => {
  const b = row.toJSON ? row.toJSON() : row;
  const packageName = b.package?.name || null;
  const destinationName = b.destination?.name || null;
  const title = packageName || destinationName || `Booking · ${b.customer_name}`;

  return {
    id: b.id,
    kind: 'booking',
    title,
    subtitle: [b.booking_code, b.customer_name].filter(Boolean).join(' · '),
    date: toDateOnly(b.travel_from),
    endDate: toDateOnly(b.travel_to) || toDateOnly(b.travel_from),
    time: null,
    status: b.status,
    notes: b.notes || '',
    customerName: b.customer_name,
    phone: b.phone || null,
    bookingId: b.id,
    bookingCode: b.booking_code,
    enquiryId: b.enquiry_id || b.enquiry?.id || null,
    enquiryCode: b.enquiry?.enquiry_code || null,
    leadStatus: b.enquiry?.leadStatus?.lead_status || null,
    packageName,
    destinationName,
    adults: b.adults ?? 0,
    children: b.children ?? 0,
  };
};

const mapVehicleTrip = (row) => {
  const a = row.toJSON ? row.toJSON() : row;
  const vehicleName = a.vehicle?.name || null;
  const registrationNumber = a.vehicle?.registration_number || null;
  const vehicleLabel = [vehicleName, registrationNumber].filter(Boolean).join(' · ');
  const enquiryCode = a.enquiry?.enquiry_code || null;
  const customerName = a.enquiry?.customer_name || '';

  return {
    id: a.id,
    kind: 'vehicle',
    title: vehicleLabel || 'Trip vehicle',
    subtitle: [enquiryCode, customerName].filter(Boolean).join(' · '),
    date: toDateOnly(a.start_date),
    endDate: toDateOnly(a.end_date) || toDateOnly(a.start_date),
    time: null,
    status: a.trip_status || a.status || 'allocated',
    notes: a.notes || '',
    customerName,
    enquiryId: a.enquiry_id || a.enquiry?.id || null,
    enquiryCode,
    leadStatus: a.enquiry?.leadStatus?.lead_status || null,
    vehicleId: a.vehicle_id || a.vehicle?.id || null,
    vehicleName,
    registrationNumber,
    vehicleOwnership: a.vehicle?.ownership || 'own',
    driverName: a.driver?.full_name || null,
    driverType: a.driver?.driver_type || 'own',
    pickupLocation: a.pickup_location || null,
    dropLocation: a.drop_location || null,
  };
};

function capitalize(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const KIND_ORDER = { booking: 0, vehicle: 1, follow_up: 2 };

function normalizeLeadStatus(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lead statuses that mean the trip is finished — hide from calendar even if vehicle is still on_trip. */
function isClosedLeadStatus(label) {
  const name = normalizeLeadStatus(label);
  if (!name) return false;
  return name.includes('completed') || name === 'feedback';
}

async function getClosedLeadStatusIds() {
  const rows = await LeadStatus.findAll({ attributes: ['id', 'lead_status'] });
  return rows.filter((row) => isClosedLeadStatus(row.lead_status)).map((row) => row.id);
}

function enquiryInclude(closedLeadStatusIds) {
  const where = closedLeadStatusIds.length
    ? {
        [Op.or]: [
          { lead_status_id: null },
          { lead_status_id: { [Op.notIn]: closedLeadStatusIds } },
        ],
      }
    : {};

  return {
    model: Enquiry,
    as: 'enquiry',
    required: true,
    attributes: ['id', 'enquiry_code', 'customer_name', 'lead_status_id'],
    where,
    include: [{ model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] }],
  };
}

function isOpenVehicleTrip(row) {
  const data = row.toJSON ? row.toJSON() : row;
  if (isClosedLeadStatus(data.enquiry?.leadStatus?.lead_status)) return false;
  const status = String(data.status || '').toLowerCase();
  const tripStatus = String(data.trip_status || '').toLowerCase();
  return !['completed', 'cancelled'].includes(status) && tripStatus !== 'trip_closed';
}

function isOpenBooking(row) {
  const data = row.toJSON ? row.toJSON() : row;
  return !isClosedLeadStatus(data.enquiry?.leadStatus?.lead_status);
}

const getEvents = async (query = {}) => {
  const from = query.from ? dayjs(query.from).startOf('day') : dayjs().startOf('month');
  const to = query.to ? dayjs(query.to).endOf('day') : dayjs().endOf('month');
  const fromDate = from.format('YYYY-MM-DD');
  const toDate = to.format('YYYY-MM-DD');
  const closedLeadStatusIds = await getClosedLeadStatusIds();

  const [followUps, bookings, vehicleTrips] = await Promise.all([
    FollowUp.findAll({
      where: {
        follow_up_date: { [Op.between]: [from.toDate(), to.toDate()] },
        status: { [Op.ne]: 'cancelled' },
      },
      include: [
        { model: Lead, as: 'lead', attributes: ['id', 'lead_code', 'first_name', 'last_name'] },
        { model: Enquiry, as: 'enquiry', attributes: ['id', 'enquiry_code', 'customer_name'] },
        { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] },
      ],
      order: [['follow_up_date', 'ASC']],
    }),
    Booking.findAll({
      where: {
        travel_from: { [Op.lte]: toDate },
        travel_to: { [Op.gte]: fromDate },
        status: { [Op.notIn]: ['cancelled', 'completed'] },
      },
      attributes: [
        'id',
        'booking_code',
        'customer_name',
        'phone',
        'travel_from',
        'travel_to',
        'status',
        'adults',
        'children',
        'notes',
        'enquiry_id',
      ],
      include: [
        { model: Package, as: 'package', attributes: ['id', 'name', 'code'] },
        { model: Destination, as: 'destination', attributes: ['id', 'name'] },
        enquiryInclude(closedLeadStatusIds),
      ],
      order: [['travel_from', 'ASC']],
    }),
    EnquiryVehicleAssignment.findAll({
      where: {
        start_date: { [Op.lte]: toDate },
        end_date: { [Op.gte]: fromDate },
        status: { [Op.notIn]: ['cancelled'] },
      },
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'name', 'code', 'type', 'registration_number', 'ownership'],
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'full_name', 'phone', 'driver_type'],
        },
        enquiryInclude(closedLeadStatusIds),
      ],
      order: [['start_date', 'ASC']],
    }),
  ]);

  const events = [
    ...followUps.map(mapFollowUp),
    ...bookings.filter(isOpenBooking).map(mapBooking),
    ...vehicleTrips.filter(isOpenVehicleTrip).map(mapVehicleTrip),
  ].filter((event) => event.date);

  events.sort((a, b) => {
    const dateCmp = String(a.date).localeCompare(String(b.date));
    if (dateCmp !== 0) return dateCmp;
    const kindCmp = (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9);
    if (kindCmp !== 0) return kindCmp;
    return String(a.time || '').localeCompare(String(b.time || ''));
  });

  return events;
};

module.exports = { getEvents };
