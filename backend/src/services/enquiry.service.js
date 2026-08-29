const { Op } = require('sequelize');
const {
  Enquiry,
  EnquiryNote,
  Lead,
  Destination,
  Package,
  User,
  Branch,
  Country,
  State,
  City,
  LeadSourceType,
  LeadStatus,
  EnquiryVehicleAssignment,
  EnquiryVehicleAssignmentStatusLog,
  Vehicle,
  Driver,
  VehicleAllocation,
  Booking,
  Payment,
  Quotation,
  Itinerary,
} = require('../models');
const createCrudService = require('./crud.factory');
const { generateCode, generateRunningNumber } = require('../utils/helpers');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const distanceService = require('./distance.service');
const tripCostService = require('./tripCost.service');
const whatsappNotification = require('./whatsappNotification.service');
const quotationService = require('./quotation.service');
const enquiryInvoiceImageService = require('./enquiryInvoiceImage.service');
const masterService = require('./master.service');
const { resolveInvoiceTotalAmount: computeInvoiceTotalAmount } = require('../utils/invoiceAmount');
const { notifyNewEnquiry } = require('./enquiryNotify.service');
const { assertLeadStatusTransition } = require('../utils/leadStatusPipeline');

const VEHICLE_LIST_ATTRS = [
  'id',
  'name',
  'code',
  'type',
  'capacity',
  'registration_number',
  'is_active',
  'ownership',
  'availability_status',
];

const assignmentIncludes = [
  {
    model: Vehicle,
    as: 'vehicle',
    attributes: VEHICLE_LIST_ATTRS,
  },
  {
    model: Driver,
    as: 'driver',
    attributes: [
      'id',
      'code',
      'full_name',
      'phone',
      'photo',
      'license_number',
      'availability_status',
      'is_active',
      'driver_type',
    ],
  },
  {
    model: Enquiry,
    as: 'enquiry',
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'travel_from',
      'travel_to',
      'travel_from_destination',
      'travel_to_destination',
      'lead_status_id',
    ],
    include: [{ model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] }],
  },
];

const monthRange = (year, month) => {
  const y = Number(year);
  const m = Number(month);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

const overlapsMonth = (start, end) => ({
  [Op.and]: [{ start_date: { [Op.lte]: end } }, { end_date: { [Op.gte]: start } }],
});

const isCompletedLeadStatus = (label) => {
  const name = String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return name.includes('completed') || name === 'feedback';
};

const isOpenVehicleTrip = (row) => {
  const data = row.toJSON ? row.toJSON() : row;
  if (isCompletedLeadStatus(data.enquiry?.leadStatus?.lead_status)) return false;
  const status = String(data.status || '').toLowerCase();
  const tripStatus = String(data.trip_status || '').toLowerCase();
  return !['completed', 'cancelled'].includes(status) && tripStatus !== 'trip_closed';
};

const openAssignmentWhere = (excludeEnquiryId) => {
  const where = {
    status: { [Op.notIn]: ['completed', 'cancelled'] },
    [Op.or]: [{ trip_status: null }, { trip_status: { [Op.ne]: 'trip_closed' } }],
  };
  if (excludeEnquiryId) where.enquiry_id = { [Op.ne]: excludeEnquiryId };
  return where;
};

const tripEnquiryInclude = {
  model: Enquiry,
  as: 'enquiry',
  attributes: ['id', 'lead_status_id'],
  required: true,
  include: [{ model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] }],
};

/** Assignments that still occupy a vehicle/driver (open trip on a non-completed enquiry). */
const listBusyAssignments = async ({ vehicleId, driverId, excludeEnquiryId } = {}) => {
  const where = openAssignmentWhere(excludeEnquiryId);
  if (vehicleId) where.vehicle_id = vehicleId;
  if (driverId) where.driver_id = driverId;
  const rows = await EnquiryVehicleAssignment.findAll({
    where,
    attributes: ['id', 'vehicle_id', 'driver_id', 'enquiry_id'],
    include: [tripEnquiryInclude],
  });
  return rows.filter(
    (row) => !isCompletedLeadStatus(row.enquiry?.leadStatus?.lead_status)
  );
};

const hasOtherOpenAssignments = async (params) => (await listBusyAssignments(params)).length > 0;

const getBusyResourceIds = async () => {
  const rows = await listBusyAssignments();
  const vehicleIds = new Set();
  const driverIds = new Set();
  for (const row of rows) {
    if (row.vehicle_id) vehicleIds.add(String(row.vehicle_id));
    if (row.driver_id) driverIds.add(String(row.driver_id));
  }
  return { vehicleIds, driverIds };
};

const markOnTrip = async ({ vehicleId, driverId }) => {
  if (vehicleId) {
    await Vehicle.update({ availability_status: 'on_trip' }, { where: { id: vehicleId } });
  }
  if (driverId) {
    await Driver.update({ availability_status: 'on_trip' }, { where: { id: driverId } });
  }
};

const setAvailableIfIdle = async ({ vehicleId, driverId, excludeEnquiryId }) => {
  if (driverId && !(await hasOtherOpenAssignments({ driverId, excludeEnquiryId }))) {
    await Driver.update({ availability_status: 'available' }, { where: { id: driverId } });
  }
  if (vehicleId && !(await hasOtherOpenAssignments({ vehicleId, excludeEnquiryId }))) {
    await Vehicle.update({ availability_status: 'available' }, { where: { id: vehicleId } });
  }
};

