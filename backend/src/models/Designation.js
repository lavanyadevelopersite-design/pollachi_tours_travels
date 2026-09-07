const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Designation = sequelize.define(
  'Designation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    designation_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    designation_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hierarchy_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  { tableName: 'tt_designations' }
);

module.exports = Designation;
