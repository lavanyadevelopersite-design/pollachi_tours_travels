const { sequelize } = require('../src/config/database');

(async () => {
  try {
    await sequelize.query(
      'ALTER TABLE `itinerary_events` ADD COLUMN `details` JSON NULL AFTER `image_url`'
    );
    console.log('OK: details column added');
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
