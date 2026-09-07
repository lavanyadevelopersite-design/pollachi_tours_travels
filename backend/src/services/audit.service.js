const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { AuditLog, User } = require('../models');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { buildSearchWhere } = require('../utils/helpers');

const create = async (payload) => AuditLog.create(payload);

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = {
    ...buildSearchWhere(query.search, ['action', 'module', 'description', 'ip_address'], Op),
  };

  if (query.user_id) where.user_id = query.user_id;
  if (query.module) where.module = query.module;
  if (query.action) where.action = query.action;

  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  const date = query.date;

  if (date) {
    where.created_at = {
      [Op.between]: [dayjs(date).startOf('day').toDate(), dayjs(date).endOf('day').toDate()],
    };
  } else if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = dayjs(from).startOf('day').toDate();
    if (to) where.created_at[Op.lte] = dayjs(to).endOf('day').toDate();
  }

  const orderField = sortBy === 'createdAt' ? 'created_at' : sortBy || 'created_at';

  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    limit,
    offset,
    order: [[orderField, sortOrder]],
  });

  return { data: rows, pagination: buildPaginationMeta(count, page, limit) };
};

const getById = async (id) => {
  const log = await AuditLog.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }],
  });
  return log;
};

module.exports = { create, list, getById };
