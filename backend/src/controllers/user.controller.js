const userService = require('../services/user.service');

const { ensureUpload } = require('../services/file.service');

const ApiResponse = require('../utils/ApiResponse');

const asyncHandler = require('../utils/asyncHandler');



const attachUserUploads = (req) => {

  const data = { ...req.body };

  if (req.file) {

    data.avatar = ensureUpload(req.file).url;

  }

  return data;

};



const list = asyncHandler(async (req, res) => {

  const result = await userService.list(req.query);

  res.json(ApiResponse.paginated('Users retrieved', result.data, result.pagination));

});



const getById = asyncHandler(async (req, res) => {

  const user = await userService.getById(req.params.id);

  res.json(ApiResponse.success('User retrieved', user));

});



const create = asyncHandler(async (req, res) => {

  const user = await userService.create(attachUserUploads(req), req.user.id);

  res.status(201).json(ApiResponse.success('User created', user));

});



const update = asyncHandler(async (req, res) => {

  const user = await userService.update(req.params.id, attachUserUploads(req), req.user.id);

  res.json(ApiResponse.success('User updated', user));

});



const remove = asyncHandler(async (req, res) => {

  await userService.remove(req.params.id);

  res.json(ApiResponse.success('User deleted'));

});



module.exports = { list, getById, create, update, remove };

