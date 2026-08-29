const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  Feedback,
  Booking,
  Enquiry,
  EnquiryVehicleAssignment,
  Vehicle,
  Driver,
  User,
} = require('../models');
const createCrudService = require('./crud.factory');
const AppError = require('../utils/AppError');
const whatsappNotification = require('./whatsappNotification.service');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { buildSearchWhere, formatRouteLabel } = require('../utils/helpers');

const enquiryInclude = {
  model: Enquiry,
  as: 'enquiry',
  attributes: [
    'id',
    'enquiry_code',
    'customer_name',
    'phone',
    'email',
    'assigned_to',
    'travel_from',
    'travel_to',
    'travel_from_destination',
    'travel_to_destination',
  ],
  include: [
    {
      model: User,
      as: 'assignee',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
};

const base = createCrudService(Feedback, {
  searchFields: ['customer_name', 'email', 'comments', 'share_token'],
  defaultIncludes: [
    { model: Booking, as: 'booking', attributes: ['id', 'booking_code'] },
    enquiryInclude,
  ],
});

const listSubmitted = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination({
    ...query,
    sortBy: query.sortBy || 'submitted_at',
    sortOrder: query.sortOrder || 'DESC',
  });

  const where = {
    submitted_at: { [Op.ne]: null },
    ...buildSearchWhere(query.search, ['customer_name', 'email', 'comments'], Op),
  };

  if (query.rating) {
    const rating = Number(query.rating);
    if (Number.isFinite(rating)) where.rating = rating;
  }

  const { rows, count } = await Feedback.findAndCountAll({
    where,
    include: [
      { model: Booking, as: 'booking', attributes: ['id', 'booking_code'] },
      enquiryInclude,
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    distinct: true,
  });

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const data = row.toJSON();
      const trip = data.enquiry_id ? await loadTripSummary(data.enquiry_id) : null;
      const assignee = data.enquiry?.assignee;
      const assignedName = assignee
        ? [assignee.first_name, assignee.last_name].filter(Boolean).join(' ') ||
          assignee.email ||
          null
        : null;

      return {
        ...data,
        trip: trip
          ? {
              ...trip,
              vehicle_label: [trip.vehicle_name, trip.vehicle_registration]
                .filter(Boolean)
                .join(' · '),
            }
          : null,
        driver_name: trip?.driver_name || null,
        driver_type: trip?.driver_type || 'own',
        vehicle_name: trip?.vehicle_name || null,
        vehicle_registration: trip?.vehicle_registration || null,
        vehicle_ownership: trip?.vehicle_ownership || 'own',
        vehicle_label: trip
          ? [trip.vehicle_name, trip.vehicle_registration].filter(Boolean).join(' · ')
          : null,
        assigned_to_name: assignedName,
        route_label: formatRouteLabel(
          data.enquiry?.travel_from_destination || trip?.pickup_location,
          data.enquiry?.travel_to_destination || trip?.drop_location
        ),
      };
    })
  );

  return {
    data: enriched,
    pagination: buildPaginationMeta(count, page, limit),
  };
};

const makeShareToken = () => crypto.randomBytes(24).toString('hex');

const averageRating = (ratings) => {
  const nums = ratings.map(Number).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
};

const tripInclude = [
  {
    model: Vehicle,
    as: 'vehicle',
    attributes: ['id', 'name', 'registration_number', 'type', 'ownership'],
  },
  {
    model: Driver,
    as: 'driver',
    attributes: ['id', 'full_name', 'phone', 'driver_type'],
  },
];

const loadTripSummary = async (enquiryId) => {
  const assignment = await EnquiryVehicleAssignment.findOne({
    where: { enquiry_id: enquiryId },
    include: tripInclude,
    order: [
      ['status_updated_at', 'DESC'],
      ['updated_at', 'DESC'],
      ['created_at', 'DESC'],
    ],
  });
  if (!assignment) return null;
  const data = assignment.toJSON();
  return {
    id: data.id,
    vehicle_name: data.vehicle?.name || null,
    vehicle_registration: data.vehicle?.registration_number || null,
    vehicle_ownership: data.vehicle?.ownership || 'own',
    driver_name: data.driver?.full_name || null,
    driver_type: data.driver?.driver_type || 'own',
    trip_status: data.trip_status || null,
    start_date: data.start_date,
    end_date: data.end_date,
    pickup_location: data.pickup_location,
    drop_location: data.drop_location,
  };
};

