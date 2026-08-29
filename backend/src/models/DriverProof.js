const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriverProof = sequelize.define(
  'DriverProof',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    proof_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Driving License, Aadhaar, PAN, etc.',
    },
    proof_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    license_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'LMV/HMV when proof is Driving License',
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of image/document URLs',
      get() {
        const raw = this.getDataValue('images');
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      },
      set(value) {
        if (!value) {
          this.setDataValue('images', null);
          return;
        }
        this.setDataValue('images', JSON.stringify(Array.isArray(value) ? value : [value]));
      },
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  { tableName: 'tt_driver_proofs' }
);

module.exports = DriverProof;
