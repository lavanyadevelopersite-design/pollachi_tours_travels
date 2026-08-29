const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cancellation = sequelize.define(
  'Cancellation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cancellation_fee: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    refundable_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
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
  { tableName: 'cancellations' }
);

module.exports = Cancellation;
