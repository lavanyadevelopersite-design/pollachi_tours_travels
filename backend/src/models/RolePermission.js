const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolePermission = sequelize.define(
  'RolePermission',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { tableName: 'role_permissions', paranoid: false, updatedAt: false }
);

module.exports = RolePermission;
