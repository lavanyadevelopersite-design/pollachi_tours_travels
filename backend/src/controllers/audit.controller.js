const auditService = require('../services/audit.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const result = await auditService.list(req.query);
  res.json(ApiResponse.paginated('Audit logs retrieved', result.data, result.pagination));
});

const getById = asyncHandler(async (req, res) => {
  const data = await auditService.getById(req.params.id);
  if (!data) throw new AppError('Audit log not found', 404);
  res.json(ApiResponse.success('Audit log retrieved', data));
});

module.exports = { list, getById };
