const bookingService = require('../services/booking.service');
const createCrudController = require('./crud.factory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const base = createCrudController(bookingService, 'Booking');

const addHotelReservation = asyncHandler(async (req, res) => {
  const data = await bookingService.addHotelReservation(req.params.id, req.body, req.user.id);
  res.status(201).json(ApiResponse.success('Hotel reservation added', data));
});

const addVehicleAllocation = asyncHandler(async (req, res) => {
  const data = await bookingService.addVehicleAllocation(req.params.id, req.body, req.user.id);
  res.status(201).json(ApiResponse.success('Vehicle allocation added', data));
});

const addFlightBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.addFlightBooking(req.params.id, req.body, req.user.id);
  res.status(201).json(ApiResponse.success('Flight booking added', data));
});

const updateHotelReservation = asyncHandler(async (req, res) => {
  const data = await bookingService.updateHotelReservation(req.params.subId, req.body, req.user.id);
  res.json(ApiResponse.success('Hotel reservation updated', data));
});

const updateVehicleAllocation = asyncHandler(async (req, res) => {
  const data = await bookingService.updateVehicleAllocation(req.params.subId, req.body, req.user.id);
  res.json(ApiResponse.success('Vehicle allocation updated', data));
});

const updateFlightBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.updateFlightBooking(req.params.subId, req.body, req.user.id);
  res.json(ApiResponse.success('Flight booking updated', data));
});

const removeHotelReservation = asyncHandler(async (req, res) => {
  await bookingService.removeHotelReservation(req.params.subId);
  res.json(ApiResponse.success('Hotel reservation deleted'));
});

const removeVehicleAllocation = asyncHandler(async (req, res) => {
  await bookingService.removeVehicleAllocation(req.params.subId);
  res.json(ApiResponse.success('Vehicle allocation deleted'));
});

const removeFlightBooking = asyncHandler(async (req, res) => {
  await bookingService.removeFlightBooking(req.params.subId);
  res.json(ApiResponse.success('Flight booking deleted'));
});

module.exports = {
  ...base,
  addHotelReservation,
  addVehicleAllocation,
  addFlightBooking,
  updateHotelReservation,
  updateVehicleAllocation,
  updateFlightBooking,
  removeHotelReservation,
  removeVehicleAllocation,
  removeFlightBooking,
};
