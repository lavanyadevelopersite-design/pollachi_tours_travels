const { Op } = require('sequelize');
const { Payment, Enquiry, Quotation, User, Package, Itinerary } = require('../models');
const createCrudService = require('./crud.factory');
const AppError = require('../utils/AppError');
const { getFileUrl } = require('./file.service');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const whatsappNotification = require('./whatsappNotification.service');
const enquiryService = require('./enquiry.service');

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
      'travel_from',
      'travel_to',
      'travel_from_destination',
      'travel_to_destination',
      'adults',
      'children',
      'infants',
      'package_id',
      'assigned_to',
    ],
    include: [
      { model: Package, as: 'package', attributes: ['id', 'name'] },
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
  },
  {
    model: Quotation,
    as: 'quotation',
    attributes: [
      'id',
      'quotation_code',
      'total_amount',
      'status',
      'customer_name',
      'email',
      'phone',
      'travel_from',
      'travel_to',
      'adults',
      'children',
      'package_id',
      'itinerary_id',
    ],
    include: [
      { model: Package, as: 'package', attributes: ['id', 'name'] },
      {
        model: Itinerary,
        as: 'itinerary',
        attributes: ['id', 'title', 'from_date', 'to_date', 'days', 'nights', 'adults', 'children'],
      },
    ],
  },
  { model: User, as: 'receiver', attributes: ['id', 'first_name', 'last_name', 'email'] },
  { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
];

const quotationInclude = [
  { model: Package, as: 'package', attributes: ['id', 'name'] },
  {
    model: Itinerary,
    as: 'itinerary',
    attributes: ['id', 'title', 'from_date', 'to_date', 'days', 'nights', 'adults', 'children'],
  },
];

const resolveQuotationForPayment = async (plain = {}) => {
  if (plain.quotation?.quotation_code) return plain.quotation;

  const enquiryId = plain.enquiry_id;
  if (!enquiryId) return plain.quotation || null;

  if (plain.quotation_id) {
    const linked = await Quotation.findByPk(plain.quotation_id, { include: quotationInclude });
    if (linked) return linked.toJSON ? linked.toJSON() : linked;
  }

  const standalone = await Quotation.findOne({
    where: { enquiry_id: enquiryId, itinerary_id: null },
    include: quotationInclude,
    order: [['updated_at', 'DESC']],
  });
  if (standalone) return standalone.toJSON ? standalone.toJSON() : standalone;

  const latest = await Quotation.findOne({
    where: { enquiry_id: enquiryId },
    include: quotationInclude,
    order: [['updated_at', 'DESC']],
  });
  return latest ? (latest.toJSON ? latest.toJSON() : latest) : plain.quotation || null;
};