const createOrGetShareLink = async (enquiryId, userId = null) => {
  const enquiry = await Enquiry.findByPk(enquiryId);
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  let feedback = await Feedback.findOne({
    where: { enquiry_id: enquiryId },
    order: [['created_at', 'DESC']],
  });

  if (!feedback) {
    feedback = await Feedback.create({
      enquiry_id: enquiryId,
      customer_name: enquiry.customer_name || 'Customer',
      email: enquiry.email || null,
      phone: enquiry.phone || null,
      share_token: makeShareToken(),
      created_by: userId,
      updated_by: userId,
    });
  } else if (!feedback.share_token) {
    await feedback.update({
      share_token: makeShareToken(),
      updated_by: userId,
    });
  }

  const trip = await loadTripSummary(enquiryId);

  return {
    id: feedback.id,
    enquiry_id: enquiry.id,
    enquiry_code: enquiry.enquiry_code,
    customer_name: enquiry.customer_name,
    token: feedback.share_token,
    already_submitted: Boolean(feedback.submitted_at),
    submitted_at: feedback.submitted_at,
    trip,
  };
};

const getPublicFeedback = async (token) => {
  if (!token) throw new AppError('Feedback link is invalid', 404);

  const feedback = await Feedback.findOne({
    where: { share_token: token },
    include: [
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
          'adults',
          'children',
        ],
      },
    ],
  });

  if (!feedback) throw new AppError('Feedback link is invalid or expired', 404);

  const enquiry = feedback.enquiry;
  const trip = enquiry ? await loadTripSummary(enquiry.id) : null;

  return {
    token: feedback.share_token,
    already_submitted: Boolean(feedback.submitted_at),
    submitted_at: feedback.submitted_at,
    customer_name: feedback.customer_name || enquiry?.customer_name || 'Customer',
    trip: {
      enquiry_code: enquiry?.enquiry_code || null,
      customer_name: enquiry?.customer_name || feedback.customer_name,
      travel_from: enquiry?.travel_from || null,
      travel_to: enquiry?.travel_to || null,
      travel_from_destination: enquiry?.travel_from_destination || trip?.pickup_location || null,
      travel_to_destination: enquiry?.travel_to_destination || trip?.drop_location || null,
      adults: enquiry?.adults ?? null,
      children: enquiry?.children ?? null,
      vehicle_name: trip?.vehicle_name || null,
      vehicle_registration: trip?.vehicle_registration || null,
      vehicle_ownership: trip?.vehicle_ownership || 'own',
      driver_name: trip?.driver_name || null,
      driver_type: trip?.driver_type || 'own',
      start_date: trip?.start_date || enquiry?.travel_from || null,
      end_date: trip?.end_date || enquiry?.travel_to || null,
    },
    ratings: feedback.submitted_at
      ? {
          transportation_rating: feedback.transportation_rating,
          overall_rating: feedback.overall_rating,
          customer_support_rating: feedback.customer_support_rating,
          staff_behaviour_rating: feedback.staff_behaviour_rating,
          comments: feedback.comments,
        }
      : null,
  };
};

const submitPublicFeedback = async (token, payload = {}) => {
  const feedback = await Feedback.findOne({ where: { share_token: token } });
  if (!feedback) throw new AppError('Feedback link is invalid or expired', 404);
  if (feedback.submitted_at) {
    throw new AppError('Feedback has already been submitted for this trip', 400);
  }

  const parseStar = (raw, label) => {
    const whole = Math.round(Number(raw));
    if (!Number.isFinite(whole) || whole < 1 || whole > 5) {
      throw new AppError(`${label} rating must be between 1 and 5`, 400);
    }
    return whole;
  };

  const transportation = parseStar(payload.transportation_rating, 'Transportation');
  const overall = parseStar(payload.overall_rating, 'Overall Trip Experience');
  const support = parseStar(payload.customer_support_rating, 'Customer Support');
  const staff = parseStar(payload.staff_behaviour_rating, 'Staff Behaviour');

  const comments = String(payload.comments || '').trim();
  if (!comments) throw new AppError('Please share a short description of your experience', 400);

  const rating = averageRating([transportation, overall, support, staff]);

  await feedback.update({
    transportation_rating: transportation,
    overall_rating: overall,
    customer_support_rating: support,
    staff_behaviour_rating: staff,
    rating,
    comments,
    customer_name: payload.customer_name || feedback.customer_name,
    email: payload.email || feedback.email,
    phone: payload.phone || feedback.phone,
    submitted_at: new Date(),
    is_published: true,
  });

  return getPublicFeedback(token);
};

const shareFeedbackWhatsApp = async (enquiryId, userId = null, payload = {}) => {
  const shareData = await createOrGetShareLink(enquiryId, userId);
  const enquiry = await Enquiry.findByPk(enquiryId);
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const feedbackLink =
    payload.feedback_link ||
    payload.feedbackLink ||
    whatsappNotification.buildPublicFeedbackLink(shareData.token);

  return whatsappNotification.sendCustomerFeedbackWhatsApp({
    enquiry,
    feedbackLink,
  });
};

module.exports = {
  ...base,
  list: listSubmitted,
  createOrGetShareLink,
  shareFeedbackWhatsApp,
  getPublicFeedback,
  submitPublicFeedback,
};
