const { Op } = require('sequelize');
const dayjs = require('dayjs');
const {
  Quotation,
  Enquiry,
  Lead,
  Package,
  Destination,
  Branch,
  Itinerary,
  User,
} = require('../models');
const createCrudService = require('./crud.factory');
const AppError = require('../utils/AppError');
const { generateRunningNumber } = require('../utils/helpers');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const defaultIncludes = [
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
    ],
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
  },
  { model: Lead, as: 'lead', attributes: ['id', 'lead_code'] },
  { model: Package, as: 'package' },
  { model: Destination, as: 'destination' },
  { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
  {
    model: Itinerary,
    as: 'itinerary',
    attributes: [
      'id',
      'title',
      'status',
      'days',
      'nights',
      'from_date',
      'to_date',
      'cover_image',
      'adults',
      'children',
      'pricing',
    ],
  },
  { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
  { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
];

const base = createCrudService(Quotation, {
  searchFields: ['quotation_code', 'customer_name', 'email', 'phone'],
  defaultIncludes,
  codeField: 'quotation_code',
  codePrefix: 'QT',
});

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const summarizeTotals = (pricing = {}) => {
  const items = Array.isArray(pricing.line_items) ? pricing.line_items : [];
  const subtotalNet = round2(items.reduce((s, i) => s + (Number(i.net) || 0), 0));
  const subtotalGross = round2(
    items.reduce((s, i) => {
      const net = Number(i.net) || 0;
      const m = Number(i.markup_percent) || 0;
      return s + net + (net * m) / 100;
    }, 0)
  );
  const baseMarkup = round2((subtotalNet * (Number(pricing.base_markup_percent) || 0)) / 100);
  const extraMarkup = Number(pricing.extra_markup) || 0;
  const taxable = round2(subtotalGross + baseMarkup + extraMarkup);
  const cgst = round2((taxable * (Number(pricing.cgst_percent) || 0)) / 100);
  const sgst = round2((taxable * (Number(pricing.sgst_percent) || 0)) / 100);
  const igst = round2((taxable * (Number(pricing.igst_percent) || 0)) / 100);
  const tcs = round2((taxable * (Number(pricing.tcs_percent) || 0)) / 100);
  const discount = Number(pricing.discount) || 0;
  const taxTotal = round2(cgst + sgst + igst + tcs);
  const grandTotal = round2(Math.max(taxable + taxTotal - discount, 0));
  return { subtotal: subtotalNet, tax_amount: taxTotal, discount, total_amount: grandTotal };
};

/**
 * Create or update quotation pricing snapshot for an enquiry + itinerary.
 * Does NOT mutate itinerary.pricing.
 */
const upsertForItinerary = async (payload, userId = null) => {
  const { enquiry_id, itinerary_id, pricing } = payload;
  if (!enquiry_id || !itinerary_id) {
    throw new AppError('enquiry_id and itinerary_id are required', 422);
  }

  const enquiry = await Enquiry.findByPk(enquiry_id);
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const itinerary = await Itinerary.findByPk(itinerary_id);
  if (!itinerary) throw new AppError('Itinerary not found', 404);
  if (itinerary.enquiry_id && itinerary.enquiry_id !== enquiry_id) {
    throw new AppError('Itinerary does not belong to this enquiry', 422);
  }
  if (String(itinerary.status || '').toLowerCase() !== 'confirmed') {
    throw new AppError('Only confirmed itineraries can be quoted', 422);
  }

  const pricingSnapshot = pricing || itinerary.pricing || {};
  const totals = summarizeTotals(pricingSnapshot);

  let quotation = await Quotation.findOne({
    where: { enquiry_id, itinerary_id },
  });

  const data = {
    enquiry_id,
    itinerary_id,
    customer_name: enquiry.customer_name || 'Customer',
    email: enquiry.email || null,
    phone: enquiry.phone || null,
    destination_id: itinerary.destination_id || null,
    travel_from: enquiry.travel_from || itinerary.from_date || null,
    travel_to: enquiry.travel_to || itinerary.to_date || null,
    adults: itinerary.adults ?? enquiry.adults ?? 1,
    children: itinerary.children ?? enquiry.children ?? 0,
    pricing: pricingSnapshot,
    line_items: pricingSnapshot.line_items || [],
    subtotal: totals.subtotal,
    tax_amount: totals.tax_amount,
    discount: totals.discount,
    total_amount: totals.total_amount,
    status: payload.status || 'draft',
    notes: payload.notes ?? undefined,
    updated_by: userId,
  };

  if (quotation) {
    await quotation.update(data);
  } else {
    data.quotation_code = await generateRunningNumber(Quotation, 'quotation_code', 'QT');
    data.created_by = userId;
    data.status = payload.status || 'draft';
    quotation = await Quotation.create(data);
  }

  // Link itinerary → quotation without touching itinerary pricing
  if (itinerary.quotation_id !== quotation.id) {
    await itinerary.update({ quotation_id: quotation.id, updated_by: userId });
  }

  return Quotation.findByPk(quotation.id, { include: defaultIncludes });
};

const upsertForEnquiry = async (payload, userId = null) => {
  const { enquiry_id, pricing } = payload;
  if (!enquiry_id) throw new AppError('enquiry_id is required', 422);

  const enquiry = await Enquiry.findByPk(enquiry_id);
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const pricingSnapshot = pricing || {};
  const totals = summarizeTotals(pricingSnapshot);

  let quotation = await Quotation.findOne({
    where: { enquiry_id, itinerary_id: null },
  });

  const data = {
    enquiry_id,
    itinerary_id: null,
    customer_name: enquiry.customer_name || 'Customer',
    email: enquiry.email || null,
    phone: enquiry.phone || null,
    destination_id: enquiry.destination_id || null,
    travel_from: enquiry.travel_from || null,
    travel_to: enquiry.travel_to || null,
    adults: enquiry.adults ?? 1,
    children: enquiry.children ?? 0,
    pricing: pricingSnapshot,
    line_items: pricingSnapshot.line_items || [],
    subtotal: totals.subtotal,
    tax_amount: totals.tax_amount,
    discount: totals.discount,
    total_amount: totals.total_amount,
    status: payload.status || quotation?.status || 'draft',
    notes: payload.notes ?? undefined,
    updated_by: userId,
  };

  if (quotation) {
    await quotation.update(data);
  } else {
    data.quotation_code = await generateRunningNumber(Quotation, 'quotation_code', 'QT');
    data.created_by = userId;
    data.status = payload.status || 'draft';
    quotation = await Quotation.create(data);
  }

  return Quotation.findByPk(quotation.id, { include: defaultIncludes });
};

const listByEnquiry = async (enquiryId) => {
  const rows = await Quotation.findAll({
    where: { enquiry_id: enquiryId },
    include: defaultIncludes,
    order: [['updated_at', 'DESC']],
  });
  return rows;
};

const getByEnquiryAndItinerary = async (enquiryId, itineraryId) => {
  return Quotation.findOne({
    where: { enquiry_id: enquiryId, itinerary_id: itineraryId },
    include: defaultIncludes,
  });
};

const getStandaloneByEnquiry = async (enquiryId) => {
  return Quotation.findOne({
    where: { enquiry_id: enquiryId, itinerary_id: null },
    include: defaultIncludes,
  });
};

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = {};

  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { quotation_code: { [Op.like]: term } },
      { customer_name: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { '$enquiry.enquiry_code$': { [Op.like]: term } },
      { '$enquiry.customer_name$': { [Op.like]: term } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.enquiry_id) where.enquiry_id = query.enquiry_id;
  if (query.assigned_to) where.assigned_to = query.assigned_to;
  if (query.branch_id) where.branch_id = query.branch_id;

  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = dayjs(from).startOf('day').toDate();
    if (to) where.created_at[Op.lte] = dayjs(to).endOf('day').toDate();
  }

  const orderField = sortBy === 'createdAt' ? 'created_at' : sortBy || 'created_at';

  const { rows, count } = await Quotation.findAndCountAll({
    where,
    include: defaultIncludes,
    limit,
    offset,
    order: [[orderField, sortOrder]],
    distinct: true,
    subQuery: false,
  });

  return {
    data: rows,
    pagination: buildPaginationMeta(count, page, limit),
  };
};

module.exports = {
  ...base,
  list,
  upsertForItinerary,
  upsertForEnquiry,
  listByEnquiry,
  getByEnquiryAndItinerary,
  getStandaloneByEnquiry,
  summarizeTotals,
};
