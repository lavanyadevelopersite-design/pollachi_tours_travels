const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Guide = sequelize.define(
  'Guide',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Contact — primary source for tourists during tours
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    alternate_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'WhatsApp number for tourist contact during tour',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Emergency / on-tour contact for tourists
    emergency_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '24x7 contact shared with tourists',
    },
    // Guide profile
    languages: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Comma-separated languages spoken',
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Heritage, adventure, wildlife, etc.',
    },
    license_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Guide license / certification number',
    },
    license_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    id_proof_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    id_proof_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    proof_document: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    daily_rate: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    destination_ids: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of destination UUIDs the guide covers',
    },
    coverage_areas: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Free-text areas / regions covered',
    },
    availability_status: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: 'available',
      comment: 'available, on_tour, leave, inactive',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Short intro shown to tourists',
    },
    notes: {
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
  { tableName: 'tt_guides' }
);

module.exports = Guide;
