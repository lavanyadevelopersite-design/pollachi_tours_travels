const { sequelize } = require('../src/config/database');

(async () => {
  try {
    await sequelize.query(
      'ALTER TABLE `enquiries` ADD COLUMN `emergency_contact_number` VARCHAR(20) NULL AFTER `phone`'
    );
    console.log('OK: emergency_contact_number column added');
  } catch (e) {
    const msg = e.message || String(e);
    if (/Duplicate column|already exists/i.test(msg)) {
      console.log('OK: column already exists');
      process.exit(0);
    }
    console.error(msg);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
