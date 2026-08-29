const { sequelize } = require('../src/config/database');

const addColumn = async (sql) => {
  try {
    await sequelize.query(sql);
    console.log('OK:', sql.slice(0, 80));
  } catch (e) {
    const msg = e.message || String(e);
    if (/Duplicate column|already exists/i.test(msg)) {
      console.log('SKIP (exists):', sql.slice(0, 60));
      return;
    }
    throw e;
  }
};

(async () => {
  try {
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `nights` INT NOT NULL DEFAULT 0 AFTER `days`'
    );
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `from_date` DATE NULL AFTER `nights`'
    );
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `to_date` DATE NULL AFTER `from_date`'
    );
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `cover_image` VARCHAR(500) NULL AFTER `to_date`'
    );
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `package_term_ids` JSON NULL AFTER `cover_image`'
    );

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`itinerary_destinations\` (
        \`id\` CHAR(36) NOT NULL,
        \`itinerary_id\` CHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`latitude\` DECIMAL(10,7) NULL,
        \`longitude\` DECIMAL(10,7) NULL,
        \`country\` VARCHAR(100) NULL,
        \`state\` VARCHAR(100) NULL,
        \`city\` VARCHAR(100) NULL,
        \`place_id\` VARCHAR(255) NULL,
        \`display_order\` INT DEFAULT 0,
        \`created_by\` CHAR(36) NULL,
        \`updated_by\` CHAR(36) NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        \`deleted_at\` DATETIME NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_itinerary_destinations_itinerary\` (\`itinerary_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('OK: itinerary_destinations');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`itinerary_days\` (
        \`id\` CHAR(36) NOT NULL,
        \`itinerary_id\` CHAR(36) NOT NULL,
        \`day_number\` INT NOT NULL,
        \`date\` DATE NULL,
        \`destination\` VARCHAR(255) NULL,
        \`subject\` VARCHAR(255) NULL,
        \`description\` LONGTEXT NULL,
        \`status\` VARCHAR(50) DEFAULT 'planned',
        \`display_order\` INT DEFAULT 0,
        \`created_by\` CHAR(36) NULL,
        \`updated_by\` CHAR(36) NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        \`deleted_at\` DATETIME NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_itinerary_days_itinerary\` (\`itinerary_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('OK: itinerary_days');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`itinerary_events\` (
        \`id\` CHAR(36) NOT NULL,
        \`itinerary_id\` CHAR(36) NOT NULL,
        \`itinerary_day_id\` CHAR(36) NOT NULL,
        \`event_type\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(200) NOT NULL,
        \`event_time\` VARCHAR(10) NULL,
        \`description\` TEXT NULL,
        \`image_url\` VARCHAR(500) NULL,
        \`display_order\` INT DEFAULT 0,
        \`status\` VARCHAR(50) DEFAULT 'active',
        \`created_by\` CHAR(36) NULL,
        \`updated_by\` CHAR(36) NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        \`deleted_at\` DATETIME NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_itinerary_events_day\` (\`itinerary_day_id\`),
        KEY \`idx_itinerary_events_itinerary\` (\`itinerary_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('OK: itinerary_events');
    console.log('Itinerary planner schema ready');
    process.exit(0);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
