require('dotenv').config();

const { connectDatabase } = require('../config/database');
const logger = require('../config/logger');
const { sequelize, Vehicle, Driver, DriverProof, Guide } = require('../models');

const sampleVehicles = [
  {
    name: 'Innova Crysta',
    code: 'VEH-INN-01',
    type: 'SUV',
    capacity: 7,
    registration_number: 'MH12AB1234',
    price_per_day: 3500,
    is_active: true,
  },
  {
    name: 'Tempo Traveller',
    code: 'VEH-TMP-01',
    type: 'Mini Bus',
    capacity: 12,
    registration_number: 'MH14CD5678',
    price_per_day: 5500,
    is_active: true,
  },
];

const sampleDrivers = [
  {
    code: 'DRV001',
    full_name: 'Ramesh Kumar',
    license_number: 'MH1420110012345',
    license_type: 'LMV',
    license_expiry: '2028-06-15',
    phone: '9876543210',
    alternate_phone: '9876501234',
    email: 'ramesh.driver@example.com',
    address: '12, Andheri East',
    city: 'Mumbai',
    emergency_contact_name: 'Suresh Kumar',
    emergency_contact_phone: '9876512345',
    emergency_contact_relation: 'Brother',
    employment_type: 'permanent',
    experience_years: 8,
    joining_date: '2019-04-01',
    blood_group: 'B+',
    availability_status: 'available',
    notes: 'Preferred for airport transfers',
    is_active: true,
    vehicleCode: 'VEH-INN-01',
    proofs: [
      {
        proof_type: 'Driving License',
        proof_number: 'MH1420110012345',
        license_type: 'LMV',
        expiry_date: '2028-06-15',
        display_order: 0,
        notes: 'Primary license',
      },
      {
        proof_type: 'Aadhaar',
        proof_number: 'XXXX-XXXX-1234',
        display_order: 1,
        notes: 'ID proof copy',
      },
    ],
  },
  {
    code: 'DRV002',
    full_name: 'Sanjay Patil',
    license_number: 'MH1220150098765',
    license_type: 'HMV',
    license_expiry: '2027-11-20',
    phone: '9765432109',
    alternate_phone: '9765409876',
    email: 'sanjay.driver@example.com',
    address: '45, Pimpri',
    city: 'Pune',
    emergency_contact_name: 'Anita Patil',
    emergency_contact_phone: '9765411122',
    emergency_contact_relation: 'Spouse',
    employment_type: 'contract',
    experience_years: 12,
    joining_date: '2021-08-15',
    blood_group: 'O+',
    availability_status: 'available',
    notes: 'Experienced with tempo traveller routes',
    is_active: true,
    vehicleCode: 'VEH-TMP-01',
    proofs: [
      {
        proof_type: 'Driving License',
        proof_number: 'MH1220150098765',
        license_type: 'HMV',
        expiry_date: '2027-11-20',
        display_order: 0,
      },
      {
        proof_type: 'PAN',
        proof_number: 'ABCDE1234F',
        display_order: 1,
      },
      {
        proof_type: 'Aadhaar',
        proof_number: 'XXXX-XXXX-5678',
        display_order: 2,
      },
    ],
  },
  {
    code: 'DRV003',
    full_name: 'Vikram Singh',
    license_number: 'RJ1420180054321',
    license_type: 'LMV',
    license_expiry: '2029-01-10',
    phone: '9654321098',
    email: 'vikram.driver@example.com',
    address: 'Near City Palace',
    city: 'Jaipur',
    emergency_contact_name: 'Rajesh Singh',
    emergency_contact_phone: '9654312345',
    emergency_contact_relation: 'Father',
    employment_type: 'freelance',
    experience_years: 5,
    joining_date: '2023-01-20',
    blood_group: 'A+',
    availability_status: 'on_trip',
    notes: 'Rajasthan sightseeing specialist',
    is_active: true,
    proofs: [
      {
        proof_type: 'Driving License',
        proof_number: 'RJ1420180054321',
        license_type: 'LMV',
        expiry_date: '2029-01-10',
        display_order: 0,
      },
    ],
  },
];

