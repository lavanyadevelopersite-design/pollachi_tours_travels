const { sequelize } = require('../src/config/database');

(async () => {
  try {
    const [cols] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enquiry_payments'
        AND COLUMN_NAME = 'payment_type'
    `);

    if (cols.length > 0) {
      console.log('OK: enquiry_payments.payment_type already exists');
    } else {
      await sequelize.query(`
        ALTER TABLE \`enquiry_payments\`
          ADD COLUMN \`payment_type\` VARCHAR(30) NOT NULL DEFAULT 'advance'
          AFTER \`quotation_id\`
      `);
      console.log('OK: enquiry_payments.payment_type column added');
    }
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
