const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { LEAD_STATUSES } = require('../utils/constants');

const Lead = sequelize.define(
  'Lead',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lead_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...LEAD_STATUSES),
      defaultValue: 'new',
    },
    destination_interest: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    travel_date: {
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
    notes: {
      type: DataTypes.TEXT,
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
  { tableName: 'leads' }
);

module.exports = Lead;
