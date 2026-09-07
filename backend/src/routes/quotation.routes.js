const express = require('express');
const quotationController = require('../controllers/quotation.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('quotations.view'), quotationController.list);
router.get(
  '/by-enquiry/:enquiryId/standalone',
  authorize('quotations.view', 'enquiries.view'),
  quotationController.getStandaloneByEnquiry
);
router.get(
  '/by-enquiry/:enquiryId',
  authorize('quotations.view', 'enquiries.view'),
  quotationController.listByEnquiry
);
router.get(
  '/by-enquiry/:enquiryId/itinerary/:itineraryId',
  authorize('quotations.view', 'enquiries.view'),
  quotationController.getByEnquiryItinerary
);
router.post(
  '/upsert-itinerary',
  authorize('quotations.create', 'quotations.edit', 'enquiries.edit'),
  quotationController.upsertForItinerary
);
router.post(
  '/upsert-enquiry',
  authorize('quotations.create', 'quotations.edit', 'enquiries.edit'),
  quotationController.upsertForEnquiry
);

router.get('/:id', authorize('quotations.view'), quotationController.getById);
router.post('/', authorize('quotations.create'), quotationController.create);
router.put('/:id', authorize('quotations.edit'), quotationController.update);
router.delete('/:id', authorize('quotations.delete'), quotationController.remove);

module.exports = router;
