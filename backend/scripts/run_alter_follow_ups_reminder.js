const { sequelize } = require('../src/config/database');

(async () => {
  try {
    const [cols] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'follow_ups'
        AND COLUMN_NAME = 'reminder'
    `);

    if (cols.length > 0) {
      console.log('OK: follow_ups.reminder already exists');
    } else {
      await sequelize.query(`
        ALTER TABLE \`follow_ups\`
          ADD COLUMN \`reminder\` TINYINT(1) NOT NULL DEFAULT 0 AFTER \`assigned_to\`
      `);
      console.log('OK: follow_ups.reminder column added');
    }
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
