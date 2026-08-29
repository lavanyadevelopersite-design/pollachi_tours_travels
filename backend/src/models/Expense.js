const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { EXPENSE_STATUSES } = require('../utils/constants');

const Expense = sequelize.define(
  'Expense',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    expense_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    expense_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...EXPENSE_STATUSES),
      defaultValue: 'pending',
    },
    payment_mode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    receipt_file: {
      type: DataTypes.STRING(500),
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
  { tableName: 'expenses' }
);

module.exports = Expense;
