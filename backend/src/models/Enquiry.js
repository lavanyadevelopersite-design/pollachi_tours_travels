const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { ENQUIRY_STATUSES, ENQUIRY_TYPES, SERVICE_REQUIRED_OPTIONS, VACATION_TYPE_OPTIONS } = require('../utils/constants');

const Enquiry = sequelize.define(
  'Enquiry',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enquiry_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    enquiry_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [ENQUIRY_TYPES],
      },
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    emergency_contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    state_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    state_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    city_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    city_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    destination_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    package_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    travel_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    travel_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    travel_from_destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travel_to_destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travel_from_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    travel_from_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    travel_to_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    travel_to_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    approx_distance_km: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    estimated_trip_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    adults: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    children: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    children_details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    infants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    lead_source_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    service_required: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isIn: [SERVICE_REQUIRED_OPTIONS],
      },
    },
    vacation_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isIn: [VACATION_TYPE_OPTIONS],
      },
    },
    lead_status_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_converted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(...ENQUIRY_STATUSES),
      defaultValue: 'open',
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
  { tableName: 'enquiries' }
);

module.exports = Enquiry;
