const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('bookings.view'), bookingController.list);
router.get('/:id', authorize('bookings.view'), bookingController.getById);
router.post('/', authorize('bookings.create'), bookingController.create);
router.put('/:id', authorize('bookings.edit'), bookingController.update);
router.delete('/:id', authorize('bookings.delete'), bookingController.remove);

router.post('/:id/hotels', authorize('bookings.edit'), bookingController.addHotelReservation);
router.put('/:id/hotels/:subId', authorize('bookings.edit'), bookingController.updateHotelReservation);
router.delete('/:id/hotels/:subId', authorize('bookings.edit'), bookingController.removeHotelReservation);

router.post('/:id/vehicles', authorize('bookings.edit'), bookingController.addVehicleAllocation);
router.put('/:id/vehicles/:subId', authorize('bookings.edit'), bookingController.updateVehicleAllocation);
router.delete('/:id/vehicles/:subId', authorize('bookings.edit'), bookingController.removeVehicleAllocation);

router.post('/:id/flights', authorize('bookings.edit'), bookingController.addFlightBooking);
router.put('/:id/flights/:subId', authorize('bookings.edit'), bookingController.updateFlightBooking);
router.delete('/:id/flights/:subId', authorize('bookings.edit'), bookingController.removeFlightBooking);

module.exports = router;
