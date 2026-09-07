const { sequelize } = require('../src/config/database');

const columns = [
  { name: 'state_name', sql: 'ADD COLUMN `state_name` VARCHAR(150) NULL AFTER `state_id`' },
  { name: 'city_name', sql: 'ADD COLUMN `city_name` VARCHAR(150) NULL AFTER `city_id`' },
  { name: 'vacation_type', sql: 'ADD COLUMN `vacation_type` VARCHAR(100) NULL AFTER `service_required`' },
];

(async () => {
  try {
    for (const col of columns) {
      const [rows] = await sequelize.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'enquiries'
          AND COLUMN_NAME = '${col.name}'
      `);

      if (rows.length > 0) {
        console.log(`OK: enquiries.${col.name} already exists`);
      } else {
        await sequelize.query(`ALTER TABLE \`enquiries\` ${col.sql}`);
        console.log(`OK: enquiries.${col.name} column added`);
      }
    }
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
