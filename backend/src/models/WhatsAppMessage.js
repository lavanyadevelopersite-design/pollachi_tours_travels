const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WhatsAppMessage = sequelize.define(
  'WhatsAppMessage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    direction: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'document', 'audio', 'video', 'location', 'template', 'other'),
      allowNull: false,
      defaultValue: 'text',
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    wasender_msg_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'received'),
      allowNull: false,
      defaultValue: 'pending',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sent_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    raw_payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { tableName: 'whatsapp_messages' }
);

module.exports = WhatsAppMessage;