/** Mark this enquiry's assignments complete and free vehicle/driver if they have no other open trips. */
const releaseAssignedResources = async (enquiryId) => {
  const assignments = await EnquiryVehicleAssignment.findAll({
    where: { enquiry_id: enquiryId },
    attributes: ['id', 'vehicle_id', 'driver_id'],
  });
  if (!assignments.length) return;

  await EnquiryVehicleAssignment.update(
    {
      status: 'completed',
      trip_status: 'trip_closed',
      status_updated_at: new Date(),
    },
    {
      where: {
        enquiry_id: enquiryId,
        status: { [Op.notIn]: ['completed', 'cancelled'] },
      },
    }
  );

  const driverIds = [...new Set(assignments.map((row) => row.driver_id).filter(Boolean))];
  const vehicleIds = [...new Set(assignments.map((row) => row.vehicle_id).filter(Boolean))];

  for (const driverId of driverIds) {
    await setAvailableIfIdle({ driverId, excludeEnquiryId: enquiryId });
  }
  for (const vehicleId of vehicleIds) {
    await setAvailableIfIdle({ vehicleId, excludeEnquiryId: enquiryId });
  }
};

const defaultIncludes = [
  { model: Lead, as: 'lead', attributes: ['id', 'lead_code', 'first_name', 'last_name', 'status'] },
  { model: Destination, as: 'destination' },
  { model: Package, as: 'package' },
  { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] },
  { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
  { model: Country, as: 'country', attributes: ['id', 'name', 'code', 'currency_per_rupees'] },
  { model: State, as: 'state', attributes: ['id', 'name', 'code'] },
  { model: City, as: 'city', attributes: ['id', 'name', 'code'] },
  { model: LeadSourceType, as: 'leadSource', attributes: ['id', 'lead_source_type'] },
  { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status', 'button_color'] },
  { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
  { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name', 'email'] },
];

const base = createCrudService(Enquiry, {
  searchFields: [
    'customer_name',
    'email',
    'phone',
    'enquiry_code',
    'travel_from_destination',
    'travel_to_destination',
    'service_required',
  ],
  defaultIncludes,
  codeField: null,
  codePrefix: '',
});

const getNewLeadStatus = async () => {
  const status =
    (await LeadStatus.findOne({
      where: { lead_status: { [Op.like]: 'New Enquiry' }, is_active: true },
    })) ||
    (await LeadStatus.findOne({
      where: { lead_status: { [Op.like]: 'New%' }, is_active: true },
    }));
  if (!status) throw new AppError('Lead Status "New Enquiry" not found in master', 500);
  return status;
};

const splitName = (fullName = '') => {
  const parts = String(fullName).trim().split(/\s+/);
  const first_name = parts[0] || 'Customer';
  const last_name = parts.slice(1).join(' ') || null;
  return { first_name, last_name };
};

const enrichCalculations = async (payload) => {
  const data = { ...payload };

  data.infants = data.infants != null ? data.infants : 0;
  if (data.children != null) {
    const childCount = Number(data.children) || 0;
    if (childCount <= 0) {
      data.children = 0;
      data.children_details = [];
    } else if (!Array.isArray(data.children_details)) {
      data.children_details = [];
    }
  }

  if (data.travel_from && data.travel_to && data.travel_to < data.travel_from) {
    throw new AppError('Travel To Date must be greater than Travel From Date', 400);
  }

  if (
    data.travel_from_destination &&
    data.travel_to_destination &&
    String(data.travel_from_destination).trim().toLowerCase() ===
      String(data.travel_to_destination).trim().toLowerCase()
  ) {
    throw new AppError('Travel From and Travel To destinations cannot be the same', 400);
  }

  const needsDistance =
    (data.travel_from_lat != null &&
      data.travel_from_lng != null &&
      data.travel_to_lat != null &&
      data.travel_to_lng != null) ||
    (data.travel_from_destination && data.travel_to_destination);

  if (needsDistance && (data.approx_distance_km == null || data.approx_distance_km === '')) {
    const distance = await distanceService.calculateDrivingDistance({
      fromLat: data.travel_from_lat,
      fromLng: data.travel_from_lng,
      toLat: data.travel_to_lat,
      toLng: data.travel_to_lng,
      fromPlace: data.travel_from_destination,
      toPlace: data.travel_to_destination,
    });
    data.approx_distance_km = distance.distanceKm;
    if (data.travel_from_lat == null) data.travel_from_lat = distance.from.lat;
    if (data.travel_from_lng == null) data.travel_from_lng = distance.from.lng;
    if (data.travel_to_lat == null) data.travel_to_lat = distance.to.lat;
    if (data.travel_to_lng == null) data.travel_to_lng = distance.to.lng;
  }

  if (data.country_id && data.travel_from) {
    const cost = await tripCostService.calculateTripCost({
      countryId: data.country_id,
      travelDate: data.travel_from,
    });
    data.estimated_trip_cost = cost.estimatedTripCost;
    data.budget = cost.estimatedTripCost;
  }

  return data;
};

const createLeadFromEnquiry = async (enquiry, userId = null) => {
  const leadStatus = enquiry.lead_status_id
    ? await LeadStatus.findByPk(enquiry.lead_status_id)
    : await getNewLeadStatus();

  const { first_name, last_name } = splitName(enquiry.customer_name);
  const sourceName = enquiry.leadSource?.lead_source_type || null;

  let leadSourceLabel = sourceName;
  if (!leadSourceLabel && enquiry.lead_source_id) {
    const src = await LeadSourceType.findByPk(enquiry.lead_source_id);
    leadSourceLabel = src?.lead_source_type || null;
  }

  const childrenNotes =
    Array.isArray(enquiry.children_details) && enquiry.children_details.length
      ? `Children: ${enquiry.children_details
          .map((c, i) => `${i + 1}. ${c.name} (${c.age} yrs)`)
          .join(', ')}`
      : null;

  const lead = await Lead.create({
    lead_code: generateCode('LD'),
    first_name,
    last_name,
    email: enquiry.email,
    phone: enquiry.phone,
    source: leadSourceLabel || enquiry.enquiry_type || 'Enquiry',
    status: 'new',
    destination_interest: enquiry.travel_to_destination || null,
    budget: enquiry.estimated_trip_cost || enquiry.budget || null,
    travel_date: enquiry.travel_from || null,
    adults: enquiry.adults ?? 1,
    children: enquiry.children ?? 0,
    notes: [
      `Created from enquiry ${enquiry.enquiry_code}`,
      enquiry.service_required ? `Service: ${enquiry.service_required}` : null,
      childrenNotes,
      enquiry.requirements || null,
    ]
      .filter(Boolean)
      .join('\n'),
    assigned_to: enquiry.assigned_to || null,
    branch_id: enquiry.branch_id || null,
    created_by: userId,
    updated_by: userId,
  });

  await enquiry.update({
    lead_id: lead.id,
    lead_status_id: leadStatus?.id || enquiry.lead_status_id,
    is_converted: true,
    updated_by: userId,
  });

  return lead;
};

const create = async (payload, userId = null) => {
  const leadStatus = await getNewLeadStatus();
  // Always assign New Enquiry — never accept client-supplied lead_status_id on create
  const safePayload = { ...payload };
  delete safePayload.lead_status_id;
  let data = await enrichCalculations({
    ...safePayload,
    lead_status_id: leadStatus.id,
    status: userId ? payload.status || 'open' : 'open',
  });

  data.enquiry_code = await generateRunningNumber(Enquiry, 'enquiry_code', 'ENQ');
  if (userId) {
    data.created_by = userId;
    data.updated_by = userId;
    if (!data.assigned_to) data.assigned_to = userId;
  }

  const enquiry = await Enquiry.create(data);
  await createLeadFromEnquiry(enquiry, userId);

  try {
    await notifyNewEnquiry(enquiry);
  } catch {
    // Notification failure must not block enquiry creation
  }

  return base.getById(enquiry.id);
};

const update = async (id, payload, userId = null) => {
  const record = await base.getById(id);
  let data = await enrichCalculations({ ...payload });
  if (userId) data.updated_by = userId;
  await record.update(data);
  return base.getById(id);
};

/** Quick status update for enquiry workflow + lead lifecycle status */
const isBookingConfirmedStatus = (statusName = '') =>
  /booking\s*confirmed/i.test(String(statusName || ''));

const isTripCompletedStatus = (statusName = '') => {
  const name = String(statusName || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return name === 'trip completed' || name.includes('trip completed');
};

const updateStatus = async (id, { status, lead_status_id }, userId = null, roleCode = null) => {
  const record = await base.getById(id);
  const data = {};
  let releaseResources = false;
  if (status !== undefined && status !== null && status !== '') {
    data.status = status;
  }
  if (lead_status_id !== undefined && lead_status_id !== null && lead_status_id !== '') {
    const leadStatus = await LeadStatus.findByPk(lead_status_id);
    if (!leadStatus) throw new AppError('Lead status not found', 404);

    if (lead_status_id !== record.lead_status_id) {
      const allStatuses = await LeadStatus.findAll({ where: { is_active: true } });
      try {
        assertLeadStatusTransition({
          allStatuses,
          currentId: record.lead_status_id,
          currentName: record.leadStatus?.lead_status,
          nextId: lead_status_id,
          roleCode,
        });
      } catch (err) {
        throw new AppError(err.message || 'Invalid lead status transition', 403);
      }
    }

    data.lead_status_id = lead_status_id;
    releaseResources = isCompletedLeadStatus(leadStatus.lead_status);

    const previousStatusId = record.lead_status_id;
    await record.update({ ...data, ...(userId ? { updated_by: userId } : {}) });
    if (releaseResources) {
      await releaseAssignedResources(id);
    }

    let whatsappResult = null;
    if (previousStatusId !== lead_status_id) {
      try {
        if (isTripCompletedStatus(leadStatus.lead_status)) {
          whatsappResult = await sendTripCompletedInvoiceWhatsApp(id);
        } else if (isBookingConfirmedStatus(leadStatus.lead_status)) {
          whatsappResult = await whatsappNotification.sendBookingConfirmedWhatsApp({ id }, leadStatus);
        } else {
          const fullEnquiry = await base.getById(id);
          whatsappResult = await whatsappNotification.sendForLeadStatusChange(fullEnquiry, leadStatus);
        }
      } catch (err) {
        logger.warn('WhatsApp notification failed after lead status update', {
          enquiryId: id,
          leadStatusId: lead_status_id,
          message: err.message,
        });
        whatsappResult = { skipped: true, reason: 'send_failed', error: err.message };
      }
    }

    const updated = await base.getById(id);
    const json = updated?.toJSON ? updated.toJSON() : updated;
    if (whatsappResult) json.whatsapp = whatsappResult;
    return json;
  }
  if (Object.keys(data).length === 0) {
    throw new AppError('Provide status or lead_status_id to update', 400);
  }
  if (userId) data.updated_by = userId;
  await record.update(data);
  if (releaseResources) {
    await releaseAssignedResources(id);
  }
  return base.getById(id);
};

const submitPublic = async (payload) => create(payload, null);

const convertToLead = async (id, userId = null) => {
  const enquiry = await base.getById(id);
  if (enquiry.lead_id && enquiry.is_converted) {
    throw new AppError('Enquiry is already converted to a lead', 400);
  }
  const lead = await createLeadFromEnquiry(enquiry, userId);
  return { enquiry: await base.getById(id), lead };
};

const calculateDistance = (body) => distanceService.calculateDrivingDistance(body);
const calculateTripCost = (body) => tripCostService.calculateTripCost(body);
const searchPlaces = (query) => distanceService.searchPlaces(query);

const getPublicMasters = async () => {
  const [countries, leadSources] = await Promise.all([
    Country.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'code', 'currency_per_rupees', 'phone_code'],
      order: [['name', 'ASC']],
    }),
    LeadSourceType.findAll({
      where: { is_active: true },
      attributes: ['id', 'lead_source_type'],
      order: [['lead_source_type', 'ASC']],
    }),
  ]);
  return { countries, leadSources };
};

const getPublicStates = async (countryId) => {
  if (!countryId) return [];
  return State.findAll({
    where: { country_id: countryId, is_active: true },
    attributes: ['id', 'name', 'code', 'country_id'],
    order: [['name', 'ASC']],
  });
};

const getPublicCities = async (stateId) => {
  if (!stateId) return [];
  return City.findAll({
    where: { state_id: stateId, is_active: true },
    attributes: ['id', 'name', 'code', 'state_id', 'country_id'],
    order: [['name', 'ASC']],
  });
};

const userLabel = (user) => {
  if (!user) return 'System';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'User';
};

const listNotes = async (enquiryId) => {
  await base.getById(enquiryId);
  return EnquiryNote.findAll({
    where: { enquiry_id: enquiryId },
    include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    order: [['created_at', 'DESC']],
  });
};

const addNote = async (enquiryId, noteText, userId = null) => {
  await base.getById(enquiryId);
  const text = String(noteText || '').trim();
  if (!text) throw new AppError('Note is required', 400);

  const note = await EnquiryNote.create({
    enquiry_id: enquiryId,
    note: text,
    created_by: userId,
  });

  if (userId) {
    await Enquiry.update({ updated_by: userId }, { where: { id: enquiryId } });
  }

  return EnquiryNote.findByPk(note.id, {
    include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }],
  });
};

