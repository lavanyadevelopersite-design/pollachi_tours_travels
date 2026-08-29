const userTablePreferenceService = require('../services/userTablePreference.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const data = await userTablePreferenceService.listForUser(req.user.id);
  res.json(ApiResponse.success('Table preferences fetched', data));
});

const getOne = asyncHandler(async (req, res) => {
  const data = await userTablePreferenceService.getForUser(req.user.id, req.params.tableKey);
  res.json(ApiResponse.success('Table preference fetched', data));
});

const upsert = asyncHandler(async (req, res) => {
  const data = await userTablePreferenceService.upsertForUser(
    req.user.id,
    req.params.tableKey,
    req.body?.hidden_columns
  );
  res.json(ApiResponse.success('Table preference saved', data));
});

module.exports = { list, getOne, upsert };
