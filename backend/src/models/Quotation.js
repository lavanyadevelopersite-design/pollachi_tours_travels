const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { QUOTATION_STATUSES } = require('../utils/constants');

const Quotation = sequelize.define(
  'Quotation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quotation_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lead_id: {
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
      allowNull: true,
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
      allowNull: true,
    },
    travel_to: {
      type: DataTypes.DATEONLY,
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
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...QUOTATION_STATUSES),
      defaultValue: 'draft',
    },
    valid_until: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    line_items: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    itinerary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    pricing: {
      type: DataTypes.JSON,
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
  { tableName: 'quotations' }
);

module.exports = Quotation;
