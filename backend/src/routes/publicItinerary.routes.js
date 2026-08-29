const express = require('express');
const publicItineraryController = require('../controllers/publicItinerary.controller');
const validate = require('../middleware/validate.middleware');
const { publicItineraryTokenSchema } = require('../validators/itinerary.validator');

const router = express.Router();

router.get(
  '/:token/view',
  validate(publicItineraryTokenSchema),
  publicItineraryController.viewPublic
);

router.get(
  '/:token',
  validate(publicItineraryTokenSchema),
  publicItineraryController.getPublic
);
module.exports = router;
