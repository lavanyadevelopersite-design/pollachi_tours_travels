const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const validate = require('../middleware/validate.middleware');
const {
  publicFeedbackTokenSchema,
  publicFeedbackSubmitSchema,
} = require('../validators/feedback.validator');

const router = express.Router();

router.get(
  '/:token',
  validate(publicFeedbackTokenSchema),
  feedbackController.getPublic
);
router.post(
  '/:token',
  validate(publicFeedbackSubmitSchema),
  feedbackController.submitPublic
);

module.exports = router;
