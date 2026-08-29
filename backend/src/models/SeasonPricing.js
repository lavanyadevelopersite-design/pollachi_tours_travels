const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SeasonPricing = sequelize.define(
  'SeasonPricing',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    price_increase_percent: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0,
    },
    price_decrease_percent: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0,
    },
    price_per_km: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Base price value for each km (used for lead auto calculation)',
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    description: {
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
  { tableName: 'tt_season_pricing' }
);

module.exports = SeasonPricing;
