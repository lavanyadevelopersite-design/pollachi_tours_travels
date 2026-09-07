const { UserTablePreference } = require('../models');
const AppError = require('../utils/AppError');

/**
 * MySQL LONGTEXT + Sequelize JSON often returns a string on read.
 * Parse until we get an array (handles double-encoded JSON too).
 */
const normalizeHidden = (value) => {
  let parsed = value;

  for (let i = 0; i < 3 && typeof parsed === 'string'; i += 1) {
    const trimmed = parsed.trim();
    if (!trimmed) {
      parsed = [];
      break;
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed.map((v) => String(v || '').trim()).filter(Boolean))];
};

const listForUser = async (userId) => {
  const rows = await UserTablePreference.findAll({
    where: { user_id: userId },
    order: [['table_key', 'ASC']],
  });
  return rows.map((r) => ({
    table_key: r.table_key,
    hidden_columns: normalizeHidden(r.hidden_columns),
  }));
};

const getForUser = async (userId, tableKey) => {
  if (!tableKey) throw new AppError('table_key is required', 400);
  const row = await UserTablePreference.findOne({
    where: { user_id: userId, table_key: String(tableKey) },
  });
  if (!row) {
    return {
      table_key: String(tableKey),
      hidden_columns: null,
      exists: false,
    };
  }
  return {
    table_key: String(tableKey),
    hidden_columns: normalizeHidden(row.hidden_columns),
    exists: true,
  };
};

const upsertForUser = async (userId, tableKey, hiddenColumns) => {
  if (!tableKey) throw new AppError('table_key is required', 400);
  const hidden = normalizeHidden(hiddenColumns);
  const key = String(tableKey);

  const [row, created] = await UserTablePreference.findOrCreate({
    where: { user_id: userId, table_key: key },
    defaults: {
      user_id: userId,
      table_key: key,
      hidden_columns: hidden,
    },
  });

  if (!created) {
    await row.update({ hidden_columns: hidden });
  }

  // Always return the value we just persisted (do not re-read raw LONGTEXT).
  return {
    table_key: key,
    hidden_columns: hidden,
  };
};

module.exports = {
  listForUser,
  getForUser,
  upsertForUser,
  normalizeHidden,
};
