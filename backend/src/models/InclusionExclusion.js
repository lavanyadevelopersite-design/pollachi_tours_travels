const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InclusionExclusion = sequelize.define(
  'InclusionExclusion',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('inclusion', 'exclusion'),
      allowNull: false,
    },
    heading: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'inclusions_exclusions_master',
    indexes: [
      { fields: ['type'] },
      { unique: true, fields: ['type', 'heading'] },
    ],
  }
);

module.exports = InclusionExclusion;
