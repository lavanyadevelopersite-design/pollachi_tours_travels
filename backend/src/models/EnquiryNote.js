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
