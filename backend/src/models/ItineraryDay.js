const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItineraryDay = sequelize.define(
  'ItineraryDay',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itinerary_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    day_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'planned',
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
  { tableName: 'itinerary_days' }
);

module.exports = ItineraryDay;
