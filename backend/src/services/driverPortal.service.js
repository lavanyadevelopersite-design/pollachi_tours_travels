const { Op } = require('sequelize');
const {
  User,
  Role,
  Permission,
  RolePermission,
  Driver,
  EnquiryVehicleAssignment,
  EnquiryVehicleAssignmentStatusLog,
  Enquiry,
  EnquiryNote,
  Vehicle,
} = require('../models');
const AppError = require('../utils/AppError');
const { sanitizeUser } = require('../utils/helpers');
const { DRIVER_TRIP_STATUSES } = require('../utils/constants');
const { getFileUrl, normalizeUploadedImage } = require('./file.service');
const tokenService = require('./token.service');
const loginHistoryService = require('./loginHistory.service');
const { sequelize } = require('../config/database');

const STATUS_MAP = Object.fromEntries(DRIVER_TRIP_STATUSES.map((s) => [s.value, s]));
const STATUS_ORDER = DRIVER_TRIP_STATUSES.map((s) => s.value);

const statusIndex = (status) => {
  if (!status) return -1;
  return STATUS_ORDER.indexOf(status);
};

const parseStatusHistory = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const recordDriverStatusLog = async ({
  assignmentId,
  enquiryId,
  driverId,
  userId,
  status,
}) => {
  const label = STATUS_MAP[status]?.label || status;
  const recordedAt = new Date();

  await EnquiryVehicleAssignmentStatusLog.create({
    assignment_id: assignmentId,
    enquiry_id: enquiryId,
    driver_id: driverId,
    status,
    label,
    recorded_at: recordedAt,
    created_by: userId,
  });

  const entry = JSON.stringify({
    status,
    label,
    at: recordedAt.toISOString(),
  });

  await sequelize.query(
    `UPDATE enquiry_vehicle_assignments
     SET trip_status_history = JSON_ARRAY_APPEND(
       COALESCE(trip_status_history, JSON_ARRAY()),
       '$',
       CAST(:entry AS JSON)
     )
     WHERE id = :assignmentId`,
    { replacements: { assignmentId, entry } }
  );
};

const loadStatusLogsForAssignment = async (assignmentId) => {
  const rows = await EnquiryVehicleAssignmentStatusLog.findAll({
    where: { assignment_id: assignmentId },
    order: [['recorded_at', 'ASC']],
  });
  return rows.map((row) => {
    const data = row.toJSON ? row.toJSON() : row;
    return {
      status: data.status,
      label: data.label,
      at: data.recorded_at,
    };
  });
};

const splitName = (fullName = '') => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first_name: 'Driver', last_name: 'User' };
  if (parts.length === 1) return { first_name: parts[0], last_name: 'Driver' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
};

const portalEmailForDriver = (driver) => {
  const id = String(driver.id || '').replace(/-/g, '');
  return `driver.${id}@portal.local`;
};

const legacyPortalEmailForDriver = (driver) => {
  const phone = String(driver.phone || '').replace(/\D/g, '');
  if (!phone) return null;
  return `driver.${phone}@portal.local`;
};

const findPortalUserForDriver = async (driver) => {
  if (!driver?.id) return null;

  const candidates = [
    portalEmailForDriver(driver),
    legacyPortalEmailForDriver(driver),
    driver.email ? String(driver.email).trim().toLowerCase() : null,
  ].filter(Boolean);

  let user = await User.findOne({
    where: { driver_id: driver.id },
    paranoid: false,
  });
  if (user?.deleted_at) await user.restore();
  if (user) return user;

  for (const email of candidates) {
    user = await User.findOne({
      where: { email },
      paranoid: false,
      include: [{ model: Role, as: 'role', attributes: ['id', 'code'] }],
    });
    if (!user) continue;
    if (user.deleted_at) await user.restore();
    if (user.driver_id && user.driver_id !== driver.id) continue;
    if (!user.driver_id || user.role?.code === 'driver') return user;
  }

  return null;
};