const sampleGuides = [
  {
    code: 'GUD001',
    full_name: 'Priya Sharma',
    phone: '9123456780',
    alternate_phone: '9123456781',
    whatsapp: '9123456780',
    email: 'priya.guide@example.com',
    address: 'Calangute Beach Road',
    city: 'Goa',
    emergency_phone: '9123456799',
    languages: 'English, Hindi, Konkani',
    specialization: 'Beach, Nightlife, Heritage',
    license_number: 'GOA-GUIDE-2019-112',
    license_expiry: '2027-12-31',
    id_proof_type: 'Aadhaar',
    id_proof_number: 'XXXX-XXXX-9012',
    experience_years: 6,
    daily_rate: 2500,
    joining_date: '2020-02-10',
    coverage_areas: 'North Goa, South Goa',
    availability_status: 'available',
    bio: 'Friendly local guide for Goa beach and heritage tours. Available for tourist support during the trip.',
    notes: 'Good with family groups',
    is_active: true,
  },
  {
    code: 'GUD002',
    full_name: 'Arjun Mehta',
    phone: '9234567890',
    whatsapp: '9234567890',
    email: 'arjun.guide@example.com',
    address: 'Mall Road',
    city: 'Manali',
    emergency_phone: '9234567899',
    languages: 'English, Hindi, Punjabi',
    specialization: 'Adventure, Trekking, Snow activities',
    license_number: 'HP-GUIDE-2017-045',
    license_expiry: '2028-05-20',
    id_proof_type: 'Passport',
    id_proof_number: 'P1234567',
    experience_years: 9,
    daily_rate: 3000,
    joining_date: '2018-06-01',
    coverage_areas: 'Manali, Solang, Rohtang',
    availability_status: 'available',
    bio: 'Adventure guide for Himachal tours. Primary contact for tourists during mountain trips.',
    notes: 'Certified trek leader',
    is_active: true,
  },
  {
    code: 'GUD003',
    full_name: 'Fatima Khan',
    phone: '9345678901',
    alternate_phone: '9345678902',
    whatsapp: '9345678901',
    email: 'fatima.guide@example.com',
    address: 'Bur Dubai',
    city: 'Dubai',
    emergency_phone: '971501234567',
    languages: 'English, Hindi, Arabic, Urdu',
    specialization: 'City tours, Shopping, Culture',
    license_number: 'DXB-GUIDE-2021-078',
    license_expiry: '2026-09-30',
    id_proof_type: 'Emirates ID',
    id_proof_number: '784-XXXX-XXXXXXX-1',
    experience_years: 4,
    daily_rate: 4500,
    joining_date: '2022-03-15',
    coverage_areas: 'Dubai Marina, Old Dubai, Desert Safari',
    availability_status: 'on_tour',
    bio: 'Multilingual Dubai city guide. Tourist support contact for shopping and cultural experiences.',
    notes: 'Speaks Arabic fluently',
    is_active: true,
  },
];

const seedDriversGuides = async () => {
  await connectDatabase();
  logger.info('Seeding sample drivers and guides...');

  const vehicleMap = {};
  for (const vehicle of sampleVehicles) {
    const [record] = await Vehicle.findOrCreate({
      where: { code: vehicle.code },
      defaults: vehicle,
    });
    vehicleMap[vehicle.code] = record;
  }

  for (const item of sampleDrivers) {
    const { proofs = [], vehicleCode, ...driverData } = item;
    const vehicle = vehicleCode ? vehicleMap[vehicleCode] : null;
    const [driver] = await Driver.findOrCreate({
      where: { code: driverData.code },
      defaults: {
        ...driverData,
        vehicle_id: vehicle?.id || null,
      },
    });

    for (const proof of proofs) {
      const existing = await DriverProof.findOne({
        where: {
          driver_id: driver.id,
          proof_type: proof.proof_type,
          proof_number: proof.proof_number || null,
        },
      });
      if (!existing) {
        await DriverProof.create({
          ...proof,
          driver_id: driver.id,
          images: [],
        });
      }
    }
  }

  for (const guide of sampleGuides) {
    await Guide.findOrCreate({
      where: { code: guide.code },
      defaults: guide,
    });
  }

  const driverCount = await Driver.count();
  const guideCount = await Guide.count();
  const proofCount = await DriverProof.count();
  logger.info(
    'Sample data ready — drivers: %s, proofs: %s, guides: %s',
    driverCount,
    proofCount,
    guideCount
  );
};

if (require.main === module) {
  seedDriversGuides()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      logger.error('Drivers/Guides seed failed: %s', error.stack || error.message);
      process.exit(1);
    });
}

module.exports = seedDriversGuides;
