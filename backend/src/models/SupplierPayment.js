const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierPayment = sequelize.define(
  'SupplierPayment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_mode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
  { tableName: 'supplier_payments' }
);

module.exports = SupplierPayment;