const syncDriverPortalUser = async (driver, portalPassword = null) => {
  if (!driver?.id) return null;
  const role = await ensureDriverRole();
  const { first_name, last_name } = splitName(driver.full_name);
  const email = portalEmailForDriver(driver);

  let user = await findPortalUserForDriver(driver);

  if (!user) {
    if (!portalPassword) return null;
    try {
      user = await User.create({
        first_name,
        last_name,
        email,
        phone: driver.phone,
        password: portalPassword,
        role_id: role.id,
        driver_id: driver.id,
        is_active: Boolean(driver.is_active),
      });
    } catch (error) {
      if (error.name !== 'SequelizeUniqueConstraintError') throw error;
      user = await findPortalUserForDriver(driver);
      if (!user) throw error;
    }
  }

  const updates = {
    first_name,
    last_name,
    email,
    phone: driver.phone,
    role_id: role.id,
    driver_id: driver.id,
    is_active: Boolean(driver.is_active),
  };
  if (portalPassword) updates.password = portalPassword;
  await user.update(updates);

  return getUserWithRole({ id: user.id });
};

const ensureDriverRole = async () => {
  const [role] = await Role.findOrCreate({
    where: { code: 'driver' },
    defaults: {
      name: 'Driver',
      code: 'driver',
      description: 'Driver portal access for assigned trips',
      is_active: true,
    },
  });

  const needed = ['driver_trips.view', 'driver_trips.edit'];
  for (const code of needed) {
    const [module, action] = code.split('.');
    const [permission] = await Permission.findOrCreate({
      where: { code },
      defaults: {
        name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
        code,
        module,
        action,
        description: `Permission to ${action} ${module}`,
      },
    });
    await RolePermission.findOrCreate({
      where: { role_id: role.id, permission_id: permission.id },
      defaults: { role_id: role.id, permission_id: permission.id },
    });
  }

  return role;
};

const getUserWithRole = async (where) =>
  User.findOne({
    where,
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      },
      {
        model: Driver,
        as: 'driver',
        attributes: [
          'id',
          'code',
          'full_name',
          'phone',
          'email',
          'availability_status',
          'is_active',
        ],
      },
    ],
  });

const findDriverByLogin = async (login) => {
  const raw = String(login || '').trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  const email = raw.toLowerCase();

  return Driver.findOne({
    where: {
      is_active: true,
      [Op.or]: [
        { phone: raw },
        ...(digits ? [{ phone: digits }, { phone: { [Op.like]: `%${digits.slice(-10)}` } }] : []),
        { email },
        { code: raw.toUpperCase() },
      ],
    },
  });
};

