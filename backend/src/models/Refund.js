const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { REFUND_STATUSES } = require('../utils/constants');

const Refund = sequelize.define(
  'Refund',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    refund_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    invoice_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    cancellation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...REFUND_STATUSES),
      defaultValue: 'pending',
    },
    payment_mode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
  { tableName: 'refunds' }
);

module.exports = Refund;
