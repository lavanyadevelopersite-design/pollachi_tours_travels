const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TokenBlacklist = sequelize.define(
  'TokenBlacklist',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  { tableName: 'token_blacklist', paranoid: false, updatedAt: false }
);

module.exports = TokenBlacklist;
