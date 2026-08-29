const quotationService = require('../services/quotation.service');
const createCrudController = require('./crud.factory');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const base = createCrudController(quotationService, 'Quotation');

const upsertForItinerary = asyncHandler(async (req, res) => {
  const data = await quotationService.upsertForItinerary(req.body, req.user?.id || null);
  res.json(ApiResponse.success('Quotation saved', data));
});

const upsertForEnquiry = asyncHandler(async (req, res) => {
  const data = await quotationService.upsertForEnquiry(req.body, req.user?.id || null);
  res.json(ApiResponse.success('Quotation saved', data));
});

const listByEnquiry = asyncHandler(async (req, res) => {
  const data = await quotationService.listByEnquiry(req.params.enquiryId);
  res.json(ApiResponse.success('Quotations fetched', data));
});

const getByEnquiryItinerary = asyncHandler(async (req, res) => {
  const data = await quotationService.getByEnquiryAndItinerary(
    req.params.enquiryId,
    req.params.itineraryId
  );
  res.json(ApiResponse.success('Quotation fetched', data));
});

const getStandaloneByEnquiry = asyncHandler(async (req, res) => {
  const data = await quotationService.getStandaloneByEnquiry(req.params.enquiryId);
  res.json(ApiResponse.success('Quotation fetched', data));
});

module.exports = {
  ...base,
  upsertForItinerary,
  upsertForEnquiry,
  listByEnquiry,
  getByEnquiryItinerary,
  getStandaloneByEnquiry,
};
