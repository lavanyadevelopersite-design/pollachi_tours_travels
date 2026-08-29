/**
 * Ensures tt_user_table_preferences exists (per-user DataTable column visibility).
 * Usage: node scripts/createUserTablePreferences.js
 */
require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function run() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS tt_user_table_preferences (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      table_key VARCHAR(100) NOT NULL,
      hidden_columns LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
        CHECK (json_valid(hidden_columns)),
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      deleted_at DATETIME DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_user_table_pref (user_id, table_key),
      KEY idx_user_table_pref_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('OK: tt_user_table_preferences');
  await sequelize.close();
}

run().catch(async (err) => {
  console.error(err.message || err);
  try {
    await sequelize.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
