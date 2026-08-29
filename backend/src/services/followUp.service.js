const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { FollowUp, Lead, Enquiry, User } = require('../models');
const createCrudService = require('./crud.factory');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const defaultIncludes = [
  { model: Lead, as: 'lead', attributes: ['id', 'lead_code', 'first_name', 'last_name'] },
  { model: Enquiry, as: 'enquiry', attributes: ['id', 'enquiry_code', 'customer_name'] },
  { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] },
  { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
  { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name', 'email'] },
];

const base = createCrudService(FollowUp, {
  searchFields: ['notes', 'type', 'outcome'],
  defaultIncludes,
});

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = {};

  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { notes: { [Op.like]: term } },
      { type: { [Op.like]: term } },
      { outcome: { [Op.like]: term } },
      { '$enquiry.enquiry_code$': { [Op.like]: term } },
      { '$enquiry.customer_name$': { [Op.like]: term } },
      { '$lead.lead_code$': { [Op.like]: term } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.enquiry_id) where.enquiry_id = query.enquiry_id;
  if (query.lead_id) where.lead_id = query.lead_id;
  if (query.assigned_to) where.assigned_to = query.assigned_to;
  if (query.type) where.type = query.type;

  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (from || to) {
    where.follow_up_date = {};
    if (from) where.follow_up_date[Op.gte] = dayjs(from).startOf('day').toDate();
    if (to) where.follow_up_date[Op.lte] = dayjs(to).endOf('day').toDate();
  }

  const orderField =
    sortBy === 'followUpDate' || sortBy === 'followupDate' ? 'follow_up_date' : sortBy || 'follow_up_date';

  const { rows, count } = await FollowUp.findAndCountAll({
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