const login = async ({ login: loginId, password, rememberMe = true }, meta = {}) => {
  const driver = await findDriverByLogin(loginId);
  if (!driver) throw new AppError('Invalid phone/email or password', 401);

  let user = await getUserWithRole({ driver_id: driver.id, is_active: true });
  if (!user) {
    throw new AppError(
      'Driver portal access is not enabled. Ask admin to set a portal password.',
      403
    );
  }

  if (!(await user.comparePassword(password))) {
    throw new AppError('Invalid phone/email or password', 401);
  }
  if (!user.is_active) throw new AppError('Account is deactivated', 403);

  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user, rememberMe);
  const refreshRecord = await tokenService.saveRefreshToken(user.id, refreshToken, {
    rememberMe,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await loginHistoryService.startSession({
    userId: user.id,
    refreshTokenId: refreshRecord.id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await user.update({
    last_login_at: new Date(),
    last_activity_at: new Date(),
  });

  const sanitized = sanitizeUser(user);
  sanitized.driver = user.driver
    ? user.driver.toJSON
      ? user.driver.toJSON()
      : user.driver
    : {
        id: driver.id,
        code: driver.code,
        full_name: driver.full_name,
        phone: driver.phone,
        email: driver.email,
      };

  return {
    user: sanitized,
    accessToken,
    refreshToken,
  };
};

const me = async (userId) => {
  const user = await getUserWithRole({ id: userId });
  if (!user || !user.driver_id) throw new AppError('Driver profile not found', 404);
  const sanitized = sanitizeUser(user);
  sanitized.driver = user.driver?.toJSON ? user.driver.toJSON() : user.driver;
  return sanitized;
};

const tripIncludes = [
  {
    model: Vehicle,
    as: 'vehicle',
    attributes: ['id', 'name', 'code', 'type', 'registration_number', 'capacity', 'ownership'],
  },
  {
    model: Enquiry,
    as: 'enquiry',
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'phone',
      'travel_from',
      'travel_to',
      'travel_from_destination',
      'travel_to_destination',
      'adults',
      'children',
      'infants',
      'status',
    ],
  },
];

const serializeTrip = (row) => {
  const data = row.toJSON ? row.toJSON() : row;
  const enquiry = data.enquiry || {};
  return {
    id: data.id,
    enquiry_id: data.enquiry_id,
    enquiry_code: enquiry.enquiry_code || null,
    customer_name: enquiry.customer_name || null,
    customer_phone: enquiry.phone || null,
    start_date: data.start_date,
    end_date: data.end_date,
    pickup_location:
      data.pickup_location || enquiry.travel_from_destination || enquiry.travel_from || null,
    drop_location:
      data.drop_location || enquiry.travel_to_destination || enquiry.travel_to || null,
    assignment_status: data.status,
    trip_status: data.trip_status || null,
    trip_status_label: data.trip_status
      ? STATUS_MAP[data.trip_status]?.label || data.trip_status
      : 'Assigned',
    starting_km: data.starting_km != null ? Number(data.starting_km) : null,
    starting_km_photo: data.starting_km_photo || null,
    closing_km: data.closing_km != null ? Number(data.closing_km) : null,
    closing_km_photo: data.closing_km_photo || null,
    total_km: data.total_km != null ? Number(data.total_km) : null,
    driver_update_notes: data.driver_update_notes || null,
    status_updated_at: data.status_updated_at || null,
    trip_status_history: parseStatusHistory(data.trip_status_history),
    notes: data.notes || null,
    amount: data.amount,
    vehicle: data.vehicle || null,
    enquiry: enquiry.id
      ? {
          id: enquiry.id,
          enquiry_code: enquiry.enquiry_code,
          customer_name: enquiry.customer_name,
          phone: enquiry.phone,
          adults: enquiry.adults,
          children: enquiry.children,
          infants: enquiry.infants,
          status: enquiry.status,
        }
      : null,
    is_ongoing: !['completed', 'cancelled'].includes(String(data.status || '').toLowerCase()) &&
      data.trip_status !== 'trip_closed',
    is_closed: data.trip_status === 'trip_closed' || data.status === 'completed',
  };
};

const resolveDriverId = async (user) => {
  if (user?.driver_id) return user.driver_id;
  throw new AppError('This account is not linked to a driver profile', 403);
};

const listMyTrips = async (user, { enquiry = null } = {}) => {
  const driverId = await resolveDriverId(user);
  const where = {
    driver_id: driverId,
    status: { [Op.notIn]: ['cancelled'] },
  };

  const include = [...tripIncludes];
  if (enquiry) {
    const enquiryKey = String(enquiry).trim();
    include[1] = {
      ...tripIncludes[1],
      required: true,
      where: {
        [Op.or]: [{ id: enquiryKey }, { enquiry_code: enquiryKey }],
      },
    };
  }

  const rows = await EnquiryVehicleAssignment.findAll({
    where,
    include,
    order: [
      ['start_date', 'DESC'],
      ['created_at', 'DESC'],
    ],
  });

  const trips = rows.map(serializeTrip);
  const ongoing = trips.filter((t) => t.is_ongoing);
  const assigned = trips.filter((t) => t.is_ongoing && !t.trip_status);
  const closed = trips.filter((t) => t.is_closed);

  return {
    driver_id: driverId,
    enquiry_filter: enquiry || null,
    counts: {
      total: trips.length,
      ongoing: ongoing.length,
      assigned: assigned.length,
      closed: closed.length,
    },
    status_options: DRIVER_TRIP_STATUSES,
    trips,
    ongoing,
  };
};

const getMyTrip = async (user, tripId) => {
  const driverId = await resolveDriverId(user);
  const row = await EnquiryVehicleAssignment.findOne({
    where: { id: tripId, driver_id: driverId },
    include: tripIncludes,
  });
  if (!row) throw new AppError('Trip not found or not assigned to you', 404);
  const statusLogs = await loadStatusLogsForAssignment(tripId);
  const serialized = serializeTrip(row);
  return {
    ...serialized,
    status_logs: statusLogs,
    trip_status_history: statusLogs.length ? statusLogs : serialized.trip_status_history,
    status_options: DRIVER_TRIP_STATUSES,
  };
};

const getMyTripByEnquiry = async (user, enquiryKey) => {
  const driverId = await resolveDriverId(user);
  const key = String(enquiryKey || '').trim();
  if (!key) throw new AppError('Enquiry id is required', 400);

  const row = await EnquiryVehicleAssignment.findOne({
    where: {
      driver_id: driverId,
      status: { [Op.notIn]: ['cancelled'] },
    },
    include: [
      tripIncludes[0],
      {
        ...tripIncludes[1],
        required: true,
        where: {
          [Op.or]: [{ id: key }, { enquiry_code: key }],
        },
      },
    ],
    order: [
      ['start_date', 'DESC'],
      ['created_at', 'DESC'],
    ],
  });

  if (!row) {
    throw new AppError('No trip assigned to you for this enquiry', 404);
  }

  return {
    ...serializeTrip(row),
    status_options: DRIVER_TRIP_STATUSES,
  };
};

const logDriverUpdateOnEnquiry = async (assignment, user, updates, previous = {}) => {
  if (!assignment?.enquiry_id) return;

  const enquiry = await Enquiry.findByPk(assignment.enquiry_id, {
    attributes: ['id', 'enquiry_code'],
  });
  const lines = [
    `Driver trip update for enquiry ${enquiry?.enquiry_code || assignment.enquiry_id}`,
  ];

  if (updates.trip_status && updates.trip_status !== previous.trip_status) {
    lines.push(
      `Status: ${STATUS_MAP[updates.trip_status]?.label || updates.trip_status}`
    );
  }
  if (updates.starting_km !== undefined && updates.starting_km !== previous.starting_km) {
    lines.push(`Starting KM: ${updates.starting_km}`);
  }
  if (updates.closing_km !== undefined && updates.closing_km !== previous.closing_km) {
    lines.push(`Closing KM: ${updates.closing_km}`);
  }
  if (updates.total_km !== undefined && updates.total_km !== previous.total_km) {
    lines.push(`Total trip KM: ${updates.total_km}`);
  }
  if (
    updates.driver_update_notes !== undefined &&
    updates.driver_update_notes !== previous.driver_update_notes
  ) {
    lines.push(`Notes: ${updates.driver_update_notes || '—'}`);
  }

  if (lines.length <= 1) return;

  await EnquiryNote.create({
    enquiry_id: assignment.enquiry_id,
    note: lines.join('\n'),
    created_by: user.id,
  });
  await Enquiry.update({ updated_by: user.id }, { where: { id: assignment.enquiry_id } });
};

const calcTotalKm = (startingKm, closingKm) => {
  if (startingKm == null || closingKm == null) return null;
  const start = Number(startingKm);
  const end = Number(closingKm);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  if (end < start) {
    throw new AppError('Closing KM cannot be less than starting KM', 400);
  }
  return Number((end - start).toFixed(2));
};

const updateMyTrip = async (user, tripId, payload = {}, files = {}) => {
  const driverId = await resolveDriverId(user);
  const row = await EnquiryVehicleAssignment.findOne({
    where: { id: tripId, driver_id: driverId },
  });
  if (!row) throw new AppError('Trip not found', 404);
  if (row.status === 'cancelled') {
    throw new AppError('This trip is cancelled and cannot be updated', 400);
  }

  const startingKmLocked = row.starting_km != null && Boolean(row.starting_km_photo);

  if (startingKmLocked) {
    if (files.starting_km_photo?.[0]) {
      throw new AppError('Starting KM screenshot cannot be changed after it has been saved', 400);
    }
    if (
      payload.starting_km !== undefined &&
      payload.starting_km !== '' &&
      payload.starting_km != null &&
      Number(payload.starting_km) !== Number(row.starting_km)
    ) {
      throw new AppError('Starting KM cannot be changed after it has been saved', 400);
    }
    if (payload.starting_km === '' || payload.starting_km == null) {
      throw new AppError('Starting KM cannot be cleared after it has been saved', 400);
    }
  }

  const updates = {
    updated_by: user.id,
  };

  if (payload.driver_update_notes !== undefined) {
    updates.driver_update_notes = payload.driver_update_notes || null;
  }

  if (files.starting_km_photo?.[0]) {
    normalizeUploadedImage(files.starting_km_photo[0]);
    updates.starting_km_photo = getFileUrl(files.starting_km_photo[0]);
  }
  if (files.closing_km_photo?.[0]) {
    normalizeUploadedImage(files.closing_km_photo[0]);
    updates.closing_km_photo = getFileUrl(files.closing_km_photo[0]);
  }

  let startingKm =
    payload.starting_km !== undefined && payload.starting_km !== '' && payload.starting_km != null
      ? Number(payload.starting_km)
      : row.starting_km != null
        ? Number(row.starting_km)
        : null;
  let closingKm =
    payload.closing_km !== undefined && payload.closing_km !== '' && payload.closing_km != null
      ? Number(payload.closing_km)
      : row.closing_km != null
        ? Number(row.closing_km)
        : null;

  const effectiveStartingPhoto =
    updates.starting_km_photo !== undefined
      ? updates.starting_km_photo
      : row.starting_km_photo || null;

  if (payload.trip_status) {
    const statusDef = STATUS_MAP[payload.trip_status];
    if (!statusDef) throw new AppError('Invalid trip status', 400);

    const prevIdx = statusIndex(row.trip_status);
    const nextIdx = statusIndex(payload.trip_status);
    if (prevIdx >= 0 && nextIdx <= prevIdx) {
      throw new AppError('Trip status cannot be changed back to a previous step', 400);
    }

    if (statusDef.requiresStartingKm) {
      if (startingKm == null || Number.isNaN(startingKm)) {
        throw new AppError('Starting KM is required for Trip ongoing', 400);
      }
      if (!effectiveStartingPhoto) {
        throw new AppError('Starting KM screenshot is required', 400);
      }
    }
    if (statusDef.requiresClosingKm) {
      if (startingKm == null || Number.isNaN(startingKm)) {
        throw new AppError('Starting KM must be set before closing the trip', 400);
      }
      if (closingKm == null || Number.isNaN(closingKm)) {
        throw new AppError('Closing KM is required for Trip closed', 400);
      }
    }

    updates.trip_status = payload.trip_status;
    updates.status_updated_at = new Date();

    if (['on_the_way', 'customer_place_reached', 'trip_ongoing'].includes(payload.trip_status)) {
      updates.status = 'on_trip';
      await Driver.update({ availability_status: 'on_trip' }, { where: { id: driverId } });
      if (row.vehicle_id) {
        await Vehicle.update({ availability_status: 'on_trip' }, { where: { id: row.vehicle_id } });
      }
    }
    if (payload.trip_status === 'trip_closed') {
      updates.status = 'completed';
      const otherOpen = await EnquiryVehicleAssignment.count({
        where: {
          id: { [Op.ne]: row.id },
          driver_id: driverId,
          status: { [Op.notIn]: ['completed', 'cancelled'] },
          [Op.or]: [{ trip_status: null }, { trip_status: { [Op.ne]: 'trip_closed' } }],
        },
      });
      if (!otherOpen) {
        await Driver.update({ availability_status: 'available' }, { where: { id: driverId } });
      }
      if (row.vehicle_id) {
        const vehicleBusy = await EnquiryVehicleAssignment.count({
          where: {
            id: { [Op.ne]: row.id },
            vehicle_id: row.vehicle_id,
            status: { [Op.notIn]: ['completed', 'cancelled'] },
            [Op.or]: [{ trip_status: null }, { trip_status: { [Op.ne]: 'trip_closed' } }],
          },
        });
        if (!vehicleBusy) {
          await Vehicle.update(
            { availability_status: 'available' },
            { where: { id: row.vehicle_id } }
          );
        }
      }
    }
  }

  if (payload.starting_km !== undefined && !startingKmLocked) {
    if (payload.starting_km === '' || payload.starting_km == null) {
      updates.starting_km = null;
      startingKm = null;
    } else {
      if (Number.isNaN(Number(payload.starting_km)) || Number(payload.starting_km) < 0) {
        throw new AppError('Starting KM must be a valid number', 400);
      }
      updates.starting_km = Number(payload.starting_km);
      startingKm = Number(payload.starting_km);
      if (!effectiveStartingPhoto) {
        throw new AppError('Starting KM screenshot is required when entering starting KM', 400);
      }
    }
  }

  if (payload.closing_km !== undefined) {
    if (payload.closing_km === '' || payload.closing_km == null) {
      updates.closing_km = null;
      closingKm = null;
    } else {
      if (Number.isNaN(Number(payload.closing_km)) || Number(payload.closing_km) < 0) {
        throw new AppError('Closing KM must be a valid number', 400);
      }
      updates.closing_km = Number(payload.closing_km);
      closingKm = Number(payload.closing_km);
    }
  }

  const total = calcTotalKm(
    updates.starting_km !== undefined ? updates.starting_km : startingKm,
    updates.closing_km !== undefined ? updates.closing_km : closingKm
  );
  if (total != null) {
    updates.total_km = total;
  } else if (updates.starting_km === null || updates.closing_km === null) {
    updates.total_km = null;
  }

  const previous = {
    trip_status: row.trip_status,
    starting_km: row.starting_km != null ? Number(row.starting_km) : null,
    closing_km: row.closing_km != null ? Number(row.closing_km) : null,
    total_km: row.total_km != null ? Number(row.total_km) : null,
    driver_update_notes: row.driver_update_notes,
  };

  const nextTripStatus = updates.trip_status || null;

  await row.update(updates);

  if (nextTripStatus && nextTripStatus !== previous.trip_status) {
    await recordDriverStatusLog({
      assignmentId: row.id,
      enquiryId: row.enquiry_id,
      driverId,
      userId: user.id,
      status: nextTripStatus,
    });
  }

  await logDriverUpdateOnEnquiry(row, user, { ...updates, total_km: updates.total_km }, previous);
  const trip = await getMyTrip(user, tripId);
  const statusLogs = await loadStatusLogsForAssignment(tripId);
  return {
    ...trip,
    trip_status_history: statusLogs.length ? statusLogs : trip.trip_status_history,
    status_logs: statusLogs,
  };
};

const getStatusOptions = () => DRIVER_TRIP_STATUSES;

const generatePortalPassword = () => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Driver@${suffix}`;
};

/**
 * Prepare shareable portal credentials for a driver.
 * Passwords cannot be read back (hashed), so this sets/resets a password when requested.
 */
const preparePortalShare = async (driverId, { portalPassword = null, resetPassword = true } = {}) => {
  const driver = await Driver.findByPk(driverId);
  if (!driver || driver.is_active === false) {
    throw new AppError('Driver not found', 404);
  }

  let passwordToUse = portalPassword ? String(portalPassword).trim() : null;
  if (passwordToUse && passwordToUse.length < 6) {
    throw new AppError('Portal password must be at least 6 characters', 400);
  }

  let existingUser = await findPortalUserForDriver(driver);
  if (!existingUser || resetPassword || passwordToUse) {
    if (!passwordToUse) passwordToUse = generatePortalPassword();
    existingUser = await syncDriverPortalUser(driver, passwordToUse);
  } else {
    // Portal passwords are hashed — generate a fresh shareable password for the dialog.
    passwordToUse = generatePortalPassword();
    existingUser = await syncDriverPortalUser(driver, passwordToUse);
  }

  const username = driver.phone || driver.email || existingUser?.email || null;
  return {
    driver_id: driver.id,
    driver_name: driver.full_name,
    username,
    phone: driver.phone || null,
    email: driver.email || null,
    password: passwordToUse || null,
    has_portal_access: Boolean(existingUser),
    portal_login: username,
    login_hint: driver.phone
      ? `Use phone ${driver.phone} (or email ${driver.email || 'if set'})`
      : `Use email ${driver.email}`,
  };
};

module.exports = {
  ensureDriverRole,
  syncDriverPortalUser,
  login,
  me,
  listMyTrips,
  getMyTrip,
  getMyTripByEnquiry,
  updateMyTrip,
  getStatusOptions,
  portalEmailForDriver,
  preparePortalShare,
  generatePortalPassword,
};
