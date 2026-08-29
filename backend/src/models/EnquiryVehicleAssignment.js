const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EnquiryVehicleAssignment = sequelize.define(
  'EnquiryVehicleAssignment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    drop_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'allocated',
    },
    trip_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment:
        'on_the_way | customer_place_reached | trip_ongoing | trip_closed',
    },
    starting_km: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    starting_km_photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    closing_km: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    closing_km_photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    total_km: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    driver_update_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trip_status_history: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of { status, label, at } for each driver status update',
    },
    notes: {
      type: DataTypes.TEXT,
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
  { tableName: 'enquiry_vehicle_assignments' }
);

module.exports = EnquiryVehicleAssignment;
