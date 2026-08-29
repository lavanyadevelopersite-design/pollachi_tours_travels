const feedbackService = require('../services/feedback.service');
const createCrudController = require('./crud.factory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const crud = createCrudController(feedbackService, 'Feedback');

module.exports = {
  ...crud,
  createShareLink: asyncHandler(async (req, res) => {
    const data = await feedbackService.createOrGetShareLink(req.params.id, req.user?.id);
    res.json(ApiResponse.success('Feedback share link ready', data));
  }),
  shareFeedbackWhatsApp: asyncHandler(async (req, res) => {
    const result = await feedbackService.shareFeedbackWhatsApp(
      req.params.id,
      req.user?.id,
      req.body || {}
    );
    if (result?.success) {
      res.json(ApiResponse.success('Feedback link shared on WhatsApp', result));
      return;
    }

    const reason =
      result?.error || result?.reason || 'Failed to share feedback link on WhatsApp';
    throw new AppError(reason, 422);
  }),
  getPublic: asyncHandler(async (req, res) => {
    const data = await feedbackService.getPublicFeedback(req.params.token);
    res.json(ApiResponse.success('Feedback form retrieved', data));
  }),
  submitPublic: asyncHandler(async (req, res) => {
    const data = await feedbackService.submitPublicFeedback(req.params.token, req.body);
    res.status(201).json(ApiResponse.success('Thank you for your feedback', data));
  }),
};
