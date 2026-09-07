const roleService = require('../services/role.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await roleService.list(req.query);
  res.json(ApiResponse.paginated('Roles retrieved', result.data, result.pagination));
});

const getById = asyncHandler(async (req, res) => {
  const role = await roleService.getById(req.params.id);
  res.json(ApiResponse.success('Role retrieved', role));
});

const create = asyncHandler(async (req, res) => {
  const role = await roleService.create(req.body, req.user.id);
  res.status(201).json(ApiResponse.success('Role created', role));
});

const update = asyncHandler(async (req, res) => {
  const role = await roleService.update(req.params.id, req.body, req.user.id);
  res.json(ApiResponse.success('Role updated', role));
});

const remove = asyncHandler(async (req, res) => {
  await roleService.remove(req.params.id);
  res.json(ApiResponse.success('Role deleted'));
});

const listPermissions = asyncHandler(async (req, res) => {
  const permissions = await roleService.listPermissions(req.query);
  res.json(ApiResponse.success('Permissions retrieved', permissions));
});

module.exports = { list, getById, create, update, remove, listPermissions };
