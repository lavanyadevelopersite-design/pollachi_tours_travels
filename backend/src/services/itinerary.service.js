const dayjs = require('dayjs');
const { Op } = require('sequelize');
const {
  Itinerary,
  ItineraryDestination,
  ItineraryDay,
  ItineraryEvent,
  Destination,
  Package,
  Booking,
  Quotation,
  Enquiry,
  User,
  PackageTerms,
  InclusionExclusion,
  sequelize,
} = require('../models');
const createCrudService = require('./crud.factory');
const AppError = require('../utils/AppError');
const whatsappNotification = require('./whatsappNotification.service');
const masterService = require('./master.service');
const { makeShareCode } = require('../utils/shareCode');

const dayInclude = {
  model: ItineraryDay,
  as: 'itineraryDays',
  include: [
    {
      model: ItineraryEvent,
      as: 'events',
      separate: true,
      order: [
        ['display_order', 'ASC'],
        ['event_time', 'ASC'],
      ],
    },
  ],
};

const listIncludes = [
  { model: Destination, as: 'destination' },
  { model: Package, as: 'package' },
  {
    model: Enquiry,
    as: 'enquiry',
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'travel_from',
      'travel_to',
      'adults',
      'children',
    ],
  },
  {
    model: ItineraryDestination,
    as: 'destinations',
    separate: true,
    order: [['display_order', 'ASC']],
  },
];

const fullIncludes = [
  { model: Destination, as: 'destination' },
  { model: Package, as: 'package' },
  { model: Booking, as: 'booking', attributes: ['id', 'booking_code'] },
  { model: Quotation, as: 'quotation', attributes: ['id', 'quotation_code'] },
  {
    model: Enquiry,
    as: 'enquiry',
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'email',
      'phone',
      'assigned_to',
      'travel_from',
      'travel_to',
      'adults',
      'children',
      'children_details',
    ],
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
    ],
  },
  {
    model: ItineraryDestination,
    as: 'destinations',
    separate: true,
    order: [['display_order', 'ASC']],
  },
  {
    ...dayInclude,
    separate: true,
    order: [
      ['day_number', 'ASC'],
      ['display_order', 'ASC'],
    ],
  },
];

const base = createCrudService(Itinerary, {
  searchFields: ['title', 'status'],
  defaultIncludes: listIncludes,
});