const getHistory = async (enquiryId) => {
  const enquiry = await base.getById(enquiryId);
  const notes = await EnquiryNote.findAll({
    where: { enquiry_id: enquiryId },
    include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    order: [['created_at', 'ASC']],
  });

  const rows = [];

  rows.push({
    id: `created-${enquiry.id}`,
    date: enquiry.created_at || enquiry.createdAt,
    action: 'Created',
    details: `Enquiry ${enquiry.enquiry_code} created`,
    user: userLabel(enquiry.creator),
  });

  if (enquiry.leadStatus) {
    rows.push({
      id: `lead-status-${enquiry.id}`,
      date: enquiry.updated_at || enquiry.updatedAt || enquiry.created_at,
      action: 'Lead Status',
      details: enquiry.leadStatus.lead_status,
      user: userLabel(enquiry.updater || enquiry.creator),
    });
  }

  if (enquiry.status) {
    rows.push({
      id: `status-${enquiry.id}`,
      date: enquiry.updated_at || enquiry.updatedAt || enquiry.created_at,
      action: 'Enquiry Status',
      details: String(enquiry.status).replace(/_/g, ' '),
      user: userLabel(enquiry.updater || enquiry.creator),
    });
  }

  if (enquiry.assignee) {
    rows.push({
      id: `assign-${enquiry.id}`,
      date: enquiry.updated_at || enquiry.updatedAt || enquiry.created_at,
      action: 'Assigned',
      details: `Assigned to ${userLabel(enquiry.assignee)}`,
      user: userLabel(enquiry.updater || enquiry.creator),
    });
  }

  notes.forEach((n) => {
    rows.push({
      id: n.id,
      date: n.created_at || n.createdAt,
      action: 'Note',
      details: n.note,
      user: userLabel(n.creator),
    });
  });

  const tripStatusLogs = await EnquiryVehicleAssignmentStatusLog.findAll({
    where: { enquiry_id: enquiryId },
    include: [
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'full_name'],
        required: false,
        paranoid: false,
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false,
      },
    ],
    order: [['recorded_at', 'ASC']],
  });

  tripStatusLogs.forEach((log) => {
    const data = log.toJSON ? log.toJSON() : log;
    rows.push({
      id: data.id,
      date: data.recorded_at,
      action: 'Driver Trip Status',
      details: data.label || String(data.status || '').replace(/_/g, ' '),
      user: data.driver?.full_name || userLabel(data.creator) || 'Driver',
    });
  });

  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  return rows;
};

