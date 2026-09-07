const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EnquiryVehicleAssignmentStatusLog = sequelize.define(
  'EnquiryVehicleAssignmentStatusLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    enquiry_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  { tableName: 'enquiry_vehicle_assignment_status_logs' }
);

module.exports = EnquiryVehicleAssignmentStatusLog;
