/**
 * Truncate all application data while keeping users and lead statuses.
 *
 * Preserved: users, lead_status_master
 * Usage: node scripts/truncateForTesting.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('../src/models');
const logger = require('../src/config/logger');

const PRESERVE_TABLES = new Set([
  'users',
  'lead_status_master',
  'lead_status_whatsapp_templates',
]);

async function truncateForTesting() {
  const dbName = process.env.DB_NAME || 'tours_travels_crm';
  const tableKey = `Tables_in_${dbName}`;

  await sequelize.authenticate();
  logger.info('Connected to database: %s', dbName);

  const [tables] = await sequelize.query('SHOW TABLES');
  const allTables = tables.map((row) => row[tableKey]).filter(Boolean).sort();

  const toTruncate = allTables.filter((name) => !PRESERVE_TABLES.has(name));
  const preserved = allTables.filter((name) => PRESERVE_TABLES.has(name));

  logger.info('Preserving %s table(s): %s', preserved.length, preserved.join(', ') || '(none found)');
  logger.info('Truncating %s table(s)...', toTruncate.length);

  const conn = await sequelize.connectionManager.getConnection();
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { connection: conn });

    for (const table of toTruncate) {
      await sequelize.query(`TRUNCATE TABLE \`${table}\``, { connection: conn });
      logger.info('Truncated: %s', table);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { connection: conn });
  } finally {
    sequelize.connectionManager.releaseConnection(conn);
  }

  const [userCount] = await sequelize.query('SELECT COUNT(*) AS count FROM users');
  const [leadStatusCount] = await sequelize.query('SELECT COUNT(*) AS count FROM lead_status_master');

  logger.info(
    'Done. Preserved data — users: %s, lead_status_master: %s',
    userCount[0].count,
    leadStatusCount[0].count
  );
}

truncateForTesting()
  .catch((error) => {
    logger.error('Truncate failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
