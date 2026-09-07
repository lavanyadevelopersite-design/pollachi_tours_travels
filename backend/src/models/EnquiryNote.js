const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EnquiryNote = sequelize.define(
  'EnquiryNote',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lead_status_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lead_status_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lead_status_color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'enquiry_notes',
    updatedAt: false,
    paranoid: false,
  }
);

module.exports = EnquiryNote;
