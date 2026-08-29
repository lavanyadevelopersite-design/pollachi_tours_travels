const express = require('express');
const enquiryController = require('../controllers/enquiry.controller');
const validate = require('../middleware/validate.middleware');
const {
  publicEnquirySchema,
  distanceSchema,
  tripCostSchema,
  placesSchema,
} = require('../validators/enquiry.validator');

const router = express.Router();

router.get('/masters', enquiryController.publicMasters);
router.get('/states', enquiryController.publicStates);
router.get('/cities', enquiryController.publicCities);
router.get('/places', validate(placesSchema), enquiryController.searchPlaces);
router.post('/distance', validate(distanceSchema), enquiryController.calculateDistance);
router.post('/trip-cost', validate(tripCostSchema), enquiryController.calculateTripCost);
router.post('/', validate(publicEnquirySchema), enquiryController.submitPublic);

module.exports = router;
