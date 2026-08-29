const { sequelize } = require('../src/config/database');

(async () => {
  try {
    await sequelize.query(
      'ALTER TABLE `enquiries` ADD COLUMN `children_details` JSON NULL AFTER `children`'
    );
    console.log('OK: children_details column added');
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
