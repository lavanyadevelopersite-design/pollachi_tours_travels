const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define(
  'Vehicle',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ownership: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'own',
      comment: 'own or vendor',
    },
    availability_status: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: 'available',
      comment: 'available, on_trip, inactive',
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Vehicle image URL',
    },
    registration_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    price_per_day: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    supplier_id: {
      type: DataTypes.UUID,
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
  { tableName: 'vehicles' }
);

module.exports = Vehicle;
