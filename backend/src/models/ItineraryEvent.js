const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItineraryEvent = sequelize.define(
  'ItineraryEvent',
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
    itinerary_day_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    event_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active',
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
  { tableName: 'itinerary_events' }
);

module.exports = ItineraryEvent;
