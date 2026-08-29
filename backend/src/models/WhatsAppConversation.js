const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WhatsAppConversation = sequelize.define(
  'WhatsAppConversation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    contact_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    profile_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_message_preview: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    last_message_direction: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: true,
    },
    unread_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('open', 'closed', 'archived'),
      allowNull: false,
      defaultValue: 'open',
    },
    wasender_session_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
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
  { tableName: 'whatsapp_conversations' }
);

module.exports = WhatsAppConversation;
