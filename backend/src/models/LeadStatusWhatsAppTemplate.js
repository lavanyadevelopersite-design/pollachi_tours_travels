const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadStatusWhatsAppTemplate = sequelize.define(
  'LeadStatusWhatsAppTemplate',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lead_status_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    template_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    template_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    template_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    language_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'en_US',
    },
    include_itinerary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    header_media_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    message_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin notes about template variables / body',
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
  { tableName: 'lead_status_whatsapp_templates' }
);

module.exports = LeadStatusWhatsAppTemplate;