const listVehicleAssignments = async (enquiryId) => {
  const normalizeStatusHistory = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const enquiry = await base.getById(enquiryId);
  const enquiryCompleted = isCompletedLeadStatus(enquiry.leadStatus?.lead_status);
  const rows = await EnquiryVehicleAssignment.findAll({
    where: { enquiry_id: enquiryId },
    include: [
      {
        model: Vehicle,
        as: 'vehicle',
        required: false,
        paranoid: false,
        attributes: VEHICLE_LIST_ATTRS,
      },
      {
        model: Driver,
        as: 'driver',
        required: false,
        paranoid: false,
        attributes: [
          'id',
          'code',
          'full_name',
          'phone',
          'photo',
          'license_number',
          'availability_status',
          'is_active',
          'driver_type',
        ],
      },
    ],
    order: [
      ['start_date', 'ASC'],
      ['created_at', 'DESC'],
    ],
  });

  const assignmentIds = rows.map((row) => row.id);
  const statusLogRows = assignmentIds.length
    ? await EnquiryVehicleAssignmentStatusLog.findAll({
        where: { assignment_id: { [Op.in]: assignmentIds } },
        order: [
          ['recorded_at', 'ASC'],
          ['created_at', 'ASC'],
        ],
      })
    : [];

  const statusLogsByAssignment = {};
  statusLogRows.forEach((log) => {
    const data = log.toJSON ? log.toJSON() : log;
    if (!statusLogsByAssignment[data.assignment_id]) {
      statusLogsByAssignment[data.assignment_id] = [];
    }
    statusLogsByAssignment[data.assignment_id].push({
      status: data.status,
      label: data.label,
      at: data.recorded_at,
    });
  });

  return rows.map((row) => {
    const data = row.toJSON ? row.toJSON() : row;
    const assignmentClosed =
      enquiryCompleted ||
      ['completed', 'cancelled'].includes(String(data.status || '').toLowerCase()) ||
      String(data.trip_status || '').toLowerCase() === 'trip_closed';
    const liveStatus = assignmentClosed ? 'available' : 'on_trip';
    const statusLogs = statusLogsByAssignment[data.id] || [];
    const tripStatusHistory = statusLogs.length
      ? statusLogs
      : normalizeStatusHistory(data.trip_status_history);
    return {
      ...data,
      status_logs: statusLogs,
      trip_status_history: tripStatusHistory,
      vehicle: data.vehicle ? { ...data.vehicle, availability_status: liveStatus } : data.vehicle,
      driver: data.driver ? { ...data.driver, availability_status: liveStatus } : data.driver,
    };
  });
};

