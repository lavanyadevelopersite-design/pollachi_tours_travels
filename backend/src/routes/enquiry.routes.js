const express = require('express');
const enquiryController = require('../controllers/enquiry.controller');
const feedbackController = require('../controllers/feedback.controller');
const validate = require('../middleware/validate.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const upload = require('../middleware/upload.middleware');
const { shareFeedbackWhatsAppSchema } = require('../validators/feedback.validator');
const {
  createEnquirySchema,
  updateEnquirySchema,
  updateEnquiryStatusSchema,
  distanceSchema,
  tripCostSchema,
  enquiryNoteSchema,
  sendCustomerWhatsAppSchema,
  enquiryIdParamSchema,
  vehicleAssignmentSchema,
  vehicleAssignmentUpdateSchema,
  vehicleAssignmentIdSchema,
  shareDriverLoginSchema,
  monthlyTripsSchema,
  assignedTripsSchema,
} = require('../validators/enquiry.validator');

const router = express.Router();

router.get('/', authorize('enquiries.view'), enquiryController.list);
router.get(
  '/services/monthly-trips',
  authorize('enquiries.view'),
  validate(monthlyTripsSchema),
  enquiryController.getMonthlyTrips
);
router.get(
  '/services/assigned-trips',
  authorize('enquiries.view', 'vehicles.view', 'drivers.view'),
  validate(assignedTripsSchema),
  enquiryController.listAssignedTrips
);
router.get(
  '/services/assignable-resources',
  authorize('enquiries.view'),
  enquiryController.listAssignableResources
);
router.get(
  '/services/customers',
  authorize('enquiries.view', 'enquiries.create'),
  enquiryController.listCustomers
);
router.get(
  '/services/customers/by-phone',
  authorize('enquiries.view', 'enquiries.create'),
  enquiryController.findCustomerByPhone
);
router.get(
  '/services/pipeline-stats',
  authorize('enquiries.view'),
  enquiryController.getPipelineStats
);
router.post(
  '/services/distance',
  authorize('enquiries.view'),
  validate(distanceSchema),
  enquiryController.calculateDistance
);
router.post(
  '/services/trip-cost',
  authorize('enquiries.view'),
  validate(tripCostSchema),
  enquiryController.calculateTripCost
);
router.post('/', authorize('enquiries.create'), validate(createEnquirySchema), enquiryController.create);
router.post(
  '/:id/convert',
  authorize('enquiries.edit'),
  enquiryController.convertToLead
);
router.patch(
  '/:id/status',
  authorize('enquiries.edit'),
  validate(updateEnquiryStatusSchema),
  enquiryController.updateStatus
);
router.get(
  '/:id/notes',
  authorize('enquiries.view'),
  validate(enquiryIdParamSchema),
  enquiryController.listNotes
);
router.post(
  '/:id/notes',
  authorize('enquiries.edit'),
  validate(enquiryNoteSchema),
  enquiryController.addNote
);
router.get(
  '/:id/history',
  authorize('enquiries.view'),
  validate(enquiryIdParamSchema),
  enquiryController.getHistory
);
router.post(
  '/:id/feedback-link',
  authorize('enquiries.edit', 'feedback.create'),
  validate(enquiryIdParamSchema),
  feedbackController.createShareLink
);
router.post(
  '/:id/feedback-link/share-whatsapp',
  authorize('enquiries.edit', 'feedback.create'),
  validate(shareFeedbackWhatsAppSchema),
  feedbackController.shareFeedbackWhatsApp
);
router.get(
  '/:id/vehicles',
  authorize('enquiries.view'),
  validate(enquiryIdParamSchema),
  enquiryController.listVehicleAssignments
);
router.post(
  '/:id/vehicles',
  authorize('enquiries.edit'),
  validate(vehicleAssignmentSchema),
  enquiryController.addVehicleAssignment
);
router.put(
  '/:id/vehicles/:subId',
  authorize('enquiries.edit'),
  validate(vehicleAssignmentUpdateSchema),
  enquiryController.updateVehicleAssignment
);
router.delete(
  '/:id/vehicles/:subId',
  authorize('enquiries.edit'),
  validate(vehicleAssignmentIdSchema),
  enquiryController.removeVehicleAssignment
);
router.post(
  '/:id/vehicles/:subId/share-driver-login',
  authorize('enquiries.edit'),
  validate(shareDriverLoginSchema),
  enquiryController.shareDriverLoginWhatsApp
);
router.get(
  '/:id/customer-messages',
  authorize('enquiries.view'),
  validate(enquiryIdParamSchema),
  enquiryController.listCustomerWhatsAppMessages
);
router.post(
  '/:id/customer-messages',
  authorize('enquiries.edit'),
  validate(sendCustomerWhatsAppSchema),
  enquiryController.sendCustomerWhatsApp
);
router.get(
  '/:id/whatsapp-messages',
  authorize('enquiries.view'),
  validate(enquiryIdParamSchema),
  enquiryController.listCustomerWhatsAppMessages
);
router.post(
  '/:id/whatsapp',
  authorize('enquiries.edit'),
  validate(sendCustomerWhatsAppSchema),
  enquiryController.sendCustomerWhatsApp
);
router.post(
  '/:id/invoice/share-whatsapp',
  authorize('enquiries.edit'),
  validate(enquiryIdParamSchema),
  upload.memoryUpload.single('invoice_image'),
  enquiryController.shareInvoiceWhatsApp
);
router.get('/:id', authorize('enquiries.view'), enquiryController.getById);
router.put('/:id', authorize('enquiries.edit'), validate(updateEnquirySchema), enquiryController.update);
router.delete('/:id', authorize('enquiries.delete'), enquiryController.remove);

module.exports = router;
