const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define(
  'Department',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    department_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    department_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    department_head: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Future FK to Employee Master',
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
  { tableName: 'tt_departments' }
);

module.exports = Department;