/** Sequelize may return JSON columns as strings when stored as LONGTEXT. */
const parseJsonField = (value, fallback = null) => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try {
    let parsed = JSON.parse(value);
    // Handle double-encoded JSON
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        /* keep first parse */
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const normalizePricing = (value) => {
  const parsed = parseJsonField(value, null);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const hasCorruption = parsed['0'] != null;
  const lineItems = Array.isArray(parsed.line_items) ? parsed.line_items : null;
  // Pure corruption with no salvageable line items
  if (hasCorruption && !lineItems) return null;

  // Always return a clean pricing object (strip character-key corruption)
  return {
    gst_mode: parsed.gst_mode || 'gst_on_total',
    base_markup_percent: Number(parsed.base_markup_percent) || 0,
    extra_markup: Number(parsed.extra_markup) || 0,
    cgst_percent: Number(parsed.cgst_percent) || 0,
    sgst_percent: Number(parsed.sgst_percent) || 0,
    igst_percent: Number(parsed.igst_percent) || 0,
    tcs_percent: Number(parsed.tcs_percent) || 0,
    discount: Number(parsed.discount) || 0,
    line_items: lineItems || [],
  };
};

const calcDuration = (fromDate, toDate) => {
  if (!fromDate || !toDate) return { days: 1, nights: 0 };
  const start = dayjs(fromDate);
  const end = dayjs(toDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return { days: 1, nights: 0 };
  }
  const days = end.diff(start, 'day') + 1;
  return { days, nights: Math.max(days - 1, 0) };
};

const overlayEnquiryTripFields = (json) => {
  const enquiry = json?.enquiry;
  if (!enquiry) return json;
  const from = enquiry.travel_from || json.from_date;
  const to = enquiry.travel_to || json.to_date;
  const duration = from && to ? calcDuration(from, to) : null;
  return {
    ...json,
    from_date: from || json.from_date,
    to_date: to || json.to_date,
    ...(duration ? { days: duration.days, nights: duration.nights } : {}),
    adults: enquiry.adults != null ? enquiry.adults : json.adults,
    children: enquiry.children != null ? enquiry.children : json.children,
  };
};

const buildDayWisePlan = (daysRows = []) =>
  daysRows.map((d) => ({
    day: d.day_number,
    title: d.subject || `Day ${d.day_number}`,
    description: d.description || '',
    destination: d.destination || '',
    date: d.date,
    status: d.status,
  }));

const syncDestinations = async (itineraryId, destinations = [], userId, transaction) => {
  await ItineraryDestination.destroy({
    where: { itinerary_id: itineraryId },
    force: true,
    transaction,
  });
  if (!destinations.length) return [];
  return ItineraryDestination.bulkCreate(
    destinations.map((d, index) => ({
      itinerary_id: itineraryId,
      name: d.name || d.label,
      latitude: d.latitude ?? d.lat ?? null,
      longitude: d.longitude ?? d.lng ?? null,
      country: d.country || null,
      state: d.state || null,
      city: d.city || null,
      place_id: d.place_id || d.placeId || null,
      display_order: d.display_order ?? index,
      created_by: userId,
      updated_by: userId,
    })),
    { transaction }
  );
};

const generateDays = async (itineraryId, fromDate, toDate, destinations = [], userId, transaction) => {
  const { days } = calcDuration(fromDate, toDate);
  const start = dayjs(fromDate);
  const primaryDestination = destinations[0]?.name || destinations[0]?.label || null;

  await ItineraryEvent.destroy({
    where: { itinerary_id: itineraryId },
    force: true,
    transaction,
  });
  await ItineraryDay.destroy({
    where: { itinerary_id: itineraryId },
    force: true,
    transaction,
  });

  const rows = Array.from({ length: days }, (_, i) => {
    const date = start.add(i, 'day').format('YYYY-MM-DD');
    const dest =
      destinations.length > 0
        ? destinations[Math.min(i, destinations.length - 1)]?.name ||
          destinations[Math.min(i, destinations.length - 1)]?.label
        : primaryDestination;
    return {
      itinerary_id: itineraryId,
      day_number: i + 1,
      date,
      destination: dest || null,
      subject: `Day ${i + 1}${dest ? ` – ${dest}` : ''}`,
      description: '',
      status: 'planned',
      display_order: i,
      created_by: userId,
      updated_by: userId,
    };
  });

  return ItineraryDay.bulkCreate(rows, { transaction });
};

const getFullById = async (id) => {
  const record = await Itinerary.findByPk(id, { include: fullIncludes });
  if (!record) throw new AppError('Itinerary not found', 404);

  const json = record.toJSON();
  const packageTermIds = parseJsonField(json.package_term_ids, []);
  const inclusionIds = parseJsonField(json.inclusion_ids, []);
  const exclusionIds = parseJsonField(json.exclusion_ids, []);
  const pricing = normalizePricing(json.pricing);
  const preferences = parseJsonField(json.preferences, null);

  let packageTerms = [];
  const termIds = Array.isArray(packageTermIds) ? packageTermIds : [];
  if (termIds.length) {
    packageTerms = await PackageTerms.findAll({
      where: { id: termIds, is_active: true },
      order: [['heading', 'ASC']],
    });
  }

  const inclusionIdList = Array.isArray(inclusionIds) ? inclusionIds : [];
  const exclusionIdList = Array.isArray(exclusionIds) ? exclusionIds : [];
  let inclusions = [];
  let exclusions = [];
  if (inclusionIdList.length) {
    inclusions = await InclusionExclusion.findAll({
      where: { id: inclusionIdList, type: 'inclusion', is_active: true },
      order: [['heading', 'ASC']],
    });
  }
  if (exclusionIdList.length) {
    exclusions = await InclusionExclusion.findAll({
      where: { id: exclusionIdList, type: 'exclusion', is_active: true },
      order: [['heading', 'ASC']],
    });
  }

  const itineraryDays = (json.itineraryDays || []).sort(
    (a, b) => (a.day_number || 0) - (b.day_number || 0)
  );

  return overlayEnquiryTripFields({
    ...json,
    package_term_ids: termIds,
    inclusion_ids: inclusionIdList,
    exclusion_ids: exclusionIdList,
    pricing,
    preferences,
    itineraryDays,
    package_terms: packageTerms,
    inclusions,
    exclusions,
    day_wise_plan: buildDayWisePlan(itineraryDays),
  });
};

const createWithPlan = async (payload, userId = null) => {
  const destinations = payload.destinations || [];
  if (!destinations.length) {
    throw new AppError('At least one destination is required', 422);
  }

  if (payload.enquiry_id && (!payload.from_date || !payload.to_date || payload.adults == null || payload.children == null)) {
    const linkedEnquiry = await Enquiry.findByPk(payload.enquiry_id, {
      attributes: ['id', 'travel_from', 'travel_to', 'adults', 'children'],
    });
    if (!payload.from_date && linkedEnquiry?.travel_from) {
      payload.from_date = linkedEnquiry.travel_from;
    }
    if (!payload.to_date && linkedEnquiry?.travel_to) {
      payload.to_date = linkedEnquiry.travel_to;
    }
    if (payload.adults == null && linkedEnquiry?.adults != null) {
      payload.adults = linkedEnquiry.adults;
    }
    if (payload.children == null && linkedEnquiry?.children != null) {
      payload.children = linkedEnquiry.children;
    }
  }

  if (!payload.from_date || !payload.to_date) {
    throw new AppError('From date and To date are required', 422);
  }
  if (dayjs(payload.to_date).isBefore(dayjs(payload.from_date))) {
    throw new AppError('To date cannot be smaller than From date', 422);
  }

  const { days, nights } = calcDuration(payload.from_date, payload.to_date);

  const transaction = await sequelize.transaction();
  try {
    const itinerary = await Itinerary.create(
      {
        title: payload.title,
        booking_id: payload.booking_id || null,
        quotation_id: payload.quotation_id || null,
        enquiry_id: payload.enquiry_id || null,
        destination_id: payload.destination_id || null,
        package_id: payload.package_id || null,
        days,
        nights,
        from_date: payload.from_date,
        to_date: payload.to_date,
        cover_image: payload.cover_image || null,
        package_term_ids: payload.package_term_ids || [],
        inclusion_ids: payload.inclusion_ids || [],
        exclusion_ids: payload.exclusion_ids || [],
        adults: payload.adults ?? 1,
        children: payload.children ?? 0,
        budget: payload.budget || null,
        pricing: payload.pricing || null,
        preferences: payload.preferences || null,
        is_ai_generated: payload.is_ai_generated || false,
        status: payload.status || 'draft',
        created_by: userId,
        updated_by: userId,
      },
      { transaction }
    );

    const destRows = await syncDestinations(itinerary.id, destinations, userId, transaction);
    const dayRows = await generateDays(
      itinerary.id,
      payload.from_date,
      payload.to_date,
      destinations,
      userId,
      transaction
    );

    await itinerary.update(
      {
        day_wise_plan: buildDayWisePlan(dayRows),
        destination_id: payload.destination_id || null,
      },
      { transaction }
    );

    await transaction.commit();
    return getFullById(itinerary.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const updateWithPlan = async (id, payload, userId = null) => {
  const existing = await Itinerary.findByPk(id);
  if (!existing) throw new AppError('Itinerary not found', 404);

  const fromDate = payload.from_date ?? existing.from_date;
  const toDate = payload.to_date ?? existing.to_date;
  const destinations = payload.destinations;
  const datesChanged =
    (payload.from_date && payload.from_date !== existing.from_date) ||
    (payload.to_date && payload.to_date !== existing.to_date);
  const { days, nights } = calcDuration(fromDate, toDate);

  const transaction = await sequelize.transaction();
  try {
    const data = {
      updated_by: userId,
    };
    [
      'title',
      'booking_id',
      'quotation_id',
      'enquiry_id',
      'destination_id',
      'package_id',
      'cover_image',
      'package_term_ids',
      'inclusion_ids',
      'exclusion_ids',
      'adults',
      'children',
      'budget',
      'pricing',
      'preferences',
      'status',
      'is_ai_generated',
    ].forEach((key) => {
      if (payload[key] !== undefined) data[key] = payload[key];
    });
    if (payload.pricing !== undefined) {
      data.pricing = normalizePricing(payload.pricing) ?? payload.pricing;
    }
    if (payload.preferences !== undefined) {
      data.preferences = parseJsonField(payload.preferences, payload.preferences);
    }
    ['package_term_ids', 'inclusion_ids', 'exclusion_ids'].forEach((key) => {
      if (payload[key] !== undefined) {
        data[key] = parseJsonField(payload[key], payload[key]);
      }
    });
    if (payload.from_date !== undefined) data.from_date = payload.from_date;
    if (payload.to_date !== undefined) data.to_date = payload.to_date;
    data.days = days;
    data.nights = nights;

    await existing.update(data, { transaction });

    if (Array.isArray(destinations)) {
      await syncDestinations(id, destinations, userId, transaction);
    }

    if (datesChanged || payload.regenerate_days) {
      const dests =
        destinations ||
        (await ItineraryDestination.findAll({
          where: { itinerary_id: id },
          order: [['display_order', 'ASC']],
          transaction,
        })).map((d) => d.toJSON());
      const dayRows = await generateDays(id, fromDate, toDate, dests, userId, transaction);
      await existing.update({ day_wise_plan: buildDayWisePlan(dayRows) }, { transaction });
    }

    await transaction.commit();
    return getFullById(id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const updateDay = async (itineraryId, dayId, payload, userId = null) => {
  const day = await ItineraryDay.findOne({
    where: { id: dayId, itinerary_id: itineraryId },
  });
  if (!day) throw new AppError('Itinerary day not found', 404);

  const data = { updated_by: userId };
  ['destination', 'subject', 'description', 'status', 'display_order'].forEach((key) => {
    if (payload[key] !== undefined) data[key] = payload[key];
  });
  await day.update(data);

  const days = await ItineraryDay.findAll({
    where: { itinerary_id: itineraryId },
    order: [['day_number', 'ASC']],
  });
  await Itinerary.update(
    { day_wise_plan: buildDayWisePlan(days), updated_by: userId },
    { where: { id: itineraryId } }
  );

  return ItineraryDay.findByPk(dayId, {
    include: [
      {
        model: ItineraryEvent,
        as: 'events',
        separate: true,
        order: [
          ['display_order', 'ASC'],
          ['event_time', 'ASC'],
        ],
      },
    ],
  });
};

const createEvent = async (itineraryId, dayId, payload, userId = null) => {
  const day = await ItineraryDay.findOne({
    where: { id: dayId, itinerary_id: itineraryId },
  });
  if (!day) throw new AppError('Itinerary day not found', 404);

  const maxOrder = await ItineraryEvent.max('display_order', {
    where: { itinerary_day_id: dayId },
  });

  return ItineraryEvent.create({
    itinerary_id: itineraryId,
    itinerary_day_id: dayId,
    event_type: payload.event_type,
    name: payload.name,
    event_time: payload.event_time || null,
    description: payload.description || null,
    image_url: payload.image_url || null,
    details: payload.details || null,
    display_order: payload.display_order ?? (Number.isFinite(maxOrder) ? maxOrder + 1 : 0),
    status: payload.status || 'active',
    created_by: userId,
    updated_by: userId,
  });
};

const updateEvent = async (itineraryId, eventId, payload, userId = null) => {
  const event = await ItineraryEvent.findOne({
    where: { id: eventId, itinerary_id: itineraryId },
  });
  if (!event) throw new AppError('Itinerary event not found', 404);

  const data = { updated_by: userId };
  [
    'event_type',
    'name',
    'event_time',
    'description',
    'image_url',
    'details',
    'display_order',
    'status',
  ].forEach((key) => {
    if (payload[key] !== undefined) data[key] = payload[key];
  });
  await event.update(data);
  return event;
};

const deleteEvent = async (itineraryId, eventId) => {
  const event = await ItineraryEvent.findOne({
    where: { id: eventId, itinerary_id: itineraryId },
  });
  if (!event) throw new AppError('Itinerary event not found', 404);
  await event.destroy();
  return { id: eventId };
};

const reorderEvents = async (itineraryId, dayId, orderedIds = [], userId = null) => {
  const day = await ItineraryDay.findOne({
    where: { id: dayId, itinerary_id: itineraryId },
  });
  if (!day) throw new AppError('Itinerary day not found', 404);

  await Promise.all(
    orderedIds.map((id, index) =>
      ItineraryEvent.update(
        { display_order: index, updated_by: userId },
        { where: { id, itinerary_day_id: dayId, itinerary_id: itineraryId } }
      )
    )
  );

  return ItineraryEvent.findAll({
    where: { itinerary_day_id: dayId },
    order: [
      ['display_order', 'ASC'],
      ['event_time', 'ASC'],
    ],
  });
};

const ACTIVITIES = [
  'City sightseeing tour',
  'Local market visit',
  'Cultural heritage walk',
  'Beach relaxation',
  'Adventure activity',
  'Spa & wellness',
  'Food tasting experience',
  'Sunset viewpoint',
  'Museum visit',
  'Boat cruise',
];

const generateAiItinerary = async (payload, userId = null) => {
  const days = parseInt(payload.days, 10) || 3;
  const destinationName = payload.destination_name || 'Selected Destination';
  const preferences = payload.preferences || {};

  const dayWisePlan = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    return {
      day,
      title: `Day ${day} – Explore ${destinationName}`,
      morning: {
        time: '09:00',
        activity: ACTIVITIES[i % ACTIVITIES.length],
        notes: preferences.style ? `Style: ${preferences.style}` : 'Enjoy a leisurely start',
      },
      afternoon: {
        time: '13:00',
        activity: ACTIVITIES[(i + 3) % ACTIVITIES.length],
        lunch: 'Local cuisine recommended',
      },
      evening: {
        time: '18:00',
        activity: ACTIVITIES[(i + 6) % ACTIVITIES.length],
        dinner: 'Hotel / restaurant of choice',
      },
      accommodation: preferences.hotel_preference || 'Hotel as per package',
      meals: preferences.meals || 'Breakfast included',
    };
  });

  return base.create(
    {
      title: payload.title || `${days}-Day ${destinationName} Itinerary`,
      destination_id: payload.destination_id || null,
      package_id: payload.package_id || null,
      booking_id: payload.booking_id || null,
      quotation_id: payload.quotation_id || null,
      days,
      nights: Math.max(days - 1, 0),
      adults: payload.adults || 1,
      children: payload.children || 0,
      budget: payload.budget || null,
      preferences,
      day_wise_plan: dayWisePlan,
      is_ai_generated: true,
      status: 'generated',
    },
    userId
  );
};

const regenerate = async (id, payload = {}, userId = null) => {
  const existing = await base.getById(id);
  const generated = await generateAiItinerary(
    {
      title: existing.title,
      destination_id: existing.destination_id,
      package_id: existing.package_id,
      booking_id: existing.booking_id,
      quotation_id: existing.quotation_id,
      days: payload.days || existing.days,
      adults: payload.adults || existing.adults,
      children: payload.children || existing.children,
      budget: payload.budget || existing.budget,
      preferences: payload.preferences || existing.preferences || {},
      destination_name: payload.destination_name,
    },
    userId
  );

  await existing.update({
    day_wise_plan: generated.day_wise_plan,
    days: generated.days,
    nights: generated.nights ?? Math.max(generated.days - 1, 0),
    is_ai_generated: true,
    status: 'generated',
    updated_by: userId,
  });
  await generated.destroy();
  return getFullById(id);
};

const applyEnquiryTravelDates = async (itineraryId, enquiry, userId, transaction) => {
  const fromDate = enquiry?.travel_from;
  const toDate = enquiry?.travel_to;
  const { days, nights } = fromDate && toDate ? calcDuration(fromDate, toDate) : { days: undefined, nights: undefined };
  await Itinerary.update(
    {
      ...(fromDate ? { from_date: fromDate } : {}),
      ...(toDate ? { to_date: toDate } : {}),
      ...(days ? { days, nights } : {}),
      adults: enquiry?.adults ?? 1,
      children: enquiry?.children ?? 0,
      updated_by: userId,
    },
    { where: { id: itineraryId }, transaction }
  );

  if (!fromDate || !toDate) return;

  const existingDays = await ItineraryDay.findAll({
    where: { itinerary_id: itineraryId },
    order: [
      ['day_number', 'ASC'],
      ['display_order', 'ASC'],
    ],
    transaction,
  });

  if (!existingDays.length) {
    const dests = await ItineraryDestination.findAll({
      where: { itinerary_id: itineraryId },
      order: [['display_order', 'ASC']],
      transaction,
    });
    const dayRows = await generateDays(
      itineraryId,
      fromDate,
      toDate,
      dests.map((d) => d.toJSON()),
      userId,
      transaction
    );
    await Itinerary.update(
      { day_wise_plan: buildDayWisePlan(dayRows), updated_by: userId },
      { where: { id: itineraryId }, transaction }
    );
    return;
  }

  const start = dayjs(fromDate);
  for (let i = 0; i < existingDays.length; i += 1) {
    await existingDays[i].update(
      {
        date: start.add(i, 'day').format('YYYY-MM-DD'),
        updated_by: userId,
      },
      { transaction }
    );
  }

  if (days > existingDays.length) {
    const dests = await ItineraryDestination.findAll({
      where: { itinerary_id: itineraryId },
      order: [['display_order', 'ASC']],
      transaction,
    });
    const extra = [];
    for (let i = existingDays.length; i < days; i += 1) {
      const dest = dests.length ? dests[Math.min(i, dests.length - 1)] : null;
      extra.push({
        itinerary_id: itineraryId,
        day_number: i + 1,
        date: start.add(i, 'day').format('YYYY-MM-DD'),
        destination: dest?.name || null,
        subject: `Day ${i + 1}${dest?.name ? ` – ${dest.name}` : ''}`,
        description: '',
        status: 'planned',
        display_order: i,
        created_by: userId,
        updated_by: userId,
      });
    }
    await ItineraryDay.bulkCreate(extra, { transaction });
  }

  const allDays = await ItineraryDay.findAll({
    where: { itinerary_id: itineraryId },
    order: [['day_number', 'ASC']],
    transaction,
  });
  await Itinerary.update(
    { day_wise_plan: buildDayWisePlan(allDays), updated_by: userId },
    { where: { id: itineraryId }, transaction }
  );
};

const cloneItineraryForEnquiry = async (sourceId, enquiry, userId, transaction) => {
  const source = await Itinerary.findByPk(sourceId, {
    include: [
      { model: ItineraryDestination, as: 'destinations' },
      {
        model: ItineraryDay,
        as: 'itineraryDays',
        include: [{ model: ItineraryEvent, as: 'events' }],
      },
    ],
    transaction,
  });
  if (!source) throw new AppError('Itinerary not found', 404);

  const json = source.toJSON();
  const created = await Itinerary.create(
    {
      title: json.title,
      enquiry_id: enquiry.id,
      destination_id: json.destination_id || null,
      package_id: json.package_id || null,
      days: json.days,
      nights: json.nights,
      from_date: enquiry.travel_from || json.from_date,
      to_date: enquiry.travel_to || json.to_date,
      cover_image: json.cover_image || null,
      package_term_ids: json.package_term_ids || [],
      inclusion_ids: json.inclusion_ids || [],
      exclusion_ids: json.exclusion_ids || [],
      adults: enquiry.adults ?? json.adults ?? 1,
      children: enquiry.children ?? json.children ?? 0,
      budget: json.budget,
      pricing: json.pricing,
      preferences: json.preferences,
      is_ai_generated: json.is_ai_generated || false,
      status: 'proposed',
      created_by: userId,
      updated_by: userId,
    },
    { transaction }
  );

  const dests = json.destinations || [];
  if (dests.length) {
    await ItineraryDestination.bulkCreate(
      dests.map((d, index) => ({
        itinerary_id: created.id,
        name: d.name,
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        country: d.country || null,
        state: d.state || null,
        city: d.city || null,
        place_id: d.place_id || null,
        display_order: d.display_order ?? index,
        created_by: userId,
        updated_by: userId,
      })),
      { transaction }
    );
  }

  const sourceDays = [...(json.itineraryDays || [])].sort(
    (a, b) => (a.day_number || 0) - (b.day_number || 0)
  );
  for (const day of sourceDays) {
    const newDay = await ItineraryDay.create(
      {
        itinerary_id: created.id,
        day_number: day.day_number,
        date: day.date,
        destination: day.destination,
        subject: day.subject,
        description: day.description,
        status: day.status || 'planned',
        display_order: day.display_order ?? 0,
        created_by: userId,
        updated_by: userId,
      },
      { transaction }
    );

    const events = day.events || [];
    if (events.length) {
      await ItineraryEvent.bulkCreate(
        events.map((ev, index) => ({
          itinerary_id: created.id,
          itinerary_day_id: newDay.id,
          event_type: ev.event_type,
          name: ev.name,
          event_time: ev.event_time,
          description: ev.description,
          image_url: ev.image_url,
          details: ev.details,
          display_order: ev.display_order ?? index,
          status: ev.status || 'active',
          created_by: userId,
          updated_by: userId,
        })),
        { transaction }
      );
    }
  }

  return created;
};

const assignToEnquiry = async (id, enquiryId, userId = null) => {
  const itinerary = await Itinerary.findByPk(id);
  if (!itinerary) throw new AppError('Itinerary not found', 404);

  const enquiry = await Enquiry.findByPk(enquiryId);
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  if (itinerary.enquiry_id && itinerary.enquiry_id === enquiryId) {
    await applyEnquiryTravelDates(id, enquiry, userId);
    return getFullById(id);
  }

  const transaction = await sequelize.transaction();
  try {
    let targetId = itinerary.id;
    if (itinerary.enquiry_id && itinerary.enquiry_id !== enquiryId) {
      const cloned = await cloneItineraryForEnquiry(id, enquiry, userId, transaction);
      targetId = cloned.id;
    } else {
      await itinerary.update(
        {
          enquiry_id: enquiryId,
          status: itinerary.status === 'confirmed' ? 'confirmed' : 'proposed',
          updated_by: userId,
        },
        { transaction }
      );
    }

    await applyEnquiryTravelDates(targetId, enquiry, userId, transaction);
    await transaction.commit();
    return getFullById(targetId);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const unassignFromEnquiry = async (id, userId = null) => {
  const itinerary = await Itinerary.findByPk(id);
  if (!itinerary) throw new AppError('Itinerary not found', 404);

  await itinerary.update({
    enquiry_id: null,
    status: itinerary.status === 'confirmed' ? 'draft' : itinerary.status,
    confirmed_at: null,
    confirmed_by: null,
    updated_by: userId,
  });

  return getFullById(id);
};

const confirmItinerary = async (id, userId = null) => {
  const itinerary = await Itinerary.findByPk(id);
  if (!itinerary) throw new AppError('Itinerary not found', 404);

  if (!itinerary.enquiry_id) {
    throw new AppError('Add itinerary to an enquiry before confirming', 422);
  }

  // Only one confirmed itinerary allowed per enquiry
  await Itinerary.update(
    {
      status: 'proposed',
      confirmed_at: null,
      confirmed_by: null,
      updated_by: userId,
    },
    {
      where: {
        enquiry_id: itinerary.enquiry_id,
        id: { [Op.ne]: id },
        status: 'confirmed',
      },
    }
  );

  await itinerary.update({
    status: 'confirmed',
    confirmed_at: new Date(),
    confirmed_by: userId,
    updated_by: userId,
  });

  return getFullById(id);
};

const getPublicShareBaseUrl = () => {
  const override = String(
    process.env.ITINERARY_SHARE_BASE_URL || process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173'
  ).trim();
  return override.replace(/\/$/, '');
};

const buildFrontendShareUrl = (token) =>
  `${getPublicShareBaseUrl()}/i/${encodeURIComponent(String(token || '').trim())}`;

const buildPublicShareUrl = (token) => buildFrontendShareUrl(token);

const ensureShareToken = async (id) => {
  const itinerary = await Itinerary.findByPk(id);
  if (!itinerary) throw new AppError('Itinerary not found', 404);
  const current = String(itinerary.share_token || '').trim();
  if (current && current.length <= 12) return current;

  for (let i = 0; i < 8; i += 1) {
    const share_token = makeShareCode(8);
    try {
      await itinerary.update({ share_token });
      return share_token;
    } catch (err) {
      if (err.name !== 'SequelizeUniqueConstraintError') throw err;
    }
  }

  throw new AppError('Could not create a short itinerary share link', 500);
};

const getPublicByToken = async (token) => {
  const itinerary = await Itinerary.findOne({ where: { share_token: String(token || '').trim() } });
  if (!itinerary) throw new AppError('Itinerary link not found', 404);
  const [data, branding] = await Promise.all([
    getFullById(itinerary.id),
    masterService.getBranding(),
  ]);
  return { ...data, branding };
};

const sendItineraryViaWhatsApp = async (id) => {
  const itinerary = await getFullById(id);
  if (!itinerary.enquiry_id) {
    throw new AppError('Add itinerary to an enquiry before sending to customer', 422);
  }

  const enquiry = await Enquiry.findByPk(itinerary.enquiry_id, {
    attributes: [
      'id',
      'enquiry_code',
      'customer_name',
      'phone',
      'adults',
      'children',
      'infants',
      'travel_from',
      'travel_to',
      'travel_to_destination',
    ],
  });
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const shareToken = await ensureShareToken(id);
  const shareUrl = buildPublicShareUrl(shareToken);

  return whatsappNotification.sendItineraryWhatsApp({
    enquiry: enquiry.toJSON ? enquiry.toJSON() : enquiry,
    itinerary,
    shareUrl,
  });
};

const list = async (query = {}) => {
  const result = await base.list(query);
  return {
    ...result,
    data: (result.data || []).map((row) =>
      overlayEnquiryTripFields(row.toJSON ? row.toJSON() : row)
    ),
  };
};

module.exports = {
  ...base,
  list,
  getById: getFullById,
  create: createWithPlan,
  update: updateWithPlan,
  generateAiItinerary,
  regenerate,
  updateDay,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,
  calcDuration,
  assignToEnquiry,
  unassignFromEnquiry,
  confirmItinerary,
  ensureShareToken,
  getPublicByToken,
  buildPublicShareUrl,
  buildFrontendShareUrl,
  sendItineraryViaWhatsApp,
};
