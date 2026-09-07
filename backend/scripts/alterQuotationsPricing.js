require('dotenv').config();
const { sequelize } = require('../src/models');

(async () => {
  await sequelize.authenticate();
  const alters = [
    'ALTER TABLE quotations ADD COLUMN itinerary_id CHAR(36) NULL',
    'ALTER TABLE quotations ADD COLUMN pricing JSON NULL',
  ];
  for (const sql of alters) {
    try {
      await sequelize.query(sql);
      console.log('OK:', sql);
    } catch (err) {
      console.log('SKIP:', err.message);
    }
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
