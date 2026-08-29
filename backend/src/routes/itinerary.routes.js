const express = require('express');
const itineraryController = require('../controllers/itinerary.controller');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createItinerarySchema,
  updateItinerarySchema,
  updateDaySchema,
  createEventSchema,
  updateEventSchema,
  reorderEventsSchema,
  placesSearchSchema,
  imagesSearchSchema,
  idParamSchema,
  assignEnquirySchema,
} = require('../validators/itinerary.validator');

const router = express.Router();

router.get('/meta/places', authorize('itineraries.view'), validate(placesSearchSchema), itineraryController.searchPlaces);
router.get('/meta/images', authorize('itineraries.view'), validate(imagesSearchSchema), itineraryController.searchImages);

router.get('/', authorize('itineraries.view'), itineraryController.list);
router.get('/:id', authorize('itineraries.view'), validate(idParamSchema), itineraryController.getById);
router.post('/', authorize('itineraries.create'), validate(createItinerarySchema), itineraryController.create);
router.post('/generate', authorize('itineraries.create'), itineraryController.generate);
router.post('/:id/regenerate', authorize('itineraries.edit'), itineraryController.regenerate);
router.put('/:id', authorize('itineraries.edit'), validate(updateItinerarySchema), itineraryController.update);
router.delete('/:id', authorize('itineraries.delete'), itineraryController.remove);

router.put(
  '/:id/days/:dayId',
  authorize('itineraries.edit'),
  validate(updateDaySchema),
  itineraryController.updateDay
);
router.post(
  '/:id/days/:dayId/events',
  authorize('itineraries.edit'),
  validate(createEventSchema),
  itineraryController.createEvent
);
router.put(
  '/:id/events/:eventId',
  authorize('itineraries.edit'),
  validate(updateEventSchema),
  itineraryController.updateEvent
);
router.delete(
  '/:id/events/:eventId',
  authorize('itineraries.edit'),
  itineraryController.deleteEvent
);
router.put(
  '/:id/days/:dayId/events/reorder',
  authorize('itineraries.edit'),
  validate(reorderEventsSchema),
  itineraryController.reorderEvents
);

router.post(
  '/:id/assign-enquiry',
  authorize('itineraries.edit', 'enquiries.edit'),
  validate(assignEnquirySchema),
  itineraryController.assignEnquiry
);
router.post(
  '/:id/unassign-enquiry',
  authorize('itineraries.edit', 'enquiries.edit'),
  validate(idParamSchema),
  itineraryController.unassignEnquiry
);
router.post(
  '/:id/confirm',
  authorize('itineraries.edit'),
  validate(idParamSchema),
  itineraryController.confirm
);
router.post(
  '/:id/send-whatsapp',
  authorize('itineraries.edit', 'enquiries.edit'),
  validate(idParamSchema),
  itineraryController.sendWhatsApp
);

router.post(
  '/:id/cover',
  authorize('itineraries.edit', 'itineraries.create'),
  upload.single('cover_image'),
  itineraryController.uploadCover
);
router.post(
  '/:id/events/:eventId/image',
  authorize('itineraries.edit', 'itineraries.create'),
  upload.single('event_image'),
  itineraryController.uploadEventImage
);

module.exports = router;
