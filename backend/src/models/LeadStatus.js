const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadStatus = sequelize.define(
  'LeadStatus',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lead_status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    button_color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#007BFF',
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
  { tableName: 'lead_status_master' }
);

module.exports = LeadStatus;
