const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    payment_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    payment_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'advance',
      comment: 'advance | remaining',
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_mode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bank_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    reference_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    advance_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    additional_charges: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    advance_percentage: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0,
    },
    quotation_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    received_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    proof_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'received',
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
  { tableName: 'enquiry_payments' }
);

module.exports = Payment;
