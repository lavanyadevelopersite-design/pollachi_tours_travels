const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { FOLLOW_UP_STATUSES } = require('../utils/constants');

const FollowUp = sequelize.define(
  'FollowUp',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    follow_up_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'task, call, meeting, email, visit, whatsapp, other',
    },
    status: {
      type: DataTypes.ENUM(...FOLLOW_UP_STATUSES),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    outcome: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reminder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  { tableName: 'follow_ups' }
);

module.exports = FollowUp;
