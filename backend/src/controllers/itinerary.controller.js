const itineraryService = require('../services/itinerary.service');
const placesService = require('../services/places.service');
const imagesService = require('../services/images.service');
const createCrudController = require('./crud.factory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getFileUrl, ensureUpload, normalizeUploadedImage } = require('../services/file.service');

const base = createCrudController(itineraryService, 'Itinerary');

const generate = asyncHandler(async (req, res) => {
  const data = await itineraryService.generateAiItinerary(req.body, req.user.id);
  res.status(201).json(ApiResponse.success('AI itinerary generated', data));
});

const regenerate = asyncHandler(async (req, res) => {
  const data = await itineraryService.regenerate(req.params.id, req.body, req.user.id);
  res.json(ApiResponse.success('AI itinerary regenerated', data));
});

const searchPlaces = asyncHandler(async (req, res) => {
  const data = await placesService.searchPlaces(req.query.q, req.query.limit || 8);
  res.json(ApiResponse.success('Places fetched', data));
});

const searchImages = asyncHandler(async (req, res) => {
  const data = await imagesService.searchImages(req.query);
  res.json(ApiResponse.success('Images fetched', data));
});

const updateDay = asyncHandler(async (req, res) => {
  const data = await itineraryService.updateDay(
    req.params.id,
    req.params.dayId,
    req.body,
    req.user.id
  );
  res.json(ApiResponse.success('Day updated', data));
});

const createEvent = asyncHandler(async (req, res) => {
  const data = await itineraryService.createEvent(
    req.params.id,
    req.params.dayId,
    req.body,
    req.user.id
  );
  res.status(201).json(ApiResponse.success('Event created', data));
});

const updateEvent = asyncHandler(async (req, res) => {
  const data = await itineraryService.updateEvent(
    req.params.id,
    req.params.eventId,
    req.body,
    req.user.id
  );
  res.json(ApiResponse.success('Event updated', data));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const data = await itineraryService.deleteEvent(req.params.id, req.params.eventId);
  res.json(ApiResponse.success('Event deleted', data));
});

const reorderEvents = asyncHandler(async (req, res) => {
  const data = await itineraryService.reorderEvents(
    req.params.id,
    req.params.dayId,
    req.body.ordered_ids || [],
    req.user.id
  );
  res.json(ApiResponse.success('Events reordered', data));
});

const uploadCover = asyncHandler(async (req, res) => {
  ensureUpload(req.file);
  normalizeUploadedImage(req.file);
  const cover_image = getFileUrl(req.file);
  const data = await itineraryService.update(
    req.params.id,
    { cover_image },
    req.user.id
  );
  res.json(ApiResponse.success('Cover image updated', data));
});

const uploadEventImage = asyncHandler(async (req, res) => {
  ensureUpload(req.file);
  normalizeUploadedImage(req.file);
  const image_url = getFileUrl(req.file);
  const data = await itineraryService.updateEvent(
    req.params.id,
    req.params.eventId,
    { image_url },
    req.user.id
  );
  res.json(ApiResponse.success('Event image updated', data));
});

const assignEnquiry = asyncHandler(async (req, res) => {
  const data = await itineraryService.assignToEnquiry(
    req.params.id,
    req.body.enquiry_id,
    req.user.id
  );
  res.json(ApiResponse.success('Itinerary added to enquiry', data));
});

const unassignEnquiry = asyncHandler(async (req, res) => {
  const data = await itineraryService.unassignFromEnquiry(req.params.id, req.user.id);
  res.json(ApiResponse.success('Itinerary removed from enquiry', data));
});

const confirm = asyncHandler(async (req, res) => {
  const data = await itineraryService.confirmItinerary(req.params.id, req.user.id);
  res.json(ApiResponse.success('Itinerary confirmed', data));
});

const sendWhatsApp = asyncHandler(async (req, res) => {
  const result = await itineraryService.sendItineraryViaWhatsApp(req.params.id);
  if (result.skipped) {
    const reasonMessages = {
      missing_customer_phone: 'Customer WhatsApp number is missing or invalid on this enquiry',
      invalid_phone: 'Customer WhatsApp number is missing or invalid on this enquiry',
      missing_itinerary_link: 'Could not create itinerary share link',
      wasender_disabled: 'Wasender WhatsApp is not configured. Add WASENDER_API_KEY in backend .env',
      wasender_failed: result.error || 'Failed to send WhatsApp message via Wasender',
    };
    return res.status(422).json(
      ApiResponse.error(
        reasonMessages[result.reason] || result.error || result.reason || 'WhatsApp message was not sent',
        null,
        result
      )
    );
  }

  res.json(ApiResponse.success('Itinerary preview link sent to customer on WhatsApp', result));
});

module.exports = {
  ...base,
  generate,
  regenerate,
  searchPlaces,
  searchImages,
  updateDay,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,
  uploadCover,
  uploadEventImage,
  assignEnquiry,
  unassignEnquiry,
  confirm,
  sendWhatsApp,
};
