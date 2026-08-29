const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    designation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Linked driver profile for portal login',
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    blood_group: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    aadhar: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    permanent_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    has_work_experience: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    work_experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    previous_company_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    previous_company_designation: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    previous_company_duration: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_activity_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
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
  {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = User;