const listAssignableResources = async () => {
  const activeWhere = { [Op.or]: [{ is_active: true }, { is_active: null }] };
  const [{ vehicleIds: busyVehicles, driverIds: busyDrivers }, vehicles, drivers] =
    await Promise.all([
      getBusyResourceIds(),
      Vehicle.findAll({
        where: activeWhere,
        attributes: VEHICLE_LIST_ATTRS,
        order: [
          ['name', 'ASC'],
          ['created_at', 'DESC'],
        ],
      }),
      Driver.findAll({
        where: activeWhere,
        attributes: [
          'id',
          'code',
          'full_name',
          'phone',
          'email',
          'license_number',
          'availability_status',
          'is_active',
          'vehicle_id',
          'photo',
          'driver_type',
        ],
        order: [
          ['full_name', 'ASC'],
          ['created_at', 'DESC'],
        ],
      }),
    ]);

  return {
    vehicles: vehicles.map((row) => {
      const data = row.toJSON ? row.toJSON() : row;
      return {
        ...data,
        availability_status: busyVehicles.has(String(data.id)) ? 'on_trip' : 'available',
      };
    }),
    drivers: drivers.map((row) => {
      const data = row.toJSON ? row.toJSON() : row;
      return {
        ...data,
        availability_status: busyDrivers.has(String(data.id)) ? 'on_trip' : 'available',
      };
    }),
  };
};

const addVehicleAssignment = async (enquiryId, payload, userId = null) => {
  const enquiry = await base.getById(enquiryId);
  if (!payload.vehicle_id) throw new AppError('Vehicle is required', 400);
  if (!payload.start_date || !payload.end_date) {
    throw new AppError('Start date and end date are required', 400);
  }
  if (payload.end_date < payload.start_date) {
    throw new AppError('End date must be on or after start date', 400);
  }

  const vehicle = await Vehicle.findByPk(payload.vehicle_id);
  if (!vehicle || vehicle.is_active === false) throw new AppError('Vehicle not found', 404);

  let driverId = payload.driver_id || null;
  if (driverId) {
    const driver = await Driver.findByPk(driverId);
    if (!driver || driver.is_active === false) throw new AppError('Driver not found', 404);
  }

  const assignment = await EnquiryVehicleAssignment.create({
    enquiry_id: enquiryId,
    vehicle_id: payload.vehicle_id,
    driver_id: driverId,
    start_date: payload.start_date,
    end_date: payload.end_date,
    pickup_location:
      payload.pickup_location || enquiry.travel_from_destination || null,
    drop_location: payload.drop_location || enquiry.travel_to_destination || null,
    amount: payload.amount != null ? payload.amount : 0,
    status: payload.status || 'allocated',
    notes: payload.notes || null,
    created_by: userId,
    updated_by: userId,
  });

  if (!isCompletedLeadStatus(enquiry.leadStatus?.lead_status)) {
    await markOnTrip({ vehicleId: payload.vehicle_id, driverId });
  }

  const assignmentWithDetails = await EnquiryVehicleAssignment.findByPk(assignment.id, {
    include: [
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: VEHICLE_LIST_ATTRS,
      },
      {
        model: Driver,
        as: 'driver',
        attributes: [
          'id',
          'code',
          'full_name',
          'phone',
          'photo',
          'license_number',
          'availability_status',
          'is_active',
          'driver_type',
        ],
      },
    ],
  });

  let whatsappResult = null;
  try {
    whatsappResult = await whatsappNotification.sendVehicleDriverAssignedWhatsApp({
      enquiry,
      assignment: assignmentWithDetails,
    });
  } catch (err) {
    logger.warn('WhatsApp vehicle/driver assignment notification failed', {
      enquiryId,
      assignmentId: assignment.id,
      message: err.message,
    });
    whatsappResult = { skipped: true, reason: 'send_failed', error: err.message };
  }

  const result = assignmentWithDetails || assignment;
  if (result?.toJSON) {
    const json = result.toJSON();
    json.whatsapp = whatsappResult;
    return json;
  }
  return { ...(result || {}), whatsapp: whatsappResult };
};

const shareDriverLoginWhatsApp = async (enquiryId, assignmentId, payload = {}) => {
  return whatsappNotification.sendDriverLoginCredentialsWhatsApp({
    enquiryId,
    assignmentId,
    username: payload.username,
    password: payload.password,
    loginLink: payload.login_link || payload.loginLink,
  });
};

const invoiceQuotationInclude = [
  { model: Package, as: 'package', attributes: ['id', 'name'] },
  {
    model: Itinerary,
    as: 'itinerary',
    attributes: ['id', 'title', 'from_date', 'to_date', 'days', 'nights', 'pricing'],
  },
];