const base = createCrudService(Payment, {
  searchFields: ['payment_code', 'payment_mode', 'reference_no', 'transaction_id', 'notes'],
  defaultIncludes,
});

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = {};

  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { payment_code: { [Op.like]: term } },
      { payment_mode: { [Op.like]: term } },
      { reference_no: { [Op.like]: term } },
      { transaction_id: { [Op.like]: term } },
      { notes: { [Op.like]: term } },
      { '$enquiry.enquiry_code$': { [Op.like]: term } },
      { '$enquiry.customer_name$': { [Op.like]: term } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.enquiry_id) where.enquiry_id = query.enquiry_id;
  if (query.quotation_id) where.quotation_id = query.quotation_id;
  if (query.payment_type) where.payment_type = query.payment_type;

  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (from || to) {
    where.payment_date = {};
    if (from) where.payment_date[Op.gte] = from;
    if (to) where.payment_date[Op.lte] = to;
  }

  const orderField =
    sortBy === 'paymentDate' || sortBy === 'createdAt'
      ? sortBy === 'createdAt'
        ? 'created_at'
        : 'payment_date'
      : sortBy || 'payment_date';

  const { rows, count } = await Payment.findAndCountAll({
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

const nextPaymentCode = async (paymentType = 'advance') => {
  const year = new Date().getFullYear();
  const kind = paymentType === 'remaining' ? 'BAL' : 'ADV';
  const prefix = `PAY/${kind}/${year}/`;
  const last = await Payment.findOne({
    where: { payment_code: { [Op.like]: `${prefix}%` } },
    order: [['payment_code', 'DESC']],
    paranoid: false,
    attributes: ['payment_code'],
  });

  let next = 1;
  if (last?.payment_code) {
    const parts = String(last.payment_code).split('/');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(5, '0')}`;
};

const withPaidSummary = async (record) => {
  if (!record) return record;
  const plain = record.toJSON ? record.toJSON() : { ...record };
  const enquiryId = plain.enquiry_id;

  let alreadyPaid = 0;
  if (enquiryId) {
    const siblings = await Payment.findAll({
      where: { enquiry_id: enquiryId },
      attributes: ['id', 'advance_amount', 'created_at', 'payment_code'],
      order: [
        ['created_at', 'ASC'],
        ['payment_code', 'ASC'],
      ],
    });
    for (const row of siblings) {
      if (row.id === plain.id) break;
      alreadyPaid += Number(row.advance_amount) || 0;
    }
  }

  const resolvedQuotation = await resolveQuotationForPayment(plain);
  if (resolvedQuotation) plain.quotation = resolvedQuotation;

  const quotationAmount = Number(plain.quotation_amount) || Number(plain.quotation?.total_amount) || 0;
  const receivedAmount = Number(plain.advance_amount) || 0;
  plain.already_paid = alreadyPaid;
  plain.balance_amount = Math.max(quotationAmount - alreadyPaid - receivedAmount, 0);
  return plain;
};

const getById = async (id) => {
  const record = await Payment.findByPk(id, { include: defaultIncludes });
  if (!record) throw new AppError('Payment not found', 404);
  return withPaidSummary(record);
};

const create = async (payload, userId = null, file = null) => {
  if (!payload.enquiry_id) throw new AppError('Enquiry is required', 422);
  if (!payload.payment_date) throw new AppError('Payment date is required', 422);
  if (!payload.payment_mode) throw new AppError('Payment mode is required', 422);
  if (payload.advance_amount === undefined || payload.advance_amount === null || payload.advance_amount === '') {
    throw new AppError('Advance amount is required', 422);
  }

  const data = { ...payload };
  data.payment_type = data.payment_type === 'remaining' ? 'remaining' : 'advance';
  data.payment_code = await nextPaymentCode(data.payment_type);
  data.advance_amount = Number(data.advance_amount) || 0;
  data.quotation_amount = Number(data.quotation_amount) || 0;
  data.advance_percentage =
    data.quotation_amount > 0
      ? Number(((data.advance_amount / data.quotation_amount) * 100).toFixed(2))
      : Number(data.advance_percentage) || 0;
  data.status = data.status || 'received';

  if (file) {
    data.proof_file = getFileUrl(file);
  }

  if (userId) {
    data.created_by = userId;
    data.updated_by = userId;
    if (!data.received_by) data.received_by = userId;
  }

  if (!data.quotation_id && data.enquiry_id) {
    const linkedQuotation = await resolveQuotationForPayment({ enquiry_id: data.enquiry_id });
    if (linkedQuotation?.id) data.quotation_id = linkedQuotation.id;
  }

  const created = await Payment.create(data);
  const record = await getById(created.id);
  await enquiryService.maybeMarkFullyPaid(data.enquiry_id, userId);
  return record;
};

const shareReceiptWhatsApp = async (paymentId, imageBuffer) => {
  const payment = await getById(paymentId);
  return whatsappNotification.sendPaymentReceiptWhatsApp({ payment, imageBuffer });
};

const update = async (id, payload, userId = null, file = null) => {
  const record = await Payment.findByPk(id);
  if (!record) throw new AppError('Payment not found', 404);
  const data = { ...payload };

  if (data.advance_amount !== undefined) {
    data.advance_amount = Number(data.advance_amount) || 0;
  }
  if (data.quotation_amount !== undefined) {
    data.quotation_amount = Number(data.quotation_amount) || 0;
  }

  const advance = data.advance_amount !== undefined ? data.advance_amount : Number(record.advance_amount);
  const quotation =
    data.quotation_amount !== undefined ? data.quotation_amount : Number(record.quotation_amount);
  if (quotation > 0) {
    data.advance_percentage = Number(((advance / quotation) * 100).toFixed(2));
  }

  if (file) {
    data.proof_file = getFileUrl(file);
  }
  if (userId) data.updated_by = userId;

  await record.update(data);
  const updated = await getById(id);
  await enquiryService.maybeMarkFullyPaid(updated.enquiry_id, userId);
  return updated;
};

module.exports = { ...base, list, getById, create, update, shareReceiptWhatsApp };
