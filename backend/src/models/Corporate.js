const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Corporate = sequelize.define(
  'Corporate',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    corporate_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
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
  { tableName: 'corporate_master' }
);

module.exports = Corporate;
