const {
  Booking,
  Quotation,
  Enquiry,
  Package,
  Destination,
  Branch,
  HotelReservation,
  VehicleAllocation,
  FlightBooking,
  Hotel,
  Vehicle,
} = require('../models');
const createCrudService = require('./crud.factory');
const AppError = require('../utils/AppError');

const bookingIncludes = [
  { model: Quotation, as: 'quotation', attributes: ['id', 'quotation_code'] },
  { model: Enquiry, as: 'enquiry', attributes: ['id', 'enquiry_code'] },
  { model: Package, as: 'package' },
  { model: Destination, as: 'destination' },
  { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
  { model: HotelReservation, as: 'hotelReservations', include: [{ model: Hotel, as: 'hotel' }] },
  { model: VehicleAllocation, as: 'vehicleAllocations', include: [{ model: Vehicle, as: 'vehicle' }] },
  { model: FlightBooking, as: 'flightBookings' },
];

const base = createCrudService(Booking, {
  searchFields: ['booking_code', 'customer_name', 'email', 'phone'],
  defaultIncludes: bookingIncludes,
  codeField: 'booking_code',
  codePrefix: 'BK',
});

const addHotelReservation = async (bookingId, payload, userId = null) => {
  await base.getById(bookingId);
  return HotelReservation.create({
    ...payload,
    booking_id: bookingId,
    created_by: userId,
    updated_by: userId,
  });
};

const addVehicleAllocation = async (bookingId, payload, userId = null) => {
  await base.getById(bookingId);
  return VehicleAllocation.create({
    ...payload,
    booking_id: bookingId,
    created_by: userId,
    updated_by: userId,
  });
};

const addFlightBooking = async (bookingId, payload, userId = null) => {
  await base.getById(bookingId);
  return FlightBooking.create({
    ...payload,
    booking_id: bookingId,
    created_by: userId,
    updated_by: userId,
  });
};

const updateSubResource = async (Model, id, payload, userId = null) => {
  const record = await Model.findByPk(id);
  if (!record) throw new AppError(`${Model.name} not found`, 404);
  await record.update({ ...payload, updated_by: userId });
  return record;
};

const removeSubResource = async (Model, id) => {
  const record = await Model.findByPk(id);
  if (!record) throw new AppError(`${Model.name} not found`, 404);
  await record.destroy();
  return true;
};

module.exports = {
  ...base,
  addHotelReservation,
  addVehicleAllocation,
  addFlightBooking,
  updateHotelReservation: (id, payload, userId) =>
    updateSubResource(HotelReservation, id, payload, userId),
  updateVehicleAllocation: (id, payload, userId) =>
    updateSubResource(VehicleAllocation, id, payload, userId),
  updateFlightBooking: (id, payload, userId) =>
    updateSubResource(FlightBooking, id, payload, userId),
  removeHotelReservation: (id) => removeSubResource(HotelReservation, id),
  removeVehicleAllocation: (id) => removeSubResource(VehicleAllocation, id),
  removeFlightBooking: (id) => removeSubResource(FlightBooking, id),
};