const resolveInvoiceNumber = (quotation, enquiry) => {
  if (quotation?.quotation_code) {
    return String(quotation.quotation_code).replace(/^QT/i, 'INV');
  }
  if (enquiry?.enquiry_code) {
    return String(enquiry.enquiry_code).replace(/^ENQ/i, 'INV');
  }
  return '—';
};

const resolveInvoiceSourceForEnquiry = async (enquiryId) => {
  const standalone = await quotationService.getStandaloneByEnquiry(enquiryId);
  if (standalone) {
    let itinerary = null;
    if (standalone.itinerary_id) {
      itinerary = await Itinerary.findByPk(standalone.itinerary_id);
    }
    return { quotation: standalone, itinerary };
  }

  const latestQuotation = await Quotation.findOne({
    where: { enquiry_id: enquiryId },
    include: invoiceQuotationInclude,
    order: [['updated_at', 'DESC']],
  });
  if (latestQuotation) {
    const itinerary =
      latestQuotation.itinerary ||
      (latestQuotation.itinerary_id
        ? await Itinerary.findByPk(latestQuotation.itinerary_id)
        : null);
    return { quotation: latestQuotation, itinerary };
  }

  const itinerary = await Itinerary.findOne({
    where: { enquiry_id: enquiryId },
    order: [['updated_at', 'DESC']],
  });
  return { quotation: null, itinerary };
};

const buildInvoiceShareContext = async (enquiryId, payload = {}) => {
  const enquiry = await Enquiry.findByPk(enquiryId, {
    include: [
      { model: Destination, as: 'destination', attributes: ['id', 'name'] },
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: Package, as: 'package', attributes: ['id', 'name'] },
    ],
  });
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const isDirect =
    payload.is_direct === true ||
    payload.is_direct === 'true' ||
    payload.is_direct === '1' ||
    payload.is_direct === 1;

  let quotation = null;
  let itinerary = null;

  if (payload.quotation_id) {
    quotation = await Quotation.findByPk(payload.quotation_id, {
      include: invoiceQuotationInclude,
    });
  } else if (isDirect) {
    quotation = await quotationService.getStandaloneByEnquiry(enquiryId);
  } else if (payload.itinerary_id) {
    quotation = await quotationService.getByEnquiryAndItinerary(enquiryId, payload.itinerary_id);
    itinerary = await Itinerary.findByPk(payload.itinerary_id);
  } else {
    const resolved = await resolveInvoiceSourceForEnquiry(enquiryId);
    quotation = resolved.quotation;
    itinerary = resolved.itinerary;
  }

  if (!itinerary && quotation?.itinerary_id) {
    itinerary = await Itinerary.findByPk(quotation.itinerary_id);
  }
  if (!itinerary && payload.itinerary_id && !isDirect) {
    itinerary = await Itinerary.findByPk(payload.itinerary_id);
  }

  const payments = await Payment.findAll({
    where: { enquiry_id: enquiryId },
    attributes: ['advance_amount', 'quotation_amount'],
    order: [['created_at', 'DESC']],
  });
  const paidAmount = Math.round(
    payments.reduce((sum, row) => sum + (Number(row.advance_amount) || 0), 0)
  );

  const enquiryPlain = enquiry.toJSON ? enquiry.toJSON() : enquiry;
  const quotationPlain = quotation?.toJSON ? quotation.toJSON() : quotation;
  const itineraryPlain =
    quotationPlain?.itinerary ||
    (itinerary?.toJSON ? itinerary.toJSON() : itinerary);
  const totalAmount = computeInvoiceTotalAmount({
    quotation: quotationPlain,
    itinerary: itineraryPlain,
    enquiry: enquiryPlain,
    payments,
  });
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);

  return {
    enquiry: enquiryPlain,
    quotation: quotationPlain,
    itinerary: itineraryPlain,
    invoice_number: resolveInvoiceNumber(quotationPlain, enquiryPlain),
    invoice_date: new Date(),
    total_amount: totalAmount,
    paid_amount: paidAmount,
    balance_amount: balanceAmount,
    trip_from:
      quotationPlain?.travel_from ||
      itineraryPlain?.from_date ||
      enquiryPlain.travel_from ||
      null,
    trip_to:
      quotationPlain?.travel_to || itineraryPlain?.to_date || enquiryPlain.travel_to || null,
  };
};

const sendTripCompletedInvoiceWhatsApp = async (enquiryId, payload = {}) => {
  const invoiceContext = await buildInvoiceShareContext(enquiryId, payload);
  const branding = await masterService.getBranding();
  const imageBuffer = await enquiryInvoiceImageService.generateEnquiryInvoiceImageBuffer({
    enquiry: invoiceContext.enquiry,
    quotation: invoiceContext.quotation,
    itinerary: invoiceContext.itinerary,
    invoiceContext,
    branding,
  });

  return whatsappNotification.sendTripCompletedWhatsApp({
    enquiry: invoiceContext.enquiry,
    invoiceContext,
    imageBuffer,
  });
};

const shareInvoiceWhatsApp = async (enquiryId, imageBuffer, payload = {}) => {
  const enquiry = await Enquiry.findByPk(enquiryId, {
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'phone',
      'email',
      'travel_from_destination',
      'travel_to_destination',
    ],
  });
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const enquiryData = enquiry.toJSON ? enquiry.toJSON() : enquiry;

  return whatsappNotification.sendInvoiceWhatsApp({
    enquiry: enquiryData,
    invoiceContext: {
      invoice_number: payload.invoice_number || null,
      trip_id: payload.trip_id || enquiryData.enquiry_code || null,
      enquiry_code: payload.trip_id || enquiryData.enquiry_code || null,
      grand_total: payload.grand_total ?? null,
      travel_from_destination:
        payload.travel_from_destination || enquiryData.travel_from_destination || null,
      travel_to_destination:
        payload.travel_to_destination || enquiryData.travel_to_destination || null,
    },
    imageBuffer,
  });
};

