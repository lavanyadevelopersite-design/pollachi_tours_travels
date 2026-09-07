const { sequelize } = require('../src/config/database');

(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`enquiry_payments\` (
        \`id\` CHAR(36) NOT NULL,
        \`payment_code\` VARCHAR(50) NOT NULL,
        \`enquiry_id\` CHAR(36) NOT NULL,
        \`quotation_id\` CHAR(36) NULL,
        \`payment_date\` DATE NOT NULL,
        \`payment_mode\` VARCHAR(100) NOT NULL,
        \`bank_name\` VARCHAR(150) NULL,
        \`reference_no\` VARCHAR(100) NULL,
        \`notes\` TEXT NULL,
        \`advance_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0,
        \`advance_percentage\` DECIMAL(8,2) NULL DEFAULT 0,
        \`quotation_amount\` DECIMAL(12,2) NULL DEFAULT 0,
        \`transaction_id\` VARCHAR(100) NULL,
        \`received_by\` CHAR(36) NULL,
        \`proof_file\` VARCHAR(500) NULL,
        \`status\` VARCHAR(30) NOT NULL DEFAULT 'received',
        \`created_by\` CHAR(36) NULL,
        \`updated_by\` CHAR(36) NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` DATETIME NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_enquiry_payments_code\` (\`payment_code\`),
        KEY \`idx_enquiry_payments_enquiry_id\` (\`enquiry_id\`),
        KEY \`idx_enquiry_payments_quotation_id\` (\`quotation_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('OK: enquiry_payments table ready');
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
