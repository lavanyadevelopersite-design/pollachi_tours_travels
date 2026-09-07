const { Op } = require('sequelize');
const { Expense, ExpensesType, Booking, Supplier, Branch } = require('../models');
const createCrudService = require('./crud.factory');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { buildSearchWhere } = require('../utils/helpers');

const defaultIncludes = [
  { model: Booking, as: 'booking', attributes: ['id', 'booking_code'] },
  { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'code'] },
  { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
];

const searchFields = ['expense_code', 'title', 'category'];

const base = createCrudService(Expense, {
  searchFields,
  defaultIncludes,
  codeField: 'expense_code',
  codePrefix: 'EXP',
});

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = { ...buildSearchWhere(query.search, searchFields, Op) };

  if (query.status) where.status = query.status;
  if (query.category) where.category = query.category;
  if (query.branch_id) where.branch_id = query.branch_id;

  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (from || to) {
    where.expense_date = {};
    if (from) where.expense_date[Op.gte] = from;
    if (to) where.expense_date[Op.lte] = to;
  }

  const orderField = sortBy || 'expense_date';

  const { rows, count } = await Expense.findAndCountAll({
    where,
    include: defaultIncludes,
    limit,
    offset,
    order: [[orderField, sortOrder]],
    distinct: true,
  });

  return {
    data: rows,
    pagination: buildPaginationMeta(count, page, limit),
  };
};

const listCategories = async () => {
  const rows = await ExpensesType.findAll({
    where: { is_active: true },
    attributes: ['id', 'name', 'code'],
    order: [['name', 'ASC']],
  });
  return rows;
};

module.exports = {
  ...base,
  list,
  listCategories,
};
