const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { BOOKING_STATUSES } = require('../utils/constants');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    enquiry_id: {
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
    package_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    destination_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    travel_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    travel_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    adults: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    children: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...BOOKING_STATUSES),
      defaultValue: 'pending',
    },
    notes: {
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
  { tableName: 'bookings' }
);

module.exports = Booking;
