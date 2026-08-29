const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Country = sequelize.define(
  'Country',
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
    iso_numeric_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    currency_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    currency_per_rupees: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 1,
      comment: 'Currency value in rupees; used as km × season_price × currency_per_rupees',
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
  { tableName: 'tt_country' }
);

module.exports = Country;
