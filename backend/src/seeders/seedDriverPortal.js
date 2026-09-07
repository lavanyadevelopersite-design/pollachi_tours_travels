require('dotenv').config();

const { Op } = require('sequelize');
const { connectDatabase } = require('../config/database');
const logger = require('../config/logger');
const {
  Driver,
  Vehicle,
  Enquiry,
  EnquiryVehicleAssignment,
} = require('../models');
const driverPortalService = require('../services/driverPortal.service');

const DEMO_PASSWORD = 'Driver@123';

const seedDriverPortal = async () => {
  try {
    await connectDatabase();
    await driverPortalService.ensureDriverRole();

    let driver =
      (await Driver.findOne({ where: { code: 'DRV001' } })) ||
      (await Driver.findOne({ where: { is_active: true }, order: [['created_at', 'ASC']] }));

    if (!driver) {
      driver = await Driver.create({
        code: 'DRV001',
        full_name: 'Ramesh Kumar',
        license_number: 'MH1420110012345',
        license_type: 'LMV',
        phone: '9876543210',
        email: 'ramesh.driver@example.com',
        availability_status: 'available',
        is_active: true,
      });
      logger.info('Created demo driver DRV001');
    }

    await driverPortalService.syncDriverPortalUser(driver, DEMO_PASSWORD);
    logger.info(
      `Driver portal ready: login with phone ${driver.phone} or email ${driver.email} / ${DEMO_PASSWORD}`
    );

    const vehicle =
      (await Vehicle.findOne({ where: { is_active: true }, order: [['created_at', 'ASC']] })) ||
      (await Vehicle.create({
        name: 'Innova Crysta',
        code: 'VEH-DRV-01',
        type: 'SUV',
        capacity: 7,
        registration_number: 'TN38AB1234',
        price_per_day: 3500,
        is_active: true,
      }));

    const enquiry =
      (await Enquiry.findOne({
        where: { status: ['open', 'in_progress', 'quoted', 'booked'] },
        order: [['created_at', 'DESC']],
      })) ||
      (await Enquiry.findOne({ order: [['created_at', 'DESC']] }));

    if (enquiry) {
      let assignment = await EnquiryVehicleAssignment.findOne({
        where: { enquiry_id: enquiry.id, status: { [Op.ne]: 'cancelled' } },
        order: [['created_at', 'DESC']],
      });

      if (assignment) {
        await assignment.update({
          driver_id: driver.id,
          vehicle_id: assignment.vehicle_id || vehicle.id,
          status: assignment.status === 'cancelled' ? 'confirmed' : assignment.status || 'confirmed',
        });
        logger.info(
          `Linked enquiry ${enquiry.enquiry_code} assignment to driver ${driver.code}`
        );
      } else {
        const start = enquiry.travel_from || new Date().toISOString().slice(0, 10);
        const end = enquiry.travel_to || start;
        assignment = await EnquiryVehicleAssignment.create({
          enquiry_id: enquiry.id,
          vehicle_id: vehicle.id,
          driver_id: driver.id,
          start_date: start,
          end_date: end,
          pickup_location: enquiry.travel_from_destination || enquiry.travel_from || 'Pickup point',
          drop_location: enquiry.travel_to_destination || enquiry.travel_to || 'Drop point',
          status: 'confirmed',
          amount: 0,
          notes: 'Demo assignment for driver portal',
        });
        logger.info(`Assigned enquiry ${enquiry.enquiry_code} to driver ${driver.code}`);
      }

      console.log(
        `Share link: http://localhost:5173/driver/login?enquiry=${encodeURIComponent(
          enquiry.enquiry_code
        )}&trip=${assignment.id}`
      );
    } else {
      logger.warn('No enquiry found to assign a demo trip');
    }

    console.log('\nDriver portal URL: http://localhost:5173/driver/login');
    console.log(`Login: ${driver.phone}  (or ${driver.email})`);
    console.log(`Password: ${DEMO_PASSWORD}\n`);
    process.exit(0);
  } catch (error) {
    logger.error('Driver portal seed failed: %s', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDriverPortal();
