const { sequelize } = require('../src/config/database');

const addColumn = async (sql) => {
  try {
    await sequelize.query(sql);
    console.log('OK:', sql.slice(0, 90));
  } catch (e) {
    const msg = e.message || String(e);
    if (/Duplicate column|already exists/i.test(msg)) {
      console.log('SKIP:', sql.slice(0, 60));
      return;
    }
    throw e;
  }
};

(async () => {
  try {
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `enquiry_id` CHAR(36) NULL AFTER `quotation_id`'
    );
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `confirmed_at` DATETIME NULL AFTER `status`'
    );
    await addColumn(
      'ALTER TABLE `itineraries` ADD COLUMN `confirmed_by` CHAR(36) NULL AFTER `confirmed_at`'
    );
    console.log('Itinerary enquiry/confirm columns ready');
    process.exit(0);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
