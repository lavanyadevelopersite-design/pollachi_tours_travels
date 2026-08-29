const loginHistoryService = require('../services/loginHistory.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const result = await loginHistoryService.list(req.query);
  res.json(ApiResponse.paginated('Login history retrieved', result.data, result.pagination));
});

const summary = asyncHandler(async (req, res) => {
  const data = await loginHistoryService.getSummary(req.query);
  res.json(ApiResponse.success('Login history summary retrieved', data));
});

const userReport = asyncHandler(async (req, res) => {
  const userId = req.query.user_id || req.query.userId || req.params.userId;
  const data = await loginHistoryService.getUserReport({ ...req.query, user_id: userId });
  if (!data) throw new AppError('User login report not found', 404);
  res.json(ApiResponse.success('User login report retrieved', data));
});

module.exports = { list, summary, userReport };
