const enquiryService = require('../services/enquiry.service');
const createCrudController = require('./crud.factory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const base = createCrudController(enquiryService, 'Enquiry');

module.exports = {
  ...base,

  create: asyncHandler(async (req, res) => {
    const record = await enquiryService.create(req.body, req.user?.id || null);
    res.status(201).json(ApiResponse.success('Enquiry created', record));
  }),

  submitPublic: asyncHandler(async (req, res) => {
    const record = await enquiryService.submitPublic(req.body);
    res.status(201).json(
      ApiResponse.success('Enquiry submitted successfully', {
        id: record.id,
        enquiry_code: record.enquiry_code,
        customer_name: record.customer_name,
        estimated_trip_cost: record.estimated_trip_cost,
        approx_distance_km: record.approx_distance_km,
      })
    );
  }),

  convertToLead: asyncHandler(async (req, res) => {
    const result = await enquiryService.convertToLead(req.params.id, req.user.id);
    res.json(ApiResponse.success('Enquiry converted to lead', result));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const record = await enquiryService.updateStatus(
      req.params.id,
      {
        status: req.body.status,
        lead_status_id: req.body.lead_status_id,
      },
      req.user?.id || null,
      req.user?.role?.code || req.user?.role_code || null
    );
    res.json(ApiResponse.success('Enquiry status updated', record));
  }),

  calculateDistance: asyncHandler(async (req, res) => {
    const result = await enquiryService.calculateDistance(req.body);
    res.json(ApiResponse.success('Distance calculated', result));
  }),

  calculateTripCost: asyncHandler(async (req, res) => {
    const result = await enquiryService.calculateTripCost({
      countryId: req.body.country_id,
      travelDate: req.body.travel_date,
    });
    res.json(ApiResponse.success('Trip cost calculated', result));
  }),

  searchPlaces: asyncHandler(async (req, res) => {
    const result = await enquiryService.searchPlaces(req.query.q);
    res.json(ApiResponse.success('Places retrieved', result));
  }),

  publicMasters: asyncHandler(async (req, res) => {
    const result = await enquiryService.getPublicMasters();
    res.json(ApiResponse.success('Masters retrieved', result));
  }),

  publicStates: asyncHandler(async (req, res) => {
    const result = await enquiryService.getPublicStates(req.query.country_id);
    res.json(ApiResponse.success('States retrieved', result));
  }),

  publicCities: asyncHandler(async (req, res) => {
    const result = await enquiryService.getPublicCities(req.query.state_id);
    res.json(ApiResponse.success('Cities retrieved', result));
  }),

  listNotes: asyncHandler(async (req, res) => {
    const notes = await enquiryService.listNotes(req.params.id);
    res.json(ApiResponse.success('Notes retrieved', notes));
  }),

  addNote: asyncHandler(async (req, res) => {
    const note = await enquiryService.addNote(req.params.id, req.body.note, req.user?.id || null);
    res.status(201).json(ApiResponse.success('Note added', note));
  }),

  getHistory: asyncHandler(async (req, res) => {
    const history = await enquiryService.getHistory(req.params.id);
    res.json(ApiResponse.success('History retrieved', history));
  }),

  listVehicleAssignments: asyncHandler(async (req, res) => {
    const rows = await enquiryService.listVehicleAssignments(req.params.id);
    res.json(ApiResponse.success('Vehicle assignments retrieved', rows));
  }),

  listAssignableResources: asyncHandler(async (_req, res) => {
    const data = await enquiryService.listAssignableResources();
    res.json(ApiResponse.success('Assignable vehicles and drivers retrieved', data));
  }),

  addVehicleAssignment: asyncHandler(async (req, res) => {
    const record = await enquiryService.addVehicleAssignment(
      req.params.id,
      req.body,
      req.user?.id || null
    );
    const full = await enquiryService.listVehicleAssignments(req.params.id);
    const created = full.find((r) => r.id === record.id);
    const payload = created?.toJSON ? created.toJSON() : created || record;
    if (record?.whatsapp) payload.whatsapp = record.whatsapp;
    res.status(201).json(ApiResponse.success('Vehicle assigned', payload));
  }),

  updateVehicleAssignment: asyncHandler(async (req, res) => {
    const record = await enquiryService.updateVehicleAssignment(
      req.params.subId,
      req.body,
      req.user?.id || null
    );
    res.json(ApiResponse.success('Vehicle assignment updated', record));
  }),

  removeVehicleAssignment: asyncHandler(async (req, res) => {
    await enquiryService.removeVehicleAssignment(req.params.subId);
    res.json(ApiResponse.success('Vehicle assignment removed'));
  }),

  shareDriverLoginWhatsApp: asyncHandler(async (req, res) => {
    const result = await enquiryService.shareDriverLoginWhatsApp(
      req.params.id,
      req.params.subId,
      req.body
    );
    if (result?.success) {
      res.json(ApiResponse.success('Driver login credentials shared on WhatsApp', result));
      return;
    }

    const reason =
      result?.error || result?.reason || 'Failed to share driver login on WhatsApp';
    throw new AppError(reason, 422);
  }),

  shareInvoiceWhatsApp: asyncHandler(async (req, res) => {
    const imageBuffer = req.file?.buffer;
    if (!imageBuffer?.length) {
      throw new AppError('Invoice image is required', 422);
    }

    const result = await enquiryService.shareInvoiceWhatsApp(
      req.params.id,
      imageBuffer,
      req.body
    );
    if (result?.success) {
      res.json(ApiResponse.success('Invoice shared on WhatsApp', result));
      return;
    }

    const reasonMessages = {
      missing_customer_phone: 'Customer WhatsApp number is missing or invalid on this enquiry',
      wasender_disabled: 'Wasender WhatsApp is not configured. Add WASENDER_API_KEY in backend .env',
    };
    const reason =
      reasonMessages[result?.reason] ||
      result?.error ||
      result?.reason ||
      'Failed to share invoice on WhatsApp';
    throw new AppError(reason, 422);
  }),

  getMonthlyTrips: asyncHandler(async (req, res) => {
    const result = await enquiryService.getMonthlyTrips({
      vehicleId: req.query.vehicle_id || null,
      driverId: req.query.driver_id || null,
      year: req.query.year,
      month: req.query.month,
    });
    res.json(ApiResponse.success('Monthly trips retrieved', result));
  }),

  listAssignedTrips: asyncHandler(async (req, res) => {
    const result = await enquiryService.listAssignedTrips({
      vehicleId: req.query.vehicle_id || null,
      driverId: req.query.driver_id || null,
    });
    res.json(ApiResponse.success('Assigned trips retrieved', result));
  }),
};
