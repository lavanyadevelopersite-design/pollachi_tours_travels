const { sequelize } = require('../src/config/database');

const run = async (sql) => {
  try {
    await sequelize.query(sql);
    console.log('OK:', sql.slice(0, 100));
  } catch (e) {
    const msg = e.message || String(e);
    if (/Duplicate column|already exists|Duplicate key name/i.test(msg)) {
      console.log('SKIP:', sql.slice(0, 70));
      return;
    }
    throw e;
  }
};

(async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS \`inclusions_exclusions_master\` (
        \`id\` CHAR(36) NOT NULL PRIMARY KEY,
        \`type\` ENUM('inclusion','exclusion') NOT NULL,
        \`heading\` VARCHAR(150) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_by\` CHAR(36) NULL,
        \`updated_by\` CHAR(36) NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        UNIQUE KEY \`uq_ie_type_heading\` (\`type\`, \`heading\`),
        KEY \`idx_ie_type\` (\`type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await run(
      'ALTER TABLE `itineraries` ADD COLUMN `inclusion_ids` JSON NULL AFTER `package_term_ids`'
    );
    await run(
      'ALTER TABLE `itineraries` ADD COLUMN `exclusion_ids` JSON NULL AFTER `inclusion_ids`'
    );
    await run('ALTER TABLE `itineraries` ADD COLUMN `pricing` JSON NULL AFTER `budget`');

    console.log('Itinerary pricing + inclusions/exclusions ready');
    process.exit(0);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
