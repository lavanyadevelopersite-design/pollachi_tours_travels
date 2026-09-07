const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const City = sequelize.define(
  'City',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    state_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    airport_code: {
      type: DataTypes.STRING(10),
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
  {
    tableName: 'tt_city',
    indexes: [
      {
        unique: true,
        fields: ['state_id', 'name'],
        name: 'uq_tt_city_state_name',
      },
    ],
  }
);

module.exports = City;