const isFullyPaidStatus = (statusName = '') => /fully\s*paid/i.test(String(statusName || ''));

const maybeMarkFullyPaid = async (enquiryId, userId = null) => {
  if (!enquiryId) return null;

  const enquiry = await Enquiry.findByPk(enquiryId, {
    include: [{ model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] }],
  });
  if (!enquiry) return null;

  const currentName = enquiry.leadStatus?.lead_status || '';
  if (isFullyPaidStatus(currentName) || isCompletedLeadStatus(currentName)) {
    return null;
  }

  const invoiceContext = await buildInvoiceShareContext(enquiryId);
  if (invoiceContext.total_amount <= 0 || invoiceContext.balance_amount > 0) {
    return null;
  }

  const fullyPaidStatus = await LeadStatus.findOne({
    where: { lead_status: { [Op.like]: 'Fully Paid' }, is_active: true },
  });
  if (!fullyPaidStatus) return null;

  await enquiry.update({
    lead_status_id: fullyPaidStatus.id,
    ...(userId ? { updated_by: userId } : {}),
  });

  logger.info('Enquiry marked Fully Paid after payment', {
    enquiryId,
    previousStatus: currentName,
  });

  return fullyPaidStatus;
};

const updateVehicleAssignment = async (assignmentId, payload, userId = null) => {
  const record = await EnquiryVehicleAssignment.findByPk(assignmentId);
  if (!record) throw new AppError('Vehicle assignment not found', 404);

  if (payload.start_date && payload.end_date && payload.end_date < payload.start_date) {
    throw new AppError('End date must be on or after start date', 400);
  }
  if (payload.vehicle_id) {
    const vehicle = await Vehicle.findByPk(payload.vehicle_id);
    if (!vehicle || vehicle.is_active === false) throw new AppError('Vehicle not found', 404);
  }
  if (payload.driver_id) {
    const driver = await Driver.findByPk(payload.driver_id);
    if (!driver || driver.is_active === false) throw new AppError('Driver not found', 404);
  }

  const previousVehicleId = record.vehicle_id;
  const previousDriverId = record.driver_id;

  await record.update({
    ...payload,
    updated_by: userId,
  });

  const nextVehicleId = record.vehicle_id;
  const nextDriverId = record.driver_id;
  await markOnTrip({ vehicleId: nextVehicleId, driverId: nextDriverId });
  if (previousVehicleId && previousVehicleId !== nextVehicleId) {
    await setAvailableIfIdle({ vehicleId: previousVehicleId, excludeEnquiryId: record.enquiry_id });
  }
  if (previousDriverId && previousDriverId !== nextDriverId) {
    await setAvailableIfIdle({ driverId: previousDriverId, excludeEnquiryId: record.enquiry_id });
  }

  return EnquiryVehicleAssignment.findByPk(assignmentId, { include: assignmentIncludes });
};

const removeVehicleAssignment = async (assignmentId) => {
  const record = await EnquiryVehicleAssignment.findByPk(assignmentId);
  if (!record) throw new AppError('Vehicle assignment not found', 404);
  const vehicleId = record.vehicle_id;
  const driverId = record.driver_id;
  const enquiryId = record.enquiry_id;
  await record.destroy();
  await setAvailableIfIdle({ vehicleId, driverId, excludeEnquiryId: enquiryId });
  return true;
};

const getMonthlyTrips = async ({ vehicleId = null, driverId = null, year, month } = {}) => {
  if (!vehicleId && !driverId) {
    throw new AppError('vehicle_id or driver_id is required', 400);
  }

  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;
  const { start, end } = monthRange(y, m);

  const enquiryWhere = {
    ...overlapsMonth(start, end),
  };
  if (vehicleId) enquiryWhere.vehicle_id = vehicleId;
  if (driverId) enquiryWhere.driver_id = driverId;

  const enquiryTrips = (
    await EnquiryVehicleAssignment.findAll({
    where: enquiryWhere,
    include: assignmentIncludes,
    order: [['start_date', 'ASC']],
  })
  ).filter(isOpenVehicleTrip);

  const bookingWhere = {
    ...overlapsMonth(start, end),
  };
  if (vehicleId) bookingWhere.vehicle_id = vehicleId;

  let bookingTrips = [];
  if (vehicleId || driverId) {
    bookingTrips = await VehicleAllocation.findAll({
      where: bookingWhere,
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'name', 'code', 'type', 'registration_number', 'ownership', 'availability_status'],
        },
        {
          model: Booking,
          as: 'booking',
          attributes: [
            'id',
            'booking_code',
            'customer_name',
            'travel_from',
            'travel_to',
            'enquiry_id',
          ],
          include: [
            {
              model: Enquiry,
              as: 'enquiry',
              attributes: ['id', 'enquiry_code', 'customer_name', 'lead_status_id'],
              required: false,
              include: [{ model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] }],
            },
          ],
        },
      ],
      order: [['start_date', 'ASC']],
    });

    if (driverId) {
      const driver = await Driver.findByPk(driverId);
      const driverName = String(driver?.full_name || '')
        .trim()
        .toLowerCase();
      const driverPhone = String(driver?.phone || '').trim();
      bookingTrips = bookingTrips.filter((row) => {
        const name = String(row.driver_name || '')
          .trim()
          .toLowerCase();
        const phone = String(row.driver_phone || '').trim();
        return (
          (driverName && name && name === driverName) ||
          (driverPhone && phone && phone === driverPhone)
        );
      });
    }
  }

  bookingTrips = bookingTrips.filter(
    (row) => !isCompletedLeadStatus(row.booking?.enquiry?.leadStatus?.lead_status)
  );

  const trips = [
    ...enquiryTrips.map((row) => ({
      id: row.id,
      source: 'enquiry',
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      pickup_location: row.pickup_location,
      drop_location: row.drop_location,
      amount: row.amount,
      notes: row.notes,
      vehicle: row.vehicle,
      driver: row.driver,
      enquiry: row.enquiry,
      booking: null,
      customer_name: row.enquiry?.customer_name || null,
      reference_code: row.enquiry?.enquiry_code || null,
    })),
    ...bookingTrips.map((row) => ({
      id: row.id,
      source: 'booking',
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      pickup_location: null,
      drop_location: null,
      amount: row.amount,
      notes: row.notes,
      vehicle: row.vehicle,
      driver: row.driver_name
        ? { full_name: row.driver_name, phone: row.driver_phone }
        : null,
      enquiry: row.booking?.enquiry || null,
      booking: row.booking
        ? {
            id: row.booking.id,
            booking_code: row.booking.booking_code,
            customer_name: row.booking.customer_name,
          }
        : null,
      customer_name: row.booking?.customer_name || null,
      reference_code: row.booking?.booking_code || null,
    })),
  ].sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));

  return {
    year: Number(y),
    month: Number(m),
    start,
    end,
    count: trips.length,
    trips,
  };
};

