const { Op } = require('sequelize');
const dayjs = require('dayjs');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { buildSearchWhere } = require('../utils/helpers');

/**
 * Creates a standard CRUD service for a Sequelize model.
 */
const createCrudService = (Model, options = {}) => {
  const {
    searchFields = ['name'],
    defaultIncludes = [],
    codeField = null,
    codePrefix = '',
  } = options;

  const list = async (query = {}) => {
    const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
    const where = { ...buildSearchWhere(query.search, searchFields, Op) };

    if (query.status) where.status = query.status;
    if (query.is_active !== undefined) {
      where.is_active = query.is_active === 'true' || query.is_active === true;
    }
    if (query.branch_id) where.branch_id = query.branch_id;

    const from = query.from || query.date_from || query.start_date;
    const to = query.to || query.date_to || query.end_date;
    if ((from || to) && Model.rawAttributes.created_at) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = dayjs(from).startOf('day').toDate();
      if (to) where.created_at[Op.lte] = dayjs(to).endOf('day').toDate();
    }

    Object.keys(query).forEach((key) => {
      if (
        ![
          'page',
          'perPage',
          'limit',
          'offset',
          'search',
          'sortBy',
          'sortOrder',
          'status',
          'is_active',
          'branch_id',
          'from',
          'to',
          'date_from',
          'date_to',
          'start_date',
          'end_date',
        ].includes(key)
        && query[key] !== undefined
        && query[key] !== ''
      ) {
        if (Model.rawAttributes[key]) {
          where[key] = query[key];
        }
      }
    });

    const { rows, count } = await Model.findAndCountAll({
      where,
      include: defaultIncludes,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true,
    });

    return {
      data: rows,
      pagination: buildPaginationMeta(count, page, limit),
    };
  };

  const getById = async (id) => {
    const record = await Model.findByPk(id, { include: defaultIncludes });
    if (!record) throw new AppError(`${Model.name} not found`, 404);
    return record;
  };

  const create = async (payload, userId = null) => {
    const data = { ...payload };
    if (userId) {
      data.created_by = userId;
      data.updated_by = userId;
    }
    if (codeField && !data[codeField] && codePrefix) {
      const { generateCode } = require('../utils/helpers');
      data[codeField] = generateCode(codePrefix);
    }
    return Model.create(data);
  };

  const update = async (id, payload, userId = null) => {
    const record = await getById(id);
    const data = { ...payload };
    if (userId) data.updated_by = userId;
    await record.update(data);
    return getById(id);
  };

  const remove = async (id) => {
    const record = await getById(id);
    await record.destroy();
    return true;
  };

  return { list, getById, create, update, remove };
};

module.exports = createCrudService;
