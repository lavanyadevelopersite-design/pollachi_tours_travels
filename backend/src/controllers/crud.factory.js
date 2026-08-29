const createCrudController = (service, resourceName) => {
  const ApiResponse = require('../utils/ApiResponse');
  const asyncHandler = require('../utils/asyncHandler');

  return {
    list: asyncHandler(async (req, res) => {
      const result = await service.list(req.query);
      res.json(ApiResponse.paginated(`${resourceName}s retrieved`, result.data, result.pagination));
    }),
    getById: asyncHandler(async (req, res) => {
      const record = await service.getById(req.params.id);
      res.json(ApiResponse.success(`${resourceName} retrieved`, record));
    }),
    create: asyncHandler(async (req, res) => {
      const record = await service.create(req.body, req.user.id);
      res.status(201).json(ApiResponse.success(`${resourceName} created`, record));
    }),
    update: asyncHandler(async (req, res) => {
      const record = await service.update(req.params.id, req.body, req.user.id);
      res.json(ApiResponse.success(`${resourceName} updated`, record));
    }),
    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      res.json(ApiResponse.success(`${resourceName} deleted`));
    }),
  };
};

module.exports = createCrudController;
