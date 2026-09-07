const express = require('express');
const driverPortalController = require('../controllers/driverPortal.controller');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  driverLoginSchema,
  updateTripSchema,
  tripIdSchema,
  shareCodeSchema,
} = require('../validators/driverPortal.validator');

const router = express.Router();

const tripKmUpload = upload.fields([
  { name: 'starting_km_photo', maxCount: 1 },
  { name: 'closing_km_photo', maxCount: 1 },
]);

router.post(
  '/auth/login',
  authLimiter,
  validate(driverLoginSchema),
  driverPortalController.login
);

router.use(authenticate);

router.get('/me', driverPortalController.me);
router.get('/status-options', driverPortalController.statusOptions);
router.get('/trips', driverPortalController.listTrips);
router.get('/trips/by-enquiry/:enquiryKey', driverPortalController.getTripByEnquiry);
router.get(
  '/trips/by-share/:code',
  validate(shareCodeSchema),
  driverPortalController.getTripByShareCode
);
router.get('/trips/:id/route', validate(tripIdSchema), driverPortalController.getTripRoute);
router.get('/trips/:id', validate(tripIdSchema), driverPortalController.getTrip);
router.patch('/trips/:id', tripKmUpload, validate(updateTripSchema), driverPortalController.updateTrip);

module.exports = router;
