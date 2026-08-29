const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Itinerary = sequelize.define(
  'Itinerary',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    destination_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    confirmed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    package_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    nights: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cover_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    package_term_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    inclusion_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    exclusion_ids: {
      type: DataTypes.JSON,
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
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    pricing: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    day_wise_plan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_ai_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'draft',
    },
    share_token: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
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
  { tableName: 'itineraries' }
);

module.exports = Itinerary;
