const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = query.limit ?? query.per_page ?? query.perPage ?? 10;
  const limit = Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 10));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || query.sort_by || 'created_at';
  const sortOrder =
    (query.sortOrder || query.sort_order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { page, limit, offset, sortBy, sortOrder };
};

const buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});

module.exports = { getPagination, buildPaginationMeta };
