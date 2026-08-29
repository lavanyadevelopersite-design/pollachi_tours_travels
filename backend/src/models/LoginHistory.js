const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoginHistory = sequelize.define(
  'LoginHistory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    refresh_token_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    login_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    logout_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    device: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    logout_reason: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  { tableName: 'login_history', paranoid: false, updatedAt: true }
);

module.exports = LoginHistory;
