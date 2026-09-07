const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define(
  'Package',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    destination_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    duration_nights: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    base_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    inclusions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exclusions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
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
  { tableName: 'packages' }
);

module.exports = Package;
