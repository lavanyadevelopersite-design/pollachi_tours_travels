const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FlightBooking = sequelize.define(
  'FlightBooking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    airline: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    flight_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    departure_airport: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    arrival_airport: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    departure_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    arrival_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pnr: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    passengers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'booked',
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
  { tableName: 'flight_bookings' }
);

module.exports = FlightBooking;
