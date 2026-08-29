export const buildParams = (params = {}) => {
  const { page = 1, perPage = 10, search = '', sortBy, sortOrder, ...filters } = params;
  return {
    page,
    limit: perPage,
    search: search || undefined,
    sortBy,
    sortOrder,
    ...filters,
  };
};

export const normalizeListResponse = (data) => {
  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.rows)
      ? data.rows
      : Array.isArray(data)
        ? data
        : [];

  return {
    rows,
    pagination: data?.pagination || {
      total: rows.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };
};

export default buildParams;
