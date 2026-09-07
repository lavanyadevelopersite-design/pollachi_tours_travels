const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Currency = sequelize.define(
  'Currency',
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
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    decimal_places: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
      defaultValue: 1,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  { tableName: 'tt_currency' }
);

module.exports = Currency;
