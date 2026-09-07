const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserTablePreference = sequelize.define(
  'UserTablePreference',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    table_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    hidden_columns: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      // LONGTEXT storage may round-trip as a string; always expose an array.
      get() {
        const raw = this.getDataValue('hidden_columns');
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      },
      set(value) {
        const next = Array.isArray(value) ? value : [];
        this.setDataValue('hidden_columns', next);
      },
    },
  },
  {
    tableName: 'tt_user_table_preferences',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'table_key'],
        name: 'uniq_user_table_pref',
      },
    ],
  }
);

module.exports = UserTablePreference;
