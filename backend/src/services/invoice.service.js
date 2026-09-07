const { Op } = require('sequelize');
const { Invoice, Booking, Branch, Enquiry, User } = require('../models');
const createCrudService = require('./crud.factory');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const defaultIncludes = [
  {
    model: Booking,
    as: 'booking',
    attributes: ['id', 'booking_code', 'enquiry_id', 'assigned_to', 'created_by'],
    include: [
      {
        model: Enquiry,
        as: 'enquiry',
        attributes: ['id', 'enquiry_code', 'customer_name', 'assigned_to'],
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        ],
      },
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
  },
  { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
  { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
];

const base = createCrudService(Invoice, {
  searchFields: ['invoice_number', 'customer_name', 'email', 'phone'],
  defaultIncludes,
  codeField: 'invoice_number',
  codePrefix: 'INV',
});

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = {};

  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { invoice_number: { [Op.like]: term } },
      { customer_name: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { '$booking.booking_code$': { [Op.like]: term } },
      { '$booking.enquiry.enquiry_code$': { [Op.like]: term } },
      { '$booking.enquiry.customer_name$': { [Op.like]: term } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.booking_id) where.booking_id = query.booking_id;
  if (query.branch_id) where.branch_id = query.branch_id;

  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (from || to) {
    where.invoice_date = {};
    if (from) where.invoice_date[Op.gte] = from;
    if (to) where.invoice_date[Op.lte] = to;
  }

  const orderField =
    sortBy === 'invoiceDate' || sortBy === 'dueDate'
      ? sortBy === 'dueDate'
        ? 'due_date'
        : 'invoice_date'
      : sortBy || 'invoice_date';

  const { rows, count } = await Invoice.findAndCountAll({
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
};
