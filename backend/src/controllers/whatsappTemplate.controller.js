const whatsappTemplateService = require('../services/whatsappTemplate.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const rows = await whatsappTemplateService.listAll();
  res.json(ApiResponse.success('WhatsApp templates retrieved', rows));
});

const getById = asyncHandler(async (req, res) => {
  const row = await whatsappTemplateService.getById(req.params.id);
  res.json(ApiResponse.success('WhatsApp template retrieved', row));
});

const create = asyncHandler(async (req, res) => {
  const row = await whatsappTemplateService.create(req.body, req.user?.id);
  res.status(201).json(ApiResponse.success('WhatsApp template created', row));
});

const update = asyncHandler(async (req, res) => {
  const row = await whatsappTemplateService.update(req.params.id, req.body, req.user?.id);
  res.json(ApiResponse.success('WhatsApp template updated', row));
});

const updateStatus = asyncHandler(async (req, res) => {
  const row = await whatsappTemplateService.updateActiveStatus(
    req.params.id,
    req.body.is_active,
    req.user?.id
  );
  res.json(ApiResponse.success('Template status updated', row));
});

const remove = asyncHandler(async (_req, res) => {
  res.status(403).json(ApiResponse.error('WhatsApp templates cannot be deleted'));
});

module.exports = {
  list,
  getById,
  create,
  update,
  updateStatus,
  remove,
};
