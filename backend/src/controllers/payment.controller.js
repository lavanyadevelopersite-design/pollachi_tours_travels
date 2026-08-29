const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
module.exports = {
  list: asyncHandler(async (req, res) => {
    const result = await paymentService.list(req.query);
    res.json(ApiResponse.paginated('Payments retrieved', result.data, result.pagination));
  }),

  getById: asyncHandler(async (req, res) => {
    const record = await paymentService.getById(req.params.id);
    res.json(ApiResponse.success('Payment retrieved', record));
  }),

  create: asyncHandler(async (req, res) => {
    const record = await paymentService.create(req.body, req.user.id, req.file);
    res.status(201).json(ApiResponse.success('Payment created', record));
  }),

  update: asyncHandler(async (req, res) => {
    const record = await paymentService.update(req.params.id, req.body, req.user.id, req.file);
    res.json(ApiResponse.success('Payment updated', record));
  }),

  remove: asyncHandler(async (req, res) => {
    await paymentService.remove(req.params.id);
    res.json(ApiResponse.success('Payment deleted'));
  }),

  shareReceipt: asyncHandler(async (req, res) => {
    const imageBuffer = req.file?.buffer;
    if (!imageBuffer?.length) {
      throw new AppError('Receipt image is required', 422);
    }

    const result = await paymentService.shareReceiptWhatsApp(req.params.id, imageBuffer);
    if (result?.success) {
      res.json(ApiResponse.success('Receipt shared on WhatsApp', result));
      return;
    }

    const reason = result?.error || result?.reason || 'Failed to share receipt on WhatsApp';
    throw new AppError(reason, 422);
  }),
};