/** All assigned trips for a vehicle or driver (enquiry + booking sources). */
const listAssignedTrips = async ({ vehicleId = null, driverId = null } = {}) => {
  if (!vehicleId && !driverId) {
    throw new AppError('vehicle_id or driver_id is required', 400);
  }

  const enquiryWhere = {};
  if (vehicleId) enquiryWhere.vehicle_id = vehicleId;
  if (driverId) enquiryWhere.driver_id = driverId;

  const enquiryTrips = (
    await EnquiryVehicleAssignment.findAll({
    where: enquiryWhere,
    include: assignmentIncludes,
    order: [['start_date', 'DESC']],
  })
  ).filter(isOpenVehicleTrip);

  const bookingWhere = {};
  if (vehicleId) bookingWhere.vehicle_id = vehicleId;

  let bookingTrips = [];
  if (vehicleId || driverId) {
    bookingTrips = await VehicleAllocation.findAll({
      where: bookingWhere,
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'name', 'code', 'type', 'registration_number', 'ownership', 'availability_status'],
        },
        {
          model: Booking,
          as: 'booking',
          attributes: [
            'id',
            'booking_code',
            'customer_name',
            'travel_from',
            'travel_to',
            'enquiry_id',
          ],
          include: [
            {
              model: Enquiry,
              as: 'enquiry',
              attributes: ['id', 'enquiry_code', 'customer_name', 'lead_status_id'],
              required: false,
              include: [{ model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] }],
            },
          ],
        },
      ],
      order: [['start_date', 'DESC']],
    });

    if (driverId) {
      const driver = await Driver.findByPk(driverId);
      const driverName = String(driver?.full_name || '')
        .trim()
        .toLowerCase();
      const driverPhone = String(driver?.phone || '').trim();
      bookingTrips = bookingTrips.filter((row) => {
        const name = String(row.driver_name || '')
          .trim()
          .toLowerCase();
        const phone = String(row.driver_phone || '').trim();
        return (
          (driverName && name && name === driverName) ||
          (driverPhone && phone && phone === driverPhone)
        );
      });
    }
  }

  bookingTrips = bookingTrips.filter(
    (row) => !isCompletedLeadStatus(row.booking?.enquiry?.leadStatus?.lead_status)
  );

  const trips = [
    ...enquiryTrips.map((row) => ({
      id: row.id,
      source: 'enquiry',
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      pickup_location: row.pickup_location,
      drop_location: row.drop_location,
      amount: row.amount,
      notes: row.notes,
      vehicle: row.vehicle,
      driver: row.driver,
      enquiry: row.enquiry,
      booking: null,
      customer_name: row.enquiry?.customer_name || null,
      reference_code: row.enquiry?.enquiry_code || null,
      travel_from: row.enquiry?.travel_from || null,
      travel_to: row.enquiry?.travel_to || null,
    })),
    ...bookingTrips.map((row) => ({
      id: row.id,
      source: 'booking',
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      pickup_location: null,
      drop_location: null,
      amount: row.amount,
      notes: row.notes,
      vehicle: row.vehicle,
      driver: row.driver_name
        ? { full_name: row.driver_name, phone: row.driver_phone }
        : null,
      enquiry: row.booking?.enquiry || null,
      booking: row.booking
        ? {
            id: row.booking.id,
            booking_code: row.booking.booking_code,
            customer_name: row.booking.customer_name,
          }
        : null,
      customer_name: row.booking?.customer_name || null,
      reference_code: row.booking?.booking_code || null,
      travel_from: row.booking?.travel_from || null,
      travel_to: row.booking?.travel_to || null,
    })),
  ].sort((a, b) => String(b.start_date || '').localeCompare(String(a.start_date || '')));

  return {
    count: trips.length,
    trips,
  };
};

module.exports = {
  ...base,
  create,
  update,
  updateStatus,
  submitPublic,
  convertToLead,
  calculateDistance,
  calculateTripCost,
  searchPlaces,
  getPublicMasters,
  getPublicStates,
  getPublicCities,
  listNotes,
  addNote,
  getHistory,
  listVehicleAssignments,
  listAssignableResources,
  addVehicleAssignment,
  shareDriverLoginWhatsApp,
  sendTripCompletedInvoiceWhatsApp,
  shareInvoiceWhatsApp,
  maybeMarkFullyPaid,
  updateVehicleAssignment,
  removeVehicleAssignment,
  getMonthlyTrips,
  listAssignedTrips,
};
