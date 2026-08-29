const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tax = sequelize.define(
  'Tax',
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
    tax_percentage: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    tax_type: {
      type: DataTypes.ENUM('GST', 'VAT', 'CGST', 'SGST', 'IGST', 'Service Tax', 'Other'),
      allowNull: false,
      defaultValue: 'GST',
    },
    applicable_on: {
      type: DataTypes.ENUM('Package', 'Hotel', 'Transport', 'Visa', 'Insurance', 'Activities', 'Other'),
      allowNull: false,
      defaultValue: 'Package',
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
  { tableName: 'tt_tax' }
);

module.exports = Tax;
