const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Driver = sequelize.define(
  'Driver',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Driver photo URL',
    },
    // Proof details
    license_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    license_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'LMV, HMV, etc.',
    },
    license_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    id_proof_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Aadhaar, PAN, Passport, etc.',
    },
    id_proof_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    proof_document: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Scanned license / ID proof URL',
    },
    // Contact details
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    alternate_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Emergency contacts
    emergency_contact_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergency_contact_relation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // Working details
    employment_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'permanent, contract, freelance',
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    blood_group: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Preferred / assigned vehicle',
    },
    driver_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'own',
      comment: 'own or vendor',
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Vendor when driver_type is vendor',
    },
    availability_status: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: 'available',
      comment: 'available, on_trip, leave, inactive',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  { tableName: 'tt_drivers' }
);

module.exports = Driver;
